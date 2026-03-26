# Wave Webhook Structure Analysis

## Executive Summary

The Wave webhook implementation has **a critical assumption**: that Wave returns custom metadata in webhook payloads. However, **Wave's actual API documentation is unclear about whether metadata is returned in webhooks**, which presents a potential mapping issue between what's sent to Wave vs. what comes back.

---

## 1. Expected Webhook Structure

### Endpoint
```
POST /api/wave/webhook
```

### Authentication
- Header: `x-wave-signature`
- Signature verified using HMAC-SHA256 with `WAVE_WEBHOOK_SECRET`

### Event Types Handled
```typescript
switch(webhookData.type) {
  case 'checkout.session.completed':
    // Payment succeeded
    await this.handlePaymentCompleted(webhookData);
    break;
    
  case 'checkout.session.payment_failed':
    // Payment failed
    await this.handlePaymentFailed(webhookData);
    break;
    
  case 'b2b.payment_received':
    // B2B payment (also treated as completed)
    await this.handlePaymentCompleted(webhookData);
    break;
}
```

### Full Webhook Payload Structure

```typescript
interface WaveWebhook {
  type: 'checkout.session.completed' | 'checkout.session.payment_failed' | 'b2b.payment_received';
  data: {
    id: string;                    // Wave payment session ID
    checkout_status?: string;      // 'successful', 'cancelled', etc.
    payment_status?: string;       // 'processing', 'successful', 'failed'
    
    // ⚠️ CRITICAL: Wave's actual webhook response structure for metadata is UNCLEAR
    // The code assumes metadata is returned, but this needs verification
    metadata?: {
      [key: string]: any;          // Custom data sent when creating payment
    };
  };
}
```

---

## 2. Metadata Structure & Extraction

### How Metadata is Sent TO Wave

#### For Course Payments
```typescript
// From wave.service.ts - createCoursePayment()
const transaction: WaveTransaction = {
  amount: effectiveAmount,
  currency: 'XOF',
  customer_phone: userInfo.phone,
  customer_firstname: userInfo.firstName,
  customer_lastname: userInfo.lastName,
  description: `Achat du cours: ${course.title}`,
  redirect_url: `...`,
  cancel_url: `...`,
  webhook_url: `...`,
  metadata: {                        // ✅ Custom metadata sent to Wave
    courseId: courseId,
    userId: userId,
    type: 'course_purchase',
    ...(promoCode && { promoCode: promoCode }),
    originalPrice: course.price,
    ...(finalAmount && finalAmount < course.price && { 
      discountAmount: course.price - finalAmount 
    })
  }
};
```

#### For Subscription Payments
```typescript
// From wave-subscription.service.ts - createSubscriptionPayment()
const transaction = {
  amount: amount,
  currency: 'XOF',
  customer_phone: userInfo.phone,
  customer_firstname: userInfo.firstName,
  customer_lastname: userInfo.lastName,
  description: `Abonnement annuel - Classe: ${classe}...`,
  redirect_url: `...`,
  cancel_url: `...`,
  webhook_url: `...`,
  metadata: {                        // ✅ Custom metadata sent to Wave
    userId: userId,
    subscriptionId: subscription.id,
    classe: classe,
    niveauScolaire: niveauScolaire,
    typeAbonnement: typeAbonnement,
    matieres: matieres || [],
    type: 'subscription_payment'     // Critical flag for webhook handler
  }
};
```

### How Metadata is Extracted FROM Webhook

```typescript
// From wave.controller.ts - handlePaymentCompleted()
private async handlePaymentCompleted(webhookData: any): Promise<void> {
  const { data } = webhookData;
  const wavePaymentId = data.id;
  
  // ⚠️ ASSUMPTION: metadata is returned in webhook
  const metadata = data.metadata || {};
  const paymentType = metadata.type;  // 'course_payment' or 'subscription_payment'
  
  if (paymentType === 'subscription_payment') {
    await this.handleSubscriptionPayment(metadata, wavePaymentId);
  } else {
    await this.handleCoursePayment(metadata, wavePaymentId);
  }
}

// For course payments
private async handleCoursePayment(metadata: any, wavePaymentId: string): Promise<void> {
  const courseId = metadata.courseId;      // ⚠️ Extracted from webhook metadata
  const userId = metadata.userId;          // ⚠️ Extracted from webhook metadata
  
  // Find payment by wavePaymentId and update status
  const payment = await paymentService.getByWavePaymentId(wavePaymentId);
  await paymentService.updateStatus(payment.id, 'SUCCESS');
}

// For subscription payments
private async handleSubscriptionPayment(metadata: any, wavePaymentId: string): Promise<void> {
  const subscriptionId = metadata.subscriptionId;  // ⚠️ Extracted from webhook metadata
  const userId = metadata.userId;                  // ⚠️ Extracted from webhook metadata
  
  // Find payment and activate subscription
  const payment = await paymentService.getByWavePaymentId(wavePaymentId);
  await subscriptionService.activateSubscription(subscriptionId, wavePaymentId, 'wave');
}
```

---

## 3. Metadata Fields by Payment Type

### Course Purchase Metadata
```json
{
  "courseId": "course_123",
  "userId": "user_456",
  "type": "course_purchase",
  "promoCode": "PROMO10",              // Optional
  "originalPrice": 50000,
  "discountAmount": 5000               // Optional, if discount applied
}
```

### Subscription Payment Metadata
```json
{
  "userId": "user_456",
  "subscriptionId": "sub_789",
  "classe": "3ème (BFEM)",
  "niveauScolaire": "MOYEN",
  "typeAbonnement": "MATIERE",
  "matieres": ["matiere_1", "matiere_2", "matiere_3"],
  "type": "subscription_payment"
}
```

---

## 4. Example Webhook Payloads

### Example 1: Course Payment Success
```json
{
  "type": "checkout.session.completed",
  "data": {
    "id": "wave_checkout_sess_12345abc",
    "checkout_status": "successful",
    "payment_status": "successful",
    "metadata": {
      "courseId": "course_cm2_math_001",
      "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
      "type": "course_purchase",
      "originalPrice": 50000,
      "promoCode": "WELCOME20"
    }
  }
}
```

### Example 2: Subscription Payment Success
```json
{
  "type": "checkout.session.completed",
  "data": {
    "id": "wave_checkout_sess_67890def",
    "checkout_status": "successful",
    "payment_status": "successful",
    "metadata": {
      "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
      "subscriptionId": "sub_abc123",
      "classe": "3ème (BFEM)",
      "niveauScolaire": "MOYEN",
      "typeAbonnement": "MATIERE",
      "matieres": ["mat_fr_001", "mat_math_001", "mat_science_001"],
      "type": "subscription_payment"
    }
  }
}
```

### Example 3: Payment Failed
```json
{
  "type": "checkout.session.payment_failed",
  "data": {
    "id": "wave_checkout_sess_99999xyz",
    "payment_status": "failed",
    "metadata": {
      "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
      "subscriptionId": "sub_def456",
      "type": "subscription_payment"
    }
  }
}
```

---

## 5. Potential Mapping Issues

### ⚠️ CRITICAL ISSUE: Metadata Return Assumption

**The Problem:**
The code assumes Wave **returns the custom metadata in webhook payloads**. However:

1. **Wave API documentation is ambiguous** about whether metadata is included in webhooks
2. **No verification exists** that the metadata is actually returned
3. **If Wave doesn't return metadata**, the webhook handler will fail with missing data

**Evidence:**
- When creating payment: `metadata` is passed in the `WaveTransaction` object
- When handling webhook: code does `const metadata = data.metadata || {}`
- **No logging or error handling** if metadata is empty

**Current Fallback:**
```typescript
const metadata = data.metadata || {};  // Defaults to empty object
const paymentType = metadata.type;      // Will be undefined if metadata missing!
```

### Issue 1: Missing Payment Type Detection

```typescript
if (paymentType === 'subscription_payment') {
  // This branch won't execute if metadata.type is undefined!
  await this.handleSubscriptionPayment(metadata, wavePaymentId);
} else {
  // Falls back to course payment handler regardless
  await this.handleCoursePayment(metadata, wavePaymentId);
}
```

**Impact:** Subscription payments could be processed as course payments.

### Issue 2: Missing Required IDs

If metadata isn't returned:

```typescript
// handleCoursePayment()
const courseId = metadata.courseId;    // undefined
const userId = metadata.userId;        // undefined

// handleSubscriptionPayment()
const subscriptionId = metadata.subscriptionId;  // undefined
const userId = metadata.userId;                  // undefined
```

**Impact:** 
- Cannot find the payment by `wavePaymentId`
- Subscription not activated
- User remains without access

### Issue 3: Reliance on Wave Payment ID Only

Currently, the system **depends entirely on** `wavePaymentId` to find the payment, then uses metadata for secondary info:

```typescript
// This works IF wavePaymentId is correctly stored during payment creation
const payment = await paymentService.getByWavePaymentId(wavePaymentId);
if (!payment) {
  console.error('Payment not found');  // Webhook fails silently
  return;
}
```

**Risk:** If the lookup by `wavePaymentId` fails, the entire webhook fails with no alternative recovery method.

---

## 6. Data Flow Comparison

### What's Sent TO Wave (During Payment Creation)

```
Frontend Request
↓
createCoursePayment() / createSubscriptionPayment()
↓
WaveService.createPayment(transaction)
  └─ transaction.metadata = { userId, courseId/subscriptionId, type, ... }
↓
POST to Wave API
{
  "amount": "5000",
  "currency": "XOF",
  "metadata": {                    ← SENT TO WAVE
    "userId": "...",
    "courseId": "...",
    "type": "course_purchase"
  }
}
↓
Wave responds with session ID
```

### What's Expected FROM Wave (In Webhook)

```
Wave sends webhook
↓
POST /api/wave/webhook
{
  "type": "checkout.session.completed",
  "data": {
    "id": "wave_sess_123",
    "metadata": {                  ← EXPECTED FROM WAVE
      "userId": "...",             ⚠️ But does Wave actually return this?
      "courseId": "...",
      "type": "course_purchase"
    }
  }
}
↓
handlePaymentCompleted()
  └─ Extracts metadata.courseId, metadata.userId
      ⚠️ These may be undefined!
```

---

## 7. Documentation & Test References

### Test Endpoint in Code
```typescript
// From wave.controller.ts
async testConfirmPayment(req: Request, res: Response): Promise<void> {
  const { wavePaymentId } = req.params;
  
  // Simulates webhook with minimal data
  const webhookData = {
    type: 'checkout.session.completed',
    data: {
      id: wavePaymentId,
      payment_status: 'successful'    // No metadata!
    }
  };
  
  await this.handlePaymentCompleted(webhookData);  // Will fail!
}
```

**Note:** Even the test endpoint doesn't include metadata!

### Documentation Examples

From `FIX_SUBSCRIPTION_PAYMENT_BUG.md`:
```bash
# Example from documentation
POST /api/wave/webhook
{
  "type": "checkout.session.completed",
  "data": {
    "id": "wave_test_123",
    "checkout_status": "successful",
    "metadata": {
      "type": "subscription_payment",
      "subscriptionId": "sub_xxx",
      "userId": "user_xxx"
    }
  }
}
```

**Note:** Documentation assumes metadata is returned, but lacks official Wave API confirmation.

---

## 8. Signature Verification Flow

```typescript
// Wave webhook verification
verifyWebhookSignature(payload: string, signature: string): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', this.webhookSecret)  // Uses WAVE_WEBHOOK_SECRET env var
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

**Dependencies:**
- Environment variable: `WAVE_WEBHOOK_SECRET`
- Header: `x-wave-signature`
- Raw request payload used for verification

---

## 9. Recommendations & Next Steps

### URGENT: Verify Wave Webhook Metadata Behavior

Before production deployment:

1. **Test with real Wave API:**
   ```bash
   # Create a test payment and check what Wave actually returns in webhook
   POST /api/subscriptions/create-payment
   # Complete payment on Wave checkout
   # Enable webhook logging to see actual response
   ```

2. **Check Wave API Documentation:**
   - Confirm if custom metadata is returned in `checkout.session.completed` events
   - If not, implement alternative data recovery method

3. **Add Defensive Programming:**
   ```typescript
   // Instead of current approach
   const metadata = data.metadata || {};
   
   // Should be:
   if (!data.metadata || !data.metadata.type) {
     console.error('❌ CRITICAL: Metadata missing from Wave webhook!');
     console.error('📧 Webhook data:', JSON.stringify(data));
     // Try to recover using only wavePaymentId (current fallback)
   }
   ```

### Fallback Strategy (If Metadata Not Returned)

Since the system uses `wavePaymentId` as primary lookup key:

1. Find payment using `wavePaymentId`
2. Extract all required data from Firestore payment document
3. Use payment document's `subscriptionId`/`courseId` instead of webhook metadata

```typescript
// More robust approach
const payment = await paymentService.getByWavePaymentId(wavePaymentId);
if (!payment) throw new Error('Payment not found');

// Use data from Firestore document, not webhook metadata
const userId = payment.userId;
const subscriptionId = payment.subscriptionId;
const courseId = payment.courseId;
```

### Additional Logging

Add detailed logging to track metadata flow:

```typescript
console.log('📧 Webhook received:', { type: webhookData.type });
console.log('💳 Payment ID:', data.id);
console.log('📦 Metadata present:', !!data.metadata);
console.log('🔍 Metadata content:', JSON.stringify(data.metadata));
```

---

## Summary Table

| Aspect | Details |
|--------|---------|
| **Webhook Endpoint** | `POST /api/wave/webhook` |
| **Authentication** | HMAC-SHA256 signature in `x-wave-signature` header |
| **Event Types** | `checkout.session.completed`, `checkout.session.payment_failed`, `b2b.payment_received` |
| **Metadata Sent** | ✅ Includes `userId`, `courseId`/`subscriptionId`, `type`, custom fields |
| **Metadata Returned** | ⚠️ **ASSUMED but UNVERIFIED** - Wave API docs unclear |
| **Critical Field** | `data.metadata.type` - determines payment type handling |
| **Fallback Lookup** | `wavePaymentId` → find payment in Firestore |
| **Risk Level** | **HIGH** - System depends on unverified metadata return |

---

## Related Files

- [functions/src/controllers/wave.controller.ts](functions/src/controllers/wave.controller.ts) - Webhook handler
- [functions/src/services/wave.service.ts](functions/src/services/wave.service.ts) - Wave API integration
- [functions/src/services/wave-subscription.service.ts](functions/src/services/wave-subscription.service.ts) - Subscription metadata
- [FIX_SUBSCRIPTION_PAYMENT_BUG.md](FIX_SUBSCRIPTION_PAYMENT_BUG.md) - Example webhook payloads
- [DEBUG_PAYMENT_FIRESTORE.md](DEBUG_PAYMENT_FIRESTORE.md) - Payment flow documentation

---

**Last Updated:** March 16, 2026  
**Status:** ⚠️ Requires Wave API confirmation before production
