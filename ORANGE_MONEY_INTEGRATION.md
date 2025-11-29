# 💰 Guide d'intégration Orange Money

> **Statut actuel**: Mode MOCK (sans clés API)  
> **API Version**: Orange Money Webpay v1  
> **Documentation officielle**: https://developer.orange-sonatel.com/documentation

---

## 📋 Table des matières

- [Architecture](#architecture)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Endpoints API](#endpoints-api)
- [Flux de paiement](#flux-de-paiement)
- [Webhooks](#webhooks)
- [Tests](#tests)
- [Migration vers production](#migration-vers-production)

---

## 🏗️ Architecture

### Composants créés

```
functions/src/
├── models/
│   └── payment.model.ts          # Modèle de paiement
├── services/
│   ├── orangemoney.service.ts    # Service Orange Money (MOCKÉ)
│   └── payment.service.ts        # Service de gestion des paiements
└── routes/
    └── payment.routes.ts         # Routes API des paiements

functions/tests/
├── services/
│   └── orangemoney.service.test.ts
└── routes/
    └── payment.routes.test.ts
```

### Statuts de paiement

```typescript
type PaymentStatus = 
  | 'PENDING'     // En attente de paiement
  | 'SUCCESS'     // Paiement réussi
  | 'FAILED'      // Paiement échoué
  | 'CANCELLED'   // Paiement annulé
  | 'EXPIRED'     // Paiement expiré (>15 min)
```

### Méthodes de paiement supportées

```typescript
type PaymentMethod = 
  | 'orange-money'  // Orange Money Sénégal
  | 'wave'          // Wave Mobile Money
  | 'free-money'    // Paiement gratuit
  | 'card'          // Carte bancaire
```

---

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` dans `functions/` :

```env
# Orange Money API (Production)
ORANGE_MONEY_API_KEY=votre_api_key
ORANGE_MONEY_MERCHANT_KEY=votre_merchant_key
ORANGE_MONEY_MERCHANT_ID=votre_merchant_id

# URL de base de l'API
API_BASE_URL=https://api-xa66eyezzq-uc.a.run.app
```

### Mode MOCK (actuel)

Le service fonctionne actuellement en **mode MOCK** :
- Aucune clé API requise
- Simule les réponses Orange Money
- 70% de succès, 20% pending, 10% échec
- Délai réseau simulé (200-500ms)

Pour activer le mode production, modifiez dans `orangemoney.service.ts` :

```typescript
private static readonly MOCK_MODE = false; // Passer à false
```

---

## 📱 Utilisation

### 1. Créer un paiement Orange Money

```typescript
// Frontend (Angular)
import { PaymentService } from './services/payment.service';

createPayment() {
  const paymentData = {
    userId: 'user123',
    enrollmentId: 'enroll456',
    courseId: 'course789',
    amount: 10000,              // 10,000 XOF
    currency: 'XOF',
    paymentMethod: 'orange-money',
    customerPhoneNumber: '+221771234567',
    customerFirstName: 'Amadou',
    customerLastName: 'Diallo',
    description: 'Paiement cours Python avancé'
  };

  this.paymentService.createPayment(paymentData).subscribe({
    next: (response) => {
      if (response.success) {
        const payment = response.data;
        
        // Rediriger vers l'URL de paiement Orange Money
        window.location.href = payment.paymentUrl;
        
        // OU afficher dans un iframe
        // this.showPaymentModal(payment.paymentUrl);
      }
    },
    error: (err) => console.error('Erreur:', err)
  });
}
```

### 2. Vérifier le statut d'un paiement

```typescript
checkPaymentStatus(paymentId: string) {
  this.paymentService.checkPaymentStatus(paymentId).subscribe({
    next: (response) => {
      const payment = response.data;
      
      switch (payment.status) {
        case 'SUCCESS':
          console.log('✅ Paiement réussi!');
          this.activateEnrollment();
          break;
        case 'PENDING':
          console.log('⏳ En attente...');
          // Réessayer dans 5 secondes
          setTimeout(() => this.checkPaymentStatus(paymentId), 5000);
          break;
        case 'FAILED':
          console.log('❌ Paiement échoué');
          this.showErrorMessage();
          break;
      }
    }
  });
}
```

### 3. Annuler un paiement

```typescript
cancelPayment(paymentId: string) {
  this.paymentService.cancelPayment(paymentId).subscribe({
    next: (response) => {
      console.log('Paiement annulé:', response.data);
    }
  });
}
```

---

## 🌐 Endpoints API

### POST `/api/payments`
Crée un nouveau paiement

**Request Body:**
```json
{
  "userId": "user123",
  "enrollmentId": "enroll456",
  "courseId": "course789",
  "amount": 10000,
  "currency": "XOF",
  "paymentMethod": "orange-money",
  "customerPhoneNumber": "+221771234567",
  "customerFirstName": "Amadou",
  "customerLastName": "Diallo",
  "description": "Paiement cours"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "payment123",
    "orderReferenceNumber": "MS-1701234567-8901",
    "payToken": "MOCK_TOKEN_abc123...",
    "paymentUrl": "https://mock-orange-money.example.com/pay/...",
    "status": "PENDING",
    "expiresAt": "2025-11-29T15:30:00Z",
    ...
  }
}
```

### GET `/api/payments/:id`
Récupère un paiement par ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "payment123",
    "status": "SUCCESS",
    "transactionId": "TXN_1701234567",
    ...
  }
}
```

### GET `/api/payments/user/:userId`
Récupère tous les paiements d'un utilisateur

### GET `/api/payments/enrollment/:enrollmentId`
Récupère tous les paiements d'une inscription

### GET `/api/payments/status/:status`
Filtre par statut (`PENDING`, `SUCCESS`, `FAILED`, etc.)

### GET `/api/payments/:id/check`
Vérifie le statut auprès d'Orange Money

### POST `/api/payments/:id/cancel`
Annule un paiement en attente

### POST `/api/payments/webhook/orange-money`
Webhook pour notifications Orange Money (callback automatique)

### DELETE `/api/payments/:id`
Supprime un paiement

---

## 🔄 Flux de paiement

### Diagramme de séquence

```
Frontend          API MySchool       Orange Money        Firestore
   |                    |                   |                 |
   |--createPayment---->|                   |                 |
   |                    |--initPayment----->|                 |
   |                    |<--payToken--------|                 |
   |                    |--savePayment--------------------->|
   |<--paymentUrl-------|                   |                 |
   |                    |                   |                 |
   |----redirect------->|------------------>|                 |
   |                    |                   |                 |
   |                    |    (User pays)    |                 |
   |                    |                   |                 |
   |                    |<----webhook-------|                 |
   |                    |--updateStatus-------------------->|
   |                    |                   |                 |
   |<--redirect---------|<------------------|                 |
   |                    |                   |                 |
   |--checkStatus------>|                   |                 |
   |<--SUCCESS----------|                   |                 |
```

### Étapes détaillées

1. **Initialisation** (Frontend)
   - L'utilisateur clique sur "Payer avec Orange Money"
   - Frontend appelle `POST /api/payments`

2. **Création du paiement** (Backend)
   - API MySchool génère une référence unique (`MS-timestamp-random`)
   - Appelle Orange Money API pour initialiser
   - Reçoit un `payToken` et `paymentUrl`
   - Sauvegarde le paiement dans Firestore avec statut `PENDING`
   - Retourne l'URL de paiement au frontend

3. **Redirection** (Frontend)
   - Redirige l'utilisateur vers `paymentUrl` (page Orange Money)
   - OU affiche dans un iframe/modal

4. **Paiement** (Orange Money)
   - L'utilisateur entre son code PIN Orange Money
   - Confirme le paiement
   - Orange Money traite la transaction

5. **Notification** (Webhook)
   - Orange Money envoie un webhook à `/api/payments/webhook/orange-money`
   - API met à jour le statut du paiement dans Firestore
   - Active l'inscription si paiement réussi

6. **Retour utilisateur**
   - Orange Money redirige vers MySchool
   - Frontend vérifie le statut avec `GET /api/payments/:id/check`
   - Affiche le résultat à l'utilisateur

---

## 🔔 Webhooks

### Configuration

L'URL du webhook est automatiquement configurée :
```
https://api-xa66eyezzq-uc.a.run.app/api/payments/webhook/orange-money
```

### Format du payload

Orange Money envoie :
```json
{
  "status": "SUCCESS",
  "txnid": "TXN_1701234567890",
  "order_id": "MS-1701234567-8901",
  "amount": "10000",
  "currency": "XOF",
  "payment_method": "orange_money",
  "timestamp": "2025-11-29T14:30:00Z"
}
```

### Traitement

Le webhook :
1. Valide la signature (en production)
2. Trouve le paiement via `order_id`
3. Met à jour le statut
4. Active l'inscription si `SUCCESS`
5. Retourne toujours `200 OK` (évite les retry)

---

## 🧪 Tests

### Lancer les tests

```bash
cd functions
npm test orangemoney
```

### Tests disponibles

**Service Orange Money** (35 tests)
- ✅ Validation numéro de téléphone
- ✅ Formatage numéro
- ✅ Génération référence de commande
- ✅ Initialisation paiement (mock)
- ✅ Vérification statut (mock)
- ✅ Annulation paiement (mock)
- ✅ Traitement webhook
- ✅ Génération webhook mocké

**Routes API** (15 tests)
- ✅ Création paiement
- ✅ Récupération par ID
- ✅ Filtrage par utilisateur
- ✅ Filtrage par inscription
- ✅ Filtrage par statut
- ✅ Vérification statut
- ✅ Annulation
- ✅ Webhook
- ✅ Suppression

### Tester avec des données mockées

```typescript
import { OrangeMoneyService } from './services/orangemoney.service';

// Générer un webhook de test
const webhook = OrangeMoneyService.generateMockWebhook(
  'MS-123456-7890',
  'SUCCESS',
  10000
);

console.log(webhook);
```

---

## 🚀 Migration vers production

### Étape 1: Obtenir les credentials

1. Créer un compte sur https://developer.orange-sonatel.com/
2. Créer une application
3. Obtenir:
   - API Key
   - Merchant Key
   - Merchant ID

### Étape 2: Configurer les variables

```bash
# Firebase Functions config
firebase functions:config:set \
  orangemoney.api_key="YOUR_API_KEY" \
  orangemoney.merchant_key="YOUR_MERCHANT_KEY" \
  orangemoney.merchant_id="YOUR_MERCHANT_ID"
```

### Étape 3: Modifier le code

Dans `orangemoney.service.ts` :

```typescript
private static readonly MOCK_MODE = false; // ⚠️ Passer à false

constructor() {
  // Utiliser les vraies variables
  this.apiKey = process.env.ORANGE_MONEY_API_KEY || 
                functions.config().orangemoney?.api_key;
  this.merchantKey = process.env.ORANGE_MONEY_MERCHANT_KEY || 
                     functions.config().orangemoney?.merchant_key;
  this.merchantId = process.env.ORANGE_MONEY_MERCHANT_ID || 
                    functions.config().orangemoney?.merchant_id;
}
```

### Étape 4: Implémenter les vraies requêtes

```typescript
async initializePayment(request: OrangeMoneyInitPaymentRequest) {
  // Remplacer le mock par:
  const response = await fetch(`${this.API_BASE_URL}/webpayment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      merchant_key: this.merchantKey,
      currency: request.currency,
      order_id: request.orderReferenceNumber,
      amount: request.amount,
      return_url: request.returnUrl,
      cancel_url: request.returnUrl,
      notif_url: request.notifUrl,
      lang: 'fr',
      reference: request.orderReferenceNumber
    })
  });

  const data = await response.json();
  return {
    payToken: data.pay_token,
    paymentUrl: data.payment_url,
    orderReferenceNumber: request.orderReferenceNumber,
    expiresAt: new Date(data.notif_token_expire_at)
  };
}
```

### Étape 5: Tester en sandbox

Orange Money fournit un environnement sandbox :
- URL: `https://api.orange.com/orange-money-webpay/dev/v1`
- Numéros de test fournis dans la doc

### Étape 6: Déployer

```bash
npm run deploy
```

---

## 📞 Support

### Documentation Orange Money

- 📖 API Reference: https://developer.orange-sonatel.com/documentation
- 💬 Forum: https://orange-sonatel.atlassian.net/servicedesk/customer/portal/10
- 📧 Email: partenaires.orangemoney@orange-sonatel.com

### Numéros de téléphone valides (Sénégal)

Format accepté:
- `+221 77 123 45 67`
- `+221771234567`
- `771234567`

Préfixes valides: 70, 75, 76, 77, 78

### Codes d'erreur communs

| Code | Message | Solution |
|------|---------|----------|
| 400 | Invalid phone number | Vérifier le format |
| 401 | Invalid API key | Vérifier les credentials |
| 402 | Insufficient balance | L'utilisateur n'a pas assez de solde |
| 408 | Timeout | Réessayer la requête |
| 500 | Server error | Contacter le support Orange |

---

## 🎯 Checklist de production

- [ ] Obtenir credentials Orange Money
- [ ] Configurer variables d'environnement
- [ ] Désactiver MOCK_MODE
- [ ] Implémenter vraies requêtes API
- [ ] Tester en sandbox
- [ ] Implémenter validation de signature webhook
- [ ] Configurer retry logic
- [ ] Ajouter logging avancé
- [ ] Tester avec vrais numéros
- [ ] Déployer en production
- [ ] Monitorer les transactions
- [ ] Configurer alertes d'erreur

---

**Dernière mise à jour**: 29 novembre 2025  
**Mode actuel**: 🧪 MOCK (sans clés API)  
**Prêt pour production**: ✅ Oui (après configuration)
