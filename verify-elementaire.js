/**
 * Script de vérification du contenu élémentaire créé
 * Vérifie les matières, cours et chapitres pour CE1, CE2, CM1
 * 
 * Usage: node verify-elementaire.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
db.settings({ 
  databaseId: 'myschool-1',
  ignoreUndefinedProperties: true 
});

/**
 * Vérifier le contenu pour une classe
 */
async function verifyClasse(classe) {
  console.log(`\n🏫 VÉRIFICATION ${classe}`);
  console.log('='.repeat(50));
  
  try {
    // 1. Vérifier les matières
    const matieresSnap = await db.collection('matieres')
      .where('classe', '==', classe)
      .where('niveauScolaire', '==', 'ELEMENTAIRE')
      .get();
    
    console.log(`\n📚 Matières (${matieresSnap.size})`);
    const matieresIds = [];
    matieresSnap.forEach(doc => {
      const data = doc.data();
      matieresIds.push(doc.id);
      console.log(`   ✅ ${data.nom} ${data.icone} - ${data.description}`);
    });
    
    // 2. Vérifier les cours
    const coursesSnap = await db.collection('courses')
      .where('classe', '==', classe)
      .where('niveauScolaire', '==', 'ELEMENTAIRE')
      .get();
    
    console.log(`\n🎓 Cours (${coursesSnap.size})`);
    let totalChapters = 0;
    let totalLessons = 0;
    let totalExercises = 0;
    
    for (const courseDoc of coursesSnap.docs) {
      const courseData = courseDoc.data();
      console.log(`   📖 ${courseData.title}`);
      console.log(`      Type: ${courseData.type}, Durée: ${courseData.duration}min`);
      
      // Vérifier les chapitres du cours
      if (courseData.chaptersIds && courseData.chaptersIds.length > 0) {
        console.log(`      📝 Chapitres: ${courseData.chaptersIds.length}`);
        totalChapters += courseData.chaptersIds.length;
        
        // Compter les leçons et exercices
        for (const chapterId of courseData.chaptersIds) {
          const chapterDoc = await db.collection('chapters').doc(chapterId).get();
          if (chapterDoc.exists) {
            const chapterData = chapterDoc.data();
            totalLessons += chapterData.lessonsIds ? chapterData.lessonsIds.length : 0;
            totalExercises += chapterData.exercisesIds ? chapterData.exercisesIds.length : 0;
          }
        }
      } else {
        console.log(`      ⚠️  Aucun chapitre trouvé`);
      }
    }
    
    console.log(`\n📊 Résumé ${classe}:`);
    console.log(`   Matières: ${matieresSnap.size}`);
    console.log(`   Cours: ${coursesSnap.size}`);
    console.log(`   Chapitres: ${totalChapters}`);
    console.log(`   Leçons: ${totalLessons}`);
    console.log(`   Exercices: ${totalExercises}`);
    
    return {
      matieres: matieresSnap.size,
      cours: coursesSnap.size,
      chapitres: totalChapters,
      lecons: totalLessons,
      exercices: totalExercises
    };
    
  } catch (error) {
    console.error(`❌ Erreur pour ${classe}:`, error);
    return null;
  }
}

/**
 * Vérifier la cohérence des relations
 */
async function verifyRelations() {
  console.log(`\n🔗 VÉRIFICATION DES RELATIONS`);
  console.log('='.repeat(50));
  
  try {
    // Vérifier que tous les cours ont bien une matière existante
    const coursesSnap = await db.collection('courses')
      .where('niveauScolaire', '==', 'ELEMENTAIRE')
      .get();
    
    console.log(`\n📋 Vérification des relations matière-cours`);
    for (const courseDoc of coursesSnap.docs) {
      const courseData = courseDoc.data();
      
      if (courseData.matiereId) {
        const matiereDoc = await db.collection('matieres').doc(courseData.matiereId).get();
        if (matiereDoc.exists) {
          console.log(`   ✅ ${courseData.title} ← ${matiereDoc.data().nom}`);
        } else {
          console.log(`   ❌ ${courseData.title} ← MATIÈRE INTROUVABLE`);
        }
      } else {
        console.log(`   ⚠️  ${courseData.title} ← AUCUNE MATIÈRE`);
      }
    }
    
    // Vérifier que tous les chapitres ont bien un cours existant
    const chaptersSnap = await db.collection('chapters').get();
    console.log(`\n📋 Vérification des relations cours-chapitre`);
    
    let orphanChapters = 0;
    for (const chapterDoc of chaptersSnap.docs) {
      const chapterData = chapterDoc.data();
      
      if (chapterData.courseId) {
        const courseDoc = await db.collection('courses').doc(chapterData.courseId).get();
        if (!courseDoc.exists) {
          console.log(`   ❌ Chapitre ${chapterData.title} → COURS INTROUVABLE`);
          orphanChapters++;
        }
      }
    }
    
    if (orphanChapters === 0) {
      console.log(`   ✅ Tous les chapitres sont liés à des cours existants`);
    } else {
      console.log(`   ⚠️  ${orphanChapters} chapitres orphelins détectés`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des relations:', error);
  }
}

/**
 * Afficher un exemple de structure complète
 */
async function showStructureExample() {
  console.log(`\n🌳 EXEMPLE DE STRUCTURE COMPLÈTE`);
  console.log('='.repeat(50));
  
  try {
    // Prendre le premier cours de CE1
    const courseSnap = await db.collection('courses')
      .where('classe', '==', 'CE1')
      .limit(1)
      .get();
    
    if (courseSnap.empty) {
      console.log('❌ Aucun cours trouvé pour CE1');
      return;
    }
    
    const courseDoc = courseSnap.docs[0];
    const courseData = courseDoc.data();
    
    console.log(`📖 Cours: ${courseData.title}`);
    console.log(`   Classe: ${courseData.classe}`);
    console.log(`   Matière ID: ${courseData.matiereId}`);
    
    // Récupérer la matière
    if (courseData.matiereId) {
      const matiereDoc = await db.collection('matieres').doc(courseData.matiereId).get();
      if (matiereDoc.exists) {
        const matiereData = matiereDoc.data();
        console.log(`   Matière: ${matiereData.nom} ${matiereData.icone}`);
      }
    }
    
    // Afficher les chapitres
    if (courseData.chaptersIds && courseData.chaptersIds.length > 0) {
      console.log(`\n   📚 Chapitres (${courseData.chaptersIds.length}):`);
      
      for (let i = 0; i < Math.min(2, courseData.chaptersIds.length); i++) {
        const chapterId = courseData.chaptersIds[i];
        const chapterDoc = await db.collection('chapters').doc(chapterId).get();
        
        if (chapterDoc.exists) {
          const chapterData = chapterDoc.data();
          console.log(`      ${i + 1}. ${chapterData.title}`);
          console.log(`         ${chapterData.description}`);
          console.log(`         Durée: ${chapterData.duration}`);
          console.log(`         Leçons: ${chapterData.lessonsIds ? chapterData.lessonsIds.length : 0}`);
          console.log(`         Exercices: ${chapterData.exercisesIds ? chapterData.exercisesIds.length : 0}`);
          
          // Afficher une leçon exemple
          if (chapterData.lessonsIds && chapterData.lessonsIds.length > 0) {
            const lessonDoc = await db.collection('lessons').doc(chapterData.lessonsIds[0]).get();
            if (lessonDoc.exists) {
              const lessonData = lessonDoc.data();
              console.log(`            📹 Leçon: ${lessonData.title} (${lessonData.type}, ${lessonData.duration})`);
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage de l\'exemple:', error);
  }
}

/**
 * Fonction principale de vérification
 */
async function verifyElementaire() {
  console.log('🔍 VÉRIFICATION CONTENU ÉLÉMENTAIRE');
  console.log('='.repeat(60));
  
  const classes = ['CE1', 'CE2', 'CM1'];
  const results = {};
  
  // Vérifier chaque classe
  for (const classe of classes) {
    results[classe] = await verifyClasse(classe);
  }
  
  // Vérifier les relations
  await verifyRelations();
  
  // Afficher un exemple de structure
  await showStructureExample();
  
  // Statistiques finales
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ GÉNÉRAL');
  console.log('='.repeat(60));
  
  let totalMatieres = 0, totalCours = 0, totalChapitres = 0;
  let totalLecons = 0, totalExercices = 0;
  
  for (const [classe, result] of Object.entries(results)) {
    if (result) {
      console.log(`${classe}: ${result.matieres} matières, ${result.cours} cours, ${result.chapitres} chapitres, ${result.lecons} leçons, ${result.exercices} exercices`);
      totalMatieres += result.matieres;
      totalCours += result.cours;
      totalChapitres += result.chapitres;
      totalLecons += result.lecons;
      totalExercices += result.exercices;
    } else {
      console.log(`${classe}: ❌ Erreur de vérification`);
    }
  }
  
  console.log('\n' + '-'.repeat(60));
  console.log(`TOTAL ÉLÉMENTAIRE: ${totalMatieres} matières, ${totalCours} cours, ${totalChapitres} chapitres`);
  console.log(`                   ${totalLecons} leçons, ${totalExercices} exercices`);
  console.log('\n✅ Vérification terminée !');
}

// Exécution
verifyElementaire()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });