import * as admin from 'firebase-admin';
import * as path from 'node:path';
import * as fs from 'node:fs';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Option 1: Service Account JSON file
  const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    // Utiliser le fichier de service account
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('🔥 Firebase Admin SDK initialisé avec Service Account');
  } 
  // Option 2: Variables d'environnement
  else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'myschool-f862b',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    console.log('🔥 Firebase Admin SDK initialisé avec credentials .env');
  } 
  // Option 3: Mode développement avec émulation (pour tests locaux uniquement)
  else {
    // Créer des credentials temporaires pour développement
    console.warn('⚠️  Mode développement: Utilisation de credentials basiques');
    console.warn('⚠️  Pour la production, configurez FIREBASE_PRIVATE_KEY et FIREBASE_CLIENT_EMAIL');
    
    // Utiliser les credentials de l'application (lecture seule pour Firestore)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || 'myschool-f862b'
    });
  }
}

// Initialize Firebase services
// IMPORTANT: La base de données s'appelle "myschool-1" et non "(default)"
const databaseId = process.env.FIRESTORE_DATABASE_ID || 'myschool-1';

// Initialiser Firestore avec le bon database ID
const firestoreSettings: FirebaseFirestore.Settings = {
  ignoreUndefinedProperties: true
};

// Si ce n'est pas la base par défaut, spécifier le databaseId
if (databaseId !== '(default)') {
  (firestoreSettings as any).databaseId = databaseId;
}

export const db = admin.firestore();
db.settings(firestoreSettings);

export const auth = admin.auth();
export const storage = admin.storage();

console.log('🔥 Firebase initialisé - Projet:', admin.app().options.projectId);
console.log('🔥 Firestore Database ID:', databaseId);

export default admin;
