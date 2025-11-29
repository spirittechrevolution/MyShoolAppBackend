# Documentation de l'API MySchool

## 📖 Accès à la documentation OpenAPI

L'API MySchool utilise la spécification **OpenAPI 3.0** pour documenter tous ses endpoints.

### 🌐 Endpoints de documentation

#### Production
- **Spécification JSON** : https://us-central1-myschool-f862b.cloudfunctions.net/api/api-docs
- **Endpoint alternatif** : https://us-central1-myschool-f862b.cloudfunctions.net/api/openapi.json

#### Développement local
- **Spécification JSON** : http://localhost:3000/api-docs

---

## 🔧 Visualiser la documentation

### Option 1 : Swagger Editor (Recommandé)

1. **Récupérer la spécification JSON** :
   ```bash
   curl https://us-central1-myschool-f862b.cloudfunctions.net/api/api-docs > openapi.json
   ```

2. **Ouvrir Swagger Editor** :
   - Aller sur https://editor.swagger.io/
   - Cliquer sur **File → Import file**
   - Sélectionner le fichier `openapi.json`

3. **Alternative : Copier-coller** :
   - Copier le contenu JSON de l'URL
   - Coller directement dans Swagger Editor

### Option 2 : Swagger UI local

Installer Swagger UI localement pour une visualisation hors ligne :

```bash
npm install -g swagger-ui-watcher
swagger-ui-watcher https://us-central1-myschool-f862b.cloudfunctions.net/api/api-docs
```

### Option 3 : Postman

1. Ouvrir Postman
2. Cliquer sur **Import**
3. Coller l'URL : `https://us-central1-myschool-f862b.cloudfunctions.net/api/api-docs`
4. Postman importera automatiquement tous les endpoints

### Option 4 : VS Code avec extension

Installer l'extension **OpenAPI (Swagger) Editor** dans VS Code :
1. Télécharger le JSON : `curl https://us-central1-myschool-f862b.cloudfunctions.net/api/api-docs > openapi.json`
2. Ouvrir le fichier dans VS Code
3. Utiliser la prévisualisation OpenAPI

---

## 📋 Informations de l'API

### Serveurs disponibles

| Environnement | URL |
|---------------|-----|
| **Production** | `https://us-central1-myschool-f862b.cloudfunctions.net/api` |
| **Émulateur Firebase** | `http://localhost:5001/myschool-f862b/us-central1/api` |
| **Développement local** | `http://localhost:3000` |

### Modules disponibles

| Module | Endpoint | Description |
|--------|----------|-------------|
| **Users** | `/api/users` | Gestion des utilisateurs |
| **Courses** | `/api/courses` | Gestion des cours |
| **Chapters** | `/api/chapters` | Gestion des chapitres |
| **Lessons** | `/api/lessons` | Gestion des leçons |
| **Exercises** | `/api/exercises` | Gestion des exercices |
| **Enrollments** | `/api/enrollments` | Gestion des inscriptions |
| **Instructors** | `/api/instructors` | Gestion des instructeurs |

---

## 🚀 Exemples d'utilisation

### Récupérer la spécification OpenAPI

```bash
# Avec curl
curl https://us-central1-myschool-f862b.cloudfunctions.net/api/api-docs

# Avec PowerShell
Invoke-WebRequest -Uri "https://us-central1-myschool-f862b.cloudfunctions.net/api/api-docs" -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Sauvegarder localement

```bash
# Linux/Mac
curl https://us-central1-myschool-f862b.cloudfunctions.net/api/api-docs > myschool-openapi.json

# Windows PowerShell
Invoke-WebRequest -Uri "https://us-central1-myschool-f862b.cloudfunctions.net/api/api-docs" -OutFile "myschool-openapi.json"
```

---

## 🎯 Pourquoi pas Swagger UI en production ?

Cloud Functions (serverless) ne supporte pas le service de fichiers statiques nécessaire pour Swagger UI. C'est pourquoi nous fournissons uniquement la **spécification JSON** qui peut être visualisée avec des outils externes comme :

- Swagger Editor (en ligne)
- Postman
- Insomnia
- ReDoc
- VS Code avec extension OpenAPI

Cette approche offre plus de flexibilité et évite les limitations des Cloud Functions.

---

## 📱 Intégration Frontend

Pour intégrer la documentation dans votre application Angular :

```typescript
// Récupérer la spécification OpenAPI
const openApiSpec = await fetch('https://us-central1-myschool-f862b.cloudfunctions.net/api/api-docs')
  .then(res => res.json());

// Utiliser avec une bibliothèque comme swagger-ui-react ou redoc
```

---

## 🔒 Authentification

Certains endpoints nécessitent une authentification. Consultez la section **Security Schemes** dans la spécification OpenAPI pour plus de détails.

---

## 📞 Support

Pour toute question concernant l'API, contactez :
- **Email** : support@myschool.com
- **Documentation complète** : https://us-central1-myschool-f862b.cloudfunctions.net/api/api-docs
