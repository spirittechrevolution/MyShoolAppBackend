/**
 * Cloud Function schedulée pour vérifier et expirer les abonnements
 * S'exécute tous les jours à 2h du matin
 */

import * as functions from 'firebase-functions';
import { SubscriptionService } from './services/subscription.service';

const subscriptionService = new SubscriptionService();

/**
 * Fonction HTTP pour déclencher manuellement la vérification des abonnements expirés
 * Utile pour les tests ou les exécutions manuelles
 * GET /api/admin/check-expired-subscriptions
 */
export const manualCheckExpiredSubscriptions = functions.https.onRequest(async (req, res) => {
  try {
    // TODO: Ajouter une authentification admin ici
    // const authToken = req.headers.authorization;
    // if (!authToken || !verifyAdminToken(authToken)) {
    //   res.status(401).json({ success: false, message: 'Non autorisé' });
    //   return;
    // }

    console.log('🔄 Vérification manuelle des abonnements expirés...');
    
    const expiredCount = await subscriptionService.checkAndExpireSubscriptions();
    
    res.status(200).json({
      success: true,
      data: {
        expiredCount: expiredCount,
        timestamp: new Date().toISOString()
      },
      message: `${expiredCount} abonnement(s) expiré(s) traité(s)`
    });
  } catch (error: any) {
    console.error('❌ Erreur vérification manuelle:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la vérification'
    });
  }
});

// NOTE: La fonction schedulée est temporairement désactivée car firebase-functions v2
// a une API différente pour les scheduled functions. Elle sera réactivée après mise à jour.
// 
// Pour l'instant, utilisez manualCheckExpiredSubscriptions pour déclencher manuellement
// la vérification des abonnements expirés.
//
// Version futures avec firebase-functions v2:
// import { onSchedule } from 'firebase-functions/v2/scheduler';
// export const checkExpiredSubscriptions = onSchedule({
//   schedule: '0 2 * * *',
//   timeZone: 'Africa/Dakar'
// }, async (event) => {
//   const expiredCount = await subscriptionService.checkAndExpireSubscriptions();
//   console.log(`✅ ${expiredCount} abonnement(s) expiré(s)`);
// });
