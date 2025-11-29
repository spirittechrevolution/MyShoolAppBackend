# 🚀 Guide d'intégration Frontend - MySchool API v2.0.0

> **Dernière mise à jour**: 29 novembre 2025  
> **API Version**: 2.0.0  
> **Status**: ✅ Déployée en production

## 📋 Table des matières
- [Configuration Firebase](#configuration-firebase)
- [Configuration de l'API](#configuration-de-lapi)
- [Endpoints disponibles](#endpoints-disponibles)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Gestion des erreurs](#gestion-des-erreurs)
- [Documentation Swagger](#documentation-swagger)
- [Nouveautés v2.0.0](#nouveautés-v200)

---

## 🔥 Configuration Firebase

### 1. Installation des dépendances

```bash
npm install firebase
# ou
yarn add firebase
```

### 2. Configuration Firebase dans votre projet Angular

Créez un fichier `src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyBqXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "myschool-f862b.firebaseapp.com",
    projectId: "myschool-f862b",
    storageBucket: "myschool-f862b.firebasestorage.app",
    messagingSenderId: "XXXXXXXXXXXX",
    appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXX",
    measurementId: "G-XXXXXXXXXX"
  },
  // ⚡ Nouvelle URL API (Cloud Run Gen 2)
  apiUrl: "https://api-xa66eyezzq-uc.a.run.app"
};
```

### 3. Environment de production

Créez `src/environments/environment.prod.ts` :

```typescript
export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "AIzaSyBqXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "myschool-f862b.firebaseapp.com",
    projectId: "myschool-f862b",
    storageBucket: "myschool-f862b.firebasestorage.app",
    messagingSenderId: "XXXXXXXXXXXX",
    appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXX",
    measurementId: "G-XXXXXXXXXX"
  },
  apiUrl: "https://api-xa66eyezzq-uc.a.run.app"
};
```

### 3. Initialisation Firebase

Créez un service `src/app/services/firebase.service.ts` :

```typescript
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = initializeApp(environment.firebaseConfig);
  public auth: Auth = getAuth(this.app);
  public db: Firestore = getFirestore(this.app);

  constructor() {
    console.log('Firebase initialized successfully');
  }
}
```

---

## 🌐 Configuration de l'API

### Service HTTP de base

Créez `src/app/services/api.service.ts` :

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
  }
}
```

---

## 📚 Endpoints disponibles (41 endpoints)

### 👤 Users (Utilisateurs) - 11 endpoints

| Méthode | Endpoint | Description | Nouveau |
|---------|----------|-------------|---------|
| POST | `/api/users` | Crée un nouvel utilisateur | |
| GET | `/api/users` | Liste tous les utilisateurs | |
| GET | `/api/users/:id` | Récupère un utilisateur par ID | |
| PUT | `/api/users/:id` | Met à jour un utilisateur | |
| DELETE | `/api/users/:id` | Supprime un utilisateur | |
| GET | `/api/users/email/:email` | Recherche par email | |
| GET | `/api/users/phone/:phone` | Recherche par téléphone | ✨ |
| GET | `/api/users/role/:role` | Filtre par rôle (student/instructor/admin) | |
| GET | `/api/users/status/:status` | Filtre par statut (active/inactive/suspended) | ✨ |
| GET | `/api/users/:id/profile` | Récupère le profil complet | ✨ |
| PATCH | `/api/users/:id/status` | Change le statut | ✨ |

### 📖 Courses (Cours) - 10 endpoints

| Méthode | Endpoint | Description | Nouveau |
|---------|----------|-------------|---------|
| POST | `/api/courses` | Crée un nouveau cours | |
| GET | `/api/courses` | Liste tous les cours | |
| GET | `/api/courses/published` | Cours publiés uniquement | |
| GET | `/api/courses/:id` | Récupère un cours par ID | |
| PUT | `/api/courses/:id` | Met à jour un cours | |
| DELETE | `/api/courses/:id` | Supprime un cours | |
| GET | `/api/courses/category/:category` | Filtre par catégorie | |
| GET | `/api/courses/level/:level` | Filtre par niveau (DEBUTANT/INTERMEDIAIRE/AVANCE) | |
| GET | `/api/courses/type/:type` | Filtre par type (VIDEO/En ligne/Hybride) | ✨ |
| PATCH | `/api/courses/:id/publish` | Publier/dépublier un cours | ✨ |

### 📑 Chapters (Chapitres) - 5 endpoints

| Méthode | Endpoint | Description | Nouveau |
|---------|----------|-------------|---------|
| POST | `/api/chapters` | Crée un nouveau chapitre | |
| GET | `/api/chapters` | Liste tous les chapitres | |
| GET | `/api/chapters/:id` | Récupère un chapitre par ID | |
| PUT | `/api/chapters/:id` | Met à jour un chapitre | |
| DELETE | `/api/chapters/:id` | Supprime un chapitre | |
| GET | `/api/chapters/course/:courseId` | **Chapitres d'un cours (triés par order)** | ⚡ |

### 📝 Lessons (Leçons) - 6 endpoints

| Méthode | Endpoint | Description | Nouveau |
|---------|----------|-------------|---------|
| POST | `/api/lessons` | Crée une nouvelle leçon | |
| GET | `/api/lessons` | Liste toutes les leçons | |
| GET | `/api/lessons/:id` | Récupère une leçon par ID | |
| PUT | `/api/lessons/:id` | Met à jour une leçon | |
| DELETE | `/api/lessons/:id` | Supprime une leçon | |
| GET | `/api/lessons/chapter/:chapterId` | **Leçons d'un chapitre (triées par order)** | ⚡ |
| GET | `/api/lessons/course/:courseId` | **Leçons d'un cours (triées par order)** | ✨⚡ |

### ✏️ Exercises (Exercices) - 8 endpoints

| Méthode | Endpoint | Description | Nouveau |
|---------|----------|-------------|---------|
| POST | `/api/exercises` | Crée un nouvel exercice | |
| GET | `/api/exercises` | Liste tous les exercices | |
| GET | `/api/exercises/:id` | Récupère un exercice par ID | |
| PUT | `/api/exercises/:id` | Met à jour un exercice | |
| DELETE | `/api/exercises/:id` | Supprime un exercice | |
| GET | `/api/exercises/chapter/:chapterId` | **Exercices d'un chapitre** | ✨⚡ |
| GET | `/api/exercises/course/:courseId` | **Exercices d'un cours** | ✨⚡ |
| GET | `/api/exercises/type/:type` | Filtre par type (quiz/coding/essay) | ✨ |

### 🎓 Enrollments (Inscriptions) - 10 endpoints

| Méthode | Endpoint | Description | Nouveau |
|---------|----------|-------------|---------|
| POST | `/api/enrollments` | Crée une inscription | |
| GET | `/api/enrollments` | Liste toutes les inscriptions | |
| GET | `/api/enrollments/:id` | Récupère une inscription par ID | |
| PUT | `/api/enrollments/:id` | Met à jour une inscription | |
| DELETE | `/api/enrollments/:id` | Supprime une inscription | |
| GET | `/api/enrollments/user/:userId` | Inscriptions d'un utilisateur | ✨ |
| GET | `/api/enrollments/course/:courseId` | Inscriptions à un cours | |
| GET | `/api/enrollments/status/:status` | Filtre par statut (active/completed/cancelled) | |
| PATCH | `/api/enrollments/:id/progress` | Met à jour la progression | ✨ |
| POST | `/api/enrollments/:id/complete-chapter` | Marque un chapitre comme terminé | ✨ |

### 👨‍🏫 Instructors (Instructeurs) - 6 endpoints

| Méthode | Endpoint | Description | Nouveau |
|---------|----------|-------------|---------|
| POST | `/api/instructors` | Crée un instructeur | |
| GET | `/api/instructors` | Liste tous les instructeurs | |
| GET | `/api/instructors/:id` | Récupère un instructeur par ID | |
| PUT | `/api/instructors/:id` | Met à jour un instructeur | |
| DELETE | `/api/instructors/:id` | Supprime un instructeur | |
| GET | `/api/instructors/user/:userId` | Récupère par userId | ✨ |

**Légende**: ✨ = Nouveau endpoint | ⚡ = Optimisé avec index Firestore

---

## 💡 Exemples d'utilisation

export interface User {
  id?: string;
  uid?: string;
  firstName: string;
  lastName: string;
  phone: string;
  login?: string;
  password?: string; // Requis uniquement à la création
  level: 'beginner' | 'intermediate' | 'advanced';
  role: {
    libelle: 'student' | 'instructor' | 'admin';
  };
  status: 'active' | 'inactive' | 'suspended';
  profileImage?: string;
  specializationId?: string;
  createdAt?: any;
  updatedAt?: any;
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private api: ApiService) {}

  getAllUsers(): Observable<ApiResponse<User[]>> {
    return this.api.get<ApiResponse<User[]>>('/api/users');
  }

  getUserById(id: string): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>(`/api/users/${id}`);
  }

  createUser(user: User): Observable<ApiResponse<User>> {
    return this.api.post<ApiResponse<User>>('/api/users', user);
  }

  updateUser(id: string, user: Partial<User>): Observable<ApiResponse<User>> {
    return this.api.put<ApiResponse<User>>(`/api/users/${id}`, user);
  }

  deleteUser(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`/api/users/${id}`);
  }

  getUserByEmail(email: string): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>(`/api/users/email/${email}`);
  }

  getUserByPhone(phone: string): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>(`/api/users/phone/${phone}`);
  }

  getUsersByRole(role: string): Observable<ApiResponse<User[]>> {
    return this.api.get<ApiResponse<User[]>>(`/api/users/role/${role}`);
  }

  getUsersByStatus(status: string): Observable<ApiResponse<User[]>> {
    return this.api.get<ApiResponse<User[]>>(`/api/users/status/${status}`);
  }

  getUserProfile(id: string): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>(`/api/users/${id}/profile`);
  }

  updateUserStatus(id: string, status: string): Observable<ApiResponse<User>> {
    return this.api.put<ApiResponse<User>>(`/api/users/${id}/status`, { status });
  }
}
  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.api.put<User>(`/users/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.api.delete<void>(`/users/${id}`);
  }

  getUserByEmail(email: string): Observable<User> {
export interface Course {
  id?: string;
  title: string;
  description: string;
  category: string;
  type: 'VIDEO' | 'En ligne' | 'Hybride';
  level: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
  duration: number; // en minutes
  sessions: number;
  price: number;
  rating?: number;
  image?: string;
  isPublished: boolean;
  certificateAvailable: boolean;
  chaptersIds?: string[];
@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private api: ApiService) {}

  getAllCourses(): Observable<ApiResponse<Course[]>> {
    return this.api.get<ApiResponse<Course[]>>('/api/courses');
  }

  getPublishedCourses(): Observable<ApiResponse<Course[]>> {
    return this.api.get<ApiResponse<Course[]>>('/api/courses/published');
  }

  getCourseById(id: string): Observable<ApiResponse<Course>> {
    return this.api.get<ApiResponse<Course>>(`/api/courses/${id}`);
  }

  createCourse(course: Course): Observable<ApiResponse<Course>> {
    return this.api.post<ApiResponse<Course>>('/api/courses', course);
  }

  updateCourse(id: string, course: Partial<Course>): Observable<ApiResponse<Course>> {
    return this.api.put<ApiResponse<Course>>(`/api/courses/${id}`, course);
  }

  deleteCourse(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`/api/courses/${id}`);
  }

  getCoursesByCategory(category: string): Observable<ApiResponse<Course[]>> {
    return this.api.get<ApiResponse<Course[]>>(`/api/courses/category/${encodeURIComponent(category)}`);
  }

  getCoursesByLevel(level: string): Observable<ApiResponse<Course[]>> {
    return this.api.get<ApiResponse<Course[]>>(`/api/courses/level/${level}`);
  }

  getCoursesByType(type: string): Observable<ApiResponse<Course[]>> {
    return this.api.get<ApiResponse<Course[]>>(`/api/courses/type/${encodeURIComponent(type)}`);
  }

  publishCourse(id: string, isPublished: boolean): Observable<ApiResponse<Course>> {
    return this.api.put<ApiResponse<Course>>(`/api/courses/${id}/publish`, { isPublished });
  }
} updateCourse(id: string, course: Partial<Course>): Observable<Course> {
    return this.api.put<Course>(`/courses/${id}`, course);
  }

  deleteCourse(id: string): Observable<void> {
    return this.api.delete<void>(`/courses/${id}`);
  }

  getCoursesByCategory(category: string): Observable<Course[]> {
    return this.api.get<Course[]>(`/courses/category/${category}`);
  }

  getCoursesByLevel(level: string): Observable<Course[]> {
    return this.api.get<Course[]>(`/courses/level/${level}`);
  }
### Service Chapters (Nouveau)

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface Chapter {
  id?: string;
  title: string;
  description?: string;
  courseId: string;
  order: number;
  duration?: number;
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChapterService {
  constructor(private api: ApiService) {}

  getAllChapters(): Observable<ApiResponse<Chapter[]>> {
    return this.api.get<ApiResponse<Chapter[]>>('/api/chapters');
  }

  getChapterById(id: string): Observable<ApiResponse<Chapter>> {
    return this.api.get<ApiResponse<Chapter>>(`/api/chapters/${id}`);
  }

  createChapter(chapter: Chapter): Observable<ApiResponse<Chapter>> {
    return this.api.post<ApiResponse<Chapter>>('/api/chapters', chapter);
  }

  updateChapter(id: string, chapter: Partial<Chapter>): Observable<ApiResponse<Chapter>> {
    return this.api.put<ApiResponse<Chapter>>(`/api/chapters/${id}`, chapter);
  }

  deleteChapter(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`/api/chapters/${id}`);
  }

  // ⚡ Optimisé avec index Firestore
  getChaptersByCourse(courseId: string): Observable<ApiResponse<Chapter[]>> {
    return this.api.get<ApiResponse<Chapter[]>>(`/api/chapters/course/${courseId}`);
  }
}
```

### Service Lessons (Nouveau)

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface Lesson {
  id?: string;
  title: string;
  content?: string;
  videoUrl?: string;
  chapterId: string;
  courseId: string;
  order: number;
  duration?: number;
  createdAt?: any;
  updatedAt?: any;
}
### Utilisation dans un composant

```typescript
import { Component, OnInit } from '@angular/core';
import { CourseService, Course } from '../services/course.service';
import { EnrollmentService } from '../services/enrollment.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html'
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private courseService: CourseService,
    private enrollmentService: EnrollmentService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService.getPublishedCourses().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.courses = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
        console.error('Erreur lors du chargement des cours:', err);
      }
    });
  }

  enrollInCourse(courseId: string, userId: string): void {
    const enrollment = {
      userId,
      courseId,
      status: 'active' as const,
      progress: 0,
      amount: 0,
      paymentMethod: 'free-money' as const
    };

    this.enrollmentService.createEnrollment(enrollment).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Inscription réussie:', response.data);
        }
      },
      error: (err) => {
        console.error('Erreur inscription:', err);
      }
    });
  }
}
```

### Exemple de navigation de cours structurée

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../services/course.service';
import { ChapterService } from '../services/chapter.service';
import { LessonService } from '../services/lesson.service';
import { ExerciseService } from '../services/exercise.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html'
})
export class CourseDetailComponent implements OnInit {
  courseId: string;
  course: any;
  chapters: any[] = [];
  lessons: any[] = [];
  exercises: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private chapterService: ChapterService,
    private lessonService: LessonService,
    private exerciseService: ExerciseService
  ) {
    this.courseId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.loadCourseData();
  }

  loadCourseData(): void {
    // Chargement parallèle de toutes les données du cours
    forkJoin({
      course: this.courseService.getCourseById(this.courseId),
      chapters: this.chapterService.getChaptersByCourse(this.courseId),
      lessons: this.lessonService.getLessonsByCourse(this.courseId),
      exercises: this.exerciseService.getExercisesByCourse(this.courseId)
    }).subscribe({
      next: (results) => {
        if (results.course.success) this.course = results.course.data;
        if (results.chapters.success) this.chapters = results.chapters.data || [];
        if (results.lessons.success) this.lessons = results.lessons.data || [];
        if (results.exercises.success) this.exercises = results.exercises.data || [];
        
        this.loading = false;
        console.log('Cours chargé:', {
          course: this.course,
          chaptersCount: this.chapters.length,
          lessonsCount: this.lessons.length,
          exercisesCount: this.exercises.length
        });
      },
      error: (err) => {
        console.error('Erreur chargement cours:', err);
        this.loading = false;
      }
    });
  }

  getLessonsForChapter(chapterId: string): any[] {
    return this.lessons.filter(l => l.chapterId === chapterId);
  }

  getExercisesForChapter(chapterId: string): any[] {
    return this.exercises.filter(e => e.chapterId === chapterId);
  }
}
```itle: string;
  description?: string;
  lessonId: string;
  chapterId?: string;
  courseId?: string;
  type: 'quiz' | 'coding' | 'essay';
  questions?: any[];
  points?: number;
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  constructor(private api: ApiService) {}

  getAllExercises(): Observable<ApiResponse<Exercise[]>> {
    return this.api.get<ApiResponse<Exercise[]>>('/api/exercises');
  }

  getExerciseById(id: string): Observable<ApiResponse<Exercise>> {
    return this.api.get<ApiResponse<Exercise>>(`/api/exercises/${id}`);
  }

  createExercise(exercise: Exercise): Observable<ApiResponse<Exercise>> {
    return this.api.post<ApiResponse<Exercise>>('/api/exercises', exercise);
  }

  updateExercise(id: string, exercise: Partial<Exercise>): Observable<ApiResponse<Exercise>> {
    return this.api.put<ApiResponse<Exercise>>(`/api/exercises/${id}`, exercise);
  }

## 📚 Documentation Swagger

### Swagger UI Interactif

**URL Production**: https://api-xa66eyezzq-uc.a.run.app/api-docs

Interface complète avec:
- 📖 41 endpoints documentés
- 🧪 Test en direct des endpoints
- 📋 Schémas de données complets
- 📝 Exemples de requêtes/réponses

### OpenAPI JSON

**URL**: https://api-xa66eyezzq-uc.a.run.app/openapi.json

Téléchargez la spécification OpenAPI 3.0 pour:
- Génération automatique de clients
- Import dans Postman/Insomnia
- Intégration CI/CD

---

## ✨ Nouveautés v2.0.0

### 🚀 Améliorations de performance

**Index Firestore déployés** pour requêtes filtrées optimisées:
- ⚡ `chapters/course/:courseId` - Tri par order
- ⚡ `lessons/chapter/:chapterId` - Tri par order  
- ⚡ `lessons/course/:courseId` - Tri par order
- ⚡ `exercises/chapter/:chapterId` - Tri par order
- ⚡ `exercises/course/:courseId` - Tri par order

### 📊 Nouveaux endpoints

```typescript
// Récupérer toutes les leçons d'un cours (trié)
GET /api/lessons/course/:courseId

// Récupérer tous les exercices d'un chapitre
GET /api/exercises/chapter/:chapterId

// Récupérer tous les exercices d'un cours
GET /api/exercises/course/:courseId

// Mettre à jour la progression
PATCH /api/enrollments/:id/progress

// Marquer un chapitre comme complété
POST /api/enrollments/:id/complete-chapter

// Publier/dépublier un cours
PATCH /api/courses/:id/publish

// Recherche utilisateur par téléphone
GET /api/users/phone/:phone

// Filtrer utilisateurs par statut
GET /api/users/status/:status

// Récupérer instructeur par userId
GET /api/instructors/user/:userId
```

### 🔄 Format de réponse standardisé

Toutes les réponses suivent maintenant ce format:

```typescript
{
  "success": true,
  "data": { /* votre ressource */ },
  "count": 10, // pour les listes
  "message": "Opération réussie" // optionnel
}
```

En cas d'erreur:

```typescript
{
  "success": false,
  "message": "Description de l'erreur"
}
```

### 📝 Modèles de données mis à jour

**User**: Ajout de `phone`, `login`, `status`, `specializationId`  
**Course**: Ajout de `type`, `sessions`, `certificateAvailable`, `rating`  
**Enrollment**: Ajout de `progress`, `amount`, `paymentMethod`, `chaptersCompleted`  
**Exercise**: Ajout de `chapterId`, `courseId` pour filtrage

---

## 🚀 Checklist d'intégration

### Configuration initiale
- [ ] Installer Firebase SDK (`npm install firebase`)
- [ ] Configurer `environment.ts` avec URL API v2.0
- [ ] Créer le service `FirebaseService`
- [ ] Créer le service `ApiService` avec gestion `ApiResponse<T>`

### Services métier
- [ ] Créer `UserService` (11 endpoints)
- [ ] Créer `CourseService` (10 endpoints)
- [ ] Créer `ChapterService` (6 endpoints)
- [ ] Créer `LessonService` (7 endpoints)
- [ ] Créer `ExerciseService` (8 endpoints)
- [ ] Créer `EnrollmentService` (10 endpoints)
- [ ] Créer `InstructorService` (6 endpoints)

### Fonctionnalités avancées
- [ ] Ajouter l'intercepteur d'erreurs
- [ ] Implémenter gestion de cache (optionnel)
- [ ] Tester navigation cours/chapitres/leçons
- [ ] Implémenter tracking de progression
- [ ] Tester filtres (par niveau, catégorie, type)

### Tests et validation
- [ ] Tester la connexion à l'API
- [ ] Vérifier format `ApiResponse<T>`
- [ ] Tester endpoints de filtrage optimisés
- [ ] Valider gestion d'erreurs
- [ ] Tester en production

---

## 📞 Support et ressources

### En cas de problème

**Vérifications**:
1. ✅ API déployée: https://api-xa66eyezzq-uc.a.run.app
2. ✅ CORS configurés pour ports 4200-4205
3. ✅ Format de réponse `ApiResponse<T>` géré
4. ✅ Préfixe `/api/` dans tous les endpoints

**Debugging**:
```typescript
// Activer logs détaillés
console.log('API Response:', response);
console.log('Success:', response.success);
console.log('Data:', response.data);
console.log('Count:', response.count);
```

### Informations techniques

- **API Version**: 2.0.0
- **Base URL**: `https://api-xa66eyezzq-uc.a.run.app`
- **Runtime**: Node.js 20 (Cloud Run Gen 2)
- **Database**: Firestore `myschool-1` (non-default)
- **Endpoints**: 41 documentés
- **Tests**: 114 (100% passing)
- **Coverage**: 63.36%

### Liens utiles

- 📖 [Swagger UI](https://api-xa66eyezzq-uc.a.run.app/api-docs)
- 📄 [OpenAPI Spec](https://api-xa66eyezzq-uc.a.run.app/openapi.json)
- 🔥 [Firebase Console](https://console.firebase.google.com/project/myschool-f862b)
- 📊 [Cloud Run](https://console.cloud.google.com/run)

---

**Date de dernière mise à jour**: 29 novembre 2025  
**Statut**: ✅ Production Ready
  courseId: string;
  courseTitle?: string;
  courseImage?: string;
  enrolledAt?: any;
  status: 'active' | 'completed' | 'cancelled';
  progress?: number; // 0-100
  amount?: number;
  paymentMethod?: 'free-money' | 'wave' | 'orange-money' | 'card';
  chaptersCompleted?: string[];
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  constructor(private api: ApiService) {}

  getAllEnrollments(): Observable<ApiResponse<Enrollment[]>> {
    return this.api.get<ApiResponse<Enrollment[]>>('/api/enrollments');
  }

  getEnrollmentById(id: string): Observable<ApiResponse<Enrollment>> {
    return this.api.get<ApiResponse<Enrollment>>(`/api/enrollments/${id}`);
  }

  createEnrollment(enrollment: Enrollment): Observable<ApiResponse<Enrollment>> {
    return this.api.post<ApiResponse<Enrollment>>('/api/enrollments', enrollment);
  }

  updateEnrollment(id: string, enrollment: Partial<Enrollment>): Observable<ApiResponse<Enrollment>> {
    return this.api.put<ApiResponse<Enrollment>>(`/api/enrollments/${id}`, enrollment);
  }

  deleteEnrollment(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`/api/enrollments/${id}`);
  }

  getUserEnrollments(userId: string): Observable<ApiResponse<Enrollment[]>> {
    return this.api.get<ApiResponse<Enrollment[]>>(`/api/enrollments/user/${userId}`);
  }

  getCourseEnrollments(courseId: string): Observable<ApiResponse<Enrollment[]>> {
    return this.api.get<ApiResponse<Enrollment[]>>(`/api/enrollments/course/${courseId}`);
  }

  getEnrollmentsByStatus(status: string): Observable<ApiResponse<Enrollment[]>> {
    return this.api.get<ApiResponse<Enrollment[]>>(`/api/enrollments/status/${status}`);
  }

  // Nouveaux endpoints v2.0
  updateProgress(id: string, progress: number): Observable<ApiResponse<Enrollment>> {
    return this.api.put<ApiResponse<Enrollment>>(`/api/enrollments/${id}/progress`, { progress });
  }

  completeChapter(id: string, chapterId: string): Observable<ApiResponse<Enrollment>> {
    return this.api.post<ApiResponse<Enrollment>>(`/api/enrollments/${id}/complete-chapter`, { chapterId });
  }
}
```

### Service Instructors (Nouveau)

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface Instructor {
  id?: string;
  userId: string;
  bio: string;
  specialization: string;
  rating?: number;
  totalStudents?: number;
  totalCourses?: number;
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  constructor(private api: ApiService) {}

  getAllInstructors(): Observable<ApiResponse<Instructor[]>> {
    return this.api.get<ApiResponse<Instructor[]>>('/api/instructors');
  }

  getInstructorById(id: string): Observable<ApiResponse<Instructor>> {
    return this.api.get<ApiResponse<Instructor>>(`/api/instructors/${id}`);
  }

  createInstructor(instructor: Instructor): Observable<ApiResponse<Instructor>> {
    return this.api.post<ApiResponse<Instructor>>('/api/instructors', instructor);
  }

  updateInstructor(id: string, instructor: Partial<Instructor>): Observable<ApiResponse<Instructor>> {
    return this.api.put<ApiResponse<Instructor>>(`/api/instructors/${id}`, instructor);
  }

  deleteInstructor(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`/api/instructors/${id}`);
  }

  getInstructorByUserId(userId: string): Observable<ApiResponse<Instructor>> {
    return this.api.get<ApiResponse<Instructor>>(`/api/instructors/user/${userId}`);
  }
}
``` return this.api.get<Enrollment[]>(`/enrollments/student/${studentId}`);
  }

  getCourseEnrollments(courseId: string): Observable<Enrollment[]> {
    return this.api.get<Enrollment[]>(`/enrollments/course/${courseId}`);
  }

  getEnrollmentsByStatus(status: string): Observable<Enrollment[]> {
    return this.api.get<Enrollment[]>(`/enrollments/status/${status}`);
  }
}
```

### Utilisation dans un composant

```typescript
import { Component, OnInit } from '@angular/core';
import { CourseService, Course } from '../services/course.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html'
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  loading = false;
  error: string | null = null;

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService.getPublishedCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
        console.error('Erreur lors du chargement des cours:', err);
      }
    });
  }

  enrollInCourse(courseId: string, studentId: string): void {
    const enrollment = {
      studentId,
      courseId,
      enrollmentDate: new Date(),
      status: 'active' as const
    };

    // Utilisez le service EnrollmentService ici
    console.log('Inscription au cours:', enrollment);
  }
}
```

---

## ⚠️ Gestion des erreurs

### Intercepteur HTTP pour la gestion globale

Créez `src/app/interceptors/error.interceptor.ts` :

```typescript
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Une erreur est survenue';

        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = `Erreur: ${error.error.message}`;
        } else {
          // Erreur côté serveur
          errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
          
          // Messages spécifiques selon le code d'erreur
          switch (error.status) {
            case 400:
              errorMessage = 'Requête invalide';
              break;
            case 404:
              errorMessage = 'Ressource non trouvée';
              break;
            case 500:
              errorMessage = 'Erreur serveur interne';
              break;
          }
        }

        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
```

Enregistrez l'intercepteur dans `app.module.ts` :

```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './interceptors/error.interceptor';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

---

## 🔐 Authentification (Optionnelle)

Si vous souhaitez ajouter l'authentification Firebase :

```typescript
import { Injectable } from '@angular/core';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { FirebaseService } from './firebase.service';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private firebase: FirebaseService) {}

  login(email: string, password: string): Observable<any> {
    return from(
      signInWithEmailAndPassword(this.firebase.auth, email, password)
    );
  }

  register(email: string, password: string): Observable<any> {
    return from(
      createUserWithEmailAndPassword(this.firebase.auth, email, password)
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.firebase.auth));
  }

  getCurrentUser(): User | null {
    return this.firebase.auth.currentUser;
  }
}
```

---

## 📊 Documentation API complète

**Swagger UI** : `https://us-central1-myschool-f862b.cloudfunctions.net/api-docs`

Accédez à cette URL une fois l'API déployée pour voir la documentation interactive complète avec tous les schémas de données et la possibilité de tester les endpoints.

---

## 🚀 Checklist d'intégration

- [ ] Installer Firebase SDK
- [ ] Configurer `environment.ts` avec les credentials Firebase
- [ ] Créer le service `FirebaseService`
- [ ] Créer le service `ApiService`
- [ ] Créer les services métier (UserService, CourseService, etc.)
- [ ] Ajouter l'intercepteur d'erreurs
- [ ] Tester la connexion à l'API
- [ ] Implémenter l'authentification (optionnel)

---

## 📞 Support

En cas de problème, vérifiez :
1. Que l'API est bien déployée et accessible
2. Que les CORS sont configurés pour vos ports (4200-4205)
3. Les logs dans la console du navigateur
4. Les logs Firebase Functions : `firebase functions:log`

**Base de données Firestore** : `myschool-1` (non par défaut)
