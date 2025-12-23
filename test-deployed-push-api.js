const https = require('https');

console.log('🔍 Test de l\'API push notifications déployée...\n');

const url = 'https://us-central1-myschool-f862b.cloudfunctions.net/api/push-notifications/user/Cn8YpH1RBhOUcCZfrstJAwV2XbA3?limit=50';

https.get(url, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📋 Réponse:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
}).on('error', (e) => {
  console.error(`❌ Erreur: ${e.message}`);
});