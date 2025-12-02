dans sms /**
 * Cloud Function pour l'envoi de SMS
 * Surveille la collection sms_queue et envoie les SMS via Orange SMS API ou autre provider
 */

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import axios from 'axios';

/**
 * Configuration du provider SMS depuis les variables d'environnement
 */
interface SmsProviderConfig {
  provider: string;
  apiUrl: string;
  apiKey: string;
  senderId: string;
}

/**
 * Récupère la configuration du provider SMS
 */
function getSmsProviderConfig(): SmsProviderConfig {
  // Utilise les variables d'environnement .env (recommandé par Firebase)
  return {
    provider: process.env.SMS_PROVIDER || 'mock',
    apiUrl: process.env.SMS_API_URL || '',
    apiKey: process.env.SMS_API_KEY || '',
    senderId: process.env.SMS_SENDER_ID || 'MySchool',
  };
}

/**
 * Envoie un SMS via Orange SMS API
 * Documentation: https://developer.orange.com/apis/sms-senegal/
 */
async function sendViaOrangeSmsApi(
  to: string,
  message: string,
  from: string,
  config: SmsProviderConfig
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await axios.post(
      `${config.apiUrl}/outbound/tel%3A%2B${config.senderId}/requests`,
      {
        outboundSMSMessageRequest: {
          address: `tel:${to}`,
          senderAddress: `tel:+${config.senderId}`,
          outboundSMSTextMessage: {
            message: message,
          },
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 201) {
      return {
        success: true,
        messageId: response.data?.outboundSMSMessageRequest?.resourceURL,
      };
    }

    return {
      success: false,
      error: 'Réponse invalide du serveur Orange',
    };
  } catch (error: any) {
    console.error('Erreur Orange SMS API:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Envoie un SMS via un provider générique (peut être adapté pour Twilio, Nexmo, etc.)
 */
async function sendViaSmsProvider(
  to: string,
  message: string,
  from: string,
  config: SmsProviderConfig
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Mode mock pour le développement
  if (config.provider === 'mock') {
    console.log('📱 [MOCK SMS]', {
      to,
      from,
      message: message.substring(0, 100) + '...',
    });
    
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  }

  // Orange SMS API
  if (config.provider === 'orange') {
    return sendViaOrangeSmsApi(to, message, from, config);
  }

  // Autres providers peuvent être ajoutés ici
  // if (config.provider === 'twilio') { ... }
  
  throw new Error(`Provider SMS non supporté: ${config.provider}`);
}

/**
 * Cloud Function déclenchée lors de l'ajout d'un SMS dans sms_queue
 * Envoie automatiquement le SMS et met à jour son statut
 */
export const sendSmsOnCreate = onDocumentCreated(
  {
    document: 'sms_queue/{smsId}',
    region: 'us-central1',
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('Pas de données dans le snapshot');
      return;
    }

    const smsId = event.params.smsId;
    const smsData = snapshot.data();

    console.log(`📨 Nouveau SMS à envoyer: ${smsId}`, {
      to: smsData.to,
      type: smsData.type,
    });

    try {
      // Récupère la configuration
      const config = getSmsProviderConfig();

      // Envoie le SMS
      const result = await sendViaSmsProvider(
        smsData.to,
        smsData.message,
        smsData.from || config.senderId,
        config
      );

      if (result.success) {
        // Met à jour le statut: envoyé
        await snapshot.ref.update({
          status: 'sent',
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          provider: config.provider,
          messageId: result.messageId,
        });

        console.log(`✅ SMS envoyé avec succès: ${smsId}`);
      } else {
        // Met à jour le statut: échec
        await snapshot.ref.update({
          status: 'failed',
          error: result.error,
          retryCount: admin.firestore.FieldValue.increment(1),
        });

        console.error(`❌ Échec d'envoi du SMS: ${smsId}`, result.error);
      }
    } catch (error: any) {
      console.error(`❌ Erreur lors de l'envoi du SMS: ${smsId}`, error);

      // Met à jour le statut: échec
      await snapshot.ref.update({
        status: 'failed',
        error: error.message,
        retryCount: admin.firestore.FieldValue.increment(1),
      });
    }
  }
);

/**
 * Cloud Function planifiée pour réessayer l'envoi des SMS échoués
 * S'exécute toutes les heures
 */
export const retrySendFailedSms = onSchedule(
  {
    schedule: 'every 1 hours',
    region: 'us-central1',
  },
  async () => {
    console.log('🔄 Tentative de renvoi des SMS échoués...');

    const db = admin.firestore();
    const config = getSmsProviderConfig();

    // Récupère les SMS échoués avec moins de 3 tentatives
    const failedSmsSnapshot = await db.collection('sms_queue')
      .where('status', '==', 'failed')
      .where('retryCount', '<', 3)
      .limit(50)
      .get();

    if (failedSmsSnapshot.empty) {
      console.log('✅ Aucun SMS à renvoyer');
      return;
    }

    console.log(`📨 ${failedSmsSnapshot.size} SMS à renvoyer`);

    const promises = failedSmsSnapshot.docs.map(async (doc) => {
      const smsData = doc.data();

      try {
        // Réessaie d'envoyer
        const result = await sendViaSmsProvider(
          smsData.to,
          smsData.message,
          smsData.from || config.senderId,
          config
        );

        if (result.success) {
          await doc.ref.update({
            status: 'sent',
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            provider: config.provider,
            messageId: result.messageId,
            error: admin.firestore.FieldValue.delete(),
          });

          console.log(`✅ SMS renvoyé avec succès: ${doc.id}`);
        } else {
          await doc.ref.update({
            retryCount: admin.firestore.FieldValue.increment(1),
            error: result.error,
          });

          console.error(`❌ Échec du renvoi: ${doc.id}`, result.error);
        }
      } catch (error: any) {
        console.error(`❌ Erreur lors du renvoi: ${doc.id}`, error);

        await doc.ref.update({
          retryCount: admin.firestore.FieldValue.increment(1),
          error: error.message,
        });
      }
    });

    await Promise.all(promises);
    console.log('✅ Traitement des SMS échoués terminé');
  }
);

/**
 * Cloud Function planifiée pour nettoyer les anciens SMS
 * S'exécute tous les jours à minuit
 */
export const cleanupOldSms = onSchedule(
  {
    schedule: 'every day 00:00',
    timeZone: 'Africa/Dakar',
    region: 'us-central1',
  },
  async () => {
    console.log('🧹 Nettoyage des anciens SMS...');

    const db = admin.firestore();
    
    // Supprime les SMS de plus de 30 jours
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const oldSmsSnapshot = await db.collection('sms_queue')
      .where('createdAt', '<', admin.firestore.Timestamp.fromDate(cutoffDate))
      .where('status', 'in', ['sent', 'delivered'])
      .limit(500)
      .get();

    if (oldSmsSnapshot.empty) {
      console.log('✅ Aucun ancien SMS à supprimer');
      return;
    }

    console.log(`🗑️ ${oldSmsSnapshot.size} SMS à supprimer`);

    const batch = db.batch();
    oldSmsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ ${oldSmsSnapshot.size} SMS supprimés`);
  }
);
