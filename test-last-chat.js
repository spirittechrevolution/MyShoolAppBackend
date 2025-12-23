/**
 * Test de l'API pour récupérer le dernier chat d'un utilisateur
 * Test simple pour vérifier le bon fonctionnement de l'endpoint
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const TEST_USER_ID = 'uGbrU72VFWfWZcUkvk31QaOi7tG3';

async function testLastChatAPI() {
  console.log('🧪 Test de l\'API dernier chat...\n');

  try {
    // 1. Tester l'endpoint du dernier chat
    console.log('📞 Test GET /api/chat/last/' + TEST_USER_ID);
    
    const response = await axios.get(`${BASE_URL}/chat/last/${TEST_USER_ID}`);
    
    console.log('✅ Statut:', response.status);
    console.log('📄 Réponse:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data.lastMessage) {
      console.log('\n✅ Test réussi: Dernier message récupéré');
      console.log('💬 Rôle:', response.data.data.lastMessage.role);
      console.log('📝 Contenu:', response.data.data.lastMessage.content.substring(0, 100) + '...');
    } else {
      console.log('\n⚠️ Aucun message trouvé pour cet utilisateur');
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Erreur HTTP:', error.response.status);
      console.log('📄 Message:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 404) {
        console.log('\n💡 Suggestion: L\'utilisateur n\'a peut-être pas encore de conversation.');
        console.log('   Essayez d\'abord d\'envoyer un message via /api/chat/ask');
      }
    } else {
      console.log('❌ Erreur:', error.message);
    }
  }
}

// Exécuter le test si ce fichier est appelé directement
if (require.main === module) {
  testLastChatAPI();
}

module.exports = { testLastChatAPI };