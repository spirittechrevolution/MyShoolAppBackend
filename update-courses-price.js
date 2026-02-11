/**
 * Script pour mettre à jour le prix de tous les cours existants
 * Met tous les prix à 0 (cours gratuits)
 * 
 * Usage: node update-courses-price.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.settings({ 
  databaseId: 'myschool-1',
  ignoreUndefinedProperties: true 
});

async function updateCoursesPrices() {
  console.log('🚀 Mise à jour des prix des cours...\n');

  try {
    // Récupérer tous les cours
    const coursesSnapshot = await db.collection('courses').get();

    if (coursesSnapshot.empty) {
      console.log('❌ Aucun cours trouvé.');
      return;
    }

    console.log(`📚 ${coursesSnapshot.size} cours trouvés\n`);

    const batch = db.batch();
    let updateCount = 0;

    // Mettre à jour chaque cours
    coursesSnapshot.docs.forEach(doc => {
      const courseRef = db.collection('courses').doc(doc.id);
      batch.update(courseRef, {
        price: 0,
        updatedAt: new Date()
      });
      updateCount++;

      const courseData = doc.data();
      console.log(`✅ ${updateCount}. ${courseData.title}`);
      console.log(`   └─ Prix: ${courseData.price} FCFA → 0 FCFA (GRATUIT)`);
    });

    // Commit les changements
    await batch.commit();
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ ${updateCount} cours mis à jour avec succès!`);
    console.log('   Tous les cours sont maintenant GRATUITS (prix = 0 FCFA)');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    throw error;
  }
}

// Exécuter le script
updateCoursesPrices()
  .then(() => {
    console.log('\n🎉 Script terminé avec succès!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
