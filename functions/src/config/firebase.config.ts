import * as admin from 'firebase-admin';

// Ne pas réinitialiser si déjà fait (sera initialisé dans index.ts pour Cloud Functions)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Pour Cloud Functions, la base de données est configurée dans index.ts
// Ici on récupère juste l'instance
export const db = admin.firestore();

export const auth = admin.auth();
export const storage = admin.storage();

export default admin;
