# 🔧 FIX: Wave Webhook Metadata Missing Issue

## 🔴 Problem Identified

**Symptom:** Après le paiement Wave, le statut reste `PENDING` pour l'abonnement et le paiement. Les cours ne sont pas débloqués après la redirection.

**Root Cause:** Wave ne retourne pas les métadonnées dans le webhook payload.

### Why This Happened

The webhook handler was designed with an incorrect assumption:

```typescript
// BEFORE (BROKEN): Expected metadata from webhook
const metadata = data.metadata || {};
const paymentType = metadata.type; // undefined! ❌
```

**Flow of the bug:**
1. ✅ Client crée abonnement → Backend envoie `metadata.type = 'subscription_payment'` à Wave
2. ✅ Paiement créé dans Firestore avec `paymentType = 'subscription'` et `wavePaymentId`
3. ✅ Client paie sur Wave
4. ❌ Webhook Wave arrive → mais **sans** métadonnées!
5. ❌ Code cherche `metadata.type` → undefined
6. ❌ `paymentType` = undefined → tombe dans cas par défaut
7. ❌ Traite comme paiement de cours au lieu de paiement d'abonnement
8. ❌ Appelle `handleCoursePayment()` au lieu de `handleSubscriptionPayment()`
9. ❌ L'abonnement reste PENDING, paiement reste PENDING
10. 🔒 Utilisateur reste bloqué - les cours ne sont pas débloqués

---

## ✅ Fix Applied

**Solution:** Use Firestore as source of truth instead of webhook metadata.

### Files Modified

1. ✅ `functions/src/controllers/wave.controller.ts`
   - `handlePaymentCompleted()` - Now queries Firestore first
   - `handleCoursePayment()` - Uses Firestore data instead of webhook metadata
   - `handleSubscriptionPayment()` - Uses Firestore data instead of webhook metadata

2. ✅ `src/controllers/wave.controller.ts` (local development version)
   - Same fixes applied

### Code Changes

#### Before (Broken):
```typescript
private async handlePaymentCompleted(webhookData: any): Promise<void> {
  const { data } = webhookData;
  const metadata = data.metadata || {}; // ❌ Wave doesn't return this!
  const paymentType = metadata.type;   // ❌ undefined!
  
  if (paymentType === 'subscription_payment') {
    await this.handleSubscriptionPayment(metadata, wavePaymentId);
  } else {
    await this.handleCoursePayment(metadata, wavePaymentId);
  }
}
```

#### After (Fixed):
```typescript
private async handlePaymentCompleted(webhookData: any): Promise<void> {
  const { data } = webhookData;
  const wavePaymentId = data.id;
  
  // ✅ Query Firestore for payment - this is the source of truth
  const payment = await paymentService.getByWavePaymentId(wavePaymentId);
  if (!payment || !payment.id) {
    console.error('❌ Payment not found for wavePaymentId:', wavePaymentId);
    return;
  }
  
  // ✅ Get payment type from Firestore, not webhook
  const paymentType = payment.paymentType; // 'course' or 'subscription'
  const metadata = payment.metadata || {};
  
  if (paymentType === 'subscription') {
    await this.handleSubscriptionPayment(metadata, wavePaymentId);
  } else {
    await this.handleCoursePayment(metadata, wavePaymentId);
  }
}
```

---

## 🧪 How to Verify the Fix Works

### Method 1: Run the Test Script
```bash
node test-subscription-wave-fix.js
```

This script:
1. Creates a test user
2. Creates a subscription payment
3. Simulates the Wave webhook
4. Verifies that subscription is activated

**Expected output:**
```
✅ ✅ ✅ TEST RÉUSSI! ✅ ✅ ✅
Le flux d'abonnement Wave fonctionne correctement!
- Abonnement créé en PENDING ✓
- Webhook reçu et traité ✓
- Abonnement activé en ACTIVE ✓
- Paiement confirmé ✓
```

### Method 2: Manual Testing
1. **Create subscription payment:**
   ```bash
   POST /api/subscriptions/create-payment
   {
     "userId": "YOUR_USER_ID",
     "classe": "6èmeA",
     "niveauScolaire": "ELEMENTAIRE",
     "typeAbonnement": "CLASSE"
   }
   ```
   
   Response:
   ```json
   {
     "paymentId": "wave_xxx",
     "subscriptionId": "sub_xxx",
     "paymentUrl": "https://..."
   }
   ```

2. **Check subscription BEFORE webhook:**
   ```bash
   GET /api/subscriptions/active/YOUR_USER_ID
   ```
   
   Should return: `status: "PENDING"`

3. **Simulate webhook:**
   ```bash
   POST /api/wave/test-confirm/wave_xxx
   ```

4. **Check subscription AFTER webhook:**
   ```bash
   GET /api/subscriptions/active/YOUR_USER_ID
   ```
   
   Should return: `status: "ACTIVE"` ✅

### Method 3: Full Integration Testing
1. Deploy fixes to Firebase
2. Have user pay on Wave (real payment)
3. Wave sends webhook
4. Subscription should activate automatically

---

## 📊 Before vs After

| Step | Before Fix | After Fix |
|------|-----------|-----------|
| 1. Create subscription | ✅ PENDING | ✅ PENDING |
| 2. User pays on Wave | ✅ Payment received | ✅ Payment received |
| 3. Wave sends webhook | ✅ Webhook received | ✅ Webhook received |
| 4. Webhook handler executed | ⚠️ Wrong type detected | ✅ Correct type from Firestore |
| 5. Process payment | ❌ As course payment | ✅ As subscription payment |
| 6. Subscription activated | ❌ STAYS PENDING | ✅ BECOMES ACTIVE |
| 7. User can access courses | ❌ NO | ✅ YES |

---

## 🚀 Deployment

### Build and Deploy
```bash
# Build TypeScript
npm run build
cd functions && npm run build

# Deploy to Firebase
firebase deploy --only functions

# Or use the deployment script
.\deploy-functions.ps1
```

### Verify Deployment
1. Check Cloud Functions logs
2. Monitor for webhook processing logs
3. Test with real payment if possible

---

## 📋 Key Takeaways

1. **Wave API doesn't return custom metadata in webhooks**
   - This was the core assumption that was wrong
   - The webhook only contains the payment ID and basic status

2. **Firestore is the source of truth**
   - All payment info including `paymentType`, `subscriptionId`, `courseId` is stored in Firestore
   - Never rely on webhook metadata for critical decisions

3. **Error Handling is Critical**
   - The code now validates that payment exists in Firestore
   - If payment not found, the webhook fails gracefully with detailed logging

---

## 🔍 Debugging

If the fix doesn't work, check:

1. **Firestore collection `payments`:**
   - Verify document has `paymentType: "subscription"` (not undefined)
   - Verify document has `subscriptionId` (filled in)
   - Verify document has `metadata.wavePaymentId` (filled in)

2. **Cloud Functions logs:**
   - Look for "Webhook reçu pour paiement"
   - Look for "Paiement trouvé dans Firestore"
   - Look for "Traitement paiement abonnement"
   - Look for "Abonnement activé avec succès"

3. **Network:**
   - Verify Wave webhook URL is correct
   - Verify webhook signature validation passes

---

## 📚 References

- [Wave API Documentation](https://docs.wave.com/)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore)
- [SUBSCRIPTION_SYSTEM.md](./SUBSCRIPTION_SYSTEM.md) - Full subscription flow documentation
