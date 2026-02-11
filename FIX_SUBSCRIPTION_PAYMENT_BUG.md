# 🔧 Correction du problème d'accès aux cours après paiement d'abonnement

## 🐛 Problème identifié

Après un paiement d'abonnement via Wave, l'utilisateur était redirigé vers la page des cours mais **les cours restaient bloqués** malgré le paiement effectué.

## 🔍 Analyse des causes

### Cause racine : Incohérence entre ancien et nouveau modèle

Le service `wave-subscription.service.ts` utilisait l'**ancien modèle** :
- `plan` (MONTHLY, QUARTERLY, ANNUAL)
- `category` (catégorie de cours)

Alors que le système a migré vers le **nouveau modèle classe-based** :
- `niveauScolaire` (ELEMENTAIRE, MOYEN, SECONDAIRE, UNIVERSITAIRE)
- `classe` (CM2, 3ème (BFEM), Terminale S, Licence 2, etc.)
- `typeAbonnement` (CLASSE pour élémentaire, MATIERE pour les autres)
- `matieres` (array de 3 IDs pour type MATIERE)
- Prix unique : **5000 FCFA/an** pour tous

### Conséquences du bug

1. ❌ La méthode `createSubscriptionPayment()` ne recevait pas les bonnes informations
2. ❌ L'abonnement créé en base n'était pas valide (manquait classe, niveauScolaire, typeAbonnement)
3. ❌ Le webhook Wave ne pouvait pas activer correctement l'abonnement
4. ❌ Le champ `user.hasActiveSubscription` restait à `false`
5. ❌ Les cours restaient bloqués car le middleware de vérification d'accès retournait `false`

## ✅ Corrections appliquées

### 1. Mise à jour `wave-subscription.service.ts`

**Avant :**
```typescript
async createSubscriptionPayment(
  plan: string,
  userId: string,
  userInfo: { phone, firstName, lastName },
  category: string  // ❌ Ancien modèle
)
```

**Après :**
```typescript
async createSubscriptionPayment(
  plan: string,
  userId: string,
  userInfo: {
    phone, firstName, lastName,
    classe: string,           // ✅ Nouveau
    niveauScolaire: string,   // ✅ Nouveau
    typeAbonnement: string,   // ✅ Nouveau
    matieres?: string[]       // ✅ Nouveau
  }
)
```

**Changements clés :**
- ✅ Import de `SUBSCRIPTION_PRICE` depuis le modèle (5000 FCFA)
- ✅ Validation du `typeAbonnement` (CLASSE uniquement pour ELEMENTAIRE)
- ✅ Validation des 3 matières pour type MATIERE
- ✅ Création abonnement avec nouveau modèle :
  ```typescript
  await this.subscriptionService.create({
    userId, 
    niveauScolaire, 
    typeAbonnement, 
    classe, 
    matieres
  });
  ```
- ✅ Métadonnées Wave enrichies pour le webhook :
  ```typescript
  metadata: {
    userId, subscriptionId, classe, niveauScolaire,
    typeAbonnement, matieres, type: 'subscription_payment'
  }
  ```

### 2. Mise à jour `subscription.controller.ts`

**Avant :**
```typescript
const paymentData = await waveSubscriptionService.createSubscriptionPayment(
  plan, userId, { phone, firstName, lastName }
); // ❌ Manque classe, niveauScolaire, typeAbonnement
```

**Après :**
```typescript
const paymentData = await waveSubscriptionService.createSubscriptionPayment(
  plan, userId, {
    phone, firstName, lastName,
    classe,                      // ✅ Ajouté
    niveauScolaire: user.niveauScolaire,  // ✅ Ajouté
    typeAbonnement,              // ✅ Ajouté
    matieres                     // ✅ Ajouté
  }
);
```

### 3. Logs détaillés dans `wave.controller.ts`

Ajout de logs complets dans `handleSubscriptionPayment()` :
```typescript
console.log('📋 Traitement paiement abonnement:', {
  subscriptionId, userId, wavePaymentId, metadata
});
console.log('💳 Paiement trouvé:', { paymentId, status, subscriptionId });
console.log('✅ Statut paiement mis à jour: SUCCESS');
console.log('✅ Abonnement activé avec succès');
console.log('🎉 Paiement abonnement complété');
```

### 4. Logs détaillés dans `subscription.service.ts`

Enrichissement de `activateSubscription()` :
```typescript
console.log('🔄 Activation abonnement:', { subscriptionId, paymentId });
console.log('📋 Abonnement trouvé:', { userId, classe, typeAbonnement, status });
console.log('✅ Document subscription mis à jour');
console.log('✅ Profil utilisateur mis à jour:', { userId, hasActiveSubscription: true });
console.log('🎉 Abonnement activé avec succès');
```

### 5. Script de diagnostic

Création de `test-user-subscription.js` pour :
- ✅ Vérifier le profil utilisateur (`hasActiveSubscription`, `subscriptionId`)
- ✅ Lister les abonnements ACTIFS et PENDING
- ✅ Afficher les paiements d'abonnement
- ✅ Détecter les incohérences entre user et subscriptions
- ✅ Proposer des solutions

**Usage :**
```bash
node test-user-subscription.js <userId>
```

## 📋 Flux corrigé (A → Z)

### 1️⃣ Frontend envoie la demande
```json
POST /api/subscriptions/create-payment
{
  "plan": "ANNUAL",
  "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
  "classe": "3ème (BFEM)",
  "typeAbonnement": "MATIERE",
  "matieres": ["matiere1_id", "matiere2_id", "matiere3_id"]
}
```

### 2️⃣ Backend crée l'abonnement PENDING
```typescript
Subscription {
  userId: "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
  niveauScolaire: "MOYEN",  // ✅ Hérité du user
  typeAbonnement: "MATIERE", // ✅ Correct
  classe: "3ème (BFEM)",    // ✅ Obligatoire
  matieres: ["id1", "id2", "id3"], // ✅ 3 matières
  status: "PENDING",
  amount: 5000
}
```

### 3️⃣ Backend crée paiement Wave avec métadonnées
```typescript
Wave.metadata {
  userId, subscriptionId, classe, niveauScolaire,
  typeAbonnement, matieres,
  type: "subscription_payment"  // ✅ Important!
}
```

### 4️⃣ User paie via Wave
L'utilisateur complète le paiement sur l'interface Wave.

### 5️⃣ Webhook Wave appelle le backend
```json
POST /api/wave/webhook
{
  "type": "checkout.session.completed",
  "data": {
    "id": "wave_12345",
    "checkout_status": "successful",
    "metadata": {
      "type": "subscription_payment",
      "subscriptionId": "sub_abc123",
      "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
      "classe": "3ème (BFEM)",
      "typeAbonnement": "MATIERE",
      "matieres": ["id1", "id2", "id3"]
    }
  }
}
```

### 6️⃣ Backend active l'abonnement
1. ✅ Met à jour `subscriptions.status` → `ACTIVE`
2. ✅ Définit `startDate` et `endDate` (+1 an)
3. ✅ Met à jour `user.hasActiveSubscription` → `true`
4. ✅ Met à jour `user.subscriptionId`, `subscriptionStatus`, `subscriptionEndDate`

### 7️⃣ User peut accéder aux cours
Le middleware `hasUnlimitedAccess()` retourne maintenant `true` :
```typescript
// Dans subscription.service.ts
async hasUnlimitedAccess(userId: string): Promise<boolean> {
  const subscription = await this.getActiveSubscription(userId);
  return subscription !== null && subscription.isActive();
}
```

## 🧪 Tests de vérification

### Test 1 : Vérifier l'abonnement d'un utilisateur
```bash
node test-user-subscription.js VLzZCBlJstQOWhJy9Xg4MEO7ESK2
```

**Output attendu :**
```
✅ TOUT EST OK: L'utilisateur a un abonnement actif et peut accéder aux cours
```

### Test 2 : Créer un abonnement de test
```bash
curl -X POST https://api-xa66eyezzq-uc.a.run.app/api/subscriptions/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "ANNUAL",
    "userId": "test_user_id",
    "classe": "CM2",
    "typeAbonnement": "CLASSE"
  }'
```

**Vérifications :**
1. ✅ Response contient `paymentUrl` Wave
2. ✅ `subscriptionId` créé
3. ✅ Document `subscriptions` avec status=PENDING
4. ✅ Metadata contient classe, niveauScolaire, typeAbonnement

### Test 3 : Simuler webhook Wave
```bash
# Utiliser Postman avec signature Wave valide
POST /api/wave/webhook
{
  "type": "checkout.session.completed",
  "data": {
    "id": "wave_test_123",
    "checkout_status": "successful",
    "metadata": {
      "type": "subscription_payment",
      "subscriptionId": "<subscription_id_from_test2>",
      "userId": "test_user_id"
    }
  }
}
```

**Vérifications :**
1. ✅ Logs montrent "Traitement paiement abonnement"
2. ✅ Subscription.status → ACTIVE
3. ✅ User.hasActiveSubscription → true
4. ✅ User peut accéder aux cours

## 🚀 Déploiement

### Étape 1 : Compiler TypeScript
```bash
cd functions
npm run build
```

### Étape 2 : Déployer sur Firebase
```bash
firebase deploy --only functions
```

### Étape 3 : Vérifier le déploiement
```bash
firebase functions:log --follow
```

## 📊 Monitoring post-déploiement

### Logs à surveiller

1. **Création paiement :**
   ```
   💰 Paiement Wave créé: { id, subscriptionId, classe, typeAbonnement }
   ```

2. **Webhook reçu :**
   ```
   📧 Webhook Wave reçu: { type: "checkout.session.completed" }
   📋 Traitement paiement abonnement: { subscriptionId, userId }
   ```

3. **Activation réussie :**
   ```
   ✅ Document subscription mis à jour
   ✅ Profil utilisateur mis à jour: { hasActiveSubscription: true }
   🎉 Abonnement activé avec succès
   ```

### Erreurs potentielles

❌ **"Métadonnées manquantes pour le paiement d'abonnement"**
- Cause : Metadata.type !== "subscription_payment"
- Solution : Vérifier createSubscriptionPayment() dans wave-subscription.service.ts

❌ **"Paiement non trouvé pour wavePaymentId"**
- Cause : Payment pas enregistré dans Firestore
- Solution : Vérifier payment.service.create() dans subscription.controller.ts

❌ **"Abonnement non trouvé"**
- Cause : subscriptionId invalide dans metadata
- Solution : Vérifier que subscription.id est bien dans metadata Wave

## ✅ Checklist avant production

- [x] wave-subscription.service.ts mis à jour avec nouveau modèle
- [x] subscription.controller.ts passe classe, niveauScolaire, typeAbonnement
- [x] Logs détaillés ajoutés dans webhook et activation
- [x] Script de diagnostic créé (test-user-subscription.js)
- [ ] Tests avec un vrai paiement Wave en environnement staging
- [ ] Vérification des logs dans Firebase Console
- [ ] Documentation mise à jour (SUBSCRIPTION_SYSTEM.md)
- [ ] Frontend informé des changements de réponse API

## 📞 Support

En cas de problème, vérifier dans cet ordre :

1. **Logs Firebase Functions** → `firebase functions:log --follow`
2. **Script diagnostic** → `node test-user-subscription.js <userId>`
3. **Firestore Console** → Vérifier collections `subscriptions` et `utilisateur`
4. **Dashboard Wave** → Vérifier que le webhook est enregistré

---

**Date de correction :** 4 février 2026  
**Version API :** 2.2.0  
**Impact :** Tous les paiements d'abonnement via Wave
