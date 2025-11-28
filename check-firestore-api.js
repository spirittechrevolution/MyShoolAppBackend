const { google } = require('googleapis');
const serviceAccount = require('./serviceAccountKey.json');

async function checkFirestoreAPI() {
  try {
    console.log('🔍 Vérification de l\'API Firestore...\n');
    
    // Créer un client avec les credentials du service account
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    const authClient = await auth.getClient();
    const projectId = serviceAccount.project_id;
    
    // Vérifier l'API Firestore
    const serviceusage = google.serviceusage('v1');
    
    const firestoreAPI = await serviceusage.services.get({
      auth: authClient,
      name: `projects/${projectId}/services/firestore.googleapis.com`
    });
    
    console.log('✅ API Firestore:');
    console.log('   État:', firestoreAPI.data.state);
    console.log('   Nom:', firestoreAPI.data.config?.name || 'N/A');
    
    // Vérifier aussi l'API Firestore Admin
    try {
      const adminAPI = await serviceusage.services.get({
        auth: authClient,
        name: `projects/${projectId}/services/firebasehosting.googleapis.com`
      });
      console.log('\n✅ API Firebase Hosting:', adminAPI.data.state);
    } catch (e) {
      console.log('\n⚠️  API Firebase Hosting non vérifiable');
    }
    
    // Tenter de lister les bases de données Firestore
    console.log('\n🔍 Tentative de liste des bases Firestore...');
    const firestore = google.firestore('v1');
    
    try {
      const databases = await firestore.projects.databases.list({
        auth: authClient,
        parent: `projects/${projectId}`
      });
      
      if (databases.data.databases) {
        console.log('\n✅ Bases de données trouvées:');
        databases.data.databases.forEach(db => {
          console.log(`   - ${db.name}`);
          console.log(`     Type: ${db.type}`);
          console.log(`     État: ${db.state || 'N/A'}`);
        });
      } else {
        console.log('\n❌ Aucune base de données Firestore trouvée !');
        console.log('   Vous devez créer une base de données Firestore.');
        console.log('   Allez sur: https://console.firebase.google.com/project/myschool-f862b/firestore');
        console.log('   Et cliquez sur "Créer une base de données"');
      }
    } catch (dbError) {
      console.log('\n❌ Impossible de lister les bases:', dbError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
  }
}

checkFirestoreAPI();
