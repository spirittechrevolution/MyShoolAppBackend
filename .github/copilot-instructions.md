# MySchool Backend - AI Coding Guide

## Architecture Overview

**Dual Deployment Model**: This is a Firebase Cloud Functions project with local development support
- **Production**: Firebase Cloud Functions (`functions/` directory) 
- **Local dev**: Express server (`src/` directory with near-identical code)
- Both environments share core logic but have different entry points and Firebase initialization

**Database**: Firestore with named database `myschool-1` (NOT default database)
```typescript
// CRITICAL: Always configure databaseId in functions/src/index.ts
db.settings({ databaseId: 'myschool-1' });
```

**Service Architecture**: Standard Express layered architecture
- Routes → Controllers → Services → Firestore
- Models define TypeScript interfaces and classes
- All services in `functions/src/services/` are singletons

## Key Patterns & Conventions

### 1. User Authentication Pattern
Users are created in **both** Firebase Auth AND Firestore:
```typescript
// From user.service.ts - dual creation pattern
const userRecord = await auth.createUser({ email, password });
const uid = userRecord.uid; // Firebase Auth UID
await db.collection('utilisateur').doc(uid).set(userData); // Store in Firestore with same UID
```
**Critical**: Password is NEVER stored in Firestore, only in Firebase Auth. Collection name is `utilisateur` (French).

### 2. Payment Integration Pattern
**Two payment providers**: Wave (primary) and Orange Money (mock mode)

Wave payment flow requires THREE collections:
```typescript
// 1. Create Payment document
await db.collection('payment').add({ userId, courseId, status: 'PENDING' });

// 2. Create Wave checkout session via Wave API
const waveSession = await waveService.createCheckout({ amount, currency: 'XOF' });

// 3. Update Payment with Wave details
await db.collection('payment').doc(paymentId).update({ wavePaymentId, checkoutUrl });
```
See [WAVE_PAYMENT_FLOW.md](../WAVE_PAYMENT_FLOW.md) for complete sequence diagrams.

### 3. Subscription System
**Two access models**: Individual course purchase OR unlimited subscription
- Subscriptions are stored in `subscription` collection
- User documents have embedded subscription fields (`hasActiveSubscription`, `subscriptionPlan`, etc.)
- Payment confirmation triggers subscription activation via Wave webhook
- Manual cron job checks expiration: `manualCheckExpiredSubscriptions` function

Reference [SUBSCRIPTION_SYSTEM.md](../SUBSCRIPTION_SYSTEM.md) for detailed pricing ($5k-40k XOF) and lifecycle.

### 4. AI Integration (Gemini)
Chat service uses Google Gemini API for educational Q&A:
```typescript
// From ai-chat.service.ts pattern
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const chat = model.startChat({ history: conversationHistory });
const result = await chat.sendMessage(userMessage);
```
Always maintain conversation history in Firestore for context continuity.

## Development Workflows

### Local Development
```bash
npm run dev           # Start local Express server (port 3000)
cd functions && npm run build:watch  # Auto-compile TypeScript in functions/
```

### Testing Strategy
```bash
npm test              # Run 114 tests (60 route, 54 service tests)
npm run test:coverage # Generate coverage report (63.36% overall)
npm run test:clean    # Run tests then cleanup test data from Firestore
```
**Important**: Route tests create REAL Firestore data. Use `test:clean` to remove test users/courses with "Test" in names.

### Deployment to Firebase
```powershell
.\deploy-functions.ps1  # PowerShell script with 4 options:
# 1. Test locally (emulators)
# 2. Deploy functions only
# 3. Deploy Firestore rules only  
# 4. Full deployment
```
Or manually:
```bash
firebase use myschool-f862b
cd functions && npm run build
firebase deploy --only functions
```

### Debugging Firestore Issues
**Most common error**: Wrong database ID. Always check:
```typescript
// In functions/src/index.ts - MUST be set before any Firestore operations
db.settings({ databaseId: 'myschool-1', ignoreUndefinedProperties: true });
```
Use diagnostic scripts in project root: `diagnose-firestore.js`, `test-firestore-direct.js`

## Response Format Standard

**ALL API responses** follow this structure:
```typescript
// Success
{ success: true, data: {...}, message?: string, count?: number }

// Error  
{ success: false, message: "Error description" }
```
Never return raw data or throw unhandled errors to client.

## Critical Files

- [functions/src/api.ts](../functions/src/api.ts) - Cloud Function entry point with CORS config for multiple origins
- [functions/src/index.ts](../functions/src/index.ts) - Firebase initialization and function exports
- [functions/src/services/user.service.ts](../functions/src/services/user.service.ts) - Dual Auth+Firestore user creation
- [functions/src/services/wave.service.ts](../functions/src/services/wave.service.ts) - Wave payment integration
- [firebase.json](../firebase.json) - Defines emulator ports (Functions: 5001, Firestore: 8080, UI: 4000)
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Comprehensive deployment guide

## Common Tasks

**Add new endpoint**: Create route → controller → service → update `functions/src/api.ts` to register route
**Add Firestore collection**: Define model interface in `functions/src/models/`, create service with CRUD operations
**Update subscription logic**: Modify `functions/src/services/subscription.service.ts` + update [SUBSCRIPTION_SYSTEM.md](../SUBSCRIPTION_SYSTEM.md)
**Change payment flow**: Update `wave.service.ts` or `payment.service.ts` + corresponding webhook handlers

## Environment Variables

Never commit `.env` or `serviceAccountKey.json`. Required variables:
```
FIREBASE_PROJECT_ID=myschool-f862b
WAVE_API_KEY=wave_sn_prod_xxx
GEMINI_API_KEY=AIzaSyxxx
```

See [AUTH_GUIDE.md](../AUTH_GUIDE.md) for Firebase credentials setup.
