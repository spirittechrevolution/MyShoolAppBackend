import * as admin from 'firebase-admin';

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

// ============ CLOUD FUNCTIONS TRIGGERS ============
// NOTE: Les triggers Firestore et scheduled functions sont temporairement désactivés
// pour résoudre les problèmes de compatibilité avec firebase-functions v2
// Ils seront réactivés après la mise à jour vers firebase-functions@latest
// Voir le fichier index.ts.backup pour le code complet des triggers