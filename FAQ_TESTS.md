# FAQ & AI Chat - Guide de Test

## 🧪 Tests Unitaires Créés

### **Services**
- ✅ `src/__tests__/services/faq.service.test.ts` - Tests FAQ CRUD
- ✅ `src/__tests__/services/ai-chat.service.test.ts` - Tests AI Chat

### **Routes**
- ✅ `src/__tests__/routes/faq.routes.test.ts` - Tests API FAQ
- ✅ `src/__tests__/routes/chat.routes.test.ts` - Tests API Chat

---

## 📝 Exécuter les Tests

### **Tous les tests**
```bash
npm test
```

### **Tests FAQ uniquement**
```bash
npm test faq
```

### **Tests Chat uniquement**
```bash
npm test chat
```

### **Tests avec couverture**
```bash
npm run test:coverage
```

---

## 🎯 Couverture des Tests

### **FaqService**
- ✅ createFaq (création + gestion erreurs)
- ✅ getAllFaqs (récupération + filtres)
- ✅ getFaqById (trouvé/non trouvé + incrémentation vues)
- ✅ searchFaqs (recherche texte + résultats vides)
- ✅ updateFaq (mise à jour + FAQ inexistante)
- ✅ deleteFaq (suppression)
- ✅ markHelpful (utile/pas utile)
- ✅ getFaqStats (statistiques complètes)
- ✅ getFaqsByCategory (filtrage par catégorie)

### **AiChatService**
- ✅ askQuestion (FAQ + AI + gestion erreurs)
- ✅ getConversationHistory (récupération + conversation inexistante)
- ✅ markMessageHelpful (feedback + erreurs)
- ✅ clearConversation (suppression historique)

### **Routes FAQ**
- ✅ POST /api/faqs (création + validation)
- ✅ GET /api/faqs (récupération + filtres)
- ✅ GET /api/faqs/search (recherche + validation)
- ✅ GET /api/faqs/stats (statistiques)
- ✅ GET /api/faqs/category/:category (par catégorie)
- ✅ GET /api/faqs/:id (détails + 404)
- ✅ PUT /api/faqs/:id (mise à jour + 404)
- ✅ POST /api/faqs/:id/helpful (feedback + validation)
- ✅ DELETE /api/faqs/:id (suppression)

### **Routes Chat**
- ✅ POST /api/chat/ask (question + validations)
- ✅ GET /api/chat/history/:userId (historique + 404)
- ✅ POST /api/chat/feedback (feedback + validations)
- ✅ DELETE /api/chat/history/:userId (suppression)

---

## 🔧 Configuration Requise

### **Variables d'environnement (.env)**
```bash
GEMINI_API_KEY=your_api_key_here
FIRESTORE_DATABASE_ID=myschool-1
```

### **Dépendances de test**
```bash
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

---

## 📊 Exemples de Tests

### **Test de création FAQ**
```typescript
it('devrait créer une FAQ avec succès', async () => {
  const faqData = {
    question: 'Comment payer un cours ?',
    answer: 'Vous pouvez payer via Orange Money...',
    category: FaqCategory.PAYMENTS,
    order: 1,
    tags: ['paiement'],
    isActive: true,
  };

  const result = await faqService.createFaq(faqData);

  expect(result.success).toBe(true);
  expect(result.id).toBeDefined();
});
```

### **Test de recherche**
```typescript
it('devrait rechercher des FAQs par texte', async () => {
  const results = await faqService.searchFaqs('paiement');

  expect(Array.isArray(results)).toBe(true);
});
```

### **Test API Chat**
```typescript
it('devrait répondre à une question', async () => {
  const response = await request(app)
    .post('/api/chat/ask')
    .send({
      userId: 'test-user',
      question: 'Comment payer un cours ?',
    })
    .expect(200);

  expect(response.body.success).toBe(true);
  expect(response.body.data.answer).toBeDefined();
});
```

---

## ⚠️ Notes Importantes

1. **Firestore Emulator** : Pour des tests isolés, utilisez l'émulateur Firestore
2. **Gemini API** : En mode test, utilisez une clé API de développement
3. **Cleanup** : Les tests créent des données de test, pensez au nettoyage
4. **Rate Limiting** : Attention aux limites d'appels API Gemini en test

---

## 🚀 Déploiement

### **Compiler et déployer**
```bash
cd functions
npm run build
firebase deploy --only functions
```

### **Tester en production**
```bash
# FAQ
curl https://api-xa66eyezzq-uc.a.run.app/faqs

# Chat
curl -X POST https://api-xa66eyezzq-uc.a.run.app/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","question":"Test"}'
```

---

## 📚 Documentation Complète

- Swagger UI: `https://api-xa66eyezzq-uc.a.run.app/api-docs`
- OpenAPI JSON: `https://api-xa66eyezzq-uc.a.run.app/openapi.json`
