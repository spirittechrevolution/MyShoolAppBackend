# 🎯 Guide Utilisation Code Promo - Paiement Abonnement (4500 FCFA)

## ✅ Correction Appliquée

Un code promo **`REDUCTION10`** a été créé en production pour réduire le montant d'abonnement de **5000 FCFA à 4500 FCFA**.

---

## 📊 Détails du Code Promo

| Paramètre | Valeur |
|-----------|--------|
| **Code** | `REDUCTION10` |
| **Type de réduction** | Pourcentage (%) |
| **Montant de réduction** | 10% |
| **Montant réduit** | **500 FCFA** |
| **Prix final** | **4500 FCFA** |
| **Date expiration** | 09/03/2027 |
| **Limit d'utilisation** | 1000 fois |
| **Statut** | ✅ Actif |

---

## 🔴 Erreur Précédente Rechauffée

**Erreur:** "Impossible de déterminer la classe à partir des matières"

**Cause:** Les matières sélectionnées ne correspondent pas à celles dans la base de données ou n'appartiennent pas à la même classe.

**Vérification faite:**
- ✅ Toutes les matières existent dans Firestore
- ✅ Chaque matière a une classe définie
- ✅ Les matières sont organisées par niveau scolaire

---

## 📱 Comment Tester le Flux de Paiement

### 1️⃣ Appel API pour créer le paiement

```json
POST /api/subscriptions/create-payment

Body:
{
  "userId": "USER_ID",
  "niveauScolaire": "MOYEN",
  "typeAbonnement": "MATIERE",
  "matieres": ["Mathématiques", "Français", "Anglais"],
  "promoCode": "REDUCTION10"
}
```

### 2️⃣ Réponse Attendue

```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://wave.com/pay/...",
    "paymentId": "wave_...",
    "subscriptionId": "sub_...",
    "amount": 4500,
    "currency": "XOF",
    "promoCode": "REDUCTION10",
    "discount": 500,
    "message": "Paiement d'abonnement créé pour 3 matières (4500 FCFA/an avec réduction)"
  }
}
```

### 3️⃣ Vérification Wave

Le montant envoyé à Wave sera exactement **4500 FCFA** (au lieu de 5000).

---

## 🧮 Flux de Calcul

```
Prix original:        5000 FCFA
Réduction 10%:        -500 FCFA
─────────────────────────────
Montant à payer:      4500 FCFA ✅
```

---

## 🐛 Troubleshooting

### Erreur: "Code promo invalide ou expiré"
- ⚠️ Vérifier que le code `REDUCTION10` est bien créé
- ⚠️ Vérifier que `isActive: true` dans Firestore

### Erreur: "Impossible de déterminer la classe à partir des matières"
- ⚠️ Les 3 matières doivent appartenir à la même classe
- ⚠️ Utiliser les noms exacts des matières dans la DB
- ⚠️ Exemple valide pour MOYEN:
  - `Mathématiques` (classe: 5ème)
  - `Français` (classe: 5ème)
  - `Anglais` (classe: 5ème)

### Montant incorrect à la réception Wave
- ⚠️ Vérifier que `finalAmount` est bien calculé dans le contrôleur
- ⚠️ Vérifier que `customAmount` est passé au service Wave

---

## 📋 Commandes Utiles

### Vérifier les codes promo créés
```bash
node check-promo-matieres.js
```

### Tester la logique de réduction
```bash
node test-promo-logic.js
```

### Créer/Mettre à jour un code promo
```bash
node create-promo-code.js
```

---

## 🔗 Points Clés du Code

### 1. Contrôleur applique la réduction
[functions/src/controllers/subscription.controller.ts](../functions/src/controllers/subscription.controller.ts#L171-L176)

```typescript
if (promoCode) {
  promo = await getValidPromoCode(promoCode);
  discount = SUBSCRIPTION_PRICE - applyDiscount(SUBSCRIPTION_PRICE, promo);
  finalAmount = applyDiscount(SUBSCRIPTION_PRICE, promo);  // 4500 FCFA
}
```

### 2. Service Wave reçoit le montant réduit
[functions/src/services/wave-subscription.service.ts](../functions/src/services/wave-subscription.service.ts#L51)

```typescript
const amount = typeof customAmount === 'number' ? customAmount : SUBSCRIPTION_PRICE;
// customAmount = 4500 quand promo utilisée
```

### 3. Abonnement sauvegardé avec montant correct
```typescript
await this.subscriptionService.create({
  amount: amount,  // 4500 FCFA si promo
  // ...
});
```

---

## ✨ Prochain Déploiement

Le code promo est **déjà actif en production**. Aucun redéploiement nécessaire.

Les utilisateurs peuvent maintenant utiliser le code **`REDUCTION10`** pour payer leurs abonnements à **4500 FCFA** au lieu de 5000 FCFA! 🎉
