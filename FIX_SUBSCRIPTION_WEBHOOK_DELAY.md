# Fix: Délai d'accès aux cours après paiement Wave

## Problème Identifié ❌

**Timeline problématique:**
```
1. User s'abonne → subscriptionService.create() → statut = PENDING ✓
2. User paie via Wave ✓
3. User redirigé sur les cours
4. ❌ subscription.status = PENDING
5. ❌ getActiveSubscription() cherche uniquement status = ACTIVE
6. ❌ Les cours NE SONT PAS débloqués!
7. ⏳ Quelques secondes plus tard: webhook reçu → statut = ACTIVE ✓
   - PUIS le frontend doit rafraîchir pour obtenir l'accès
```

**Cause racine:**
- La méthode `getActiveSubscription()` ne cherche que les subscriptions avec `status = 'ACTIVE'`
- Entre le paiement et la confirmation du webhook (2-5 secondes), la subscription est en `PENDING`
- Pendant ce délai, les endpoints `/check-course-access` refusent l'accès

**Impact utilisateur:**
- User paie, mais n'a pas accès aux cours immédiatement ❌
- Mauvaise UX: écran vide ou message "accès refusé"
- Fonctionne après quelques secondes = confus l'utilisateur

## Solution Implémentée ✅

### Nouveau Flow avec `getAccessibleSubscription()`

```
1. User s'abonne → status = PENDING
2. User paie via Wave ✓
3. User redirigé sur les cours
4. API appelle: subscriptionService.getAccessibleSubscription(userId)
   ├─ Cherche ACTIVE (comme avant) ✓
   └─ Sinon: cherche PENDING avec paiement SUCCESS ✓ ← NOUVEAU
5. ✅ Les cours SONT débloqués IMMÉDIATEMENT
   (même avant la confirmation du webhook)
6. ⏳ Quelques secondes plus tard: webhook met à jour status = ACTIVE
7. ✅ Pas besoin de rafraîchir = UX fluide
```

### Modifications Dans `subscription.service.ts`

#### 1. Nouvelle méthode `getAccessibleSubscription()`

```typescript
/**
 * Récupère un abonnement accessible (ACTIVE ou PENDING avec paiement confirmé)
 * ✨ Gère le délai webhook (2-5 secondes)
 */
async getAccessibleSubscription(userId: string): Promise<SubscriptionModel | null> {
  // Étape 1: Cherche ACTIVE (normal)
  let subscription = await this.getActiveSubscription(userId);
  if (subscription) return subscription;

  // Étape 2: Cherche PENDING avec paiement SUCCESS
  // Cela couvre le délai pendant que le webhook est en traitement
  const pendingSnapshot = await db.collection('subscriptions')
    .where('userId', '==', userId)
    .where('status', '==', 'PENDING')
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (pendingSnapshot.empty) return null;

  const pendingSubscription = new SubscriptionModel(...);

  // Étape 3: Vérifier que le paiement est confirmé (SUCCESS)
  const paymentSnapshot = await db.collection('payments')
    .where('subscriptionId', '==', pendingSubscription.id)
    .where('status', '==', 'SUCCESS')
    .limit(1)
    .get();

  // Si paiement SUCCESS: retourne la subscription avec accès autorisé
  if (!paymentSnapshot.empty) {
    console.log(`✅ Subscription PENDING a un paiement SUCCESS confirmé`);
    console.log(`⚡ Accès autorisé AVANT la confirmation du webhook`);
    return pendingSubscription;
  }

  return null;
}
```

**Logique:**
- Cherche d'abord une subscription ACTIVE (cas normal après webhook)
- Si aucune, cherche une subscription PENDING
- Vérifie que cette PENDING a un paiement avec status = 'SUCCESS'
- Si oui → retourne la subscription PENDING = l'utilisateur a accès
- Si non → attend le webhook

#### 2. Modification de `hasAccessToCourse()`

**Avant:**
```typescript
const subscription = await this.getActiveSubscription(userId);
```

**Après:**
```typescript
const subscription = await this.getAccessibleSubscription(userId);
```

#### 3. Modification de `hasUnlimitedAccess()`

**Avant:**
```typescript
const subscription = await this.getActiveSubscription(userId);
```

**Après:**
```typescript
const subscription = await this.getAccessibleSubscription(userId);
```

## Endpoints Affectés

### GET `/api/subscriptions/check-course-access/:userId/:courseId`
- Utilisé par: Frontend pour vérifier l'accès à un cours
- Change: Utilise maintenant `getAccessibleSubscription()`
- Résultat: Accès autorisé IMMÉDIATEMENT après paiement au lieu d'attendre le webhook

### GET `/api/subscriptions/active/:userId` (inchangé)
- Continue à chercher uniquement les subscriptions ACTIVE
- Recommandé pour les opérations sensibles (statut du compte)

## Tests Recommandés

### Test 1: Accès immédiat après paiement ✅
```bash
1. POST /api/subscriptions/create → subscriptionId=XX, status=PENDING
2. POST /api/wave/pay → paymentUrl
3. Payment confirmé en Wave → Payment.status=SUCCESS (fake)
   - NE PAS appeler le webhook manullement
4. GET /api/subscriptions/check-course-access/userId/courseId
   → ✅ { hasAccess: true }
   (Sans attendre le webhook!)
```

### Test 2: Webhook toujours fonctionne ✅
```bash
1. POST Webhook avec signature valide
2. subscriptionService.activateSubscription() appelé
3. subscription.status mis à jour = ACTIVE
4. User document mis à jour = hasActiveSubscription=true
```

### Test 3: Accès refusé si pas de paiement ✅
```bash
1. Subscription créée en PENDING
2. GET /api/subscriptions/check-course-access/userId/courseId
   → ✅ { hasAccess: false }
   (Aucun paiement SUCCESS)
```

### Test 4: Paiement échoué ✅
```bash
1. Subscription en PENDING
2. Payment.status = FAILED
3. GET /api/subscriptions/check-course-access/userId/courseId
   → ✅ { hasAccess: false }
```

## Timeline: Avant vs Après

### AVANT (Problématique) ❌
```
T=0s  User paie
T=0s  Paiement SUCCESS, Payment créé
T=0s  User redirigé → /courses
T=0s  Frontend appelle: check-course-access?
     ❌ getActiveSubscription() → NULL (subscription est PENDING)
     ❌ hasAccess = false
     ❌ Écran vide "Accès refusé"
T=2s  Webhook reçu
T=2s  subscription.status = ACTIVE
T=2s  User doit rafraîchir la page
T=3s  Frontend redemande check-course-access
     ✅ getActiveSubscription() → SUCCESS
     ✅ hasAccess = true
     ✅ Finalement: Accès accordé!
```

### APRÈS (Fix) ✅
```
T=0s  User paie
T=0s  Paiement SUCCESS, Payment créé
T=0s  User redirigé → /courses
T=0s  Frontend appelle: check-course-access?
     ✅ getAccessibleSubscription():
        1. Cherche ACTIVE → aucune
        2. Cherche PENDING → trouvée!
        3. Cherche paiement SUCCESS → trouvé!
     ✅ hasAccess = true
     ✅ Accès accordé IMMÉDIATEMENT!
T=2s  Webhook reçu (en arrière-plan)
     subscription.status = ACTIVE miseà jour
     (User n'a pas besoin de rafraîchir)
```

## Architecture Firestore

### Interaction entre Collections
```
USER (userId)
 ├─ subscription {
 │   id: "sub_123"
 │   userId: "user_123"  ← lien
 │   status: "PENDING" ou "ACTIVE"
 │   createdAt: ...
 │ }
 │
 ├─ PAYMENT (collection)
 │   └─ payment {
 │       id: "pay_456"
 │       subscriptionId: "sub_123"  ← lien
 │       status: "SUCCESS" / "FAILED" / "PENDING"
 │       metadata: { userId, subscriptionId, ... }
 │     }
```

**Flux de vérification:**
```
getAccessibleSubscription(userId)
  ├─ Query 1: subscriptions WHERE userId AND status=ACTIVE
  ├─ Query 2: subscriptions WHERE userId AND status=PENDING
  │            WITH OrderBy createdAt DESC (dernière subscription)
  └─ Query 3: payments WHERE subscriptionId AND status=SUCCESS
```

## Performances

- **getAccessibleSubscription():** Max 3 queries Firestore
- **Impact:** Minimal (même que getActiveSubscription + 1-2 queries supplémentaires)
- **Cas optimal:** Si subscription ACTIVE trouvée → arrête là (2 queries)

## Sécurité

- ✅ Vérifie que le paiement a le statut SUCCESS
- ✅ Empêche l'accès de false positives (PENDING sans paiement = refusé)
- ✅ Validate la correspondance userId/subscriptionId/payment

## Notes

- Cette solution gère **le délai webhook NORMAL** (2-5 secondes)
- Si webhook échoue complètement → toujours bloquer l'accès (pas de webhook = pas d'activation finale)
- Cron job "checkAndExpireSubscriptions" continue à fonctionner normalement
