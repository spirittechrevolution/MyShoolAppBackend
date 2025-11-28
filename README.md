# MySchool Backend API

API REST pour la plateforme MySchool avec Firebase Firestore.

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
npm install

# Mode développement
npm run dev

# Build production
npm run build
npm start
```

## 📡 Endpoints API

### Utilisateurs (`/api/users`)
- `POST /` - Créer un utilisateur
- `GET /` - Liste tous les utilisateurs
- `GET /:id` - Obtenir un utilisateur par ID
- `GET /email/:email` - Obtenir par email
- `GET /phone/:phone` - Obtenir par téléphone
- `GET /role/:role` - Filtrer par rôle
- `GET /status/:status` - Filtrer par statut
- `PUT /:id` - Mettre à jour
- `DELETE /:id` - Supprimer
- `PATCH /:id/profile-image` - Mettre à jour l'image de profil
- `PATCH /:id/status` - Mettre à jour le statut

### Cours (`/api/courses`)
- `POST /` - Créer un cours
- `GET /` - Liste tous les cours
- `GET /published` - Cours publiés uniquement
- `GET /:id` - Obtenir par ID
- `GET /category/:category` - Filtrer par catégorie
- `GET /level/:level` - Filtrer par niveau
- `GET /type/:type` - Filtrer par type
- `PUT /:id` - Mettre à jour
- `DELETE /:id` - Supprimer
- `PATCH /:id/publish` - Publier
- `PATCH /:id/unpublish` - Dépublier

### Chapitres (`/api/chapters`)
- `POST /` - Créer un chapitre
- `GET /` - Liste tous les chapitres
- `GET /:id` - Obtenir par ID
- `GET /course/:courseId` - Chapitres d'un cours
- `PUT /:id` - Mettre à jour
- `DELETE /:id` - Supprimer

### Leçons (`/api/lessons`)
- `POST /` - Créer une leçon
- `GET /` - Liste toutes les leçons
- `GET /:id` - Obtenir par ID
- `GET /course/:courseId` - Leçons d'un cours
- `GET /chapter/:chapterId` - Leçons d'un chapitre
- `PUT /:id` - Mettre à jour
- `DELETE /:id` - Supprimer

### Exercices (`/api/exercises`)
- `POST /` - Créer un exercice
- `GET /` - Liste tous les exercices
- `GET /:id` - Obtenir par ID
- `GET /course/:courseId` - Exercices d'un cours
- `GET /chapter/:chapterId` - Exercices d'un chapitre
- `GET /type/:type` - Filtrer par type (qcm/code)
- `GET /difficulty/:difficulty` - Filtrer par difficulté
- `PUT /:id` - Mettre à jour
- `DELETE /:id` - Supprimer

### Inscriptions (`/api/enrollments`)
- `POST /` - Créer une inscription
- `GET /` - Liste toutes les inscriptions
- `GET /:id` - Obtenir par ID
- `GET /user/:userId` - Inscriptions d'un utilisateur
- `GET /course/:courseId` - Inscriptions d'un cours
- `GET /status/:status` - Filtrer par statut
- `GET /user/:userId/course/:courseId` - Inscription spécifique
- `PUT /:id` - Mettre à jour
- `DELETE /:id` - Supprimer
- `PATCH /:id/progress` - Mettre à jour la progression
- `PATCH /:id/status` - Mettre à jour le statut

### Instructeurs (`/api/instructors`)
- `POST /` - Créer un instructeur
- `GET /` - Liste tous les instructeurs
- `GET /:id` - Obtenir par ID
- `GET /course/:courseId` - Instructeurs d'un cours
- `GET /expertise/:expertiseId` - Filtrer par expertise
- `PUT /:id` - Mettre à jour
- `DELETE /:id` - Supprimer

## 📝 Format des réponses

### Succès
```json
{
  "success": true,
  "data": { ... },
  "message": "Message optionnel",
  "count": 10
}
```

### Erreur
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

## 🔧 Configuration

Créez un fichier `.env` à la racine :

```env
PORT=3000
NODE_ENV=development
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 📦 Structure du projet

```
src/
├── config/          # Configuration Firebase
├── models/          # Modèles de données
├── services/        # Logique métier
├── controllers/     # Contrôleurs API
├── routes/          # Routes Express
└── server.ts        # Point d'entrée
```

## 🛠️ Technologies

- Node.js
- Express.js
- TypeScript
- Firebase Firestore
- CORS
