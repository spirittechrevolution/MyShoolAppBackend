# **Flux de paiement Wave - De A à Z**

## **Acteurs**
- **User**: Serigne Fallou Sow (phone: 765868942)
- **Cours**: "Chimie" - 19.99 XOF (ID: D6JUMFrMoS5tODpvkpSG)
- **Admin**: Propriétaire du compte Wave marchand

---

## **Flux complet étape par étape**

### **Phase 1: Initiation du paiement** 
```
App MySchool Mobile
│
├── 1. User clique "Acheter le cours Chimie (19.99 XOF)"
│
├── 2. POST /api/wave/create-payment
│    {
│      "courseId": "D6JUMFrMoS5tODpvkpSG",
│      "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2"
│    }
│
└── 3. API MySchool traite la demande
```

### **Phase 2: Préparation des données**
```
Backend MySchool
│
├── 4. Récupération user depuis Firestore
│    → firstName: "Serigne Fallou"
│    → lastName: "Sow" 
│    → phone: "765868942"
│
├── 5. Récupération cours depuis Firestore
│    → title: "Chimie"
│    → price: 19.99 XOF
│    → id: "D6JUMFrMoS5tODpvkpSG"
│
└── 6. Validation des données
```

### **Phase 3: Création session Wave**
```
Wave API Integration
│
├── 7. POST https://api.wave.com/v1/checkout/sessions
│    {
│      "amount": 19.99,
│      "currency": "XOF",
│      "customer_phone": "765868942",
│      "customer_firstname": "Serigne Fallou",
│      "customer_lastname": "Sow",
│      "description": "Achat du cours: Chimie",
│      "success_url": "https://myschool-app.com/payment/success?courseId=D6JUMFrMoS5tODpvkpSG&userId=VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
│      "cancel_url": "https://myschool-app.com/payment/cancel?courseId=D6JUMFrMoS5tODpvkpSG",
│      "webhook_url": "https://api-xa66eyezzq-uc.a.run.app/api/wave/webhook",
│      "metadata": {
│        "courseId": "D6JUMFrMoS5tODpvkpSG",
│        "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
│        "type": "course_purchase"
│      }
│    }
│
└── 8. Wave répond avec checkout session
     {
       "id": "wave_chm_789xyz",
       "checkout_url": "https://checkout.wave.com/pay/chm789xyz",
       "amount": 19.99,
       "currency": "XOF",
       "status": "pending"
     }
```

### **Phase 4: Enregistrement transaction MySchool**
```
MySchool Database
│
└── 9. Création payment record dans Firestore
     {
       "id": "payment_auto_generated",
       "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
       "courseId": "D6JUMFrMoS5tODpvkpSG",
       "amount": 19.99,
       "currency": "XOF",
       "paymentMethod": "wave",
       "status": "PENDING",
       "metadata": {
         "wavePaymentId": "wave_chm_789xyz",
         "checkoutUrl": "https://checkout.wave.com/pay/chm789xyz"
       },
       "createdAt": "2025-12-23T14:30:00Z"
     }
```

### **Phase 5: Redirection vers Wave**
```
 User Experience
│
├── 10. API MySchool retourne à l'app mobile
│     {
│       "success": true,
│       "data": {
│         "paymentUrl": "https://checkout.wave.com/pay/chm789xyz",
│         "paymentId": "wave_chm_789xyz",
│         "amount": 19.99,
│         "currency": "XOF"
│       }
│     }
│
├── 11. App mobile redirige vers Wave
│     → Ouverture app Wave ou browser
│
└── 12. Interface Wave s'affiche avec infos pré-remplies
      "Paiement de 19.99 XOF pour Serigne Fallou Sow"
      "Cours: Chimie - MySchool"
```

### **Phase 6: Processus de paiement Wave**
```
Wave Payment Processing
│
├── 13. User saisit PIN/authentification Wave
│     → Validation identité
│     → Vérification solde compte
│
├── 14. Wave traite le paiement
│     → Débit compte Serigne Fallou: -19.99 XOF
│     → Crédit compte marchand MySchool: +19.99 XOF
│     → Frais Wave: -0.XX XOF (selon tarif)
│
└── 15. Wave confirme transaction
      Status: "successful"
```

### **Phase 7: Notifications automatiques**
```
Webhook & Notifications
│
├── 16. Wave envoie webhook IMMÉDIAT
│     POST https://api-xa66eyezzq-uc.a.run.app/api/wave/webhook
│     {
│       "type": "payment.completed",
│       "data": {
│         "id": "wave_chm_789xyz",
│         "status": "successful",
│         "amount": 19.99,
│         "currency": "XOF",
│         "customer_phone": "765868942",
│         "metadata": {
│           "courseId": "D6JUMFrMoS5tODpvkpSG",
│           "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2"
│         }
│       }
│     }
│
├── 17. Backend MySchool traite le webhook
│     → Vérification signature sécurisée
│     → Mise à jour status payment: "SUCCESS"
│     → Création enrollment automatique
│
└── 18. Inscription automatique au cours
      {
        "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
        "courseId": "D6JUMFrMoS5tODpvkpSG",
        "enrolledAt": "2025-12-23T14:32:15Z",
        "status": "in-progress",
        "paymentMethod": "wave"
      }
```

### **Phase 8: Confirmation utilisateur**
```
Success Flow
│
├── 19. Wave redirige vers success_url
│     https://myschool-app.com/payment/success?courseId=D6JUMFrMoS5tODpvkpSG&userId=VLzZCBlJstQOWhJy9Xg4MEO7ESK2
│
├── 20. App MySchool affiche confirmation
│     "Paiement réussi!"
│     "Vous êtes inscrit au cours Chimie"
│     "Accéder au cours →"
│
└── 21. User peut immédiatement accéder au contenu
      → Chapitres débloqués
      → Vidéos accessibles
      → Exercices disponibles
```

### **Phase 9: Réception argent par l'admin**
```
 Admin Revenue Processing
│
├── 22. Argent disponible dans compte Wave marchand
│     Solde compte MySchool: +19.99 XOF
│     (Moins frais Wave: ~0.50 XOF)
│     Net reçu: ~19.49 XOF
│
├── 23. Reporting financier automatique
│     → Dashboard admin mis à jour
│     → Statistiques de vente
│     → Commission par cours
│
└── 24. Retrait possible vers compte bancaire
      → Wave → Compte bancaire admin
      → Traitement: 24-48h
      → Frais de retrait selon barème Wave
```

---

## **Timeline temporelle**

| Étape | Temps | Description |
|-------|--------|-------------|
| 1-8 | 0-2s | Création session Wave |
| 9-12 | 2-5s | Redirection utilisateur |
| 13-15 | 10-30s | Paiement user Wave |
| 16-18 | 1-3s | Webhook & inscription |
| 19-21 | 2-5s | Confirmation & accès |
| 22-24 | Instantané | Argent disponible admin |

## **Sécurités mises en place**

1. **Webhook signature** → Vérification authenticité Wave
2. **Metadata validation** → Correspondance user/cours
3. **Idempotence** → Pas de double inscription
4. **Error handling** → Gestion des échecs de paiement
5. **Audit trail** → Traçabilité complète des transactions

---

## **URLs et Endpoints**

### **API Endpoints Wave MySchool**
- `POST /api/wave/create-payment` - Créer un paiement
- `GET /api/wave/payment-status/{paymentId}` - Vérifier statut
- `POST /api/wave/webhook` - Webhook Wave (sécurisé)
- `POST /api/wave/confirm-payment` - Confirmation finale

### **URLs de production**
- **API Base**: `https://api-xa66eyezzq-uc.a.run.app`
- **Swagger Docs**: `https://api-xa66eyezzq-uc.a.run.app/api-docs`
- **Wave API**: `https://api.wave.com/v1`

---

## **Exemple complet avec données réelles**

### User Data (Firestore)
```json
{
  "id": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
  "firstName": "Serigne Fallou ",
  "lastName": "Sow ",
  "phone": "765868942",
  "login": "765868942",
  "level": "beginner",
  "status": "active"
}
```

### Course Data (Firestore)
```json
{
  "id": "D6JUMFrMoS5tODpvkpSG",
  "title": "Chimie",
  "price": 19.99,
  "category": "PC au collège",
  "level": "DEBUTANT",
  "type": "VIDEO",
  "isPublished": true
}
```

### Request/Response Flow
```bash
# 1. Création paiement
curl -X POST https://api-xa66eyezzq-uc.a.run.app/api/wave/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "D6JUMFrMoS5tODpvkpSG",
    "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2"
  }'

# Response
{
  "success": true,
  "data": {
    "paymentUrl": "https://checkout.wave.com/pay/chm789xyz",
    "paymentId": "wave_chm_789xyz",
    "amount": 19.99,
    "currency": "XOF"
  },
  "message": "Paiement Wave créé avec succès"
}
```

**Résultat final**: Serigne Fallou obtient l'accès au cours "Chimie" et l'admin MySchool reçoit 19.49 XOF dans son compte Wave !