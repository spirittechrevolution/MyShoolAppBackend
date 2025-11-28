# 🚀 Guide de déploiement MySchool Backend

## 📋 Prérequis

- ✅ Node.js installé
- ✅ Firebase CLI installé (`npm install -g firebase-tools`)
- ✅ Compte Firebase avec accès au projet `myschool-f862b`

## 🔧 Configuration initiale

### 1. Se connecter à Firebase

```bash
firebase login
```

### 2. Vérifier le projet actif

```bash
firebase use
```

Si ce n'est pas `myschool-f862b` :

```bash
firebase use myschool-f862b
```

## 📦 Déploiement avec le script PowerShell

Le moyen le plus simple :

```powershell
.\deploy-functions.ps1
```

Le script propose 4 options :
1. **Tester localement** - Lance les émulateurs Firebase
2. **Déployer les functions** - Déploie uniquement les Cloud Functions
3. **Déployer les règles** - Déploie uniquement les règles Firestore
4. **Déploiement complet** - Déploie tout

## 🧪 Test local (Émulateurs)

### Démarrer les émulateurs

```bash
firebase emulators:start
```

### Interfaces disponibles

- **UI Émulateur** : http://localhost:4000
- **Functions** : http://localhost:5001
- **Firestore** : http://localhost:8080

### Tester une fonction callable

```bash
# Depuis l'UI ou avec curl
curl -X POST http://localhost:5001/myschool-f862b/us-central1/calculateEnrollmentProgress \
  -H "Content-Type: application/json" \
  -d '{"data": {"enrollmentId": "test123"}}'
```

## 🌐 Déploiement en production

### Déployer uniquement les Cloud Functions

```bash
firebase deploy --only functions
```

### Déployer une fonction spécifique

```bash
firebase deploy --only functions:onEnrollmentCreated
```

### Déployer les règles Firestore

```bash
firebase deploy --only firestore:rules
```

### Déployer les index Firestore

```bash
firebase deploy --only firestore:indexes
```

### Déploiement complet

```bash
firebase deploy
```

## 📊 Fonctions déployées

### 🔔 Triggers automatiques (4)

1. **onEnrollmentCreated** - Inscription créée
2. **onEnrollmentCompleted** - Cours complété
3. **onLessonCreated** - Leçon ajoutée
4. **onExerciseCreated** - Exercice ajouté

### 🌐 Functions HTTP Callable (2)

5. **calculateEnrollmentProgress** - Calcul de progression
6. **getCourseStatistics** - Statistiques de cours

### ⏰ Functions Schedulées (2)

7. **cleanupOldCancelledEnrollments** - Nettoyage (Dimanche 2h)
8. **sendInactiveUserReminders** - Rappels (Lundi 10h)

## 📈 Monitoring

### Voir les logs en temps réel

```bash
firebase functions:log --follow
```

### Voir les logs d'une fonction spécifique

```bash
firebase functions:log --only onEnrollmentCreated
```

### Console Firebase

https://console.firebase.google.com/project/myschool-f862b/functions

## 🐛 Dépannage

### Erreur : "PERMISSION_DENIED"

Vérifiez vos règles Firestore :

```bash
firebase deploy --only firestore:rules
```

### Erreur : "Function not found"

Reconstruisez et redéployez :

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### Erreur de build TypeScript

```bash
cd functions
npm install
npm run build
```

### Fonction ne se déclenche pas

1. Vérifiez les logs : `firebase functions:log`
2. Vérifiez le chemin du document (triggers)
3. Vérifiez les index Firestore requis

## 💰 Gestion des coûts

### Plan Gratuit (Spark)

- 125,000 invocations/mois
- 40,000 GB-secondes/mois
- 40,000 CPU-secondes/mois

### Optimisations

1. Limiter la mémoire allouée aux fonctions
2. Réduire les temps d'exécution
3. Utiliser des index Firestore
4. Mettre en cache les données fréquentes

## 📝 Commandes utiles

```bash
# Lister les projets
firebase projects:list

# Changer de projet
firebase use <project-id>

# Voir la configuration
firebase functions:config:get

# Supprimer toutes les fonctions
firebase functions:delete --all-functions

# Shell interactif
firebase functions:shell
```

## 🔐 Sécurité

### Variables d'environnement

```bash
# Définir une variable
firebase functions:config:set api.key="your-key"

# Voir les variables
firebase functions:config:get

# Dans le code
const apiKey = functions.config().api.key;
```

### Règles de sécurité

Les règles Firestore sont dans `firestore.rules`. Déployez après modification :

```bash
firebase deploy --only firestore:rules
```

## 📚 Ressources

- [Documentation Firebase Functions](https://firebase.google.com/docs/functions)
- [Console Firebase](https://console.firebase.google.com/project/myschool-f862b)
- [Pricing Calculator](https://firebase.google.com/pricing)

## ✅ Checklist avant production

- [ ] Tester toutes les fonctions localement
- [ ] Vérifier les règles de sécurité Firestore
- [ ] Configurer les index Firestore
- [ ] Définir les budgets d'alerte
- [ ] Documenter les flows critiques
- [ ] Configurer le monitoring
- [ ] Tester les fonctions schedulées
- [ ] Vérifier les permissions IAM
