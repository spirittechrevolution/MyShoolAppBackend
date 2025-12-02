# Configuration du système FAQ/Chat AI

## 📋 Vue d'ensemble

Le système FAQ/Chat AI de MySchool utilise une approche hybride :
1. **Recherche dans les FAQs** (Firestore) - Réponses rapides et précises
2. **Intelligence Artificielle** (Google Gemini) - Réponses contextuelles pour questions non couvertes

## 🔑 Configuration de Google Gemini API

### 1. Obtenir une clé API Gemini

1. Visitez [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Create API Key"
4. Copiez la clé générée

### 2. Configuration locale (.env)

Éditez `functions/.env` :

```env
# Google Gemini AI (Pour le chatbot FAQ)
GEMINI_API_KEY=votre_cle_api_gemini_ici
```

### 3. Configuration Production (Firebase Functions)

Pour déployer en production, configurez la clé via Firebase CLI :

```bash
# Méthode 1: Via Firebase CLI (RECOMMANDÉ)
firebase functions:secrets:set GEMINI_API_KEY
# Entrez votre clé quand demandé

# Méthode 2: Via variables d'environnement
firebase functions:config:set gemini.api_key="votre_cle_api_gemini_ici"

# Redéployer les fonctions
firebase deploy --only functions:api
```

### 4. Vérification

Après déploiement, vérifiez les logs :

```bash
firebase functions:log
```

Vous ne devriez plus voir : `⚠️ GEMINI_API_KEY non configurée`

## 🚀 Endpoints disponibles

### FAQ Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/faqs` | Créer une FAQ |
| GET | `/faqs` | Lister toutes les FAQs |
| GET | `/faqs/search?q=...` | Rechercher dans les FAQs |
| GET | `/faqs/stats` | Statistiques des FAQs |
| GET | `/faqs/category/:category` | FAQs par catégorie |
| GET | `/faqs/:id` | Obtenir une FAQ |
| PUT | `/faqs/:id` | Mettre à jour une FAQ |
| DELETE | `/faqs/:id` | Supprimer une FAQ |
| POST | `/faqs/:id/helpful` | Marquer comme utile |

### Chat AI Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/chat/ask` | Poser une question au chatbot |
| GET | `/chat/history/:userId` | Historique de conversation |
| POST | `/chat/feedback` | Donner un feedback |
| DELETE | `/chat/history/:userId` | Effacer l'historique |

## 📝 Catégories de FAQ

```typescript
enum FaqCategory {
  GENERAL = 'general',           // Questions générales
  PAYMENTS = 'payments',         // Paiements et facturation
  COURSES = 'courses',           // Cours et contenu
  ENROLLMENT = 'enrollment',     // Inscriptions
  CERTIFICATES = 'certificates', // Certificats
  TECHNICAL = 'technical',       // Problèmes techniques
  ACCOUNT = 'account',          // Compte utilisateur
  REFERRAL = 'referral'         // Programme de parrainage
}
```

## 🧪 Tests

### Créer une FAQ

```bash
curl -X POST https://api-xa66eyezzq-uc.a.run.app/faqs \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Comment s'\''inscrire sur la plateforme ?",
    "answer": "Pour vous inscrire, cliquez sur '\''S'\''inscrire'\'' en haut à droite, remplissez le formulaire et validez votre email.",
    "category": "account",
    "tags": ["inscription", "compte", "email"],
    "isActive": true
  }'
```

### Poser une question au chatbot

```bash
curl -X POST https://api-xa66eyezzq-uc.a.run.app/chat/ask \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "question": "Comment s'\''inscrire sur la plateforme ?"
  }'
```

**Réponse si FAQ trouvée :**
```json
{
  "answer": "Pour vous inscrire, cliquez sur 'S'inscrire'...",
  "source": "faq",
  "faqId": "abc123",
  "conversationId": "conv_user123"
}
```

**Réponse si FAQ non trouvée (IA) :**
```json
{
  "answer": "MySchool est une plateforme d'apprentissage...",
  "source": "ai",
  "conversationId": "conv_user123"
}
```

## 🔍 Recherche dans les FAQs

```bash
curl -X GET "https://api-xa66eyezzq-uc.a.run.app/faqs/search?q=inscription&category=account&limit=5"
```

## 📊 Statistiques

```bash
curl -X GET https://api-xa66eyezzq-uc.a.run.app/faqs/stats
```

**Réponse :**
```json
{
  "total": 45,
  "byCategory": {
    "general": 8,
    "payments": 12,
    "courses": 10,
    "enrollment": 6,
    "certificates": 3,
    "technical": 4,
    "account": 2,
    "referral": 0
  },
  "active": 42,
  "inactive": 3,
  "mostHelpful": [
    {
      "id": "faq1",
      "question": "Comment payer ?",
      "helpfulCount": 156
    }
  ]
}
```

## 🛡️ Mode Fallback

**Sans GEMINI_API_KEY :**
- ✅ Les FAQs fonctionnent normalement
- ⚠️ Le chatbot AI retourne un message d'erreur
- 💡 Les utilisateurs ne voient que les résultats de recherche FAQ

**Avec GEMINI_API_KEY :**
- ✅ Les FAQs fonctionnent normalement
- ✅ Le chatbot AI répond aux questions non couvertes
- ✨ Expérience utilisateur complète

## 🔐 Sécurité CORS

Les origines suivantes sont autorisées :
- `http://localhost:4200-4205` (Développement)
- `https://myschool-f862b.web.app` (Production)
- `https://myschool-f862b.firebaseapp.com` (Production)
- `https://us-central1-myschool-f862b.cloudfunctions.net` (Swagger UI)
- `https://api-xa66eyezzq-uc.a.run.app` (Cloud Run)

## 📚 Documentation complète

Swagger UI : https://api-xa66eyezzq-uc.a.run.app/api-docs

## 🐛 Dépannage

### Erreur CORS
```
Error: Non autorisé par CORS
```
**Solution :** Vérifiez que l'origine de votre application est dans `allowedOrigins` (api.ts)

### Chat AI désactivé
```
⚠️ GEMINI_API_KEY non configurée
```
**Solution :** Configurez la clé Gemini (voir section Configuration)

### FAQ non trouvée
```
{ "success": false, "message": "FAQ non trouvée" }
```
**Solution :** Vérifiez que l'ID de la FAQ est correct ou créez la FAQ

## 💡 Bonnes pratiques

1. **Créer des FAQs complètes** avant de compter sur l'IA
2. **Utiliser des tags pertinents** pour améliorer la recherche
3. **Surveiller les feedbacks** (helpful/not helpful) pour améliorer
4. **Analyser les conversations AI** pour créer de nouvelles FAQs
5. **Garder les FAQs à jour** avec les changements de la plateforme

## 📞 Support

Pour toute question, consultez :
- La documentation Swagger
- Les tests unitaires dans `__tests__/`
- Le fichier `FAQ_TESTS.md`
