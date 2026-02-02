import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Initialiser Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Configurer Firestore pour utiliser la bonne base de données
db.settings({
  databaseId: 'myschool-1',
  ignoreUndefinedProperties: true
});

// ============ EXPORT DE L'API EXPRESS ============
export { api } from './api';

// ============ CLOUD FUNCTIONS SMS ============
export { 
  sendSmsOnCreate, 
  retrySendFailedSms, 
  cleanupOldSms 
} from './sms-sender.function';

// ============ CLOUD FUNCTIONS NOTIFICATIONS ============
export {
  sendSmsOnPaymentCreated,
  sendSmsOnPaymentUpdated,
  sendSmsOnEnrollment,
  sendSmsOnCertificateEarned
} from './notification-triggers.function';

// ============ CLOUD FUNCTIONS TRIGGERS ============
// NOTE: Les triggers Firestore et scheduled functions sont temporairement désactivés
// pour résoudre les problèmes de compatibilité avec firebase-functions v2
// Ils seront réactivés après la mise à jour vers firebase-functions@latest
// Voir le fichier index.ts.backup pour le code complet des triggers

// ============ CLOUD FUNCTIONS MANUAL CHECKS ============
export {
  manualCheckExpiredSubscriptions
} from './subscription-cron.function';