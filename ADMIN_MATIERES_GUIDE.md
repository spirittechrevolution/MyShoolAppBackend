# 📚 Guide Admin - Gestion des Matières

## 🎯 Vue d'ensemble

Le système de matières est maintenant **database-driven** (piloté par la base de données) :
- ✅ **Plus de code à modifier** pour ajouter des matières
- ✅ **API REST complète** pour la gestion CRUD
- ✅ **Initialisation ponctuelle** via script
- ✅ **Administration via interface** (frontend à créer)

---

## 🚀 Initialisation (première fois uniquement)

### Script d'initialisation

Exécuter UNE SEULE FOIS pour peupler la base avec des matières par défaut :

```bash
npm run init-matieres
```

Ce script crée des matières pour :
- **CM2** (ELEMENTAIRE) : Mathématiques, Français, Anglais, Sciences, Histoire-Géo
- **3ème (BFEM)** (MOYEN) : Maths, Physique-Chimie, SVT, Français, Anglais, Histoire-Géo
- **Terminale S** (SECONDAIRE) : Maths, Physique-Chimie, SVT, Français, Philo, Anglais
- **Licence 2** (UNIVERSITAIRE) : Maths, Physique, Informatique, Chimie, Économie

### Personnaliser l'initialisation

Modifiez `scripts/init-matieres.ts` pour ajouter d'autres classes :

```typescript
const MATIERES_PAR_CLASSE: Record<string, MatiereData[]> = {
  'Licence 3': [
    { nom: 'Statistiques Avancées', niveauScolaire: 'UNIVERSITAIRE', classe: 'Licence 3', icone: '📊', ordre: 1, isActive: true },
    // ...
  ]
};
```

---

## 🛠️ API Admin - Gestion des matières

### 1. Créer une matière

**Endpoint** : `POST /api/matieres`

**Body** :
```json
{
  "nom": "Algorithmes",
  "niveauScolaire": "UNIVERSITAIRE",
  "classe": "Licence 2",
  "description": "Introduction aux algorithmes et structures de données",
  "icone": "💻",
  "ordre": 6
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "id": "matiere_abc123",
    "nom": "Algorithmes",
    "niveauScolaire": "UNIVERSITAIRE",
    "classe": "Licence 2",
    "icone": "💻",
    "ordre": 6,
    "isActive": true,
    "createdAt": "2025-12-23T10:00:00Z"
  },
  "message": "Matière créée avec succès"
}
```

**Exemples cURL** :

```bash
# Créer une matière pour CM2
curl -X POST http://localhost:3000/api/matieres \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Arts Plastiques",
    "niveauScolaire": "ELEMENTAIRE",
    "classe": "CM2",
    "icone": "🎨",
    "ordre": 6
  }'

# Créer une matière pour Terminale L
curl -X POST http://localhost:3000/api/matieres \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Philosophie",
    "niveauScolaire": "SECONDAIRE",
    "classe": "Terminale L",
    "icone": "🤔",
    "ordre": 1
  }'
```

---

### 2. Récupérer toutes les matières

**Endpoint** : `GET /api/matieres`

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "id": "mat1",
      "nom": "Mathématiques",
      "niveauScolaire": "UNIVERSITAIRE",
      "classe": "Licence 2",
      "icone": "🔢",
      "ordre": 1
    },
    // ...
  ],
  "count": 25
}
```

---

### 3. Récupérer les matières par niveau

**Endpoint** : `GET /api/matieres/niveau/:niveau`

**Exemples** :
```bash
# Matières élémentaires
GET /api/matieres/niveau/ELEMENTAIRE

# Matières universitaires
GET /api/matieres/niveau/UNIVERSITAIRE
```

---

### 4. Récupérer les matières par classe

**Endpoint** : `GET /api/matieres/classe/:classe`

**Exemples** :
```bash
# Matières pour CM2
GET /api/matieres/classe/CM2

# Matières pour Licence 2 (encoder les espaces)
GET /api/matieres/classe/Licence%202

# Matières pour Terminale S
GET /api/matieres/classe/Terminale%20S
```

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "id": "mat1",
      "nom": "Mathématiques",
      "classe": "Licence 2",
      "icone": "🔢"
    },
    {
      "id": "mat2",
      "nom": "Physique",
      "classe": "Licence 2",
      "icone": "⚛️"
    }
  ],
  "count": 5
}
```

---

### 5. Récupérer une matière par ID

**Endpoint** : `GET /api/matieres/:id`

**Exemple** :
```bash
GET /api/matieres/matiere_abc123
```

---

### 6. Modifier une matière

**Endpoint** : `PUT /api/matieres/:id`

**Body** :
```json
{
  "nom": "Mathématiques Appliquées",
  "description": "Mathématiques appliquées aux sciences",
  "ordre": 2
}
```

**Exemple cURL** :
```bash
curl -X PUT http://localhost:3000/api/matieres/mat1 \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Introduction aux mathématiques avancées",
    "ordre": 1
  }'
```

---

### 7. Désactiver/Supprimer une matière

**Endpoint** : `DELETE /api/matieres/:id`

**Note** : Suppression douce (soft delete) - la matière est marquée `isActive: false` mais reste en base.

**Exemple cURL** :
```bash
curl -X DELETE http://localhost:3000/api/matieres/mat1
```

**Réponse** :
```json
{
  "success": true,
  "message": "Matière désactivée avec succès"
}
```

---

## 🎨 Icônes disponibles

Suggestions d'icônes pour les matières :

| Matière | Icône | Emoji |
|---------|-------|-------|
| Mathématiques | 🔢 | `:1234:` |
| Physique | ⚛️ | `:atom_symbol:` |
| Chimie | ⚗️ | `:alembic:` |
| Informatique | 💻 | `:computer:` |
| Français | 📖 | `:book:` |
| Anglais | 🇬🇧 | `:gb:` |
| Histoire | 📜 | `:scroll:` |
| Géographie | 🌍 | `:earth_africa:` |
| Philosophie | 🤔 | `:thinking:` |
| Arts | 🎨 | `:art:` |
| Musique | 🎵 | `:musical_note:` |
| Sport | ⚽ | `:soccer:` |
| SVT / Biologie | 🧬 | `:dna:` |
| Économie | 💰 | `:moneybag:` |
| Droit | ⚖️ | `:balance_scale:` |

---

## 📊 Structure de classe complète

### ELEMENTAIRE
- CI (Cours d'Initiation)
- CP (Cours Préparatoire)
- CE1 (Cours Élémentaire 1)
- CE2 (Cours Élémentaire 2)
- CM1 (Cours Moyen 1)
- CM2 (Cours Moyen 2)

### MOYEN
- 6ème
- 5ème
- 4ème
- 3ème (BFEM)

### SECONDAIRE
- Seconde L, Seconde L', Seconde S, Seconde G, Seconde T
- Première L, Première L', Première S, Première G, Première T
- Terminale L, Terminale L', Terminale S, Terminale G, Terminale T

### UNIVERSITAIRE
- Licence 1
- Licence 2
- Licence 3
- Master 1
- Master 2

---

## 🔄 Workflow typique

### 1. Nouvelle classe ajoutée (ex: Seconde L)
```bash
# Créer les matières pour cette classe
curl -X POST http://localhost:3000/api/matieres \
  -H "Content-Type: application/json" \
  -d '{"nom": "Français", "niveauScolaire": "SECONDAIRE", "classe": "Seconde L", "icone": "📖", "ordre": 1}'

curl -X POST http://localhost:3000/api/matieres \
  -H "Content-Type: application/json" \
  -d '{"nom": "Histoire-Géographie", "niveauScolaire": "SECONDAIRE", "classe": "Seconde L", "icone": "🌍", "ordre": 2}'
# ... etc
```

### 2. User s'inscrit avec `classe: "Seconde L"`
```javascript
// Frontend récupère les matières disponibles
const response = await fetch('/api/matieres/classe/Seconde%20L');
const { data: matieres } = await response.json();

// Affiche la liste des matières pour sélection des 3 matières
// Matières disponibles: Français, Histoire-Géo, Philosophie, etc.
```

### 3. User crée son abonnement
```json
{
  "userId": "user123",
  "niveauScolaire": "SECONDAIRE",
  "classe": "Seconde L",
  "typeAbonnement": "MATIERE",
  "matieres": ["mat1_francais", "mat2_histo", "mat3_philo"]
}
```

---

## 🛡️ Sécurité & Permissions

### Pour production (à implémenter) :

1. **Ajouter middleware d'authentification admin** :
```typescript
// functions/src/middleware/admin.middleware.ts
export const requireAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  
  if (decodedToken.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès refusé' });
  }
  
  next();
};
```

2. **Protéger les routes** :
```typescript
// functions/src/routes/matiere.routes.ts
router.post('/', requireAdmin, matiereController.create);
router.put('/:id', requireAdmin, matiereController.update);
router.delete('/:id', requireAdmin, matiereController.delete);
```

---

## 🧪 Tests

### Tester en local

```bash
# Démarrer le serveur local
npm run dev

# Initialiser les matières
npm run init-matieres

# Tester l'API
curl http://localhost:3000/api/matieres/classe/CM2

# Créer une matière
curl -X POST http://localhost:3000/api/matieres \
  -H "Content-Type: application/json" \
  -d '{"nom": "Test Matière", "niveauScolaire": "ELEMENTAIRE", "classe": "CM2", "icone": "✅", "ordre": 99}'
```

---

## 📱 Intégration Frontend

### Composant d'administration (React/Angular)

```typescript
// components/AdminMatieres.tsx
export function AdminMatieres() {
  const [matieres, setMatieres] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState('CM2');
  
  // Charger les matières
  useEffect(() => {
    fetch(`/api/matieres/classe/${selectedClasse}`)
      .then(res => res.json())
      .then(data => setMatieres(data.data));
  }, [selectedClasse]);
  
  // Créer une matière
  const handleCreate = async (formData) => {
    const response = await fetch('/api/matieres', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      // Recharger la liste
      // ...
    }
  };
  
  return (
    <div>
      <select onChange={(e) => setSelectedClasse(e.target.value)}>
        <option value="CM2">CM2</option>
        <option value="Licence 2">Licence 2</option>
        {/* ... */}
      </select>
      
      <table>
        <thead>
          <tr>
            <th>Icône</th>
            <th>Nom</th>
            <th>Ordre</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {matieres.map(matiere => (
            <tr key={matiere.id}>
              <td>{matiere.icone}</td>
              <td>{matiere.nom}</td>
              <td>{matiere.ordre}</td>
              <td>
                <button onClick={() => handleEdit(matiere)}>✏️</button>
                <button onClick={() => handleDelete(matiere.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <button onClick={handleCreate}>+ Nouvelle matière</button>
    </div>
  );
}
```

---

## 🚀 Déploiement

### Étapes de déploiement

```bash
# 1. Build le projet
cd functions
npm run build

# 2. Déployer les fonctions
firebase deploy --only functions

# 3. Initialiser les matières (production)
# Option A : Via script local pointant vers prod
FIREBASE_PROJECT_ID=myschool-f862b npm run init-matieres

# Option B : Via Cloud Function callable
# Créer une fonction admin pour initialisation
```

---

## 📚 Ressources

- [API Documentation](DOCUMENTATION_API.md)
- [Modèle Métier](MODELE_METIER.md)
- [Architecture Métier](ARCHITECTURE_METIER.md)
- [Système d'abonnement](SUBSCRIPTION_SYSTEM.md)

---

## ❓ FAQ Admin

### Comment ajouter une matière pour toutes les classes d'un niveau ?

Vous devez créer une matière par classe. Exemple pour "Mathématiques" au SECONDAIRE :

```bash
# Seconde S
curl -X POST /api/matieres -d '{"nom":"Mathématiques","niveauScolaire":"SECONDAIRE","classe":"Seconde S","icone":"🔢","ordre":1}'

# Première S
curl -X POST /api/matieres -d '{"nom":"Mathématiques","niveauScolaire":"SECONDAIRE","classe":"Première S","icone":"🔢","ordre":1}'

# Terminale S
curl -X POST /api/matieres -d '{"nom":"Mathématiques","niveauScolaire":"SECONDAIRE","classe":"Terminale S","icone":"🔢","ordre":1}'
```

### Comment réorganiser l'ordre des matières ?

Modifiez le champ `ordre` via PUT :

```bash
# Mettre Mathématiques en premier
curl -X PUT /api/matieres/mat1 -d '{"ordre": 1}'

# Mettre Français en deuxième
curl -X PUT /api/matieres/mat2 -d '{"ordre": 2}'
```

### Comment supprimer une matière ?

**Soft delete** (recommandé) :
```bash
DELETE /api/matieres/:id
# Marque isActive = false
```

**Hard delete** (à éviter si utilisée dans des abonnements) :
```bash
# Depuis Firebase Console ou script admin
```

### Comment restaurer une matière désactivée ?

```bash
curl -X PUT /api/matieres/mat1 \
  -H "Content-Type: application/json" \
  -d '{"isActive": true}'
```

