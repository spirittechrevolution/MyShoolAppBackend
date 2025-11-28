# 🔐 Service d'Authentification Firebase

## Nouvelle fonctionnalité : Génération automatique d'UID

Le service User intègre maintenant Firebase Authentication pour générer automatiquement des UID uniques comme celui d'Awa (`9fUE3X2oaYWXPOluEXaMSMFXvjz1`).

## 📋 Comment ça marche

### Cas 1 : Avec email + password
```json
POST /api/users
{
  "firstName": "Moussa",
  "lastName": "Diallo",
  "email": "moussa@example.com",
  "password": "Moussa123!",
  "phone": "221776543210",
  "level": "beginner",
  "role": {
    "libelle": "student"
  }
}
```
✅ Firebase Auth génère l'UID automatiquement
✅ Mot de passe sécurisé (non stocké en clair dans Firestore)

### Cas 2 : Avec login + password (comme Awa)
```json
POST /api/users
{
  "firstName": "Awa",
  "lastName": "Ba",
  "login": "221778106275",
  "password": "Awa8909",
  "phone": "221778106275",
  "level": "beginner",
  "role": {
    "libelle": "student"
  }
}
```
✅ Utilise le login pour créer un compte Firebase Auth
✅ UID généré : `9fUE3X2oaYWXPOluEXaMSMFXvjz1` (28 caractères)
✅ Format identique à celui d'Awa

### Cas 3 : Sans authentification
```json
POST /api/users
{
  "firstName": "Test",
  "lastName": "User",
  "phone": "221771234567"
}
```
✅ Firestore génère un ID unique
✅ Pas d'authentification (utilisateur en lecture seule)

## 🔒 Sécurité

### Mots de passe
- ✅ Stockés dans Firebase Auth (chiffrés)
- ✅ **Jamais** sauvegardés en clair dans Firestore
- ✅ Validation : minimum 6 caractères

### Erreurs gérées
- `auth/email-already-in-use` → "Cet email est déjà utilisé"
- `auth/weak-password` → "Le mot de passe doit contenir au moins 6 caractères"
- `auth/invalid-email` → "Email invalide"

## 📊 Structure dans Firestore

```javascript
// Collection: utilisateur
// Document ID: 9fUE3X2oaYWXPOluEXaMSMFXvjz1 (UID Firebase Auth)
{
  uid: "9fUE3X2oaYWXPOluEXaMSMFXvjz1",
  firstName: "Awa",
  lastName: "ba",
  login: "221778106275",
  phone: "221778106275",
  // password: NOT STORED HERE ✅
  level: "beginner",
  role: {
    libelle: "student"
  },
  status: "active",
  specializationId: null,
  createdAt: "2025-11-28T10:28:21.000Z"
}
```

## 🔄 Connexion utilisateur (à implémenter)

Pour permettre aux utilisateurs de se connecter :

```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';

// Connexion avec email
await signInWithEmailAndPassword(auth, email, password);

// Ou avec login (numéro de téléphone)
const tempEmail = `${login}@myschool.temp`;
await signInWithEmailAndPassword(auth, tempEmail, password);
```

Voulez-vous que je crée également un endpoint de connexion (`POST /api/auth/login`) ?

## 🎯 Exemples pour Postman

### Créer un étudiant (comme Awa)
```json
POST http://localhost:3000/api/users
{
  "firstName": "Fatou",
  "lastName": "Sow",
  "login": "221775678901",
  "password": "Fatou2025!",
  "phone": "221775678901",
  "level": "beginner",
  "role": {
    "libelle": "student"
  },
  "status": "active"
}
```

Réponse :
```json
{
  "success": true,
  "data": {
    "uid": "AbCdEfGhIjKlMnOpQrStUvWxYz12", // ✅ Généré automatiquement
    "firstName": "Fatou",
    "lastName": "Sow",
    "login": "221775678901",
    "phone": "221775678901",
    "level": "beginner",
    "role": {
      "libelle": "student"
    },
    "status": "active",
    "createdAt": "2025-11-28T15:30:00.000Z"
  },
  "message": "Utilisateur créé avec succès"
}
```
