const http = require('http');

console.log('🔍 Test de l\'API tokens (sans index requis)...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/push-notifications/tokens/Cn8YpH1RBhOUcCZfrstJAwV2XbA3',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📋 Réponse tokens:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Erreur: ${e.message}`);
});

req.end();