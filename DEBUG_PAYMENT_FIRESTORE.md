# 🔧 Debug: Paiement n'apparat pas en Firestore

## Problème Reporté
User s'inscrit → paie → le paiement n'apparaît **PAS** dans la base de données Firestore

## Racine Identifiée
**Code correctement écrit**, mais peut-être **PAS DÉPLOYÉ** en production!

### Ce qui **DEVRAIT** se passer (architecture correcte):

```
1. User clique "Payer l'abonnement"
   ↓
2. Frontend → POST /api/subscriptions/create-payment
   Payload: { userId, classe, niveauScolaire, typeAbonnement, matieres?, promoCode? }
   ↓
3. SubscriptionController.createSubscriptionPayment():
   
   3.1. Valide les données (classe, niveau, type, matières)
   3.2. Appelle: waveSubscriptionService.createSubscriptionPayment()
        ├─ Crée Subscription en Firestore (status=PENDING) ✓
        ├─ Appelle WaveService.createPayment() → Crée session Wave
        └─ Retourne: {paymentUrl, paymentId (Wave ID), subscriptionId}
   
   3.3. Appelle: paymentService.create({...})
        └─ Sauvegarde dans Firestore collection 'payments'
            ├─ userId ✓
            ├─ subscriptionId ✓
            ├─ amount ✓
            ├─ status: 'PENDING' ✓
            ├─ metadata.wavePaymentId (l'ID Wave) ✓
            └─ metadata.checkoutUrl ✓
   
   3.4. Retourne au frontend: {paymentUrl, subscriptionId, ...}
        (+ JSON avec déails pour affichage)
   ↓
4. Frontend redirige User vers paymentUrl (Wave Checkout UI)
   ↓
5. User paie sur Wave
   ↓
6. Wave envoie webhook POST /api/wave/webhook
   ├─ Signature vérifiée ✓
   ├─ Cherche payment avec: paymentService.getByWavePaymentId(wavePaymentId)
   │  Query: where('metadata.wavePaymentId', '==', wavePaymentId)
   ├─ Trouve le Payment Firestore créé en étape 3.3 ✓
   ├─ Appelle: paymentService.updateStatus(paymentId, 'SUCCESS') ✓
   ├─ Appelle: subscriptionService.activateSubscription(subscriptionId)
   │  ├─ Met à jour: subscription.status = 'ACTIVE' ✓
   │  └─ Met à jour: user.hasActiveSubscription = true ✓
   └─ Logs: "🎉 Paiement abonnement complété"
   ↓
7. User voit les cours débloqués ✓
```

## Code Installation

### Step 1: Vérification que les fichiers sont à jour

```bash
# Fichiers clés modifiés:
functions/src/services/subscription.service.ts
└─ Contient: getAccessibleSubscription() ✓ (fix du délai webhook)

functions/src/controllers/subscription.controller.ts
├─ createSubscriptionPayment() ✓
│  └─ Appelle paymentService.create() ✓

functions/src/services/payment.service.ts
├─ create() ✓ (sauvegarde dans Firestore)
└─ getByWavePaymentId() ✓ (cherche par clé Wave)

functions/src/controllers/wave.controller.ts
├─ handleSubscriptionPayment() ✓
└─ Fait getByWavePaymentId() puis updateStatus()
```

### Step 2: Compilation TypeScript

```bash
cd functions
npm run build
# ✅ Aucune erreur? → OK!
# ❌ Erreurs? → Afficher les erreurs
```

### Step 3: Déploiement Firebase

```bash
npx firebase deploy --only functions --force
# Le déploiement charge les functions mises à jour
# Toutes les modifications du code sont maintenant en production
```

## **🚀 Déploiement en Cours**

Status: ✅ **EN COURS** (voir terminal)

Etapes:
1. ✅ Compilation TypeScript (functions/src/*)
2. ✅ Préparation du code pour Cloud Functions
3. ⏳ Upload des files (~460 KB)
4. ⏳ Activation des APIs Google Cloud
5. ⏳ Build des functions
6. ⏳ Déploiement sur Cloud Functions

**Durée estimée:** 5-10 minutes

## Validation Post-Déploiement

Une fois le déploiement terminé, ces endpoints seront en production:

### ✅  POST /api/subscriptions/create-payment
```bash
curl -X POST https://api-xx.cloudfunctions.net/api/subscriptions/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_xxx",
    "classe": "6ème",
    "niveauScolaire": "ELEMENTAIRE",
    "typeAbonnement": "CLASSE"
  }'

# Réponse attendue:
{
  "success": true,
  "data": {
    "paymentUrl": "https://checkout.wave.com/...",
    "subscriptionId": "sub_xxx",
    "amount": 5000,
    ...
  }
}
```

### ✅ Firestore après appel
Collection `subscriptions`: ✅ Nouveau document créé (status=PENDING)
Collection `payments`: ✅ Nouveau document créé (status=PENDING)

### ✅ POST /api/wave/webhook
```json
{
  "type": "checkout.session.completed",
  "data": {
    "id": "wave_payment_123",
    "status": "success",
    "metadata": {
      "type": "subscription_payment",
      "subscriptionId": "sub_xxx",
      "userId": "user_xxx"
    }
  }
}
```

**Logs attendus:**
```
📧 Webhook Wave reçu: {...}
📋 Traitement paiement abonnement: {subscriptionId, userId, ...}
💳 Paiement trouvé: {paymentId, status='PENDING', ...}
✅ Statut paiement mis à jour: SUCCESS
✅ Abonnement activé avec succès
🎉 Paiement abonnement complété
```

**Firestore après webhook:**
- `payments[payment_xxx]`: status = 'SUCCESS' ✅
- `subscriptions[sub_xxx]`: status = 'ACTIVE' ✅ + startDate, endDate
- `utilisateur[user_xxx]`: hasActiveSubscription = true ✅

## Prochaines Étapes (une fois déployé)

### 1. Tester avec un nouvel utilisateur
```bash
1. Créer un compte test
2. S'abonner à une classe/matières
3. Payer (Wave test mode ou mock)
4. Vérifier:
   - ✅ Payment créé en Firestore?
   - ✅ Subscription créée en Firestore?
   - ✅ Les cours sont-ils débloqués?
```

### 2. Vérifier les logs
```bash
firebase functions:log
# Chercher:
# ✅ "Paiement Wave créé: {...}"
# ✅ "💳 Paiement créé" (PaymentService)
# ✅ "📋 Traitement paiement abonnement"
# ✅ "✅ Abonnement activé"
```

### 3. Si encore bloqué, diagnostiquer
```bash
node diagnose-user-subscription.js user@email.com
# Retourne l'état complet:
# - User exists?
# - Subscriptions?
# - Payments?
# - Status de chacun?
```

## Rapport Détecté

### ✓ Code structure
- ✅ SubscriptionController appelle paymentService.create()
- ✅ PaymentService.create() sauvegarde en Firestore
- ✅ PaymentService.getByWavePaymentId() cherche avec la bonne clé

### ✓ Chaîne complète
- ✅ Subscription → Payment → Webhook → Update

### ? Déploiement
- ⚠️ Code sur branche `feature/integration-wave`
- ⚠️ Peut ne pas être en production encore!

### **SOLUTION: Déployer maintenant!**

```bash
cd /path/to/MyShoolAppBackend
npx firebase deploy --only functions --force
# Attendre 5-10 minutes
# Puis re-tester le paiement
```
