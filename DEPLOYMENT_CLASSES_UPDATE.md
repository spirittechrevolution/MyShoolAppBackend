# 🚀 Déploiement - Mise à Jour Classes SECONDAIRE

## ✅ Changements Effectués

### 1. Modèle Mise à Jour
- **Fichier:** `functions/src/models/matiere.model.ts`
- **Changements:**
  - ✅ `Terminale L'` → `Terminale L1`
  - ✅ `Terminale L` → `Terminale L2`
  - ✅ `Terminale S` → `Terminale S1, S2, S3, S4`
  - ✅ `Terminale G` → `Terminale G` (inchangé)
  - ✅ `Terminale T` → `Terminale T` (inchangé)

### 2. Scripts Créés
- `migrate-terminale-classes.js` - Migre les matières dans Firestore
- `verify-classes.js` - Vérifie les changements
- `deploy-classes-update.js` - Automatise le déploiement

---

## 📋 Étapes de Déploiement

### Option 1: Déploiement Automatisé (Recommandé)

#### Windows PowerShell:
```powershell
# Exécuter le script PowerShell de déploiement
.\deploy-functions.ps1
```

Puis sélectionner l'option **2** pour déployer uniquement les functions.

### Option 2: Déploiement Manuel

#### 1️⃣ Migrer les données Firestore:
```bash
node migrate-terminale-classes.js
```

#### 2️⃣ Compiler les functions:
```bash
cd functions
npm run build
```

#### 3️⃣ Générer le Swagger:
```bash
node generate-swagger.js
```

#### 4️⃣ Déployer les functions:
```bash
firebase deploy --only functions
```

### Option 3: Vérifier avant déployer

```bash
# Vérififier les changements
node verify-classes.js

# Vérifier les classes dans Firestore
node check-secondaire-classes.js

# Tester la logique
node test-promo-logic.js
```

---

## 🔍 Vérifications Post-Déploiement

### 1. Vérifier que les classes sont acceptées:
```bash
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "phone": "+221771234567",
    "email": "test@myschool.com",
    "password": "Test@123456",
    "niveauScolaire": "SECONDAIRE",
    "classe": "Terminale L1"
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "uid": "...",
    "firstName": "Test",
    "classe": "Terminale L1",
    "niveauScolaire": "SECONDAIRE",
    "status": "active"
  }
}
```

### 2. Tester le paiement avec nouvelle classe:
```bash
curl -X POST https://us-central1-myschool-f862b.cloudfunctions.net/api/subscriptions/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "niveauScolaire": "SECONDAIRE",
    "typeAbonnement": "MATIERE",
    "matieres": ["Mathématiques", "Français", "Anglais"],
    "promoCode": "REDUCTION10"
  }'
```

**Classe déterminée automatiquement:** ✅ `Terminale L1` ou `Terminale S1`, etc.

---

## 📊 Classes SECONDAIRE Disponibles (mise à jour)

| Cycle | Séries |
|-------|--------|
| **Seconde** | L, S, G, T |
| **Première** | L, L', S, G, T |
| **Terminale** | L1, L2, S1, S2, S3, S4, G, T |

---

## 🧪 Tests de Validation

### Vérifier les matières par classe:
```javascript
// Exemple: Récupérer matières de Terminale S2
db.collection('matieres')
  .where('niveauScolaire', '==', 'SECONDAIRE')
  .where('classe', '==', 'Terminale S2')
  .get()
```

### Erreur Avant (FIXÉE):
```
❌ "La classe \"Terminale L1\" n'existe pas pour le niveau \"SECONDAIRE\""
```

### Succès Après:
```
✅ "Paiement d'abonnement créé pour 3 matières (4500 FCFA/an avec réduction)"
```

---

## 📝 Résumé des Fichiers Modifiés

| Fichier | Changement |
|---------|-----------|
| `functions/src/models/matiere.model.ts` | ✅ Classes SECONDAIRE mises à jour |
| `functions/src/swagger.json` | 🔄 À régénérer (generate-swagger.js) |
| `migrate-terminale-classes.js` | ✨ Nouveau script de migration |
| `verify-classes.js` | ✨ Nouveau script de vérification |

---

## ⏱️ Temps Estimé

- Migration Firestore: **2-5 minutes**
- Compilation: **10-15 minutes**
- Génération Swagger: **1-2 minutes**
- Déploiement: **5-10 minutes**

**Total: ~20-30 minutes** ⏱️

---

## 🆘 Troubleshooting

### ❌ Erreur: "La classe n'existe pas"
- Vérifier que la migration a bien exécuté
- Vérifier que le modèle est bien compilé
- Vérifier les matières dans Firestore

### ❌ Erreur Firebase Login
```bash
firebase login --no-localhost
firebase use myschool-f862b
firebase deploy --only functions
```

### ❌ Port déjà utilisé
```bash
# Trouver le processus
netstat -ano | findstr :3000
# Tuer le processus (Windows)
taskkill /PID xxx /F
```

---

## 🎉 Une Fois Déployé

Les utilisateurs peuvent maintenant:
- ✅ Créer des comptes avec `Terminale L1`, `Terminale L2`
- ✅ Créer des comptes avec `Terminale S1`, `S2`, `S3`, `S4`
- ✅ Acheter des abonnements avec réduction (code promo `REDUCTION10` = 4500 FCFA)
- ✅ Accéder aux matières de leur classe

---

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifiez les logs Firebase: `firebase functions:log`
2. Vérifiez Firestore Console: https://console.firebase.google.com/project/myschool-f862b/firestore
3. Vérifiez les matières: `node check-secondaire-classes.js`
