# 🔗 URLs de Création Automatique des Index Firestore

## 📝 Instructions

**Cliquez simplement sur chaque lien ci-dessous** pour créer automatiquement les index nécessaires dans Firebase Console.

⚠️ **Important** : Vous devez être connecté à votre compte Firebase et avoir accès au projet `myschool-f862b`

---

## 🎯 Index pour la Collection `courses`

### Index 1: classe + isPublished + createdAt
**Utilisé par :** `GET /courses/classe/:classe`

👉 **[CLIQUER ICI POUR CRÉER L'INDEX](https://console.firebase.google.com/v1/r/project/myschool-f862b/firestore/databases/myschool-1/indexes?create_composite=Ck9wcm9qZWN0cy9teXNjaG9vbC1mODYyYi9kYXRhYmFzZXMvbXlzY2hvb2wtMS9jb2xsZWN0aW9uR3JvdXBzL2NvdXJzZXMvaW5kZXhlcy9fEAEaCgoGY2xhc3NlEAEaDwoLaXNQdWJsaXNoZWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC)**

```
Collection: courses
Fields:
  - classe (Ascending)
  - isPublished (Ascending)
  - createdAt (Descending)
```

---

### Index 2: matiereId + isPublished + createdAt
**Utilisé par :** `GET /courses/matiere/:matiereId`

👉 **[CLIQUER ICI POUR CRÉER L'INDEX](https://console.firebase.google.com/v1/r/project/myschool-f862b/firestore/databases/myschool-1/indexes?create_composite=ClFwcm9qZWN0cy9teXNjaG9vbC1mODYyYi9kYXRhYmFzZXMvbXlzY2hvb2wtMS9jb2xsZWN0aW9uR3JvdXBzL2NvdXJzZXMvaW5kZXhlcy9fEAEaDAoIbWF0aWVyZUlkEAEaDwoLaXNQdWJsaXNoZWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC)**

```
Collection: courses
Fields:
  - matiereId (Ascending)
  - isPublished (Ascending)
  - createdAt (Descending)
```

---

### Index 3: isPublished + niveauScolaire + createdAt
**Utilisé par :** `GET /courses/niveau/:niveau`

👉 **[CLIQUER ICI POUR CRÉER L'INDEX](https://console.firebase.google.com/v1/r/project/myschool-f862b/firestore/databases/myschool-1/indexes?create_composite=Ck9wcm9qZWN0cy9teXNjaG9vbC1mODYyYi9kYXRhYmFzZXMvbXlzY2hvb2wtMS9jb2xsZWN0aW9uR3JvdXBzL2NvdXJzZXMvaW5kZXhlcy9fEAEaDwoLaXNQdWJsaXNoZWQQARoSCg5uaXZlYXVTY29sYWlyZRABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI)**

```
Collection: courses
Fields:
  - isPublished (Ascending)
  - niveauScolaire (Ascending)
  - createdAt (Descending)
```

---

### Index 4: category + isPublished + createdAt
**Utilisé par :** `GET /courses/category/:category`

👉 **[CLIQUER ICI POUR CRÉER L'INDEX](https://console.firebase.google.com/v1/r/project/myschool-f862b/firestore/databases/myschool-1/indexes?create_composite=ClBwcm9qZWN0cy9teXNjaG9vbC1mODYyYi9kYXRhYmFzZXMvbXlzY2hvb2wtMS9jb2xsZWN0aW9uR3JvdXBzL2NvdXJzZXMvaW5kZXhlcy9fEAEaCwoHY2F0ZWdvcnkQARoPCgtpc1B1Ymxpc2hlZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI)**

```
Collection: courses
Fields:
  - category (Ascending)
  - isPublished (Ascending)
  - createdAt (Descending)
```

---

### Index 5: level + isPublished + createdAt
**Utilisé par :** `GET /courses/level/:level`

👉 **[CLIQUER ICI POUR CRÉER L'INDEX](https://console.firebase.google.com/v1/r/project/myschool-f862b/firestore/databases/myschool-1/indexes?create_composite=Ck5wcm9qZWN0cy9teXNjaG9vbC1mODYyYi9kYXRhYmFzZXMvbXlzY2hvb2wtMS9jb2xsZWN0aW9uR3JvdXBzL2NvdXJzZXMvaW5kZXhlcy9fEAEaCQoFbGV2ZWwQARoPCgtpc1B1Ymxpc2hlZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI)**

```
Collection: courses
Fields:
  - level (Ascending)
  - isPublished (Ascending)
  - createdAt (Descending)
```

---

### Index 6: type + isPublished + createdAt
**Utilisé par :** `GET /courses/type/:type`

👉 **[CLIQUER ICI POUR CRÉER L'INDEX](https://console.firebase.google.com/v1/r/project/myschool-f862b/firestore/databases/myschool-1/indexes?create_composite=Ck1wcm9qZWN0cy9teXNjaG9vbC1mODYyYi9kYXRhYmFzZXMvbXlzY2hvb2wtMS9jb2xsZWN0aW9uR3JvdXBzL2NvdXJzZXMvaW5kZXhlcy9fEAEaCAgEdHlwZRABGg8KC2lzUHVibGlzaGVkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg)**

```
Collection: courses
Fields:
  - type (Ascending)
  - isPublished (Ascending)
  - createdAt (Descending)
```

---

### Index 7: isPublished + createdAt (tous les cours publiés)
**Utilisé par :** `GET /courses/published`

👉 **[CLIQUER ICI POUR CRÉER L'INDEX](https://console.firebase.google.com/v1/r/project/myschool-f862b/firestore/databases/myschool-1/indexes?create_composite=ClBwcm9qZWN0cy9teXNjaG9vbC1mODYyYi9kYXRhYmFzZXMvbXlzY2hvb2wtMS9jb2xsZWN0aW9uR3JvdXBzL2NvdXJzZXMvaW5kZXhlcy9fEAEaDwoLaXNQdWJsaXNoZWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC)**

```
Collection: courses
Fields:
  - isPublished (Ascending)
  - createdAt (Descending)
```

---

### Index 8: instructorId + isPublished + createdAt
**Utilisé par :** `GET /courses/instructor/:instructorId`

👉 **[CLIQUER ICI POUR CRÉER L'INDEX](https://console.firebase.google.com/v1/r/project/myschool-f862b/firestore/databases/myschool-1/indexes?create_composite=ClRwcm9qZWN0cy9teXNjaG9vbC1mODYyYi9kYXRhYmFzZXMvbXlzY2hvb2wtMS9jb2xsZWN0aW9uR3JvdXBzL2NvdXJzZXMvaW5kZXhlcy9fEAEaDwoLaW5zdHJ1Y3RvcklkEAEaDwoLaXNQdWJsaXNoZWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC)**

```
Collection: courses
Fields:
  - instructorId (Ascending)
  - isPublished (Ascending)
  - createdAt (Descending)
```

---

## 📋 Checklist de Création

Cochez au fur et à mesure que vous créez les index :

- [ ] **Index 1** - classe + isPublished + createdAt
- [ ] **Index 2** - matiereId + isPublished + createdAt
- [ ] **Index 3** - niveauScolaire + isPublished + createdAt
- [ ] **Index 4** - category + isPublished + createdAt
- [ ] **Index 5** - level + isPublished + createdAt
- [ ] **Index 6** - type + isPublished + createdAt
- [ ] **Index 7** - isPublished + createdAt
- [ ] **Index 8** - instructorId + isPublished + createdAt

---

## ⏱️ Temps de Création

- **Par index** : 2-5 minutes
- **Total estimé** : 15-40 minutes
- Les index se créent en arrière-plan, vous pouvez continuer à travailler

---

## 🔍 Vérifier les Index Créés

Une fois tous les liens cliqués, vérifiez l'état des index :

**Console Firebase :**
👉 https://console.firebase.google.com/project/myschool-f862b/firestore/databases/myschool-1/indexes

**Via Firebase CLI :**
```bash
firebase firestore:indexes:list
```

---

## ✅ Test après Création

Une fois tous les index créés (status = "Enabled"), testez les endpoints :

```powershell
# Test PowerShell
.\test-courses-api.ps1
```

Ou manuellement :
```bash
# Tous les cours publiés
curl https://us-central1-myschool-f862b.cloudfunctions.net/api/courses/published

# Cours par classe
curl https://us-central1-myschool-f862b.cloudfunctions.net/api/courses/classe/6ème

# Cours par niveau
curl https://us-central1-myschool-f862b.cloudfunctions.net/api/courses/niveau/MOYEN
```

---

## 🆘 En cas de problème

Si un lien ne fonctionne pas :

1. **Vérifiez que vous êtes connecté** à Firebase Console
2. **Vérifiez vos permissions** sur le projet myschool-f862b
3. **Utilisez l'option manuelle** dans FIRESTORE_INDEXES_GUIDE.md
4. **Ou laissez Firebase créer l'index automatiquement** en faisant la requête API qui échoue (le message d'erreur contiendra le lien exact)

---

**📅 Date de création :** 10 janvier 2026  
**🎯 Projet :** myschool-f862b  
**💾 Database :** myschool-1  
**📦 Collection :** courses
