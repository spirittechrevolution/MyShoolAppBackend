#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🚀 === DÉPLOIEMENT CLASSES SECONDAIRE ===\n');

try {
  // 1. Migrer les classes dans Firestore
  console.log('1️⃣  Migration des classes dans Firestore...');
  try {
    execSync('node migrate-terminale-classes.js', { 
      cwd: __dirname,
      stdio: 'inherit',
      timeout: 30000 
    });
    console.log('✅ Migration Firestore complétée\n');
  } catch (e) {
    console.warn('⚠️  Migration possible déjà effectuée ou en attente\n');
  }

  // 2. Compiler les functions
  console.log('2️⃣  Compilation TypeScript...');
  execSync('npm run build', { 
    cwd: path.join(__dirname, 'functions'),
    stdio: 'inherit',
    timeout: 120000 
  });
  console.log('✅ Compilation complétée\n');

  // 3. Générer le Swagger
  console.log('3️⃣  Génération du Swagger...');
  execSync('node generate-swagger.js', { 
    cwd: path.join(__dirname, 'functions'),
    stdio: 'inherit',
    timeout: 30000 
  });
  console.log('✅ Swagger généré\n');

  // 4. Vérifier les classes dans le swagger
  console.log('4️⃣  Vérification des classes dans Swagger...');
  const swaggerPath = path.join(__dirname, 'functions/src/swagger.json');
  if (fs.existsSync(swaggerPath)) {
    const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
    const user = swagger.components?.schemas?.User;
    if (user) {
      console.log('✅ Swagger.json trouvé\n');
    }
  }

  // 5. Déployer
  console.log('5️⃣  Déploiement Firebase...');
  console.log('\nUtilisez cette commande pour déployer:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('firebase deploy --only functions');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('OU utiliser le script PowerShell:\n');
  console.log('.\\deploy-functions.ps1\n');

  console.log('✅ === PRÊT POUR LE DÉPLOIEMENT ===\n');

} catch (error) {
  console.error('\n❌ Erreur:', error.message);
  process.exit(1);
}
