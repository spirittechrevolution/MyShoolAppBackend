# 🚀 Guide d'intégration Frontend - MySchool API v2.2.0

> **Dernière mise à jour**: 29 novembre 2025  
> **API Version**: 2.2.0 (Referral System)  
> **Status**: ✅ Déployée en production

## 📋 Table des matières
- [Configuration Firebase](#configuration-firebase)
- [Configuration de l'API](#configuration-de-lapi)
- [Endpoints disponibles](#endpoints-disponibles)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Service Referrals (Nouveau)](#service-referrals-nouveau-v220-)
- [Service Payments](#service-payments-v210-)
- [Gestion des erreurs](#gestion-des-erreurs)
- [Documentation Swagger](#documentation-swagger)
- [Nouveautés v2.2.0](#nouveautés-v220---referral-system)
- [Nouveautés v2.1.0](#nouveautés-v210---payment-api)
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
  // ⚡ URL API Production (v2.1.0)
  apiUrl: "https://us-central1-myschool-f862b.cloudfunctions.net/api"
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

## 📚 Endpoints disponibles (58 endpoints)

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

### 💳 Payments (Paiements Orange Money) - 10 endpoints

| Méthode | Endpoint | Description | Nouveau |
|---------|----------|-------------|---------|
| POST | `/api/payments` | Crée un nouveau paiement | 🆕 |
| GET | `/api/payments` | Liste tous les paiements | 🆕 |
| GET | `/api/payments/:id` | Récupère un paiement par ID | 🆕 |
| DELETE | `/api/payments/:id` | Supprime un paiement | 🆕 |
| GET | `/api/payments/user/:userId` | Paiements d'un utilisateur | 🆕 |
| GET | `/api/payments/enrollment/:enrollmentId` | Paiements d'une inscription | 🆕 |
| GET | `/api/payments/status/:status` | Filtre par statut (PENDING/SUCCESS/FAILED/CANCELLED/EXPIRED) | 🆕 |
| GET | `/api/payments/order/:orderReference` | Recherche par référence de commande | 🆕 |
| GET | `/api/payments/:id/check` | Vérifie le statut d'un paiement | 🆕 |
| POST | `/api/payments/:id/cancel` | Annule un paiement | 🆕 |
| POST | `/api/payments/webhook/orange-money` | Webhook Orange Money (callback) | 🆕 |

### 🎁 Referrals (Parrainages) - 9 endpoints

| Méthode | Endpoint | Description | Nouveau |
|---------|----------|-------------|---------|
| POST | `/api/referrals/generate` | Génère un nouveau lien de parrainage | 🎁 |
| GET | `/api/referrals` | Liste tous les parrainages (Admin) | 🎁 |
| GET | `/api/referrals/:id` | Récupère un parrainage par ID | 🎁 |
| DELETE | `/api/referrals/:id` | Supprime un parrainage | 🎁 |
| GET | `/api/referrals/user/:userId` | Parrainages d'un utilisateur | 🎁 |
| GET | `/api/referrals/user/:userId/stats` | Statistiques de parrainage | 🎁 |
| GET | `/api/referrals/code/:code` | Recherche par code | 🎁 |
| POST | `/api/referrals/track-click` | Enregistre un clic sur le lien | 🎁 |
| POST | `/api/referrals/validate` | Valide un code lors de l'inscription | 🎁 |
| POST | `/api/referrals/:id/cancel` | Annule un parrainage | 🎁 |

**Légende**: ✨ = Nouveau endpoint | ⚡ = Optimisé avec index Firestore | 🆕 = v2.1.0 Payment API | 🎁 = v2.2.0 Referral System

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
### Service Enrollments (Mis à jour avec paiement)

```typescript
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { PaymentService } from './payment.service';

export interface Enrollment {
  id?: string;
  userId: string;
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
  constructor(
    private api: ApiService,
    private paymentService: PaymentService
  ) {}

  /**
   * Crée une inscription avec paiement optionnel
   */
  enrollInCourse(params: {
    userId: string;
    courseId: string;
    courseTitle: string;
    courseImage: string;
    amount: number;
    paymentMethod: 'free-money' | 'wave' | 'orange-money' | 'card';
    customerPhoneNumber?: string;
    customerFirstName?: string;
    customerLastName?: string;
  }): Observable<{ enrollment: any; payment?: any }> {
    // 1. Créer l'enrollment
    const enrollmentData = {
      userId: params.userId,
      courseId: params.courseId,
      courseTitle: params.courseTitle,
      courseImage: params.courseImage,
      status: 'active' as const,
      progress: 0,
      amount: params.amount,
      paymentMethod: params.paymentMethod
    };

    return this.createEnrollment(enrollmentData).pipe(
      switchMap((enrollmentResponse) => {
        if (!enrollmentResponse.success || !enrollmentResponse.data) {
          throw new Error('Échec de création de l\'inscription');
        }

        const enrollment = enrollmentResponse.data;

        // 2. Si le cours est payant, créer le paiement
        if (params.amount > 0 && params.paymentMethod === 'orange-money') {
          const paymentData = {
            userId: params.userId,
            enrollmentId: enrollment.id!,
            courseId: params.courseId,
            amount: params.amount,
            currency: 'XOF',
            paymentMethod: params.paymentMethod,
            customerPhoneNumber: params.customerPhoneNumber || '',
            customerFirstName: params.customerFirstName || '',
            customerLastName: params.customerLastName || '',
            description: `Paiement pour ${params.courseTitle}`
          };

          return this.paymentService.createPayment(paymentData).pipe(
            map((paymentResponse) => ({
              enrollment: enrollment,
              payment: paymentResponse.success ? paymentResponse.data : null
            }))
          );
        }

        // 3. Si gratuit, retourner seulement l'enrollment
        return [{ enrollment: enrollment }];
      })
    );
  }

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

  updateProgress(id: string, progress: number): Observable<ApiResponse<Enrollment>> {
    return this.api.put<ApiResponse<Enrollment>>(`/api/enrollments/${id}/progress`, { progress });
  }

  completeChapter(id: string, chapterId: string): Observable<ApiResponse<Enrollment>> {
    return this.api.post<ApiResponse<Enrollment>>(`/api/enrollments/${id}/complete-chapter`, { chapterId });
  }
}
```

### Exemple d'utilisation complète - Inscription avec paiement

```typescript
import { Component } from '@angular/core';
import { EnrollmentService } from '../services/enrollment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-course-enroll',
  templateUrl: './course-enroll.component.html'
})
export class CourseEnrollComponent {
  loading = false;
  error: string | null = null;

  constructor(
    private enrollmentService: EnrollmentService,
    private router: Router
  ) {}

  /**
   * Inscription à un cours payant avec Orange Money
   */
  enrollWithPayment(): void {
    this.loading = true;
    this.error = null;

    this.enrollmentService.enrollInCourse({
      userId: 'GPl8',
      courseId: 'D6JUMFrMoS5tODpvkpSG',
      courseTitle: 'Chimie',
      courseImage: 'assets/images/chimie.jpg',
      amount: 1999, // 19.99 FCFA en centimes
      paymentMethod: 'orange-money',
      customerPhoneNumber: '+221783703310',
      customerFirstName: 'Mohamed',
      customerLastName: 'Ba'
    }).subscribe({
      next: (result) => {
        console.log('✅ Inscription créée:', result.enrollment);
        
        if (result.payment) {
          console.log('💳 Paiement initié:', result.payment);
          
          // Rediriger vers la page de paiement Orange Money
          if (result.payment.paymentUrl) {
            window.location.href = result.payment.paymentUrl;
          }
        } else {
          // Cours gratuit, rediriger vers le cours
          this.router.navigate(['/courses', result.enrollment.courseId]);
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'inscription: ' + err.message;
        this.loading = false;
        console.error('❌ Erreur:', err);
      }
    });
  }

  /**
   * Inscription à un cours gratuit
   */
  enrollFree(): void {
    this.loading = true;

    this.enrollmentService.enrollInCourse({
      userId: 'GPl8',
      courseId: 'DOKiG9kV8rBmIkcCf7Rb',
      courseTitle: 'Algorithme',
      courseImage: 'assets/images/algorithme1.jpg',
      amount: 0,
      paymentMethod: 'free-money'
    }).subscribe({
      next: (result) => {
        console.log('✅ Inscription gratuite réussie');
        this.router.navigate(['/courses', result.enrollment.courseId]);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }
}
```

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

**URL Production**: https://us-central1-myschool-f862b.cloudfunctions.net/api/api-docs

Interface complète avec:
- 📖 58 endpoints documentés (41 existants + 8 paiements + 9 parrainages)
- 🧪 Test en direct des endpoints
- 📋 Schémas de données complets
- 📝 Exemples de requêtes/réponses

### OpenAPI JSON

**URL**: https://us-central1-myschool-f862b.cloudfunctions.net/api/openapi.json

Téléchargez la spécification OpenAPI 3.0 pour:
- Génération automatique de clients
- Import dans Postman/Insomnia
- Intégration CI/CD

---

## ✨ Nouveautés v2.2.0 - Referral System

### 🚀 Nouvelle fonctionnalité: Système de Parrainage

**Date de release**: 29 novembre 2025

#### 🎯 Fonctionnalités

- ✅ **Deep Links** (myschool://referral?code=XXX)
- ✅ **Web Links** (https://myschool-app.com/join?ref=XXX)
- ✅ **Codes uniques** (format: REF_XXXX_XXXXXX)
- ✅ **Tracking des clics et conversions**
- ✅ **Bonus configurable** (défaut: 500 centimes = 5 FCFA)
- ✅ **Expiration automatique** (30 jours)
- ✅ **Anti-fraude** (pas d'auto-parrainage)
- ✅ **Partage WhatsApp/SMS** intégré
- ✅ **Dashboard statistiques** détaillé

#### 🎁 Types de bonus supportés

- **DISCOUNT**: Réduction sur un cours (défaut)
- **FREE_COURSE**: Cours gratuit
- **POINTS**: Points de fidélité

#### 📊 Statuts de parrainage

- **PENDING**: En attente d'inscription
- **COMPLETED**: Inscription réussie, bonus attribué
- **EXPIRED**: Code expiré (30 jours)
- **CANCELLED**: Parrainage annulé

#### 🔄 Workflow de parrainage

```typescript
// 1. Utilisateur génère son lien
const response = await referralService.generateReferralLink(userId);
// → Reçoit: deepLink, webLink, shareText, code

// 2. Partage le lien via WhatsApp/SMS
referralService.shareViaWhatsApp(shareText);

// 3. Ami clique sur le lien
// → App s'ouvre avec: myschool://referral?code=REF_GPL8_ABC123

// 4. Clic est tracké
await referralService.trackClick('REF_GPL8_ABC123', 'whatsapp');

// 5. Ami s'inscrit avec le code
const signupResponse = await userService.createUser({...userData});
await referralService.validateReferralCode('REF_GPL8_ABC123', newUserId);
// → Statut: PENDING → COMPLETED
// → Bonus attribué aux deux utilisateurs

// 6. Parrain voit ses stats
const stats = await referralService.getUserStats(userId);
// → totalEarnings, conversions, conversionRate, etc.
```

#### 📱 Configuration Deep Links

**Android (AndroidManifest.xml)**:
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="myschool"
        android:host="referral" />
</intent-filter>
```

**iOS (Info.plist)**:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>myschool</string>
    </array>
  </dict>
</array>
```

#### 🎯 Exemples de codes

```typescript
// Génération de code
"REF_GPL8_A1B2C3"  // User ID: GPl8...
"REF_DIOP_XYZ789"  // User ID: DIOP...

// Deep link complet
"myschool://referral?code=REF_GPL8_A1B2C3"

// Web link (fallback)
"https://myschool-app.com/join?ref=REF_GPL8_A1B2C3"
```

#### 📊 API Endpoints (9 nouveaux)

```typescript
POST   /api/referrals/generate           // Génère un lien
GET    /api/referrals/user/:userId       // Parrainages d'un user
GET    /api/referrals/user/:userId/stats // Stats détaillées
POST   /api/referrals/track-click        // Track un clic
POST   /api/referrals/validate           // Valide lors signup
GET    /api/referrals/code/:code         // Cherche par code
GET    /api/referrals/:id                // Par ID
POST   /api/referrals/:id/cancel         // Annule
GET    /api/referrals                    // Tous (Admin)
```

#### 💰 Bonus système

- **Parrain**: Reçoit le bonus quand le filleul s'inscrit
- **Filleul**: Reçoit le même bonus à l'inscription
- **Montant par défaut**: 500 centimes (5 FCFA)
- **Stockage**: `user.referralEarnings` et `user.referralBonus`

---

## ✨ Nouveautés v2.1.0 - Payment API

### 🚀 Nouvelle fonctionnalité: Paiements Orange Money

**Date de release**: 29 novembre 2025

#### 🎯 Fonctionnalités

- ✅ **Intégration Orange Money Sénégal**
- ✅ **Paiements sécurisés** avec tokens
- ✅ **Webhooks** pour notifications en temps réel
- ✅ **Gestion de statut** (PENDING → SUCCESS/FAILED)
- ✅ **Expiration automatique** (15 minutes)
- ✅ **Annulation de paiement** avant expiration
- ✅ **Mode MOCK** pour tests sans credentials

#### 💳 Méthodes de paiement supportées

| Méthode | Statut | Description |
|---------|--------|-------------|
| `orange-money` | ✅ Actif | Orange Money Sénégal (API intégrée) |
| `wave` | 🔜 Bientôt | Wave Money |
| `free-money` | ✅ Actif | Cours gratuits |
| `card` | 🔜 Bientôt | Carte bancaire |

#### 📊 Statuts de paiement

| Statut | Description | Actions disponibles |
|--------|-------------|---------------------|
| `PENDING` | En attente de paiement | Vérifier statut, Annuler |
| `SUCCESS` | Paiement réussi | - |
| `FAILED` | Paiement échoué | Créer nouveau paiement |
| `CANCELLED` | Annulé par l'utilisateur | Créer nouveau paiement |
| `EXPIRED` | Expiré (>15min) | Créer nouveau paiement |

#### 🔄 Workflow de paiement

```typescript
// 1. Créer un enrollment
const enrollment = await enrollmentService.createEnrollment({
  userId: 'user123',
  courseId: 'course456',
  amount: 1999, // 19.99 FCFA en centimes
  paymentMethod: 'orange-money'
});

// 2. Créer le paiement
const payment = await paymentService.createPayment({
  userId: 'user123',
  enrollmentId: enrollment.id,
  courseId: 'course456',
  amount: 1999,
  currency: 'XOF',
  paymentMethod: 'orange-money',
  customerPhoneNumber: '+221771234567',
  customerFirstName: 'Amadou',
  customerLastName: 'Diallo',
  description: 'Paiement cours de Chimie'
});

// 3. Rediriger vers Orange Money
window.location.href = payment.paymentUrl;

// 4. Orange Money appelle le webhook après paiement
// → Statut mis à jour automatiquement

// 5. Vérifier le statut
const updatedPayment = await paymentService.checkPaymentStatus(payment.id);
if (updatedPayment.status === 'SUCCESS') {
  // Débloquer l'accès au cours
}
```

#### 🔐 Mode MOCK (Développement)

Le système fonctionne en **mode MOCK** par défaut (sans credentials Orange Money):

```typescript
// Simulation de paiement
{
  "payToken": "MOCK_TOKEN_1764438396694_g6hxc34o7",
  "paymentUrl": "https://mock-orange-money.example.com/pay/...",
  "status": "PENDING"
}

// Vérification du statut (aléatoire)
// 70% → SUCCESS
// 20% → reste PENDING
// 10% → FAILED
```

**Pour activer le vrai Orange Money:**
```bash
firebase functions:config:set \
  orangemoney.mode="sandbox" \
  orangemoney.api_key="your_key" \
  orangemoney.merchant_key="your_key" \
  orangemoney.merchant_id="your_id"
```

#### 📱 Format numéro de téléphone

**Sénégal uniquement** (validation automatique):
- Préfixes acceptés: 70, 75, 76, 77, 78
- Format: `+221 7X XXX XX XX`
- Exemples:
  - `+221771234567` ✅
  - `+221 77 123 45 67` ✅
  - `771234567` ✅ (ajoute +221 auto)
  - `+221701234567` ✅
  - `+221691234567` ❌ (préfixe invalide)

#### 💰 Gestion des montants

```typescript
// Backend stocke en centimes
amount: 1999 // = 19.99 FCFA

// Frontend - Conversion
const amountInFCFA = payment.amount / 100; // 19.99
const formattedAmount = `${amountInFCFA.toFixed(2)} FCFA`; // "19.99 FCFA"

// Service helper
paymentService.formatAmount(1999); // "19.99 FCFA"
```

#### 🎯 Exemples de requêtes

**Créer un paiement:**
```json
POST /api/payments
{
  "userId": "GPl8",
  "enrollmentId": "H0lj6h7lTtEIDLauvoE5",
  "courseId": "D6JUMFrMoS5tODpvkpSG",
  "amount": 1999,
  "currency": "XOF",
  "paymentMethod": "orange-money",
  "customerPhoneNumber": "+221783703310",
  "customerFirstName": "Mohamed",
  "customerLastName": "Ba",
  "description": "Paiement pour le cours de Chimie"
}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": "uYufl7vhNWEvEt2nSQrB",
    "status": "PENDING",
    "orderReferenceNumber": "MS-1764438396193-7751",
    "payToken": "MOCK_TOKEN_1764438396694_g6hxc34o7",
    "paymentUrl": "https://mock-orange-money.example.com/pay/...",
    "expiresAt": "2025-11-29T18:01:36.694Z",
    "amount": 1999,
    "currency": "XOF"
  }
}
```

**Vérifier le statut:**
```json
GET /api/payments/uYufl7vhNWEvEt2nSQrB/check

Response:
{
  "success": true,
  "data": {
    "status": "SUCCESS",
    "transactionId": "TXN_1764438452241",
    "operatorTransactionId": "OP_Y4LQEBZBZ9C",
    "completedAt": "2025-11-29T17:47:32.241Z"
  }
}
```

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
- [ ] Configurer `environment.ts` avec URL API v2.1
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
- [ ] Créer `PaymentService` (10 endpoints) 🆕

### Fonctionnalités avancées
- [ ] Ajouter l'intercepteur d'erreurs
- [ ] Implémenter gestion de cache (optionnel)
- [ ] Tester navigation cours/chapitres/leçons
- [ ] Implémenter tracking de progression
- [ ] Tester filtres (par niveau, catégorie, type)
- [ ] Implémenter flux de paiement Orange Money 🆕
- [ ] Gérer les webhooks de paiement 🆕
- [ ] Tester mode MOCK des paiements 🆕

### Tests et validation
- [ ] Tester la connexion à l'API
- [ ] Vérifier format `ApiResponse<T>`
- [ ] Tester endpoints de filtrage optimisés
- [ ] Valider gestion d'erreurs
- [ ] Tester création de paiement 🆕
- [ ] Tester vérification de statut 🆕
- [ ] Tester annulation de paiement 🆕
- [ ] Tester en production

---

## 📞 Support et ressources

### En cas de problème

**Vérifications**:
1. ✅ API déployée: https://us-central1-myschool-f862b.cloudfunctions.net/api
2. ✅ CORS configurés pour ports 4200-4205
3. ✅ Format de réponse `ApiResponse<T>` géré
4. ✅ Préfixe `/api/` dans tous les endpoints
5. ✅ Mode MOCK activé pour les paiements (pas de credentials requis)

**Debugging paiements**:
```typescript
// Activer logs détaillés
console.log('Payment Response:', paymentResponse);
console.log('Success:', paymentResponse.success);
console.log('Payment Data:', paymentResponse.data);
console.log('Status:', paymentResponse.data?.status);
console.log('Payment URL:', paymentResponse.data?.paymentUrl);
console.log('Expires At:', paymentResponse.data?.expiresAt);

// Vérifier expiration
const isExpired = paymentService.isPaymentExpired(payment);
console.log('Is Expired:', isExpired);

// Vérifier si annulable
const canCancel = paymentService.canBeCancelled(payment);
console.log('Can Cancel:', canCancel);
```

### Informations techniques

- **API Version**: 2.1.0 (Payment API)
- **Base URL**: `https://us-central1-myschool-f862b.cloudfunctions.net/api`
- **Runtime**: Node.js 20 (Cloud Run Gen 2)
- **Database**: Firestore `myschool-1` (non-default)
- **Endpoints**: 49 documentés (41 + 8 paiements)
- **Tests**: 145 (100% passing)
- **Orange Money**: Mode MOCK activé par défaut
- **Payment Expiry**: 15 minutes
- **Supported Currency**: XOF (Franc CFA)

### Liens utiles

- 📖 [Swagger UI](https://us-central1-myschool-f862b.cloudfunctions.net/api/api-docs)
- 📄 [OpenAPI Spec](https://us-central1-myschool-f862b.cloudfunctions.net/api/openapi.json)
- 🔥 [Firebase Console](https://console.firebase.google.com/project/myschool-f862b)
- 📊 [Cloud Run](https://console.cloud.google.com/run)
- 💳 [Orange Money Developer](https://developer.orange-sonatel.com)

### Configuration Orange Money Production

Pour passer en mode production:

```bash
# 1. Obtenir les credentials sur developer.orange-sonatel.com

# 2. Configurer Firebase Functions
firebase functions:config:set \
  orangemoney.mode="production" \
  orangemoney.api_key="YOUR_ORANGE_API_KEY" \
  orangemoney.merchant_key="YOUR_MERCHANT_KEY" \
  orangemoney.merchant_id="YOUR_MERCHANT_ID" \
  orangemoney.api_url="https://api.orange.com/orange-money-webpay/prod/v1" \
  orangemoney.notification_url="https://us-central1-myschool-f862b.cloudfunctions.net/api/api/payments/webhook/orange-money" \
  orangemoney.return_url="https://myschool-app.com/payment/success"

# 3. Redéployer
firebase deploy --only functions
```

---

**Date de dernière mise à jour**: 29 novembre 2025  
**Statut**: ✅ Production Ready (v2.1.0 - Payment API)
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

### Service Payments (Nouveau v2.1.0) 💳

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
export type PaymentMethod = 'orange-money' | 'wave' | 'free-money' | 'card';

export interface Payment {
  id?: string;
  userId: string;
  enrollmentId: string;
  courseId: string;
  amount: number;
  currency: string; // 'XOF' par défaut
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  orderReferenceNumber?: string;
  payToken?: string;
  paymentUrl?: string;
  customerPhoneNumber: string;
  customerFirstName: string;
  customerLastName: string;
  transactionId?: string;
  operatorTransactionId?: string;
  description?: string;
  metadata?: any;
  createdAt?: any;
  updatedAt?: any;
  completedAt?: any;
  expiresAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private api: ApiService) {}

  /**
   * Crée un nouveau paiement Orange Money
   * @param payment - Données du paiement
   * @returns Observable<ApiResponse<Payment>>
   */
  createPayment(payment: {
    userId: string;
    enrollmentId: string;
    courseId: string;
    amount: number;
    currency?: string;
    paymentMethod: PaymentMethod;
    customerPhoneNumber: string;
    customerFirstName: string;
    customerLastName: string;
    description?: string;
  }): Observable<ApiResponse<Payment>> {
    return this.api.post<ApiResponse<Payment>>('/api/payments', {
      ...payment,
      currency: payment.currency || 'XOF'
    });
  }

  /**
   * Récupère tous les paiements
   */
  getAllPayments(): Observable<ApiResponse<Payment[]>> {
    return this.api.get<ApiResponse<Payment[]>>('/api/payments');
  }

  /**
   * Récupère un paiement par ID
   */
  getPaymentById(id: string): Observable<ApiResponse<Payment>> {
    return this.api.get<ApiResponse<Payment>>(`/api/payments/${id}`);
  }

  /**
   * Récupère les paiements d'un utilisateur
   */
  getUserPayments(userId: string): Observable<ApiResponse<Payment[]>> {
    return this.api.get<ApiResponse<Payment[]>>(`/api/payments/user/${userId}`);
  }

  /**
   * Récupère les paiements d'une inscription
   */
  getEnrollmentPayments(enrollmentId: string): Observable<ApiResponse<Payment[]>> {
    return this.api.get<ApiResponse<Payment[]>>(`/api/payments/enrollment/${enrollmentId}`);
  }

  /**
   * Filtre les paiements par statut
   */
  getPaymentsByStatus(status: PaymentStatus): Observable<ApiResponse<Payment[]>> {
    return this.api.get<ApiResponse<Payment[]>>(`/api/payments/status/${status}`);
  }

  /**
   * Recherche un paiement par référence de commande
   */
  getPaymentByOrderReference(orderReference: string): Observable<ApiResponse<Payment>> {
    return this.api.get<ApiResponse<Payment>>(`/api/payments/order/${orderReference}`);
  }

  /**
   * Vérifie le statut d'un paiement auprès d'Orange Money
   */
  checkPaymentStatus(paymentId: string): Observable<ApiResponse<Payment>> {
    return this.api.get<ApiResponse<Payment>>(`/api/payments/${paymentId}/check`);
  }

  /**
   * Annule un paiement
   */
  cancelPayment(paymentId: string): Observable<ApiResponse<Payment>> {
    return this.api.post<ApiResponse<Payment>>(`/api/payments/${paymentId}/cancel`, {});
  }

  /**
   * Supprime un paiement
   */
  deletePayment(paymentId: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`/api/payments/${paymentId}`);
  }

  /**
   * Vérifie si un paiement a expiré
   */
  isPaymentExpired(payment: Payment): boolean {
    if (!payment.expiresAt) return false;
    const expiryDate = new Date(payment.expiresAt._seconds * 1000);
    return new Date() > expiryDate;
  }

  /**
   * Vérifie si un paiement peut être annulé
   */
  canBeCancelled(payment: Payment): boolean {
    return payment.status === 'PENDING' && !this.isPaymentExpired(payment);
  }

  /**
   * Formate le montant en FCFA
   */
  formatAmount(amount: number): string {
    return `${(amount / 100).toFixed(2)} FCFA`;
  }
}
```

### Utilisation du service Payment

```typescript
import { Component, OnInit } from '@angular/core';
import { PaymentService, Payment } from '../services/payment.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html'
})
export class PaymentComponent implements OnInit {
  payment: Payment | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private paymentService: PaymentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const enrollmentId = this.route.snapshot.params['enrollmentId'];
    if (enrollmentId) {
      this.createPaymentForEnrollment(enrollmentId);
    }
  }

  /**
   * Crée un paiement pour une inscription
   */
  createPaymentForEnrollment(enrollmentId: string): void {
    this.loading = true;
    
    const paymentData = {
      userId: 'GPl8', // Récupérer depuis AuthService
      enrollmentId: enrollmentId,
      courseId: 'D6JUMFrMoS5tODpvkpSG', // Récupérer depuis enrollment
      amount: 1999, // Montant en centimes (19.99 FCFA = 1999)
      currency: 'XOF',
      paymentMethod: 'orange-money' as const,
      customerPhoneNumber: '+221783703310',
      customerFirstName: 'Mohamed',
      customerLastName: 'Ba',
      description: 'Paiement pour le cours de Chimie'
    };

    this.paymentService.createPayment(paymentData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.payment = response.data;
          console.log('Paiement créé:', this.payment);
          
          // Rediriger vers l'URL de paiement Orange Money
          if (this.payment.paymentUrl) {
            window.location.href = this.payment.paymentUrl;
          }
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
        console.error('Erreur création paiement:', err);
      }
    });
  }

  /**
   * Vérifie le statut d'un paiement
   */
  checkPaymentStatus(paymentId: string): void {
    this.paymentService.checkPaymentStatus(paymentId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.payment = response.data;
          console.log('Statut mis à jour:', this.payment.status);
          
          if (this.payment.status === 'SUCCESS') {
            console.log('✅ Paiement réussi!');
            // Rediriger vers la page de succès
          } else if (this.payment.status === 'FAILED') {
            console.log('❌ Paiement échoué');
            // Afficher message d'erreur
          }
        }
      },
      error: (err) => {
        console.error('Erreur vérification statut:', err);
      }
    });
  }

  /**
   * Annule un paiement
   */
  cancelPayment(paymentId: string): void {
    if (!this.payment || !this.paymentService.canBeCancelled(this.payment)) {
      console.log('Ce paiement ne peut pas être annulé');
      return;
    }

    this.paymentService.cancelPayment(paymentId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.payment = response.data;
          console.log('Paiement annulé');
        }
      },
      error: (err) => {
        console.error('Erreur annulation:', err);
      }
    });
  }

  /**
   * Récupère l'historique des paiements d'un utilisateur
   */
  loadUserPayments(userId: string): void {
    this.paymentService.getUserPayments(userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const payments = response.data;
          console.log(`${payments.length} paiements trouvés`);
          
          // Filtrer par statut
          const successPayments = payments.filter(p => p.status === 'SUCCESS');
          const pendingPayments = payments.filter(p => p.status === 'PENDING');
          
          console.log(`✅ Réussis: ${successPayments.length}`);
          console.log(`⏳ En attente: ${pendingPayments.length}`);
        }
      },
      error: (err) => {
        console.error('Erreur chargement paiements:', err);
      }
    });
  }
}
```

### Exemple de composant de liste de paiements

```typescript
import { Component, OnInit } from '@angular/core';
import { PaymentService, Payment, PaymentStatus } from '../services/payment.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html'
})
export class PaymentHistoryComponent implements OnInit {
  payments: Payment[] = [];
  loading = false;
  selectedStatus: PaymentStatus | 'ALL' = 'ALL';

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;

    if (this.selectedStatus === 'ALL') {
      this.paymentService.getAllPayments().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.payments = response.data;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
        }
      });
    } else {
      this.paymentService.getPaymentsByStatus(this.selectedStatus).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.payments = response.data;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
        }
      });
    }
  }

  filterByStatus(status: PaymentStatus | 'ALL'): void {
    this.selectedStatus = status;
    this.loadPayments();
  }

  getStatusColor(status: PaymentStatus): string {
    switch (status) {
      case 'SUCCESS': return 'green';
      case 'PENDING': return 'orange';
      case 'FAILED': return 'red';
      case 'CANCELLED': return 'gray';
      case 'EXPIRED': return 'darkgray';
      default: return 'black';
    }
  }

  getStatusLabel(status: PaymentStatus): string {
    const labels: Record<PaymentStatus, string> = {
      'PENDING': 'En attente',
      'SUCCESS': 'Réussi',
      'FAILED': 'Échoué',
      'CANCELLED': 'Annulé',
      'EXPIRED': 'Expiré'
    };
    return labels[status];
  }
}
```

### Service Enrollments (Mis à jour avec paiement)

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

### Service Referrals (Nouveau v2.2.0) 🎁

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export type ReferralStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
export type BonusType = 'DISCOUNT' | 'FREE_COURSE' | 'POINTS';

export interface Referral {
  id?: string;
  referrerId: string;
  referredUserId?: string;
  referralCode: string;
  status: ReferralStatus;
  bonusAmount: number; // En centimes
  bonusType: BonusType;
  clicks: number;
  conversions: number;
  createdAt?: any;
  completedAt?: any;
  expiresAt?: any; // 30 jours
  metadata?: {
    deepLink?: string; // myschool://referral?code=XXX
    webLink?: string;  // https://myschool-app.com/join?ref=XXX
    shareText?: string;
    source?: string;
  };
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  completedReferrals: number;
  expiredReferrals: number;
  cancelledReferrals: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number; // Pourcentage
  totalEarnings: number;  // En centimes
  pendingBonus: number;   // En centimes
  referrals: Referral[];
}

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  constructor(private api: ApiService) {}

  /**
   * Génère un nouveau lien de parrainage
   */
  generateReferralLink(
    userId: string,
    bonusAmount: number = 500, // 5 FCFA par défaut
    bonusType: BonusType = 'DISCOUNT'
  ): Observable<ApiResponse<{
    code: string;
    deepLink: string;
    webLink: string;
    shareText: string;
    bonusAmount: number;
    expiresAt: any;
  }>> {
    return this.api.post('/api/referrals/generate', {
      userId,
      bonusAmount,
      bonusType
    });
  }

  /**
   * Récupère tous les parrainages d'un utilisateur
   */
  getUserReferrals(userId: string): Observable<ApiResponse<Referral[]>> {
    return this.api.get(`/api/referrals/user/${userId}`);
  }

  /**
   * Récupère les statistiques de parrainage
   */
  getUserStats(userId: string): Observable<ApiResponse<ReferralStats>> {
    return this.api.get(`/api/referrals/user/${userId}/stats`);
  }

  /**
   * Enregistre un clic sur un lien de parrainage
   */
  trackClick(code: string, source?: string): Observable<ApiResponse<{
    code: string;
    clicks: number;
    message: string;
  }>> {
    return this.api.post('/api/referrals/track-click', { code, source });
  }

  /**
   * Valide un code de parrainage lors de l'inscription
   */
  validateReferralCode(
    code: string,
    userId: string
  ): Observable<ApiResponse<{
    bonusAmount: number;
    bonusType: BonusType;
    referrerId: string;
    message: string;
  }>> {
    return this.api.post('/api/referrals/validate', { code, userId });
  }

  /**
   * Récupère un parrainage par code
   */
  getReferralByCode(code: string): Observable<ApiResponse<Referral>> {
    return this.api.get(`/api/referrals/code/${code}`);
  }

  /**
   * Annule un parrainage
   */
  cancelReferral(id: string): Observable<ApiResponse<{ message: string }>> {
    return this.api.post(`/api/referrals/${id}/cancel`, {});
  }

  /**
   * Partage via WhatsApp
   */
  shareViaWhatsApp(shareText: string, phoneNumber?: string): void {
    const encodedText = encodeURIComponent(shareText);
    const url = phoneNumber
      ? `https://wa.me/${phoneNumber}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
  }

  /**
   * Partage via SMS
   */
  shareViaSMS(shareText: string, phoneNumber?: string): void {
    const encodedText = encodeURIComponent(shareText);
    const url = phoneNumber
      ? `sms:${phoneNumber}?body=${encodedText}`
      : `sms:?body=${encodedText}`;
    window.location.href = url;
  }

  /**
   * Copie le lien dans le presse-papier
   */
  copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
  }

  /**
   * Formate le bonus en FCFA
   */
  formatBonus(amount: number): string {
    return `${(amount / 100).toFixed(2)} FCFA`;
  }

  /**
   * Vérifie si un parrainage est expiré
   */
  isExpired(referral: Referral): boolean {
    if (!referral.expiresAt) return false;
    const expiryDate = new Date(referral.expiresAt._seconds * 1000);
    return new Date() > expiryDate;
  }
}
```

### Utilisation du service Referral

```typescript
import { Component, OnInit } from '@angular/core';
import { ReferralService, Referral, ReferralStats } from '../services/referral.service';

@Component({
  selector: 'app-referral-dashboard',
  templateUrl: './referral-dashboard.component.html'
})
export class ReferralDashboardComponent implements OnInit {
  stats: ReferralStats | null = null;
  referrals: Referral[] = [];
  loading = false;
  deepLink = '';
  webLink = '';
  shareText = '';
  showShareOptions = false;

  constructor(private referralService: ReferralService) {}

  ngOnInit(): void {
    const userId = this.getCurrentUserId(); // Récupérer depuis AuthService
    this.loadStats(userId);
    this.generateReferralLink(userId);
  }

  /**
   * Génère un nouveau lien de parrainage
   */
  generateReferralLink(userId: string): void {
    this.referralService.generateReferralLink(userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.deepLink = response.data.deepLink;
          this.webLink = response.data.webLink;
          this.shareText = response.data.shareText;
          console.log('✅ Lien généré:', this.deepLink);
        }
      },
      error: (err) => {
        console.error('❌ Erreur génération lien:', err);
      }
    });
  }

  /**
   * Charge les statistiques de parrainage
   */
  loadStats(userId: string): void {
    this.loading = true;
    this.referralService.getUserStats(userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
          this.referrals = response.data.referrals;
          console.log('📊 Stats:', this.stats);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement stats:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Partage via WhatsApp
   */
  shareOnWhatsApp(): void {
    this.referralService.shareViaWhatsApp(this.shareText);
  }

  /**
   * Partage via SMS
   */
  shareOnSMS(): void {
    this.referralService.shareViaSMS(this.shareText);
  }

  /**
   * Copie le lien
   */
  copyLink(): void {
    this.referralService.copyToClipboard(this.deepLink).then(() => {
      console.log('✅ Lien copié!');
      // Afficher un toast/snackbar
    });
  }

  /**
   * Récupère l'utilisateur actuel
   */
  getCurrentUserId(): string {
    // Remplacer par votre logique d'authentification
    return 'GPl8';
  }
}
```

### Template du dashboard de parrainage

```html
<div class="referral-dashboard">
  <!-- Statistiques -->
  <div class="stats-grid" *ngIf="stats">
    <div class="stat-card">
      <h3>{{ stats.totalReferrals }}</h3>
      <p>Parrainages totaux</p>
    </div>
    <div class="stat-card">
      <h3>{{ stats.completedReferrals }}</h3>
      <p>Inscriptions réussies</p>
    </div>
    <div class="stat-card">
      <h3>{{ stats.totalClicks }}</h3>
      <p>Clics sur le lien</p>
    </div>
    <div class="stat-card">
      <h3>{{ stats.conversionRate }}%</h3>
      <p>Taux de conversion</p>
    </div>
    <div class="stat-card highlight">
      <h3>{{ referralService.formatBonus(stats.totalEarnings) }}</h3>
      <p>Gains totaux</p>
    </div>
  </div>

  <!-- Lien de parrainage -->
  <div class="referral-link-card">
    <h2>🎁 Ton lien de parrainage</h2>
    <div class="link-container">
      <input type="text" [value]="deepLink" readonly />
      <button (click)="copyLink()">Copier</button>
    </div>

    <!-- Options de partage -->
    <div class="share-buttons">
      <button class="whatsapp-btn" (click)="shareOnWhatsApp()">
        <i class="fab fa-whatsapp"></i> Partager sur WhatsApp
      </button>
      <button class="sms-btn" (click)="shareOnSMS()">
        <i class="fas fa-sms"></i> Partager par SMS
      </button>
    </div>
  </div>

  <!-- Liste des parrainages -->
  <div class="referrals-list">
    <h3>Mes parrainages</h3>
    <div class="referral-item" *ngFor="let referral of referrals">
      <div class="referral-info">
        <span class="code">{{ referral.referralCode }}</span>
        <span class="status" [class]="'status-' + referral.status.toLowerCase()">
          {{ getStatusLabel(referral.status) }}
        </span>
      </div>
      <div class="referral-stats">
        <span>{{ referral.clicks }} clics</span>
        <span>{{ referral.conversions }} conversions</span>
        <span>{{ referralService.formatBonus(referral.bonusAmount) }}</span>
      </div>
    </div>
  </div>
</div>
```

### Intégration dans le processus d'inscription

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { ReferralService } from '../services/referral.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html'
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  referralCode: string | null = null;
  referralBonus = 0;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private referralService: ReferralService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+221[0-9]{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      referralCode: ['']
    });
  }

  ngOnInit(): void {
    // Récupérer le code de parrainage depuis l'URL (deep link)
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.referralCode = params['code'];
        this.signupForm.patchValue({ referralCode: this.referralCode });
        this.validateReferralCode();
      }
    });
  }

  /**
   * Valide le code de parrainage
   */
  validateReferralCode(): void {
    const code = this.signupForm.get('referralCode')?.value;
    if (!code) return;

    this.referralService.getReferralByCode(code).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.referralBonus = response.data.bonusAmount;
          console.log(`✅ Code valide! Bonus: ${this.referralService.formatBonus(this.referralBonus)}`);
        }
      },
      error: (err) => {
        console.error('❌ Code invalide:', err);
        this.referralBonus = 0;
      }
    });
  }

  /**
   * Inscription avec code de parrainage
   */
  signup(): void {
    if (this.signupForm.invalid) return;

    const userData = this.signupForm.value;
    const referralCode = userData.referralCode;
    delete userData.referralCode;

    // 1. Créer l'utilisateur
    this.userService.createUser(userData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const newUserId = response.data.uid;

          // 2. Valider le code de parrainage si présent
          if (referralCode) {
            this.referralService.validateReferralCode(referralCode, newUserId).subscribe({
              next: (refResponse) => {
                if (refResponse.success) {
                  console.log('🎁', refResponse.data.message);
                }
                this.router.navigate(['/welcome']);
              },
              error: (err) => {
                console.error('Erreur validation parrainage:', err);
                this.router.navigate(['/welcome']);
              }
            });
          } else {
            this.router.navigate(['/welcome']);
          }
        }
      },
      error: (err) => {
        console.error('Erreur inscription:', err);
      }
    });
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
