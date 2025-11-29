# 🚀 Guide d'intégration Frontend - MySchool API

## 📋 Table des matières
- [Configuration Firebase](#configuration-firebase)
- [Configuration de l'API](#configuration-de-lapi)
- [Endpoints disponibles](#endpoints-disponibles)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Gestion des erreurs](#gestion-des-erreurs)

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
  apiUrl: "https://us-central1-myschool-f862b.cloudfunctions.net/api"
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

## 📚 Endpoints disponibles

### 👤 Users (Utilisateurs)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/users` | Liste tous les utilisateurs |
| GET | `/users/:id` | Récupère un utilisateur |
| POST | `/users` | Crée un utilisateur |
| PUT | `/users/:id` | Met à jour un utilisateur |
| DELETE | `/users/:id` | Supprime un utilisateur |
| GET | `/users/email/:email` | Cherche par email |
| GET | `/users/role/:role` | Filtre par rôle |

### 📖 Courses (Cours)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/courses` | Liste tous les cours |
| GET | `/courses/:id` | Récupère un cours |
| POST | `/courses` | Crée un cours |
| PUT | `/courses/:id` | Met à jour un cours |
| DELETE | `/courses/:id` | Supprime un cours |
| GET | `/courses/category/:category` | Filtre par catégorie |
| GET | `/courses/level/:level` | Filtre par niveau |
| GET | `/courses/published` | Cours publiés uniquement |
| GET | `/courses/:id/students` | Liste des étudiants |

### 📑 Chapters (Chapitres)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/chapters` | Liste tous les chapitres |
| GET | `/chapters/:id` | Récupère un chapitre |
| POST | `/chapters` | Crée un chapitre |
| PUT | `/chapters/:id` | Met à jour un chapitre |
| DELETE | `/chapters/:id` | Supprime un chapitre |
| GET | `/chapters/course/:courseId` | Chapitres d'un cours |

### 📝 Lessons (Leçons)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/lessons` | Liste toutes les leçons |
| GET | `/lessons/:id` | Récupère une leçon |
| POST | `/lessons` | Crée une leçon |
| PUT | `/lessons/:id` | Met à jour une leçon |
| DELETE | `/lessons/:id` | Supprime une leçon |
| GET | `/lessons/chapter/:chapterId` | Leçons d'un chapitre |
| GET | `/lessons/type/:type` | Filtre par type |
| GET | `/lessons/:id/complete` | Marquer comme complétée |

### ✏️ Exercises (Exercices)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/exercises` | Liste tous les exercices |
| GET | `/exercises/:id` | Récupère un exercice |
| POST | `/exercises` | Crée un exercice |
| PUT | `/exercises/:id` | Met à jour un exercice |
| DELETE | `/exercises/:id` | Supprime un exercice |
| GET | `/exercises/lesson/:lessonId` | Exercices d'une leçon |
| GET | `/exercises/type/:type` | Filtre par type |
| GET | `/exercises/difficulty/:difficulty` | Filtre par difficulté |

### 🎓 Enrollments (Inscriptions)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/enrollments` | Liste toutes les inscriptions |
| GET | `/enrollments/:id` | Récupère une inscription |
| POST | `/enrollments` | Crée une inscription |
| PUT | `/enrollments/:id` | Met à jour une inscription |
| DELETE | `/enrollments/:id` | Supprime une inscription |
| GET | `/enrollments/student/:studentId` | Inscriptions d'un étudiant |
| GET | `/enrollments/course/:courseId` | Inscriptions à un cours |
| GET | `/enrollments/status/:status` | Filtre par statut |

### 👨‍🏫 Instructors (Instructeurs)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/instructors` | Liste tous les instructeurs |
| GET | `/instructors/:id` | Récupère un instructeur |
| POST | `/instructors` | Crée un instructeur |
| PUT | `/instructors/:id` | Met à jour un instructeur |
| DELETE | `/instructors/:id` | Supprime un instructeur |
| GET | `/instructors/:id/courses` | Cours d'un instructeur |
| GET | `/instructors/:id/students` | Étudiants d'un instructeur |

---

## 💡 Exemples d'utilisation

### Service Users

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id?: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private api: ApiService) {}

  getAllUsers(): Observable<User[]> {
    return this.api.get<User[]>('/users');
  }

  getUserById(id: string): Observable<User> {
    return this.api.get<User>(`/users/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.api.post<User>('/users', user);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.api.put<User>(`/users/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.api.delete<void>(`/users/${id}`);
  }

  getUserByEmail(email: string): Observable<User> {
    return this.api.get<User>(`/users/email/${email}`);
  }

  getUsersByRole(role: string): Observable<User[]> {
    return this.api.get<User[]>(`/users/role/${role}`);
  }
}
```

### Service Courses

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Course {
  id?: string;
  title: string;
  description: string;
  instructorId: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  duration: number;
  published: boolean;
  thumbnailUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private api: ApiService) {}

  getAllCourses(): Observable<Course[]> {
    return this.api.get<Course[]>('/courses');
  }

  getCourseById(id: string): Observable<Course> {
    return this.api.get<Course>(`/courses/${id}`);
  }

  createCourse(course: Course): Observable<Course> {
    return this.api.post<Course>('/courses', course);
  }

  updateCourse(id: string, course: Partial<Course>): Observable<Course> {
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

  getPublishedCourses(): Observable<Course[]> {
    return this.api.get<Course[]>('/courses/published');
  }

  getCourseStudents(courseId: string): Observable<any[]> {
    return this.api.get<any[]>(`/courses/${courseId}/students`);
  }
}
```

### Service Enrollments

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Enrollment {
  id?: string;
  studentId: string;
  courseId: string;
  enrollmentDate: any;
  status: 'active' | 'completed' | 'suspended' | 'cancelled';
  progress?: {
    completedLessons: string[];
    completedExercises: string[];
    progressPercentage: number;
    lastAccessDate: any;
  };
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  constructor(private api: ApiService) {}

  getAllEnrollments(): Observable<Enrollment[]> {
    return this.api.get<Enrollment[]>('/enrollments');
  }

  getEnrollmentById(id: string): Observable<Enrollment> {
    return this.api.get<Enrollment>(`/enrollments/${id}`);
  }

  createEnrollment(enrollment: Enrollment): Observable<Enrollment> {
    return this.api.post<Enrollment>('/enrollments', enrollment);
  }

  updateEnrollment(id: string, enrollment: Partial<Enrollment>): Observable<Enrollment> {
    return this.api.put<Enrollment>(`/enrollments/${id}`, enrollment);
  }

  deleteEnrollment(id: string): Observable<void> {
    return this.api.delete<void>(`/enrollments/${id}`);
  }

  getStudentEnrollments(studentId: string): Observable<Enrollment[]> {
    return this.api.get<Enrollment[]>(`/enrollments/student/${studentId}`);
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
