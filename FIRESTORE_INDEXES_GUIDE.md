# Solution: Erreur d'Index Firestore Manquant

## 🔴 Problème

L'API retourne une erreur lors de certaines requêtes sur les cours :
```
"9 FAILED_PRECONDITION: The query requires an index."
```

## ✅ Solution Rapide (Recommandée)

### Option 1: Créer l'index via le lien automatique

Lorsque vous rencontrez l'erreur, Firebase vous fournit un lien direct pour créer l'index :

1. **Copiez le lien** fourni dans le message d'erreur
   - Exemple: `https://console.firebase.google.com/v1/r/project/myschool-f862b/firestore/databases/myschool-1/indexes?create_composite=...`

2. **Ouvrez le lien** dans votre navigateur

3. **Cliquez sur "Créer l'index"** dans la console Firebase

4. **Attendez** que l'index soit créé (peut prendre quelques minutes)

5. **Réessayez** votre requête API

### Option 2: Créer les index manuellement

1. **Accédez à la console Firebase :**
   ```
   https://console.firebase.google.com/project/myschool-f862b/firestore/databases/myschool-1/indexes
   ```

2. **Créez les index suivants pour la collection `courses` :**

#### Index 1: classe + isPublished + createdAt
```
Collection : courses
Champs :
  - classe (Ascending)
  - isPublished (Ascending)
  - createdAt (Descending)
Query Scope: Collection
```

#### Index 2: matiereId + isPublished + createdAt
```
Collection : courses
Champs :
  - matiereId (Ascending)
  - isPublished (Ascending)
  - createdAt (Descending)
Query Scope: Collection
```

#### Index 3: niveauScolaire + isPublished + createdAt
```
Collection : courses
Champs :
  - niveauScolaire (Ascending)
  - isPublished (Ascending)
  - createdAt (Descending)
Query Scope: Collection
```

#### Index 4: category + isPublished + createdAt
```
Collection : courses
Champs :
  - category (Ascending)
  - isPublished (Ascending)
  - createdAt (Descending)
Query Scope: Collection
```

#### Index 5: level + isPublished + createdAt
```
Collection : courses
Champs :
  - level (Ascending)
  - isPublished (Ascending)
  - createdAt (Descending)
Query Scope: Collection
```

#### Index 6: type + isPublished + createdAt
```
Collection : courses
Champs :
  - type (Ascending)
  - isPublished (Ascending)
  - createdAt (Descending)
Query Scope: Collection
```

## 📝 Fichier firestore.indexes.json

Le fichier `firestore.indexes.json` a été mis à jour avec tous les indexes nécessaires. Cependant, le déploiement via Firebase CLI échoue actuellement.

### Alternative: Créer via Firebase SDK

Si le déploiement CLI ne fonctionne pas, utilisez cette commande :

```bash
firebase firestore:indexes:create firestore.indexes.json
```

Ou :

```bash
firebase deploy --only firestore:indexes --debug
```

## 🧪 Tests des Endpoints

Pour tester quels endpoints nécessitent des indexes :

### Endpoints qui fonctionnent sans index :
- ✅ `GET /courses/level/DEBUTANT` (21 cours trouvés)
- ✅ `GET /courses/classe/6ème` (0 cours - fonctionne mais pas de données)
- ✅ `GET /courses/type/VIDEO` (0 cours - fonctionne mais pas de données)

### Endpoints qui nécessitent des indexes :
- ❌ `GET /courses` (erreur 500 - besoin d'index)
- ❌ `GET /courses/published` (erreur 500 - besoin d'index)
- ❌ `GET /courses/niveau/MOYEN` (erreur 500 - besoin d'index)

## 🔍 Identifier l'Index Manquant

Quand une requête échoue :

1. **Regardez les logs Firebase Functions :**
   ```bash
   firebase functions:log --only api
   ```

2. **L'erreur contiendra un lien** du type :
   ```
   https://console.firebase.google.com/v1/r/project/myschool-f862b/firestore/databases/myschool-1/indexes?create_composite=...
   ```

3. **Cliquez sur ce lien** pour créer automatiquement l'index exact nécessaire

## ⚡ Pourquoi les Index sont Nécessaires ?

Firestore nécessite des index composites pour les requêtes qui :
- Filtrent sur plusieurs champs (`where`)
- Combinent filtres et tri (`orderBy`)
- Utilisent des opérateurs d'inégalité sur plusieurs champs

### Exemples de requêtes nécessitant des indexes :

```javascript
// Requête 1: Cours publiés d'une classe, triés par date
db.collection('courses')
  .where('classe', '==', '6ème')
  .where('isPublished', '==', true)
  .orderBy('createdAt', 'desc')
// ➡️ Nécessite index : classe + isPublished + createdAt

// Requête 2: Cours d'une matière publiés
db.collection('courses')
  .where('matiereId', '==', 'mat123')
  .where('isPublished', '==', true)
  .orderBy('createdAt', 'desc')
// ➡️ Nécessite index : matiereId + isPublished + createdAt

// Requête 3: Cours d'un niveau scolaire
db.collection('courses')
  .where('niveauScolaire', '==', 'MOYEN')
  .where('isPublished', '==', true)
  .orderBy('createdAt', 'desc')
// ➡️ Nécessite index : niveauScolaire + isPublished + createdAt
```

## 🎯 Prochaines Étapes

1. **Créez les 6 index manuellement** via la console Firebase (Option 2 ci-dessus)
   - Temps estimé : 5-10 minutes par index
   - Total : 30-60 minutes

2. **Ou cliquez sur chaque lien d'erreur** quand vous testez les endpoints
   - Plus rapide : 1 minute par index
   - Crée exactement l'index nécessaire

3. **Vérifiez que les index sont créés** :
   ```bash
   firebase firestore:indexes:list
   ```

4. **Testez à nouveau les endpoints** une fois les index créés

## 📊 État Actuel

**Index créés automatiquement :**
- ✅ level + isPublished + createdAt (fonctionne déjà)

**Index à créer manuellement :**
- ⏳ classe + isPublished + createdAt
- ⏳ matiereId + isPublished + createdAt
- ⏳ niveauScolaire + isPublished + createdAt
- ⏳ category + isPublished + createdAt
- ⏳ type + isPublished + createdAt

## 💡 Astuce

**Pour éviter d'attendre**, créez tous les index en même temps :
1. Ouvrez 6 onglets de navigateur
2. Testez chaque endpoint qui échoue
3. Cliquez sur le lien de création d'index dans chaque erreur
4. Tous les index se créeront en parallèle

---

**Date de mise à jour :** 10 janvier 2026  
**Fichier modifié :** `firestore.indexes.json`  
**Status :** ⏳ En attente de création manuelle des index
