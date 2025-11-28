# 🚀 Guide de déploiement Cloud Functions

## 📋 Prérequis

1. **Firebase CLI installé**
```bash
npm install -g firebase-tools
```

2. **Connexion à Firebase**
```bash
firebase login
```

3. **Initialiser le projet Firebase**
```bash
firebase init
```

Sélectionnez :
- ✅ Functions
- ✅ Firestore
- Langage : TypeScript
- Projet : myschool (ou votre nom de projet)

## 📁 Structure des fichiers créés

```
myschool-project/
├── functions/
│   ├── src/
│   │   └── index.ts           # Cloud Functions principales
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.json
│   └── .gitignore
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
└── README_FUNCTIONS.md
```

## 🔧 Installation des dépendances

```bash
cd functions
npm install
```

## 🧪 Tester localement avec les émulateurs

```bash
# Depuis la racine du projet
firebase emulators:start
```

Cela démarre :
- Functions Emulator sur http://localhost:5001
- Firestore Emulator sur http://localhost:8080
- Emulator UI sur http://localhost:4000

## 📤 Déploiement sur Firebase

### Déployer tout

```bash
firebase deploy
```

### Déployer uniquement les functions

```bash
firebase deploy --only functions
```

### Déployer une function spécifique

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

## 📊 Cloud Functions disponibles

### 1. Triggers automatiques

#### `onEnrollmentCreated`
- **Trigger :** Quand un enrollment est créé
- **Actions :**
  - Incrémenter le compteur d'inscriptions du cours
  - Créer une notification pour l'utilisateur
  - Logger l'événement dans analytics

#### `onEnrollmentCompleted`
- **Trigger :** Quand un enrollment passe à "completed"
- **Actions :**
  - Générer un certificat
  - Créer une notification de félicitations
  - Incrémenter le compteur de cours complétés de l'utilisateur
  - Logger l'événement

#### `onLessonCreated`
- **Trigger :** Quand une leçon est ajoutée
- **Actions :**
  - Incrémenter `totalLessons` dans le cours
  - Incrémenter `lessonCount` dans le chapitre

#### `onExerciseCreated`
- **Trigger :** Quand un exercice est ajouté
- **Actions :**
  - Incrémenter `totalExercises` dans le cours
  - Incrémenter `exerciseCount` dans le chapitre

### 2. Fonctions HTTP callable

#### `calculateEnrollmentProgress`
Calcule la progression d'un enrollment.

**Appel depuis le client :**
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const calculateProgress = httpsCallable(functions, 'calculateEnrollmentProgress');

const result = await calculateProgress({ enrollmentId: 'abc123' });
console.log(result.data.progressPercentage); // 65
```

**Réponse :**
```json
{
  "progressPercentage": 65,
  "completedLessons": 13,
  "completedExercises": 7,
  "totalLessons": 20,
  "totalExercises": 10
}
```

#### `getCourseStatistics`
Obtient les statistiques d'un cours.

**Appel depuis le client :**
```typescript
const getStats = httpsCallable(functions, 'getCourseStatistics');
const result = await getStats({ courseId: 'svt_organes_1' });
```

**Réponse :**
```json
{
  "totalEnrollments": 150,
  "activeEnrollments": 120,
  "completedEnrollments": 25,
  "suspendedEnrollments": 3,
  "cancelledEnrollments": 2,
  "averageProgress": 45,
  "completionRate": 17
}
```

### 3. Fonctions schedulées

#### `cleanupOldCancelledEnrollments`
- **Schedule :** Chaque dimanche à 2h du matin
- **Action :** Supprime les enrollments annulés depuis plus de 90 jours

#### `sendInactiveUserReminders`
- **Schedule :** Chaque lundi à 10h du matin
- **Action :** Envoie des notifications aux utilisateurs inactifs (>7 jours)

## 🔐 Configuration des rôles IAM

Pour les fonctions schedulées, vous devez configurer les permissions :

```bash
# Cloud Scheduler
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/cloudscheduler.admin
```

## 📈 Monitoring

### Voir les logs

```bash
# Tous les logs
firebase functions:log

# Logs d'une fonction spécifique
firebase functions:log --only onEnrollmentCreated

# Logs en temps réel
firebase functions:log --follow
```

### Console Firebase

Visitez : https://console.firebase.google.com/project/YOUR_PROJECT_ID/functions

Vous pouvez voir :
- Nombre d'invocations
- Temps d'exécution
- Erreurs
- Utilisation de la mémoire

## 💰 Coûts et limites

### Plan Spark (Gratuit)
- 125 000 invocations/mois
- 40 000 secondes GB/mois
- 40 000 secondes CPU/mois
- 5 Go de trafic sortant/mois

### Plan Blaze (Pay as you go)
- $0.40 par million d'invocations
- $0.0000025 par seconde GB
- $0.0000100 par seconde CPU

### Optimisations pour réduire les coûts

1. **Limiter la mémoire allouée**
```typescript
export const myFunction = functions
  .runWith({ memory: '256MB' }) // Au lieu de 1GB par défaut
  .https.onCall(async (data, context) => {
    // ...
  });
```

2. **Définir un timeout**
```typescript
export const myFunction = functions
  .runWith({ timeoutSeconds: 30 }) // Au lieu de 60s par défaut
  .https.onCall(async (data, context) => {
    // ...
  });
```

3. **Utiliser des index Firestore** (déjà configurés dans `firestore.indexes.json`)

## 🛠️ Mise à jour des fonctions

### Migrer depuis l'ancienne structure

Si vous aviez des arrays `lessonsIds` et `exercisesIds` dans vos chapitres :

```typescript
// Migration script (à exécuter une fois)
export const migrateChapterStructure = functions.https.onCall(async (data, context) => {
  if (!isAdmin(context)) {
    throw new Error('Admin uniquement');
  }

  const coursesSnapshot = await db.collection('courses').get();
  
  for (const courseDoc of coursesSnapshot.docs) {
    const chaptersSnapshot = await db
      .collection(`courses/${courseDoc.id}/chapters`)
      .get();
    
    for (const chapterDoc of chaptersSnapshot.docs) {
      const chapterData = chapterDoc.data();
      
      // Migrer les leçons
      if (chapterData.lessonsIds && Array.isArray(chapterData.lessonsIds)) {
        for (const lessonId of chapterData.lessonsIds) {
          // Créer sous-collection
          await db
            .collection(`courses/${courseDoc.id}/chapters/${chapterDoc.id}/lessons`)
            .doc(lessonId)
            .set({ migratedFrom: 'array' });
        }
      }
      
      // Migrer les exercices
      if (chapterData.exercisesIds && Array.isArray(chapterData.exercisesIds)) {
        for (const exerciseId of chapterData.exercisesIds) {
          await db
            .collection(`courses/${courseDoc.id}/chapters/${chapterDoc.id}/exercises`)
            .doc(exerciseId)
            .set({ migratedFrom: 'array' });
        }
      }
    }
  }
  
  return { success: true };
});
```

## 🐛 Debugging

### Erreur : "PERMISSION_DENIED"
- Vérifiez vos règles Firestore
- Vérifiez que l'utilisateur est authentifié
- Vérifiez les rôles dans `firestore.rules`

### Erreur : "UNAUTHENTICATED"
- La fonction callable nécessite un utilisateur authentifié
- Vérifiez que `firebase.auth().currentUser` n'est pas null

### Fonction ne se déclenche pas
- Vérifiez les logs : `firebase functions:log`
- Vérifiez que le document path correspond exactement
- Pour les scheduled functions, vérifiez Cloud Scheduler dans la console

## 📚 Ressources

- [Documentation Firebase Functions](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Scheduler Cron Syntax](https://cloud.google.com/scheduler/docs/configuring/cron-job-schedules)

## 🚨 Avant la production

- [ ] Configurer les règles Firestore de sécurité
- [ ] Activer App Check pour protéger les functions
- [ ] Configurer les index Firestore
- [ ] Tester toutes les fonctions avec les émulateurs
- [ ] Configurer les alertes de monitoring
- [ ] Définir des budgets dans Google Cloud Console
- [ ] Mettre en place un système de backup
- [ ] Documenter les flows pour l'équipe