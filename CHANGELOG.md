# 📋 CHANGELOG - Migration vers Système par Classe

## Version 2.0.0 - 4 Février 2026

### 🎯 Changement majeur : Abonnement par CLASSE au lieu de CATÉGORIE

---

## 🔄 Changements breaking (API)

### ❌ DEPRECATED - À ne plus utiliser

```typescript
// Ancien système (par catégorie)
POST /api/subscriptions/create-payment
{
  "userId": "...",
  "plan": "ANNUAL",
  "category": "PC au collège"  // ❌ N'existe plus
}

// Ancien endpoint
GET /api/subscriptions/check-access/:userId/:category  // ❌ Supprimé
GET /api/subscriptions/categories  // ❌ Supprimé
```

### ✅ NOUVEAU - À utiliser

```typescript
// Nouveau système (par classe + matières)
POST /api/subscriptions/create-payment
{
  "userId": "...",
  "plan": "ANNUAL",
  "classe": "Licence 2",           // ✅ OBLIGATOIRE
  "typeAbonnement": "MATIERE",     // ✅ CLASSE ou MATIERE
  "matieres": ["mat1", "mat2", "mat3"]  // ✅ Si MATIERE
}

// Nouveaux endpoints
GET /api/subscriptions/check-course-access/:userId/:courseId  // ✅ Par cours
GET /api/subscriptions/matieres/:niveau  // ✅ Matières disponibles
```

---

## 📊 Modèles de données modifiés

### User

```diff
{
  "firstName": "Fatou",
  "lastName": "Sow",
  "email": "fatou@example.com",
- "level": "beginner",  // ❌ Supprimé
+ "niveauScolaire": "UNIVERSITAIRE",  // ✅ OBLIGATOIRE
+ "classe": "Licence 2",  // ✅ OBLIGATOIRE (CM2, Licence 2, Terminale S, etc.)
  "role": { "libelle": "student" }
}
```

**Impact** : Tous les nouveaux users DOIVENT avoir `niveauScolaire` et `classe`

---

### Course

```diff
{
  "title": "Algorithmique Avancée",
  "price": 19.99,
- "category": "PC au collège",  // ⚠️ Gardé temporairement pour compatibilité
- "level": "intermediate",  // ❌ Supprimé
+ "niveauScolaire": "UNIVERSITAIRE",  // ✅ OBLIGATOIRE
+ "classe": "Licence 2",  // ✅ OBLIGATOIRE
+ "matiereId": "mat_algo_123",  // ✅ Requis pour MOYEN/SECONDAIRE/UNIVERSITAIRE
  "isPublished": true
}
```

**Impact** : Création de cours nécessite `niveauScolaire` et `classe`

---

### Subscription

```diff
{
  "userId": "user123",
  "plan": "ANNUAL",
- "category": "PC au collège",  // ❌ Supprimé
+ "niveauScolaire": "UNIVERSITAIRE",  // ✅ OBLIGATOIRE
+ "classe": "Licence 2",  // ✅ OBLIGATOIRE
+ "typeAbonnement": "MATIERE",  // ✅ CLASSE ou MATIERE
+ "matieres": ["mat1", "mat2", "mat3"],  // ✅ Si MATIERE (3 obligatoires)
  "status": "ACTIVE",
  "startDate": "2026-02-04",
  "endDate": "2027-02-04"
}
```

**Impact** : Logique d'abonnement complètement changée

---

### Matiere (NOUVEAU)

```typescript
{
  "id": "mat_algo_123",
  "nom": "Algorithmique",
  "niveauScolaire": "UNIVERSITAIRE",
  "classe": "Licence 2",  // Optionnel - lie à une classe précise
  "description": "Introduction aux algorithmes",
  "icone": "💻",
  "ordre": 1,
  "isActive": true,
  "createdAt": "2026-02-04T10:00:00Z"
}
```

**Impact** : Nouveau modèle pour gérer les matières dynamiquement

---

## 🆕 Nouveaux endpoints API

### Matières (Admin)

```bash
# Récupérer toutes les matières actives
GET /api/matieres

# Matières par niveau
GET /api/matieres/niveau/UNIVERSITAIRE

# Matières par classe précise (NOUVEAU ✅)
GET /api/matieres/classe/Licence%202

# Une matière par ID
GET /api/matieres/:id

# Créer une matière (admin)
POST /api/matieres
{
  "nom": "Algorithmique",
  "niveauScolaire": "UNIVERSITAIRE",
  "classe": "Licence 2",
  "icone": "💻",
  "ordre": 1
}

# Modifier une matière (admin)
PUT /api/matieres/:id

# Désactiver une matière (soft delete)
DELETE /api/matieres/:id
```

---

### Cours

```bash
# Cours par classe précise (NOUVEAU ✅)
GET /api/courses/classe/Licence%202

# Cours par matière (NOUVEAU ✅)
GET /api/courses/matiere/:matiereId

# Cours par niveau scolaire (NOUVEAU ✅)
GET /api/courses/niveau/UNIVERSITAIRE
```

---

### Users

```bash
# Toutes les classes disponibles par niveau (NOUVEAU ✅)
GET /api/users/classes-disponibles

# Classes pour un niveau spécifique (NOUVEAU ✅)
GET /api/users/classes-disponibles/UNIVERSITAIRE

# Réponse exemple :
{
  "success": true,
  "data": {
    "niveau": "UNIVERSITAIRE",
    "classes": ["Licence 1", "Licence 2", "Licence 3", "Master 1", "Master 2"]
  }
}
```

---

### Subscriptions

```bash
# Vérifier accès à un cours (MODIFIÉ ✅)
GET /api/subscriptions/check-course-access/:userId/:courseId

# Matières disponibles par niveau (NOUVEAU ✅)
GET /api/subscriptions/matieres/:niveau
```

---

## 🔧 Changements techniques

### Middleware

**course-access.middleware.ts** - Logique modifiée :

```typescript
// Avant (catégorie)
hasCategoryAccess(userId, course.category)

// Maintenant (classe + matières)
1. Vérifier user.classe === course.classe
2. Si ELEMENTAIRE : typeAbonnement === 'CLASSE'
3. Si AUTRES : course.matiereId in subscription.matieres[]
4. OU achat individuel
```

---

### Services

**MatiereService** (NOUVEAU) :
- `create()`, `getById()`, `getAll()`
- `getByNiveau()`, `getByClasse()`
- `update()`, `delete()` (soft delete)

**SubscriptionService** (REFACTORISÉ) :
- `create()` : Validation classe + 3 matières
- `hasAccessToCourse()` : Logique classe + matières
- `getAvailableSubjects()` : Par niveau

**CourseService** (ÉTENDU) :
- `getByClasse()`, `getByMatiere()`, `getByNiveauScolaire()`

---

### Controllers

**MatiereController** (NOUVEAU) :
- 7 méthodes CRUD complètes

**SubscriptionController** (MODIFIÉ) :
- `createSubscriptionPayment()` : Validation classe obligatoire + type
- Suppression méthodes catégories

**CourseController** (MODIFIÉ) :
- `create()` : Validation niveauScolaire + classe obligatoires
- 3 nouvelles méthodes de filtrage

**UserController** (MODIFIÉ) :
- `create()` : Validation classe obligatoire
- 2 nouvelles méthodes pour classes disponibles

---

## 📦 Scripts de migration

### npm run migrate

**Fonction** : Migrer les données existantes

**Actions** :
1. Ajoute `classe` aux users selon leur `niveauScolaire`
2. Ajoute `niveauScolaire` + `classe` aux courses depuis `category`
3. Ajoute `classe` + `typeAbonnement` aux subscriptions
4. Ajoute `classe` aux matières existantes

**Mode dry-run** : Test sans modification

---

### npm run init-matieres

**Fonction** : Peupler la base avec matières initiales

**Crée** :
- 5 matières pour CM2
- 6 matières pour 3ème (BFEM)
- 6 matières pour Terminale S
- 5 matières pour Licence 2

**Total** : ~22 matières

---

## 🚨 Actions requises

### Pour les développeurs frontend

1. **Inscription utilisateur** :
   ```typescript
   // Ajouter sélection classe
   <select name="niveauScolaire">
     <option value="ELEMENTAIRE">Élémentaire</option>
     <option value="MOYEN">Collège</option>
     <option value="SECONDAIRE">Lycée</option>
     <option value="UNIVERSITAIRE">Université</option>
   </select>
   
   <select name="classe">
     {/* Fetch /api/users/classes-disponibles/:niveau */}
   </select>
   ```

2. **Abonnement** :
   ```typescript
   // ELEMENTAIRE
   <button>S'abonner à ma classe</button>
   
   // AUTRES
   <p>Sélectionnez 3 matières :</p>
   {/* Fetch /api/matieres/classe/:userClasse */}
   {/* Multiselect max 3 */}
   <button disabled={matieres.length !== 3}>S'abonner</button>
   ```

3. **Cours** :
   ```typescript
   // Filtrer par classe de l'utilisateur
   fetch(`/api/courses/classe/${user.classe}`)
   ```

---

### Pour les admins

1. **Créer matières pour toutes les classes** :
   - Utiliser `/api/matieres` (POST)
   - Ou interface admin frontend

2. **Vérifier data migrée** :
   - Firestore Console
   - Vérifier users, courses, subscriptions ont `classe`

3. **Configurer abonnements existants** :
   - Users avec abonnement MATIERE sans matières sélectionnées
   - Demander de sélectionner 3 matières

---

## 🐛 Problèmes connus & solutions

### 1. Ancien code frontend utilise "category"

**Symptôme** : Erreur "category requis"  
**Solution** : Remplacer par `classe` + `typeAbonnement`

---

### 2. Tests cassés

**Symptôme** : Tests échouent sur validation classe  
**Solution** : Mettre à jour fixtures avec `classe` obligatoire

---

### 3. Abonnements sans matières

**Symptôme** : Abonnement MATIERE avec `matieres: []`  
**Solution** : Demander sélection via frontend ou admin panel

---

## 📅 Planning de migration

### Phase 1 : Préparation (Fait ✅)
- [x] Code backend refactorisé
- [x] Scripts migration créés
- [x] Documentation complète

### Phase 2 : Migration données (À faire)
- [ ] Backup Firestore
- [ ] Exécuter `npm run migrate`
- [ ] Exécuter `npm run init-matieres`
- [ ] Vérifier données migrées

### Phase 3 : Déploiement (À faire)
- [ ] Build functions
- [ ] Deploy Firebase
- [ ] Tests post-déploiement

### Phase 4 : Frontend (À faire)
- [ ] Adapter formulaire inscription
- [ ] Adapter page abonnement
- [ ] Adapter liste cours
- [ ] Tests E2E

---

## 🔗 Ressources

- [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) - Vue d'ensemble
- [QUICKSTART.md](QUICKSTART.md) - Démarrage rapide
- [ADMIN_MATIERES_GUIDE.md](ADMIN_MATIERES_GUIDE.md) - Guide admin
- [ARCHITECTURE_METIER.md](ARCHITECTURE_METIER.md) - Architecture
- [MODELE_METIER.md](MODELE_METIER.md) - Modèles

---

## 📞 Support

Questions ? Contactez :
- Email : serignefallousow@gmail.com
- Swagger : https://api-xa66eyezzq-uc.a.run.app/api-docs

---

**Version** : 2.0.0  
**Date** : 4 Février 2026  
**Auteur** : Équipe MySchool
