# 🔧 Guide de Configuration Orange Money

## 📋 Table des matières
1. [Configuration en mode MOCK (Développement)](#mode-mock)
2. [Configuration en mode SANDBOX (Tests)](#mode-sandbox)
3. [Configuration en mode PRODUCTION](#mode-production)
4. [Obtenir les credentials Orange Money](#obtenir-credentials)
5. [Vérification de la configuration](#verification)

---

## 🧪 Mode MOCK (Développement)

**État actuel** : Le système est configuré en mode MOCK par défaut.

### Configuration dans `.env`
```bash
ORANGE_MONEY_MODE=mock
```

### Comportement
- ✅ Aucune clé API requise
- ✅ Simulation de 70% de réussite
- ✅ Délais réseau simulés (200-500ms)
- ✅ Aucun vrai paiement effectué
- ✅ Parfait pour le développement et les tests

### Utilisation
```typescript
// Aucune configuration supplémentaire nécessaire
// Le service fonctionne automatiquement en mode mock
```

---

## 🔬 Mode SANDBOX (Tests avec Orange Money)

Pour tester avec la vraie API Orange Money en environnement de développement.

### 1. Obtenir les credentials SANDBOX

Rendez-vous sur : https://developer.orange-sonatel.com/

1. Créer un compte développeur
2. Créer une application
3. Récupérer vos credentials SANDBOX :
   - API Key
   - Merchant Key
   - Merchant ID

### 2. Configuration dans `.env`

```bash
# Changer le mode
ORANGE_MONEY_MODE=sandbox

# Ajouter vos credentials SANDBOX
ORANGE_MONEY_API_KEY=votre_api_key_sandbox
ORANGE_MONEY_MERCHANT_KEY=votre_merchant_key_sandbox
ORANGE_MONEY_MERCHANT_ID=votre_merchant_id_sandbox

# URLs SANDBOX
ORANGE_MONEY_API_URL=https://api.orange.com/orange-money-webpay/dev/v1
ORANGE_MONEY_NOTIFICATION_URL=https://votre-domaine-test.com/api/payments/webhook/orange-money
ORANGE_MONEY_RETURN_URL=https://votre-frontend-test.com/payment/status
```

### 3. Configurer le webhook

Pour recevoir les notifications Orange Money :

1. **Exposer votre serveur local** (pour développement) :
   ```bash
   # Installer ngrok
   npm install -g ngrok
   
   # Exposer votre port 3000
   ngrok http 3000
   ```

2. **Copier l'URL ngrok** et mettre à jour `.env` :
   ```bash
   ORANGE_MONEY_NOTIFICATION_URL=https://votre-url-ngrok.io/api/payments/webhook/orange-money
   ```

3. **Redémarrer le serveur** :
   ```bash
   npm run dev
   ```

### 4. Tester un paiement

```bash
# Tester avec curl
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "enrollmentId": "test-enrollment-456",
    "courseId": "test-course-789",
    "amount": 5000,
    "currency": "XOF",
    "paymentMethod": "orange-money",
    "customerPhoneNumber": "+221771234567",
    "customerFirstName": "Test",
    "customerLastName": "User"
  }'
```

---

## 🚀 Mode PRODUCTION

### 1. Obtenir les credentials PRODUCTION

1. Contacter Orange Money Business : https://www.orange.sn/business
2. Signer un contrat marchand
3. Récupérer vos credentials PRODUCTION

### 2. Configuration dans `.env`

```bash
# Passer en mode production
ORANGE_MONEY_MODE=production

# Credentials PRODUCTION (⚠️ SENSIBLES - NE JAMAIS COMMITER)
ORANGE_MONEY_API_KEY=votre_api_key_production
ORANGE_MONEY_MERCHANT_KEY=votre_merchant_key_production
ORANGE_MONEY_MERCHANT_ID=votre_merchant_id_production

# URLs PRODUCTION
ORANGE_MONEY_API_URL=https://api.orange.com/orange-money-webpay/prod/v1
ORANGE_MONEY_NOTIFICATION_URL=https://api.myschool.com/api/payments/webhook/orange-money
ORANGE_MONEY_RETURN_URL=https://app.myschool.com/payment/status

# Sécurité webhook
WEBHOOK_SECRET=un_secret_tres_securise_genere_aleatoirement
```

### 3. Variables d'environnement serveur

Sur votre serveur de production (Firebase Functions, Heroku, etc.) :

```bash
# Firebase Functions
firebase functions:config:set \
  orangemoney.mode="production" \
  orangemoney.api_key="votre_api_key" \
  orangemoney.merchant_key="votre_merchant_key" \
  orangemoney.merchant_id="votre_merchant_id"

# Ou utiliser Firebase Console > Functions > Configuration
```

### 4. Sécurité PRODUCTION

⚠️ **IMPORTANT** :

- ✅ Ne JAMAIS commiter le fichier `.env`
- ✅ Utiliser des secrets management (Firebase Config, AWS Secrets Manager, etc.)
- ✅ Activer HTTPS uniquement
- ✅ Valider les webhooks avec une signature
- ✅ Logger tous les paiements pour audit
- ✅ Mettre en place des alertes de monitoring

---

## 🔑 Obtenir les Credentials Orange Money

### Étapes détaillées

#### 1. **Créer un compte développeur**

Visitez : https://developer.orange-sonatel.com/

- Cliquez sur "S'inscrire"
- Remplissez le formulaire
- Validez votre email

#### 2. **Créer une application**

Une fois connecté :
- Allez dans "Mes applications"
- Cliquez sur "Créer une application"
- Choisissez "Orange Money"
- Sélectionnez "Webpay"

#### 3. **Récupérer les credentials SANDBOX**

Dans votre application :
- **API Key** : Visible dans l'onglet "Credentials"
- **Merchant Key** : Fourni lors de la création
- **Merchant ID** : Visible dans les détails

#### 4. **Passer en PRODUCTION**

Pour la production :
- Contactez Orange Money Business : https://www.orange.sn/business
- Téléphone : +221 33 889 7000
- Email : business@orange.sn

Documents requis :
- Registre de commerce
- Pièce d'identité du gérant
- Preuve de domiciliation bancaire
- Business plan (optionnel)

---

## ✅ Vérification de la Configuration

### 1. Vérifier le mode actuel

```bash
# Lancer le serveur
npm run dev

# Vous devriez voir dans les logs :
# 🧪 Orange Money configuré en mode MOCK
# OU
# ✅ Orange Money configuré en mode: sandbox
# OU
# ✅ Orange Money configuré en mode: production
```

### 2. Test rapide

```bash
# Test endpoint health
curl http://localhost:3000/

# Vous devriez voir "payments" dans la liste des endpoints
```

### 3. Test de création de paiement

```bash
# Mode MOCK ou SANDBOX
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "enrollmentId": "enroll456",
    "courseId": "course789",
    "amount": 10000,
    "currency": "XOF",
    "paymentMethod": "orange-money",
    "customerPhoneNumber": "+221771234567",
    "customerFirstName": "Amadou",
    "customerLastName": "Diallo"
  }'
```

**Résultat attendu** :
```json
{
  "success": true,
  "data": {
    "id": "payment-id-xxx",
    "payToken": "TOKEN_XXX",
    "paymentUrl": "https://...",
    "status": "PENDING",
    "expiresAt": "2024-01-01T12:15:00Z"
  }
}
```

### 4. Vérifier les logs

En mode MOCK, vous devriez voir :
```
🧪 [MOCK] Initialisation paiement Orange Money: {
  amount: 10000,
  phone: '+221771234567',
  reference: 'MS-1234567890-1234'
}
```

En mode production, vous verrez :
```
✅ Orange Money configuré en mode: production
```

---

## 🔧 Dépannage

### Erreur : "Orange Money credentials not configured"

**Cause** : Le mode n'est pas "mock" et les credentials sont manquants.

**Solution** :
```bash
# Vérifier .env
cat .env | grep ORANGE_MONEY

# S'assurer que ORANGE_MONEY_MODE=mock
# OU que les credentials sont définis
```

### Erreur : "Numéro de téléphone invalide"

**Cause** : Format du numéro incorrect.

**Formats acceptés** :
- `+221771234567` ✅
- `+221 77 123 45 67` ✅
- `771234567` ✅
- `77 123 45 67` ✅

**Formats refusés** :
- `221771234567` ❌ (manque le +)
- `+221671234567` ❌ (6X non supporté, seulement 7X)

### Webhook ne reçoit pas de notifications

**Vérifications** :
1. L'URL webhook est accessible publiquement
2. Le serveur répond sur `/api/payments/webhook/orange-money`
3. Le webhook retourne toujours HTTP 200
4. Les logs du serveur montrent la réception

**Test local avec ngrok** :
```bash
# Terminal 1
npm run dev

# Terminal 2
ngrok http 3000

# Copier l'URL https://xxx.ngrok.io
# Mettre à jour ORANGE_MONEY_NOTIFICATION_URL
```

---

## 📞 Support

### Orange Money Support
- **Site** : https://developer.orange-sonatel.com/
- **Email** : api.support@orange.com
- **Téléphone** : +221 33 889 7000

### Documentation
- **API Reference** : https://developer.orange-sonatel.com/documentation
- **Guide Integration** : Voir `ORANGE_MONEY_INTEGRATION.md`
- **Tests** : `npm test -- orangemoney`

---

## 🎯 Checklist de Migration

### Développement → Sandbox
- [ ] Créer compte développeur Orange Money
- [ ] Obtenir credentials SANDBOX
- [ ] Configurer `.env` avec credentials SANDBOX
- [ ] Changer `ORANGE_MONEY_MODE=sandbox`
- [ ] Exposer webhook avec ngrok
- [ ] Tester un paiement réel
- [ ] Vérifier réception webhook

### Sandbox → Production
- [ ] Contacter Orange Money Business
- [ ] Signer contrat marchand
- [ ] Obtenir credentials PRODUCTION
- [ ] Configurer variables serveur production
- [ ] Changer `ORANGE_MONEY_MODE=production`
- [ ] Configurer webhook URL production (HTTPS)
- [ ] Tester en environnement de staging
- [ ] Activer monitoring et alertes
- [ ] Mettre en place logs d'audit
- [ ] Déployer en production
- [ ] Tester paiement production (petit montant)
- [ ] Surveiller les premiers paiements clients

---

**Dernière mise à jour** : 29 novembre 2024  
**Version** : 1.0.0
