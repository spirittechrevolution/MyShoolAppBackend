/**
 * Test simple de l'API Push Notifications
 */

const https = require('https');

const url = 'https://us-central1-myschool-f862b.cloudfunctions.net/api/push-notifications/user/Cn8YpH1RBhOUcCZfrstJAwV2XbA3?limit=50';

console.log('Test API Push Notifications...');

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Status:', res.statusCode);
      console.log('Success:', response.success);
      console.log('Count:', response.count);
      
      if (response.data && response.data.length > 0) {
        console.log('Notifications:');
        response.data.forEach((notif, index) => {
          console.log(`  ${index + 1}. ${notif.title} - ${notif.type}`);
        });
      } else {
        console.log('Aucune notification trouvee');
      }
      
    } catch (error) {
      console.log('Erreur parsing JSON:', error.message);
      console.log('Raw response:', data);
    }
  });
}).on('error', (error) => {
  console.log('Erreur reseau:', error.message);
});