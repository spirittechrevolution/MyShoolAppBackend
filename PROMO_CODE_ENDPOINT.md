# 🎟️ API Promo Code Endpoint - Documentation

## ✅ Resolution Summary

The **404 "Route non trouvée"** error was caused by the missing `/api/codes-promo` endpoint. This has now been created and deployed to both environments:

- **Cloud Functions**: `functions/src/` (production)
- **Local Development**: `src/` (local server)

---

## 📋 Implemented Endpoints

### 1. **POST /api/codes-promo** - Create Promo Code
Create a new promotional code with optional influencer commission tracking.

**Request:**
```bash
curl -X POST https://us-central1-myschool-f862b.cloudfunctions.net/api/codes-promo \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CODE1",
    "discountType": "fixed",
    "discountValue": 500,
    "expirationDate": "2026-04-11T10:06",
    "maxUsage": 1000,
    "isActive": true,
    "description": "Promo code description",
    "influenceurId": "QVZuQmevDIQslFk1DgrdTzxLYqx1",
    "commissionType": "percent",
    "commissionValue": 1
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "code": "CODE1",
    "discountType": "fixed",
    "discountValue": 500,
    "expiresAt": "2026-04-11T10:06:00.000Z",
    "maxUsage": 1000,
    "usageCount": 0,
    "isActive": true,
    "description": "Promo code description",
    "influenceurId": "QVZuQmevDIQslFk1DgrdTzxLYqx1",
    "commissionType": "percent",
    "commissionValue": 1,
    "createdAt": "2026-03-11T10:00:00.000Z",
    "updatedAt": "2026-03-11T10:00:00.000Z"
  },
  "message": "Code promo \"CODE1\" créé avec succès"
}
```

---

### 2. **GET /api/codes-promo** - List All Promo Codes
Retrieve all promotional codes.

**Request:**
```bash
curl -X GET https://us-central1-myschool-f862b.cloudfunctions.net/api/codes-promo
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "code": "CODE1",
      "discountType": "fixed",
      "discountValue": 500,
      ...
    }
  ],
  "count": 1
}
```

---

### 3. **GET /api/codes-promo/:code** - Get Promo Code
Retrieve details of a specific promo code.

**Request:**
```bash
curl -X GET https://us-central1-myschool-f862b.cloudfunctions.net/api/codes-promo/CODE1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "code": "CODE1",
    ...
  }
}
```

---

### 4. **PUT /api/codes-promo/:code** - Update Promo Code
Update an existing promo code.

**Request:**
```bash
curl -X PUT https://us-central1-myschool-f862b.cloudfunctions.net/api/codes-promo/CODE1 \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false,
    "commissionValue": 2
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Code promo \"CODE1\" mis à jour avec succès"
}
```

---

### 5. **DELETE /api/codes-promo/:code** - Delete Promo Code
Delete a promo code.

**Request:**
```bash
curl -X DELETE https://us-central1-myschool-f862b.cloudfunctions.net/api/codes-promo/CODE1
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Code promo \"CODE1\" supprimé avec succès"
}
```

---

### 6. **POST /api/codes-promo/validate/:code** - Validate Promo Code
Validate and apply a promo code (increments usage counter).

**Request:**
```bash
curl -X POST https://us-central1-myschool-f862b.cloudfunctions.net/api/codes-promo/validate/CODE1 \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "code": "CODE1",
    "discountType": "fixed",
    "discountValue": 500,
    "isValid": true,
    "influenceurId": "QVZuQmevDIQslFk1DgrdTzxLYqx1",
    "commissionType": "percent",
    "commissionValue": 1
  },
  "message": "Code promo \"CODE1\" validé avec succès"
}
```

**Error Responses:**
- `400` - Code invalid/expired/inactive
- `404` - Code not found

---

### 7. **GET /api/codes-promo/influencer/:influenceurId** - Get Influencer Promo Codes
Retrieve all promo codes associated with an influencer.

**Request:**
```bash
curl -X GET https://us-central1-myschool-f862b.cloudfunctions.net/api/codes-promo/influencer/QVZuQmevDIQslFk1DgrdTzxLYqx1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "code": "CODE1",
      "influenceurId": "QVZuQmevDIQslFk1DgrdTzxLYqx1",
      ...
    }
  ],
  "count": 1
}
```

---

## 📊 Request Field Reference

### Promo Code Creation Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | ✅ | Unique promo code (e.g., "CODE1", "SUMMER20") |
| `discountType` | string | ✅ | "fixed" or "percentage" |
| `discountValue` | number | ✅ | Discount amount/percentage (e.g., 500 for fixed, 10 for 10%) |
| `expirationDate` / `expiresAt` | string | ✅ | ISO 8601 date string (e.g., "2026-04-11T10:06") |
| `maxUsage` / `usageLimit` | number | ❌ | Max times code can be used (default: 1000) |
| `isActive` | boolean | ❌ | Active status (default: true) |
| `description` | string | ❌ | Description/notes |
| `influenceurId` | string | ❌ | Associated influencer ID |
| `commissionType` | string | ❌ | "percent" or "fixed" |
| `commissionValue` | number | ❌ | Commission for influencer |

---

## 🔄 Data Flow & Integration

### With Subscription System
```
User applies promo code → validate/:code endpoint
  ↓
Returns discount details + influencer commission info
  ↓
Used in subscription payment creation
  ↓
Final amount = original - discount
Influencer commission tracked separately
```

### Firestore Collection Structure
```firestore
promoCodes/
  ├── CODE1/
  │   ├── code: "CODE1"
  │   ├── discountType: "fixed"
  │   ├── discountValue: 500
  │   ├── expiresAt: Timestamp(2026-04-11...)
  │   ├── maxUsage: 1000
  │   ├── usageCount: 0
  │   ├── isActive: true
  │   ├── influenceurId: "QVZuQmevDIQslFk1DgrdTzxLYqx1"
  │   ├── commissionType: "percent"
  │   ├── commissionValue: 1
  │   ├── createdAt: Timestamp
  │   └── updatedAt: Timestamp
```

---

## 🧪 Testing Locally

### 1. Start Local Dev Server
```bash
npm run dev
```
Server runs on `http://localhost:3000`

### 2. Test Creating Promo Code
```bash
node test-promo-code-api.js
```

### 3. Using Postman
Import the collection and test each endpoint:
```
POST   /api/codes-promo
GET    /api/codes-promo
GET    /api/codes-promo/:code
PUT    /api/codes-promo/:code
DELETE /api/codes-promo/:code
POST   /api/codes-promo/validate/:code
GET    /api/codes-promo/influencer/:influenceurId
```

---

## 📝 Error Handling

All responses follow the standard format:

**Success:**
```json
{ "success": true, "data": {...}, "message": "..." }
```

**Error:**
```json
{ "success": false, "message": "Error description" }
```

### Common HTTP Status Codes
- `201` - Created successfully
- `200` - OK
- `400` - Bad request / validation error
- `404` - Not found
- `500` - Server error

---

## 🚀 Deployment

### To Cloud Functions
```bash
cd functions
npm run build
firebase deploy --only functions
```

---

## 📚 Files Modified/Created

### New Files
- `functions/src/controllers/promo-code.controller.ts` - Controller logic
- `functions/src/routes/promo-code.routes.ts` - Route definitions
- `src/controllers/promo-code.controller.ts` - Local dev controller
- `src/routes/promo-code.routes.ts` - Local dev routes

### Updated Files
- `functions/src/api.ts` - Added promo code routes registration
- `functions/src/controllers/index.ts` - Exported PromoCodeController
- `src/server.ts` - Added promo code routes registration
- `src/controllers/index.ts` - Exported PromoCodeController

---

## ✨ Features

✅ Full CRUD operations for promo codes
✅ Influencer commission tracking
✅ Usage limit enforcement
✅ Expiration date validation
✅ Active/inactive status management
✅ Firestore integration with databaseId support
✅ Type-safe TypeScript implementation
✅ Comprehensive error handling
✅ Swagger API documentation ready
