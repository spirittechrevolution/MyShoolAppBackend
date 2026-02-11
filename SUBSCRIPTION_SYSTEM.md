# 📋 SYSTÈME D'ABONNEMENT - MySchool

## 🎯 Vue d'ensemble

MySchool propose **deux modèles d'accès** aux cours :
1. **Achat individuel** : L'utilisateur achète un cours spécifique (19.99 XOF par exemple)
2. **Abonnement profil** : L'utilisateur souscrit à un abonnement pour un accès illimité à TOUS les cours

---

## 💰 Plans d'abonnement

| Plan | Prix (XOF) | Durée | Économie |
|------|------------|-------|----------|
| **MONTHLY** | 5,000 | 1 mois | - |
| **QUARTERLY** | 12,000 | 3 mois | 3,000 XOF (20%) |
| **ANNUAL** | 40,000 | 1 an | 20,000 XOF (33%) |

### Calcul des économies
- **Mensuel** : 5,000 × 12 = 60,000 XOF/an
- **Trimestriel** : 12,000 × 4 = 48,000 XOF/an ➜ **Économie : 12,000 XOF**
- **Annuel** : 40,000 XOF/an ➜ **Économie : 20,000 XOF**

---

## 🔄 Flux de paiement d'abonnement

### Phase 1 : Demande d'abonnement
**Client → Backend**
```http
POST /api/subscriptions/create-payment
Content-Type: application/json

{
  "plan": "MONTHLY",
  "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2"
}
```

### Phase 2 : Vérifications backend
1. ✅ **Vérifier l'existence de l'utilisateur**
2. ✅ **Vérifier qu'il n'a pas déjà un abonnement actif**
3. ✅ **Créer l'abonnement avec status = PENDING**

### Phase 3 : Création du paiement Wave
```typescript
// Backend crée l'abonnement en base
const subscription = await subscriptionService.create({
  userId: "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
  plan: "MONTHLY",
  status: "PENDING",
  startDate: new Date(),
  endDate: calculateEndDate("MONTHLY"), // +1 mois
  autoRenew: false
});

// Backend crée le paiement Wave
const wavePayment = await waveService.createPayment({
  amount: 5000,
  currency: "XOF",
  customer_phone: "765868942",
  customer_first_name: "Serigne Fallou",
  customer_last_name: "Sow",
  success_url: "https://myschool.app/subscription-success",
  error_url: "https://myschool.app/subscription-error",
  metadata: {
    type: "subscription_payment",  // ⚠️ Important pour différencier du course_payment
    userId: "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
    subscriptionId: subscription.id,
    plan: "MONTHLY"
  }
});
```

### Phase 4 : Réponse au client
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://checkout.wave.com/pay/abc123",
    "paymentId": "wave_12345",
    "subscriptionId": "sub_abc123",
    "amount": 5000,
    "plan": "MONTHLY",
    "currency": "XOF"
  },
  "message": "Paiement d'abonnement créé avec succès"
}
```

### Phase 5 : Redirection vers Wave
Le client est redirigé vers `paymentUrl` pour compléter le paiement.

### Phase 6 : Paiement Wave
L'utilisateur complète le paiement sur Wave avec son numéro Orange Money : **76 586 89 42**

### Phase 7 : Webhook Wave → Backend
```http
POST /api/wave/webhook
X-Wave-Signature: sha256_signature_here
Content-Type: application/json

{
  "type": "checkout.session.completed",
  "data": {
    "id": "wave_12345",
    "checkout_status": "successful",
    "amount": 5000,
    "currency": "XOF",
    "customer_phone": "765868942",
    "metadata": {
      "type": "subscription_payment",
      "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
      "subscriptionId": "sub_abc123",
      "plan": "MONTHLY"
    }
  }
}
```

### Phase 8 : Activation de l'abonnement
```typescript
// Backend détecte que metadata.type = "subscription_payment"
if (webhookData.data.metadata.type === 'subscription_payment') {
  
  // 1. Mettre à jour le paiement en base
  await paymentService.updateStatus(wavePaymentId, 'SUCCESS');
  
  // 2. Activer l'abonnement
  await subscriptionService.activateSubscription(subscriptionId);
  
  // 3. Mettre à jour le profil utilisateur
  await userService.update(userId, {
    hasActiveSubscription: true,
    subscriptionId: subscriptionId,
    subscriptionPlan: "MONTHLY",
    subscriptionStatus: "ACTIVE",
    subscriptionEndDate: new Date("2024-02-15") // +1 mois
  });
}
```

### Phase 9 : Confirmation au client
Le client est redirigé vers `success_url` avec confirmation d'activation.

---

## 🗄️ Modèles de données

### Collection `subscriptions`
```typescript
{
  id: "sub_abc123",
  userId: "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
  plan: "MONTHLY",  // MONTHLY | QUARTERLY | ANNUAL
  status: "ACTIVE",  // PENDING | ACTIVE | EXPIRED | CANCELLED
  startDate: Timestamp("2024-01-15"),
  endDate: Timestamp("2024-02-15"),
  autoRenew: false,
  createdAt: Timestamp("2024-01-15"),
  updatedAt: Timestamp("2024-01-15")
}
```

### Collection `users` (champs étendus)
```typescript
{
  id: "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
  email: "serignefallousow@gmail.com",
  firstName: "Serigne Fallou",
  lastName: "Sow",
  phone: "765868942",
  
  // 🆕 Champs d'abonnement
  hasActiveSubscription: true,
  subscriptionId: "sub_abc123",
  subscriptionPlan: "MONTHLY",
  subscriptionStatus: "ACTIVE",
  subscriptionEndDate: Timestamp("2024-02-15")
}
```

### Collection `payments` (étendue)
```typescript
{
  id: "pay_xyz789",
  userId: "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
  amount: 5000,
  currency: "XOF",
  paymentMethod: "wave",
  status: "SUCCESS",
  
  // 🆕 Champs pour différencier les types de paiement
  paymentType: "subscription",  // "course" | "subscription"
  
  // Pour paiement de cours
  courseId: null,
  enrollmentId: null,
  
  // Pour paiement d'abonnement
  subscriptionId: "sub_abc123",
  subscriptionPlan: "MONTHLY",
  
  metadata: {
    wavePaymentId: "wave_12345",
    checkoutUrl: "https://checkout.wave.com/pay/abc123"
  },
  
  createdAt: Timestamp("2024-01-15")
}
```

---

## 🔐 Contrôle d'accès aux cours

### Middleware `checkCourseAccess`
```typescript
// Un utilisateur a accès à un cours si :
// 1. Il a un abonnement ACTIF (accès illimité)
// 2. Il a acheté le cours individuellement

export async function checkCourseAccess(userId: string, courseId: string) {
  // Vérifier abonnement
  const hasSubscription = await subscriptionService.hasUnlimitedAccess(userId);
  if (hasSubscription) {
    return { access: true, type: 'subscription' };
  }
  
  // Vérifier achat individuel
  const enrollment = await enrollmentService.getUserEnrollment(userId, courseId);
  if (enrollment) {
    return { access: true, type: 'individual_purchase' };
  }
  
  return { access: false };
}
```

### Exemple d'utilisation
```typescript
// Route protégée pour accéder à un cours
router.get('/courses/:courseId/content', 
  checkCourseAccess,  // Middleware
  async (req, res) => {
    // L'utilisateur a accès, renvoyer le contenu
    const course = await courseService.getById(req.params.courseId);
    res.json({ success: true, data: course });
  }
);
```

---

## 📊 API Endpoints

### 1. Créer un paiement d'abonnement
```http
POST /api/subscriptions/create-payment
Content-Type: application/json

{
  "plan": "MONTHLY",
  "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2"
}

Response 200:
{
  "success": true,
  "data": {
    "paymentUrl": "https://checkout.wave.com/pay/abc123",
    "paymentId": "wave_12345",
    "subscriptionId": "sub_abc123",
    "amount": 5000,
    "plan": "MONTHLY",
    "currency": "XOF"
  }
}

Response 400:
{
  "success": false,
  "message": "Vous avez déjà un abonnement actif"
}
```

### 2. Obtenir l'abonnement actif
```http
GET /api/subscriptions/active/:userId

Response 200:
{
  "success": true,
  "data": {
    "id": "sub_abc123",
    "plan": "MONTHLY",
    "status": "ACTIVE",
    "startDate": "2024-01-15",
    "endDate": "2024-02-15",
    "daysRemaining": 20
  }
}

Response 404:
{
  "success": false,
  "message": "Aucun abonnement actif trouvé"
}
```

### 3. Obtenir tous les abonnements d'un utilisateur
```http
GET /api/subscriptions/user/:userId

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "sub_abc123",
      "plan": "MONTHLY",
      "status": "ACTIVE",
      "startDate": "2024-01-15",
      "endDate": "2024-02-15"
    },
    {
      "id": "sub_xyz456",
      "plan": "ANNUAL",
      "status": "EXPIRED",
      "startDate": "2023-01-01",
      "endDate": "2024-01-01"
    }
  ]
}
```

### 4. Annuler un abonnement
```http
POST /api/subscriptions/:subscriptionId/cancel

Response 200:
{
  "success": true,
  "message": "Abonnement annulé avec succès"
}
```

### 5. Obtenir les plans disponibles
```http
GET /api/subscriptions/plans

Response 200:
{
  "success": true,
  "data": [
    {
      "plan": "MONTHLY",
      "price": 5000,
      "duration": "1 mois",
      "savings": 0
    },
    {
      "plan": "QUARTERLY",
      "price": 12000,
      "duration": "3 mois",
      "savings": 3000
    },
    {
      "plan": "ANNUAL",
      "price": 40000,
      "duration": "1 an",
      "savings": 20000
    }
  ]
}
```

### 6. Vérifier l'accès illimité
```http
GET /api/subscriptions/check-access/:userId

Response 200:
{
  "success": true,
  "data": {
    "hasUnlimitedAccess": true
  }
}
```

---

## ⏰ Expiration automatique des abonnements

### Cloud Function Schedulée
```typescript
// Fonction qui s'exécute tous les jours à 2h du matin (fuseau Dakar)
export const checkExpiredSubscriptions = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('Africa/Dakar')
  .onRun(async () => {
    // Récupérer tous les abonnements ACTIVE avec endDate < maintenant
    const expiredSubs = await subscriptionService.checkAndExpireSubscriptions();
    
    for (const sub of expiredSubs) {
      // 1. Mettre à jour subscription.status = "EXPIRED"
      await subscriptionService.expireSubscription(sub.id);
      
      // 2. Mettre à jour le profil utilisateur
      await userService.update(sub.userId, {
        hasActiveSubscription: false,
        subscriptionStatus: "EXPIRED"
      });
    }
    
    console.log(`✅ ${expiredSubs.length} abonnement(s) expiré(s)`);
  });
```

### Déclenchement manuel
```http
GET /api/admin/check-expired-subscriptions

Response 200:
{
  "success": true,
  "data": {
    "expiredCount": 3,
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

---

## 🔍 Indexes Firestore

### Collection `subscriptions`
```json
{
  "collectionGroup": "subscriptions",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "subscriptions",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "endDate", "order": "ASCENDING" }
  ]
}
```

---

## 🧪 Tests

### Test 1 : Créer un abonnement mensuel
```bash
curl -X POST https://us-central1-myschool-f862b.cloudfunctions.net/api/subscriptions/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "MONTHLY",
    "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2"
  }'
```

### Test 2 : Vérifier l'accès d'un utilisateur abonné
```bash
curl https://us-central1-myschool-f862b.cloudfunctions.net/api/subscriptions/check-access/VLzZCBlJstQOWhJy9Xg4MEO7ESK2
```

### Test 3 : Déclencher manuellement la vérification des expirations
```bash
curl https://us-central1-myschool-f862b.cloudfunctions.net/api/admin/check-expired-subscriptions
```

---

## 🔄 Comparaison : Achat de cours vs Abonnement

| Aspect | Achat individuel | Abonnement |
|--------|------------------|------------|
| **Prix** | 19.99 XOF par cours | 5,000 - 40,000 XOF |
| **Accès** | 1 cours uniquement | TOUS les cours |
| **Durée** | Illimitée | 1 mois / 3 mois / 1 an |
| **Type paiement** | `paymentType: "course"` | `paymentType: "subscription"` |
| **Inscription** | Crée un `enrollment` | Met à jour `user.hasActiveSubscription` |
| **Webhook** | `metadata.type: "course_payment"` | `metadata.type: "subscription_payment"` |
| **Expiration** | Jamais | Auto-expiration par CRON |

---

## 📝 Notes importantes

1. **Un utilisateur ne peut avoir qu'UN SEUL abonnement actif à la fois**
2. **Les abonnements ne se renouvellent PAS automatiquement** (autoRenew = false par défaut)
3. **L'accès aux cours vérifie d'abord l'abonnement, puis l'achat individuel**
4. **Les abonnements expirés sont traités automatiquement chaque jour à 2h du matin**
5. **Le webhook Wave utilise `metadata.type` pour différencier course_payment vs subscription_payment**

---

## 🚀 Déploiement

```bash
# 1. Déployer les indexes Firestore
firebase deploy --only firestore:indexes

# 2. Déployer les Cloud Functions
cd functions
npm run build
firebase deploy --only functions

# 3. Vérifier les fonctions déployées
firebase functions:list
```

---

## 📞 Support

Pour toute question sur le système d'abonnement :
- Email : serignefallousow@gmail.com
- Documentation API : https://us-central1-myschool-f862b.cloudfunctions.net/api/api-docs
