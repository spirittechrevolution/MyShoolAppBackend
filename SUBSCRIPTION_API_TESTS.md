# Guide de Test des API d'Abonnement - MySchool Backend

## Résumé des Corrections Appliquées

### Problème Initial
L'API d'abonnement retournait l'erreur : **"Les matières sélectionnées ne correspondent pas au niveau scolaire"**

**Cause**: Le service `matiere.service.ts` validait les matières en utilisant leurs **IDs Firestore** au lieu de leurs **noms**.

### Solution Implémentée

#### 1. Modification de `matiere.service.ts`
Ajout de la méthode `belongsToNiveauByName()` qui valide les matières par nom :

```typescript
async belongsToNiveauByName(matiereNom: string, niveauScolaire: NiveauScolaire): Promise<boolean> {
  const snapshot = await db.collection(this.collectionName)
    .where('nom', '==', matiereNom)
    .where('niveauScolaire', '==', niveauScolaire)
    .where('isActive', '==', true)
    .limit(1)
    .get();

  return !snapshot.empty;
}
```

#### 2. Mise à jour de la validation
La méthode `validateMatieresForNiveau()` utilise maintenant les **noms** des matières :

```typescript
async validateMatieresForNiveau(matiereNoms: string[], niveauScolaire: NiveauScolaire): Promise<boolean> {
  for (const matiereNom of matiereNoms) {
    const belongs = await this.belongsToNiveauByName(matiereNom, niveauScolaire);
    if (!belongs) {
      return false;
    }
  }
  return true;
}
```

#### 3. Initialisation des matières Firestore
Script `init-matieres.js` créé pour peupler la base avec 30 matières :
- **ELEMENTAIRE** (CM1, CM2): 8 matières
- **MOYEN** (6ème, 3ème BFEM): 12 matières  
- **SECONDAIRE** (Terminale S): 6 matières
- **UNIVERSITAIRE** (Licence 1 Info): 4 matières

---

## Structure des Payloads d'Abonnement

### 1. ELEMENTAIRE (CM1, CM2)
**Type**: `CLASSE` - Accès à TOUTES les matières de la classe

```json
{
  "userId": "user_id",
  "classe": "CM2",
  "niveauScolaire": "ELEMENTAIRE",
  "typeAbonnement": "CLASSE"
}
```

**Caractéristiques**:
- ❌ PAS de sélection de matières
- ✅ Accès automatique à toutes les matières de la classe
- 💰 Prix: 5000 XOF/an

---

### 2. MOYEN (6ème, 5ème, 4ème, 3ème BFEM)
**Type**: `MATIERE` - 3 matières obligatoires

```json
{
  "userId": "user_id",
  "classe": "6ème",
  "niveauScolaire": "MOYEN",
  "typeAbonnement": "MATIERE",
  "matieres": ["Mathématiques", "Français", "SVT"]
}
```

**Matières disponibles**:
- Mathématiques
- Français
- Anglais
- SVT
- Histoire-Géographie
- Physique-Chimie

**Caractéristiques**:
- ✅ EXACTEMENT 3 matières requises
- ✅ Les noms doivent correspondre exactement aux matières en Firestore
- 💰 Prix: 5000 XOF/an

---

### 3. SECONDAIRE (Seconde, Première, Terminale)
**Type**: `MATIERE` - 3 matières obligatoires

```json
{
  "userId": "user_id",
  "classe": "Terminale S",
  "niveauScolaire": "SECONDAIRE",
  "typeAbonnement": "MATIERE",
  "matieres": ["Mathématiques", "Physique", "Philosophie"]
}
```

**Matières disponibles** (Terminale S):
- Mathématiques
- Physique
- Chimie
- SVT
- Philosophie
- Français

**Caractéristiques**:
- ✅ EXACTEMENT 3 matières requises
- 💰 Prix: 5000 XOF/an

---

### 4. UNIVERSITAIRE (Licence, Master)
**Type**: `MATIERE` - 3 matières obligatoires

```json
{
  "userId": "user_id",
  "classe": "Licence 1 Informatique",
  "niveauScolaire": "UNIVERSITAIRE",
  "typeAbonnement": "MATIERE",
  "matieres": ["Algorithmique", "Base de données", "Réseaux"]
}
```

**Matières disponibles** (Licence 1 Info):
- Algorithmique
- Base de données
- Réseaux
- Programmation

**Caractéristiques**:
- ✅ EXACTEMENT 3 matières requises
- 💰 Prix: 5000 XOF/an

---

## Validations Appliquées par l'API

### Validation Automatique

1. **Validation de la classe**
   - La `classe` du payload doit correspondre exactement à la classe de l'utilisateur dans Firestore
   - Exemple: Si l'utilisateur est en "6ème", il ne peut pas créer d'abonnement pour "CM2"

2. **Validation du niveau scolaire**
   - Le `niveauScolaire` du payload doit correspondre exactement au niveau de l'utilisateur
   - Exemple: Un élève de niveau "MOYEN" ne peut pas créer d'abonnement "SECONDAIRE"

3. **Validation du type d'abonnement**
   - **ELEMENTAIRE** → doit utiliser `typeAbonnement: "CLASSE"`
   - **MOYEN/SECONDAIRE/UNIVERSITAIRE** → doit utiliser `typeAbonnement: "MATIERE"`

4. **Validation des matières**
   - Pour `typeAbonnement: "MATIERE"` → **EXACTEMENT 3 matières** requises
   - Pour `typeAbonnement: "CLASSE"` → **AUCUNE matière** autorisée
   - Les matières doivent exister dans Firestore avec :
     - `nom` correspondant exactement
     - `niveauScolaire` correspondant
     - `isActive: true`

5. **Validation d'abonnement actif**
   - Un utilisateur ne peut avoir qu'**UN SEUL abonnement actif** à la fois
   - Si un abonnement existe déjà, l'API retourne une erreur

---

## Tests Validés

### ✅ Test Réussi - MOYEN (6ème)

**Commande PowerShell**:
```powershell
.\test-api-moyen.ps1
```

**Payload**:
```json
{
  "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
  "classe": "6ème",
  "niveauScolaire": "MOYEN",
  "typeAbonnement": "MATIERE",
  "matieres": ["Mathématiques", "Français", "Anglais"]
}
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://pay.wave.com/c/cos-22y840qg81604?a=5000&c=XOF&m=Eldera",
    "paymentId": "cos-22y840qg81604",
    "subscriptionId": "m6yHWMhwiWhPGZwtex21",
    "amount": 5000,
    "classe": "6ème",
    "typeAbonnement": "MATIERE",
    "matieres": ["Mathématiques", "Français", "Anglais"],
    "currency": "XOF"
  },
  "message": "Paiement d'abonnement créé pour 3 matières (5 000 FCFA/an)"
}
```

**Vérifications**:
- ✅ Validation des matières par nom fonctionne
- ✅ URL de paiement Wave générée
- ✅ ID d'abonnement créé dans Firestore
- ✅ Montant correct : 5000 XOF

---

## Scripts de Test Disponibles

### 1. `test-api-moyen.ps1`
Test simple pour niveau MOYEN (6ème) avec 3 matières.

### 2. `test-all-levels.ps1`
Test complet de tous les niveaux scolaires. 

**Note**: Nécessite des utilisateurs de test pour chaque niveau car la validation de classe est stricte.

### 3. `init-matieres.js`
Initialise 30 matières dans Firestore pour tous les niveaux.

**Utilisation**:
```bash
node init-matieres.js
```

---

## Endpoints API Disponibles

### POST `/subscriptions/create-payment`
Crée un abonnement et génère un paiement Wave.

**URL**: `https://us-central1-myschool-f862b.cloudfunctions.net/api/subscriptions/create-payment`

**Headers**:
```
Content-Type: application/json
```

**Corps de la requête**: Voir exemples de payloads ci-dessus selon le niveau scolaire.

**Réponses Possibles**:

#### ✅ Succès (200)
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://pay.wave.com/...",
    "paymentId": "cos-xxx",
    "subscriptionId": "xxx",
    "amount": 5000,
    "classe": "6ème",
    "typeAbonnement": "MATIERE",
    "matieres": ["..."],
    "currency": "XOF"
  },
  "message": "Paiement créé"
}
```

#### ❌ Erreurs Possibles (400)

**Classe incorrecte**:
```json
{
  "success": false,
  "message": "La classe sélectionnée \"CM2\" ne correspond pas à votre classe \"6ème\""
}
```

**Niveau scolaire incorrect**:
```json
{
  "success": false,
  "message": "Le niveau scolaire sélectionné ne correspond pas à votre profil"
}
```

**Nombre de matières incorrect**:
```json
{
  "success": false,
  "message": "Pour MOYEN/SECONDAIRE/UNIVERSITAIRE, vous devez choisir EXACTEMENT 3 matières"
}
```

**Matières invalides**:
```json
{
  "success": false,
  "message": "Les matières sélectionnées ne correspondent pas au niveau scolaire"
}
```

**Abonnement déjà actif**:
```json
{
  "success": false,
  "message": "Vous avez déjà un abonnement actif",
  "data": {
    "subscriptionEndDate": "2025-01-15T10:30:00Z",
    "typeAbonnement": "MATIERE",
    "classe": "6ème"
  }
}
```

---

## Déploiement

### Compilation TypeScript
```bash
cd functions
npm run build
```

### Déploiement Firebase
```bash
firebase deploy --only functions
```

### Ou utiliser le script PowerShell
```powershell
.\deploy-functions.ps1
# Choisir l'option 2: Deploy functions only
```

---

## État du Système

### ✅ Corrections Complétées

1. **Swagger.json** mis à jour avec nouveaux payloads
2. **Controller** modifié pour accepter nouveau format (classe, niveauScolaire, typeAbonnement, matieres)
3. **Matiere Service** corrigé pour valider par nom au lieu d'ID
4. **30 matières** créées dans Firestore pour tous les niveaux
5. **Compilation** réussie (TypeScript)
6. **Déploiement** réussi sur Firebase Functions
7. **Tests API** validés pour niveau MOYEN

### 📊 Résultats des Tests

| Niveau | Classe | Status | Détails |
|--------|--------|--------|---------|
| ELEMENTAIRE | CM2 | ❌ | Classe ne correspond pas (user en 6ème) |
| **MOYEN** | **6ème** | **✅** | **TEST RÉUSSI - Validation OK** |
| MOYEN | 3ème BFEM | ❌ | Classe ne correspond pas (user en 6ème) |
| SECONDAIRE | Terminale S | ❌ | Classe ne correspond pas (user en 6ème) |
| UNIVERSITAIRE | Licence 1 Info | ❌ | Classe ne correspond pas (user en 6ème) |

**Note**: Les échecs sont **NORMAUX** - ils valident que la vérification de classe fonctionne correctement. Pour tester tous les niveaux, il faudrait créer des utilisateurs de test pour chaque classe.

---

## Points Importants pour l'Intégration Frontend

### 1. Récupération des Matières Disponibles
Le frontend doit afficher uniquement les matières correspondant au `niveauScolaire` de l'utilisateur.

**Endpoint suggéré**: `GET /matieres?niveau={niveauScolaire}`

### 2. Validation Côté Client
Implémenter les mêmes validations côté client pour meilleure UX :
- Vérifier le nombre de matières (exactement 3 pour MATIERE)
- Désactiver la sélection de matières pour ELEMENTAIRE
- Afficher le prix (5000 XOF/an)

### 3. Gestion de la Réponse
Après création du paiement :
1. Récupérer `paymentUrl` de la réponse
2. Rediriger l'utilisateur vers Wave pour paiement
3. Attendre webhook de confirmation Wave
4. Activer l'abonnement après confirmation

### 4. Cas d'Erreur
Afficher des messages clairs pour :
- Abonnement déjà actif → proposer de voir l'abonnement actuel
- Classe incorrecte → impossible (l'utilisateur ne devrait voir que sa classe)
- Matières invalides → recharger la liste des matières

---

## Logs et Debugging

### Voir les logs Firebase
```bash
firebase functions:log
```

### Logs de validation des matières
Le service affiche maintenant des logs détaillés :
```
🔍 Validation de 3 matières pour niveau MOYEN: ["Mathématiques", "Français", "SVT"]
✅ Matière "Mathématiques" validée pour niveau MOYEN
✅ Matière "Français" validée pour niveau MOYEN
✅ Matière "SVT" validée pour niveau MOYEN
✅ Toutes les matières sont valides pour niveau MOYEN
```

---

## Documentation Associée

- [SUBSCRIPTION_SYSTEM.md](SUBSCRIPTION_SYSTEM.md) - Système complet d'abonnement
- [WAVE_PAYMENT_FLOW.md](WAVE_PAYMENT_FLOW.md) - Intégration Wave
- [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) - Guide d'intégration frontend
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guide de déploiement

---

## Support

Pour toute question ou problème :
1. Consulter les logs Firebase Functions
2. Vérifier que les matières existent dans Firestore avec les noms exacts
3. S'assurer que l'utilisateur a une `classe` et `niveauScolaire` définis
4. Vérifier qu'il n'y a pas d'abonnement actif

---

**Date**: 2025-01-10  
**Version**: 1.0  
**Status**: ✅ Opérationnel
