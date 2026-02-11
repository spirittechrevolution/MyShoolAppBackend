# Guide d'Intégration Angular - MySchool API

## 📋 Table des Matières

1. [Architecture & Configuration](#architecture--configuration)
2. [Modèles TypeScript](#modèles-typescript)
3. [Services Angular](#services-angular)
4. [API Endpoints Complets](#api-endpoints-complets)
5. [Authentification & Filtrage par Utilisateur](#authentification--filtrage-par-utilisateur)
6. [Composants d'Exemple](#composants-dexemple)
7. [Pipes & Filtres](#pipes--filtres)
8. [Gestion des Erreurs](#gestion-des-erreurs)
9. [Cas d'Usage Complets](#cas-dusage-complets)

---

## 🏗️ Architecture & Configuration

### Configuration de l'Environnement

**environment.ts**
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://us-central1-myschool-f862b.cloudfunctions.net/api',
  // Pour développement local:
  // apiUrl: 'http://localhost:3000'
};
```

**environment.prod.ts**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://us-central1-myschool-f862b.cloudfunctions.net/api'
};
```

### Intercepteurs HTTP

**auth.interceptor.ts** - Ajoute le token Firebase à chaque requête
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private afAuth: AngularFireAuth) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.afAuth.currentUser).pipe(
      switchMap(user => {
        if (user) {
          return from(user.getIdToken()).pipe(
            switchMap(token => {
              const cloned = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token}`)
              });
              return next.handle(cloned);
            })
          );
        }
        return next.handle(req);
      })
    );
  }
}
```

**error.interceptor.ts** - Gestion centralisée des erreurs
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Une erreur est survenue';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 0) {
          errorMessage = 'Impossible de contacter le serveur';
        } else if (error.status === 401) {
          errorMessage = 'Session expirée, veuillez vous reconnecter';
        } else if (error.status === 403) {
          errorMessage = 'Accès non autorisé';
        } else if (error.status === 404) {
          errorMessage = 'Ressource non trouvée';
        }

        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
        return throwError(() => error);
      })
    );
  }
}
```

**app.module.ts**
```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ]
})
export class AppModule { }
```

---

## 📦 Modèles TypeScript

### models/user.model.ts
```typescript
export type NiveauScolaire = 'ELEMENTAIRE' | 'MOYEN' | 'SECONDAIRE' | 'UNIVERSITAIRE';

export interface User {
  uid: string;
  email?: string;
  firstName: string;
  lastName: string;
  phone: string;
  photoURL?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  
  // Hiérarchie scolaire
  niveauScolaire?: NiveauScolaire;
  classe?: string; // Ex: "CM2", "6ème", "Terminale S", "Licence 2"
  
  role: { libelle: 'student' | 'teacher' | 'admin' };
  status: 'active' | 'inactive' | 'suspended';
  
  // Abonnement
  hasActiveSubscription?: boolean;
  subscriptionId?: string;
  subscriptionStatus?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  subscriptionEndDate?: Date;
  
  createdAt: Date;
  updatedAt?: Date;
}

// Classes disponibles par niveau
export const CLASSES_PAR_NIVEAU: Record<NiveauScolaire, string[]> = {
  ELEMENTAIRE: ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
  MOYEN: ['6ème', '5ème', '4ème', '3ème (BFEM)'],
  SECONDAIRE: [
    'Seconde L', 'Seconde S', 'Seconde G', 'Seconde T',
    'Première L', 'Première L\'', 'Première S', 'Première G', 'Première T',
    'Terminale L', 'Terminale L\'', 'Terminale S', 'Terminale G', 'Terminale T'
  ],
  UNIVERSITAIRE: ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2']
};
```

### models/matiere.model.ts
```typescript
export interface Matiere {
  id?: string;
  nom: string; // Ex: "Mathématiques", "Physique-Chimie", "SVT"
  niveauScolaire: NiveauScolaire;
  classe?: string; // Classe précise (optionnel)
  description?: string;
  icone?: string; // Émoji ou URL
  ordre?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
```

### models/course.model.ts
```typescript
export interface Course {
  id: string;
  title: string;
  description: string;
  
  // Hiérarchie
  niveauScolaire: NiveauScolaire;
  matiereId?: string; // ID de la matière
  classe?: string; // Classe précise
  
  category: string; // Sous-domaine (Algèbre, Géométrie, etc.)
  type: 'En ligne' | 'VIDEO' | 'Hybrid';
  level: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
  duration: number; // en minutes
  sessions: number;
  price: number;
  rating: number;
  image: string;
  isPublished: boolean;
  certificateAvailable: boolean;
  instructorId?: string;
  chaptersIds: string[];
  chapters: any[];
  exercises: number;
  enrolledUsers?: string[];
  
  // Documents PDF
  documents?: Array<{
    name: string;
    url: string;
    size?: number;
    uploadedAt?: Date;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### models/subscription.model.ts
```typescript
export type TypeAbonnement = 'CLASSE' | 'MATIERE';

export interface Subscription {
  id?: string;
  userId: string;
  
  // Nouveau modèle
  classe: string; // "CM2", "6ème", "Terminale S", etc.
  niveauScolaire: NiveauScolaire;
  typeAbonnement: TypeAbonnement;
  matieres?: string[]; // Noms des matières (requis si typeAbonnement = 'MATIERE')
  
  amount: number; // Prix en XOF (5000 pour tous)
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  startDate: Date;
  endDate: Date;
  
  // Paiement Wave
  paymentId?: string;
  wavePaymentId?: string;
  checkoutUrl?: string;
  
  createdAt: Date;
  updatedAt?: Date;
}

// Payloads pour créer un abonnement
export interface CreateSubscriptionPayload {
  userId: string;
  classe: string;
  niveauScolaire: NiveauScolaire;
  typeAbonnement: TypeAbonnement;
  matieres?: string[]; // Obligatoire pour MOYEN/SECONDAIRE/UNIVERSITAIRE (3 matières)
}
```

### models/api-response.model.ts
```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}
```

---

## 🔧 Services Angular

### services/matiere.service.ts
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Matiere, NiveauScolaire } from '../models/matiere.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class MatiereService {
  private apiUrl = `${environment.apiUrl}/matieres`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les matières actives
   */
  getAll(): Observable<Matiere[]> {
    return this.http.get<ApiResponse<Matiere[]>>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Récupérer une matière par ID
   */
  getById(id: string): Observable<Matiere> {
    return this.http.get<ApiResponse<Matiere>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Récupérer les matières par niveau scolaire
   * Utilisé pour afficher les matières disponibles dans un dropdown
   */
  getByNiveau(niveau: NiveauScolaire): Observable<Matiere[]> {
    return this.http.get<ApiResponse<Matiere[]>>(`${this.apiUrl}/niveau/${niveau}`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Récupérer les matières par classe précise
   * Utilisé pour filtrer les matières pour une classe spécifique
   */
  getByClasse(classe: string): Observable<Matiere[]> {
    return this.http.get<ApiResponse<Matiere[]>>(`${this.apiUrl}/classe/${classe}`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Créer une nouvelle matière (Admin uniquement)
   */
  create(matiere: Partial<Matiere>): Observable<Matiere> {
    return this.http.post<ApiResponse<Matiere>>(this.apiUrl, matiere).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Mettre à jour une matière (Admin uniquement)
   */
  update(id: string, matiere: Partial<Matiere>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, matiere);
  }

  /**
   * Supprimer une matière (Admin uniquement - soft delete)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### services/course.service.ts
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Course, NiveauScolaire } from '../models/course.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les cours
   */
  getAll(): Observable<Course[]> {
    return this.http.get<ApiResponse<Course[]>>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Récupérer les cours publiés uniquement
   */
  getPublished(): Observable<Course[]> {
    return this.http.get<ApiResponse<Course[]>>(`${this.apiUrl}/published`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Récupérer un cours par ID
   */
  getById(id: string): Observable<Course> {
    return this.http.get<ApiResponse<Course>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Récupérer les cours par niveau scolaire
   * Ex: Tous les cours pour MOYEN (6ème, 5ème, 4ème, 3ème)
   */
  getByNiveau(niveau: NiveauScolaire): Observable<Course[]> {
    return this.http.get<ApiResponse<Course[]>>(`${this.apiUrl}/niveau/${niveau}`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Récupérer les cours par classe précise
   * Ex: Uniquement les cours pour "Terminale S"
   */
  getByClasse(classe: string): Observable<Course[]> {
    return this.http.get<ApiResponse<Course[]>>(`${this.apiUrl}/classe/${classe}`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Récupérer les cours par matière
   * Ex: Tous les cours de Mathématiques
   */
  getByMatiere(matiereId: string): Observable<Course[]> {
    return this.http.get<ApiResponse<Course[]>>(`${this.apiUrl}/matiere/${matiereId}`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Récupérer les cours par catégorie
   * Ex: Algèbre, Géométrie, etc.
   */
  getByCategory(category: string): Observable<Course[]> {
    return this.http.get<ApiResponse<Course[]>>(`${this.apiUrl}/category/${category}`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Récupérer les cours par niveau de difficulté
   */
  getByLevel(level: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE'): Observable<Course[]> {
    return this.http.get<ApiResponse<Course[]>>(`${this.apiUrl}/level/${level}`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Récupérer les cours par type
   */
  getByType(type: 'En ligne' | 'VIDEO' | 'Hybrid'): Observable<Course[]> {
    return this.http.get<ApiResponse<Course[]>>(`${this.apiUrl}/type/${type}`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Récupérer les cours d'un instructeur
   */
  getByInstructor(instructorId: string): Observable<Course[]> {
    return this.http.get<ApiResponse<Course[]>>(`${this.apiUrl}/instructor/${instructorId}`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Filtrer les cours pour l'utilisateur connecté
   * Selon son niveau, sa classe et ses matières d'abonnement
   */
  getCoursesForUser(user: any, selectedMatieres?: string[]): Observable<Course[]> {
    return this.getByClasse(user.classe).pipe(
      map(courses => {
        // Filtrer par matières si spécifiées
        if (selectedMatieres && selectedMatieres.length > 0) {
          return courses.filter(course => 
            selectedMatieres.includes(course.matiereId || '')
          );
        }
        return courses;
      })
    );
  }

  /**
   * Créer un cours (Enseignant/Admin uniquement)
   */
  create(course: Partial<Course>): Observable<Course> {
    return this.http.post<ApiResponse<Course>>(this.apiUrl, course).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Mettre à jour un cours
   */
  update(id: string, course: Partial<Course>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, course);
  }

  /**
   * Supprimer un cours
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### services/subscription.service.ts
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Subscription, CreateSubscriptionPayload } from '../models/subscription.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/subscriptions`;

  constructor(private http: HttpClient) {}

  /**
   * Créer un paiement pour un abonnement
   * Retourne l'URL de paiement Wave à afficher à l'utilisateur
   */
  createPayment(payload: CreateSubscriptionPayload): Observable<{
    subscriptionId: string;
    paymentId: string;
    paymentUrl: string;
    amount: number;
  }> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/create-payment`, payload).pipe(
      map(response => response.data)
    );
  }

  /**
   * Vérifier le statut d'un abonnement
   */
  checkStatus(subscriptionId: string): Observable<Subscription> {
    return this.http.get<ApiResponse<Subscription>>(
      `${this.apiUrl}/${subscriptionId}/status`
    ).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Récupérer l'abonnement actif d'un utilisateur
   */
  getActiveSubscription(userId: string): Observable<Subscription | null> {
    return this.http.get<ApiResponse<Subscription>>(
      `${this.apiUrl}/user/${userId}/active`
    ).pipe(
      map(response => response.data || null)
    );
  }

  /**
   * Récupérer l'historique des abonnements d'un utilisateur
   */
  getUserSubscriptions(userId: string): Observable<Subscription[]> {
    return this.http.get<ApiResponse<Subscription[]>>(
      `${this.apiUrl}/user/${userId}`
    ).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Annuler un abonnement
   */
  cancel(subscriptionId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${subscriptionId}/cancel`, {});
  }
}
```

### services/auth.service.ts
```typescript
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private afAuth: AngularFireAuth,
    private http: HttpClient
  ) {
    // Charger l'utilisateur au démarrage
    this.afAuth.authState.pipe(
      switchMap(firebaseUser => {
        if (firebaseUser) {
          return this.getUserProfile(firebaseUser.uid);
        }
        return new Observable<null>(observer => observer.next(null));
      })
    ).subscribe(user => {
      this.currentUserSubject.next(user);
    });
  }

  /**
   * Récupérer le profil utilisateur depuis Firestore
   */
  getUserProfile(uid: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${environment.apiUrl}/users/${uid}`).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Se connecter
   */
  login(email: string, password: string): Observable<User> {
    return this.http.post<ApiResponse<{ user: User, token: string }>>(
      `${environment.apiUrl}/users/login`,
      { email, password }
    ).pipe(
      map(response => response.data!.user),
      tap(user => this.currentUserSubject.next(user))
    );
  }

  /**
   * S'inscrire
   */
  register(userData: Partial<User> & { password: string }): Observable<User> {
    return this.http.post<ApiResponse<User>>(
      `${environment.apiUrl}/users/signup`,
      userData
    ).pipe(
      map(response => response.data!),
      tap(user => this.currentUserSubject.next(user))
    );
  }

  /**
   * Se déconnecter
   */
  logout(): Observable<void> {
    return new Observable(observer => {
      this.afAuth.signOut().then(() => {
        this.currentUserSubject.next(null);
        observer.next();
        observer.complete();
      });
    });
  }

  /**
   * Obtenir l'utilisateur courant
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Vérifier si l'utilisateur a un abonnement actif
   */
  hasActiveSubscription(): boolean {
    const user = this.getCurrentUser();
    return user?.hasActiveSubscription === true && 
           user?.subscriptionStatus === 'ACTIVE';
  }
}
```

---

## 🌐 API Endpoints Complets

### Base URL
```
Production: https://us-central1-myschool-f862b.cloudfunctions.net/api
Local: http://localhost:3000
```

### 📚 MATIÈRES

#### GET `/matieres`
Récupérer toutes les matières actives

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "mat123",
      "nom": "Mathématiques",
      "niveauScolaire": "MOYEN",
      "classe": "6ème",
      "icone": "📐",
      "ordre": 1,
      "isActive": true,
      "createdAt": "2026-01-10T10:00:00Z"
    }
  ],
  "count": 30
}
```

#### GET `/matieres/:id`
Récupérer une matière par ID

#### GET `/matieres/niveau/:niveau`
Récupérer les matières par niveau scolaire

**Paramètres:**
- `niveau`: `ELEMENTAIRE` | `MOYEN` | `SECONDAIRE` | `UNIVERSITAIRE`

**Exemple:**
```
GET /matieres/niveau/MOYEN
```

**Réponse:**
```json
{
  "success": true,
  "data": [
    { "id": "mat1", "nom": "Mathématiques", "niveauScolaire": "MOYEN", "classe": "6ème" },
    { "id": "mat2", "nom": "Français", "niveauScolaire": "MOYEN", "classe": "6ème" },
    { "id": "mat3", "nom": "SVT", "niveauScolaire": "MOYEN", "classe": "6ème" }
  ],
  "count": 12
}
```

#### GET `/matieres/classe/:classe`
Récupérer les matières pour une classe précise

**Exemple:**
```
GET /matieres/classe/Terminale S
```

#### POST `/matieres` (Admin uniquement)
Créer une nouvelle matière

**Body:**
```json
{
  "nom": "Physique-Chimie",
  "niveauScolaire": "SECONDAIRE",
  "classe": "Terminale S",
  "icone": "⚗️",
  "ordre": 4
}
```

#### PUT `/matieres/:id` (Admin uniquement)
Mettre à jour une matière

#### DELETE `/matieres/:id` (Admin uniquement)
Supprimer une matière (soft delete)

---

### 📖 COURS

#### GET `/courses`
Récupérer tous les cours

#### GET `/courses/published`
Récupérer les cours publiés uniquement

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "course123",
      "title": "Algèbre - Équations du second degré",
      "description": "Maîtriser les équations du second degré",
      "niveauScolaire": "SECONDAIRE",
      "matiereId": "mat_math_terminale",
      "classe": "Terminale S",
      "category": "Algèbre",
      "type": "VIDEO",
      "level": "INTERMEDIAIRE",
      "duration": 120,
      "sessions": 10,
      "price": 5000,
      "rating": 4.5,
      "image": "https://...",
      "isPublished": true,
      "certificateAvailable": true,
      "instructorId": "teacher123",
      "chaptersIds": ["chap1", "chap2"],
      "exercises": 25,
      "documents": [
        {
          "name": "Cours_Equations.pdf",
          "url": "https://...",
          "size": 2048576,
          "uploadedAt": "2026-01-10T10:00:00Z"
        }
      ],
      "createdAt": "2026-01-05T10:00:00Z"
    }
  ],
  "count": 150
}
```

#### GET `/courses/:id`
Récupérer un cours par ID

#### GET `/courses/niveau/:niveau`
Récupérer les cours par niveau scolaire

**Exemple:**
```
GET /courses/niveau/SECONDAIRE
```

#### GET `/courses/classe/:classe`
Récupérer les cours pour une classe précise

**Exemple:**
```
GET /courses/classe/6ème
```

**Utilisation:** Afficher UNIQUEMENT les cours de la classe de l'utilisateur connecté

#### GET `/courses/matiere/:matiereId`
Récupérer les cours d'une matière spécifique

**Exemple:**
```
GET /courses/matiere/mat_math_6eme
```

**Utilisation:** Filtrer les cours par matière dans l'interface

#### GET `/courses/category/:category`
Récupérer les cours par catégorie

**Exemple:**
```
GET /courses/category/Algèbre
```

#### GET `/courses/level/:level`
Récupérer les cours par niveau de difficulté

**Paramètres:**
- `level`: `DEBUTANT` | `INTERMEDIAIRE` | `AVANCE`

#### GET `/courses/type/:type`
Récupérer les cours par type

**Paramètres:**
- `type`: `En ligne` | `VIDEO` | `Hybrid`

#### GET `/courses/instructor/:instructorId`
Récupérer les cours d'un instructeur

#### POST `/courses` (Enseignant/Admin)
Créer un nouveau cours

**Body:**
```json
{
  "title": "Introduction à Python",
  "description": "Apprendre les bases de Python",
  "niveauScolaire": "UNIVERSITAIRE",
  "matiereId": "mat_info_l1",
  "classe": "Licence 1",
  "category": "Programmation",
  "type": "VIDEO",
  "level": "DEBUTANT",
  "duration": 180,
  "sessions": 15,
  "price": 5000,
  "image": "https://...",
  "instructorId": "teacher456"
}
```

#### PUT `/courses/:id`
Mettre à jour un cours

#### DELETE `/courses/:id`
Supprimer un cours

---

### 💳 ABONNEMENTS

#### POST `/subscriptions/create-payment`
Créer un paiement Wave pour un abonnement

**Body - ELEMENTAIRE (accès à toute la classe):**
```json
{
  "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
  "classe": "CM2",
  "niveauScolaire": "ELEMENTAIRE",
  "typeAbonnement": "CLASSE"
}
```

**Body - MOYEN/SECONDAIRE/UNIVERSITAIRE (choisir 3 matières):**
```json
{
  "userId": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
  "classe": "6ème",
  "niveauScolaire": "MOYEN",
  "typeAbonnement": "MATIERE",
  "matieres": ["Mathématiques", "Français", "SVT"]
}
```

**Réponse Succès (200):**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_abc123",
    "paymentId": "pay_xyz789",
    "paymentUrl": "https://pay.wave.com/...",
    "amount": 5000
  },
  "message": "Paiement créé avec succès"
}
```

**Erreurs possibles:**
```json
// 400 - Champs manquants
{
  "success": false,
  "message": "userId, classe, niveauScolaire et typeAbonnement requis"
}

// 400 - Classe ne correspond pas
{
  "success": false,
  "message": "La classe sélectionnée \"Terminale S\" ne correspond pas à votre classe \"6ème\""
}

// 400 - Niveau ne correspond pas
{
  "success": false,
  "message": "Le niveau scolaire sélectionné ne correspond pas à votre niveau"
}

// 400 - MATIERE sans 3 matières
{
  "success": false,
  "message": "Vous devez sélectionner exactement 3 matières pour ce type d'abonnement"
}

// 400 - CLASSE avec matières
{
  "success": false,
  "message": "Le type CLASSE ne nécessite pas de sélection de matières"
}

// 400 - Matières invalides
{
  "success": false,
  "message": "Les matières sélectionnées ne correspondent pas au niveau scolaire"
}

// 409 - Abonnement actif existant
{
  "success": false,
  "message": "Vous avez déjà un abonnement actif"
}
```

#### GET `/subscriptions/:subscriptionId/status`
Vérifier le statut d'un abonnement

#### GET `/subscriptions/user/:userId/active`
Récupérer l'abonnement actif d'un utilisateur

#### GET `/subscriptions/user/:userId`
Récupérer l'historique des abonnements

#### POST `/subscriptions/:subscriptionId/cancel`
Annuler un abonnement

---

### 👤 UTILISATEURS

#### POST `/users/signup`
Créer un compte utilisateur

**Body:**
```json
{
  "email": "etudiant@example.com",
  "password": "MotDePasse123!",
  "firstName": "Mamadou",
  "lastName": "Diallo",
  "phone": "+221771234567",
  "niveauScolaire": "MOYEN",
  "classe": "6ème",
  "role": { "libelle": "student" }
}
```

#### POST `/users/login`
Se connecter

**Body:**
```json
{
  "email": "etudiant@example.com",
  "password": "MotDePasse123!"
}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "VLzZCBlJstQOWhJy9Xg4MEO7ESK2",
      "email": "etudiant@example.com",
      "firstName": "Mamadou",
      "lastName": "Diallo",
      "niveauScolaire": "MOYEN",
      "classe": "6ème",
      "hasActiveSubscription": false,
      "subscriptionStatus": null
    },
    "token": "eyJhbGciOiJSUzI1NiIsImtpZCI..."
  }
}
```

#### GET `/users/:uid`
Récupérer le profil d'un utilisateur

#### PUT `/users/:uid`
Mettre à jour le profil

---

## 🔐 Authentification & Filtrage par Utilisateur

### Récupérer les cours de l'utilisateur connecté

**Composant TypeScript:**
```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CourseService } from '../services/course.service';
import { Course } from '../models/course.model';
import { User } from '../models/user.model';

@Component({
  selector: 'app-my-courses',
  templateUrl: './my-courses.component.html'
})
export class MyCoursesComponent implements OnInit {
  currentUser: User | null = null;
  courses: Course[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private courseService: CourseService
  ) {}

  ngOnInit() {
    // S'abonner aux changements de l'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.classe) {
        this.loadCoursesForUser();
      }
    });
  }

  loadCoursesForUser() {
    if (!this.currentUser?.classe) return;

    this.loading = true;
    this.courseService.getByClasse(this.currentUser.classe).subscribe({
      next: (courses) => {
        this.courses = courses;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement cours:', error);
        this.loading = false;
      }
    });
  }
}
```

**Template HTML:**
```html
<div class="courses-container">
  <h2>Mes Cours - {{ currentUser?.classe }}</h2>
  
  <div *ngIf="loading" class="loading">
    <mat-spinner></mat-spinner>
  </div>

  <div *ngIf="!loading && courses.length === 0" class="empty-state">
    <p>Aucun cours disponible pour votre classe</p>
  </div>

  <div class="courses-grid" *ngIf="!loading && courses.length > 0">
    <mat-card *ngFor="let course of courses" class="course-card">
      <img mat-card-image [src]="course.image" [alt]="course.title">
      <mat-card-header>
        <mat-card-title>{{ course.title }}</mat-card-title>
        <mat-card-subtitle>{{ course.category }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>{{ course.description }}</p>
        <div class="course-info">
          <span><mat-icon>schedule</mat-icon> {{ course.duration }}min</span>
          <span><mat-icon>star</mat-icon> {{ course.rating }}/5</span>
          <span><mat-icon>video_library</mat-icon> {{ course.sessions }} sessions</span>
        </div>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" [routerLink]="['/courses', course.id]">
          Voir le cours
        </button>
      </mat-card-actions>
    </mat-card>
  </div>
</div>
```

---

## 💡 Composants d'Exemple

### Composant de Sélection de Matières

**matiere-selector.component.ts**
```typescript
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatiereService } from '../services/matiere.service';
import { Matiere, NiveauScolaire } from '../models/matiere.model';

@Component({
  selector: 'app-matiere-selector',
  templateUrl: './matiere-selector.component.html'
})
export class MatiereSelectorComponent implements OnInit {
  @Input() niveau!: NiveauScolaire;
  @Input() classe?: string;
  @Input() maxSelection: number = 3; // Pour MOYEN/SECONDAIRE/UNIVERSITAIRE
  @Output() selectionChange = new EventEmitter<string[]>();

  matieres: Matiere[] = [];
  selectedMatieresControl = new FormControl<Matiere[]>([]);
  loading = true;

  constructor(private matiereService: MatiereService) {}

  ngOnInit() {
    this.loadMatieres();
    
    // Émettre les changements
    this.selectedMatieresControl.valueChanges.subscribe(selected => {
      const names = (selected || []).map(m => m.nom);
      this.selectionChange.emit(names);
    });
  }

  loadMatieres() {
    this.loading = true;
    
    const observable = this.classe 
      ? this.matiereService.getByClasse(this.classe)
      : this.matiereService.getByNiveau(this.niveau);

    observable.subscribe({
      next: (matieres) => {
        this.matieres = matieres;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement matières:', error);
        this.loading = false;
      }
    });
  }

  isMaxReached(): boolean {
    const selected = this.selectedMatieresControl.value || [];
    return selected.length >= this.maxSelection;
  }

  canSelect(matiere: Matiere): boolean {
    const selected = this.selectedMatieresControl.value || [];
    return selected.includes(matiere) || !this.isMaxReached();
  }
}
```

**matiere-selector.component.html**
```html
<div class="matiere-selector">
  <h3>Sélectionnez vos matières ({{ selectedMatieresControl.value?.length || 0 }}/{{ maxSelection }})</h3>
  
  <div *ngIf="loading" class="loading">
    <mat-spinner diameter="30"></mat-spinner>
  </div>

  <mat-selection-list [formControl]="selectedMatieresControl" *ngIf="!loading">
    <mat-list-option 
      *ngFor="let matiere of matieres" 
      [value]="matiere"
      [disabled]="!canSelect(matiere)">
      <span class="matiere-icon">{{ matiere.icone }}</span>
      <span class="matiere-name">{{ matiere.nom }}</span>
    </mat-list-option>
  </mat-selection-list>

  <p class="hint" *ngIf="isMaxReached()">
    Maximum de {{ maxSelection }} matières atteint
  </p>
</div>
```

### Composant de Filtrage de Cours

**course-filter.component.ts**
```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CourseService } from '../services/course.service';
import { MatiereService } from '../services/matiere.service';
import { AuthService } from '../services/auth.service';
import { Course } from '../models/course.model';
import { Matiere } from '../models/matiere.model';
import { User } from '../models/user.model';

@Component({
  selector: 'app-course-filter',
  templateUrl: './course-filter.component.html'
})
export class CourseFilterComponent implements OnInit {
  filterForm!: FormGroup;
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  matieres: Matiere[] = [];
  currentUser: User | null = null;
  loading = true;

  categories: string[] = [];
  levels = ['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'];
  types = ['En ligne', 'VIDEO', 'Hybrid'];

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private matiereService: MatiereService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadCurrentUser();
  }

  initForm() {
    this.filterForm = this.fb.group({
      matiere: [''],
      category: [''],
      level: [''],
      type: [''],
      searchText: ['']
    });

    // Appliquer les filtres à chaque changement
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadCurrentUser() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user?.classe) {
        this.loadData();
      }
    });
  }

  loadData() {
    if (!this.currentUser?.classe) return;

    this.loading = true;

    // Charger cours et matières en parallèle
    Promise.all([
      this.courseService.getByClasse(this.currentUser.classe).toPromise(),
      this.matiereService.getByClasse(this.currentUser.classe).toPromise()
    ]).then(([courses, matieres]) => {
      this.courses = courses || [];
      this.matieres = matieres || [];
      this.filteredCourses = this.courses;
      
      // Extraire les catégories uniques
      this.categories = [...new Set(this.courses.map(c => c.category))];
      
      this.loading = false;
    }).catch(error => {
      console.error('Erreur chargement données:', error);
      this.loading = false;
    });
  }

  applyFilters() {
    const filters = this.filterForm.value;
    
    this.filteredCourses = this.courses.filter(course => {
      // Filtre par matière
      if (filters.matiere && course.matiereId !== filters.matiere) {
        return false;
      }

      // Filtre par catégorie
      if (filters.category && course.category !== filters.category) {
        return false;
      }

      // Filtre par niveau
      if (filters.level && course.level !== filters.level) {
        return false;
      }

      // Filtre par type
      if (filters.type && course.type !== filters.type) {
        return false;
      }

      // Recherche textuelle
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        return (
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }

  resetFilters() {
    this.filterForm.reset();
    this.filteredCourses = this.courses;
  }
}
```

**course-filter.component.html**
```html
<div class="course-filter-page">
  <h2>Cours de {{ currentUser?.classe }}</h2>

  <!-- Formulaire de filtrage -->
  <mat-card class="filter-card">
    <mat-card-content>
      <form [formGroup]="filterForm" class="filter-form">
        <!-- Recherche textuelle -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Rechercher un cours</mat-label>
          <input matInput formControlName="searchText" placeholder="Titre, description...">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <!-- Filtres -->
        <div class="filters-row">
          <!-- Matière -->
          <mat-form-field appearance="outline">
            <mat-label>Matière</mat-label>
            <mat-select formControlName="matiere">
              <mat-option value="">Toutes</mat-option>
              <mat-option *ngFor="let matiere of matieres" [value]="matiere.id">
                {{ matiere.icone }} {{ matiere.nom }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Catégorie -->
          <mat-form-field appearance="outline">
            <mat-label>Catégorie</mat-label>
            <mat-select formControlName="category">
              <mat-option value="">Toutes</mat-option>
              <mat-option *ngFor="let cat of categories" [value]="cat">
                {{ cat }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Niveau -->
          <mat-form-field appearance="outline">
            <mat-label>Niveau</mat-label>
            <mat-select formControlName="level">
              <mat-option value="">Tous</mat-option>
              <mat-option *ngFor="let level of levels" [value]="level">
                {{ level }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Type -->
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select formControlName="type">
              <mat-option value="">Tous</mat-option>
              <mat-option *ngFor="let type of types" [value]="type">
                {{ type }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <button mat-raised-button (click)="resetFilters()" type="button">
          <mat-icon>clear</mat-icon> Réinitialiser
        </button>
      </form>
    </mat-card-content>
  </mat-card>

  <!-- Résultats -->
  <div class="results-info">
    <p>{{ filteredCourses.length }} cours trouvés</p>
  </div>

  <div *ngIf="loading" class="loading">
    <mat-spinner></mat-spinner>
  </div>

  <div class="courses-grid" *ngIf="!loading">
    <mat-card *ngFor="let course of filteredCourses" class="course-card">
      <img mat-card-image [src]="course.image" [alt]="course.title">
      <mat-card-header>
        <mat-card-title>{{ course.title }}</mat-card-title>
        <mat-card-subtitle>{{ course.category }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>{{ course.description }}</p>
        <mat-chip-list>
          <mat-chip color="primary" selected>{{ course.level }}</mat-chip>
          <mat-chip>{{ course.type }}</mat-chip>
        </mat-chip-list>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" [routerLink]="['/courses', course.id]">
          Voir le cours
        </button>
      </mat-card-actions>
    </mat-card>
  </div>

  <div *ngIf="!loading && filteredCourses.length === 0" class="empty-state">
    <mat-icon>school</mat-icon>
    <p>Aucun cours ne correspond à vos critères</p>
  </div>
</div>
```

### Composant d'Abonnement

**subscription.component.ts**
```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SubscriptionService } from '../services/subscription.service';
import { MatiereService } from '../services/matiere.service';
import { User, NiveauScolaire } from '../models/user.model';
import { Matiere } from '../models/matiere.model';
import { CreateSubscriptionPayload } from '../models/subscription.model';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html'
})
export class SubscriptionComponent implements OnInit {
  currentUser: User | null = null;
  subscriptionForm!: FormGroup;
  matieres: Matiere[] = [];
  selectedMatieres: string[] = [];
  loading = false;
  isElementaire = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private matiereService: MatiereService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Vérifier si déjà abonné
    if (this.authService.hasActiveSubscription()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.isElementaire = this.currentUser.niveauScolaire === 'ELEMENTAIRE';
    this.initForm();
    
    if (!this.isElementaire) {
      this.loadMatieres();
    }
  }

  initForm() {
    this.subscriptionForm = this.fb.group({
      matieres: [[], this.isElementaire ? [] : Validators.required]
    });
  }

  loadMatieres() {
    if (!this.currentUser?.classe) return;

    this.matiereService.getByClasse(this.currentUser.classe).subscribe({
      next: (matieres) => {
        this.matieres = matieres;
      },
      error: (error) => {
        console.error('Erreur chargement matières:', error);
      }
    });
  }

  onMatiereSelectionChange(matieres: string[]) {
    this.selectedMatieres = matieres;
    this.subscriptionForm.patchValue({ matieres });
  }

  subscribe() {
    if (!this.currentUser) return;

    // Validation pour non-ELEMENTAIRE
    if (!this.isElementaire && this.selectedMatieres.length !== 3) {
      alert('Vous devez sélectionner exactement 3 matières');
      return;
    }

    this.loading = true;

    const payload: CreateSubscriptionPayload = {
      userId: this.currentUser.uid,
      classe: this.currentUser.classe!,
      niveauScolaire: this.currentUser.niveauScolaire!,
      typeAbonnement: this.isElementaire ? 'CLASSE' : 'MATIERE',
      matieres: this.isElementaire ? undefined : this.selectedMatieres
    };

    this.subscriptionService.createPayment(payload).subscribe({
      next: (response) => {
        // Rediriger vers Wave pour le paiement
        window.location.href = response.paymentUrl;
      },
      error: (error) => {
        console.error('Erreur création abonnement:', error);
        this.loading = false;
      }
    });
  }
}
```

**subscription.component.html**
```html
<div class="subscription-page">
  <mat-card class="subscription-card">
    <mat-card-header>
      <mat-card-title>Abonnement Annuel</mat-card-title>
      <mat-card-subtitle>{{ currentUser?.classe }} - {{ currentUser?.niveauScolaire }}</mat-card-subtitle>
    </mat-card-header>

    <mat-card-content>
      <div class="pricing">
        <h2>5 000 FCFA / an</h2>
        <p class="price-desc">Accès illimité pendant 1 an</p>
      </div>

      <!-- Pour ELEMENTAIRE -->
      <div *ngIf="isElementaire" class="elementaire-info">
        <mat-icon>info</mat-icon>
        <p>
          En tant qu'élève du niveau <strong>ELEMENTAIRE</strong>, 
          vous aurez accès à <strong>toutes les matières</strong> de votre classe.
        </p>
      </div>

      <!-- Pour MOYEN/SECONDAIRE/UNIVERSITAIRE -->
      <div *ngIf="!isElementaire" class="matiere-selection">
        <p>Choisissez 3 matières auxquelles vous souhaitez accéder:</p>
        <app-matiere-selector
          [niveau]="currentUser!.niveauScolaire!"
          [classe]="currentUser!.classe"
          [maxSelection]="3"
          (selectionChange)="onMatiereSelectionChange($event)">
        </app-matiere-selector>
      </div>

      <div class="features">
        <h3>Inclus dans l'abonnement:</h3>
        <ul>
          <li><mat-icon>check_circle</mat-icon> Cours vidéo</li>
          <li><mat-icon>check_circle</mat-icon> Documents PDF</li>
          <li><mat-icon>check_circle</mat-icon> Exercices pratiques</li>
          <li><mat-icon>check_circle</mat-icon> Certificat de participation</li>
          <li *ngIf="isElementaire"><mat-icon>check_circle</mat-icon> Toutes les matières</li>
          <li *ngIf="!isElementaire"><mat-icon>check_circle</mat-icon> 3 matières de votre choix</li>
        </ul>
      </div>
    </mat-card-content>

    <mat-card-actions>
      <button 
        mat-raised-button 
        color="primary" 
        [disabled]="loading || (!isElementaire && selectedMatieres.length !== 3)"
        (click)="subscribe()">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <span *ngIf="!loading">Procéder au paiement</span>
      </button>
      <button mat-button [routerLink]="['/dashboard']">Annuler</button>
    </mat-card-actions>
  </mat-card>
</div>
```

---

## 🔧 Pipes & Filtres

### filter-courses.pipe.ts
```typescript
import { Pipe, PipeTransform } from '@angular/core';
import { Course } from '../models/course.model';

@Pipe({
  name: 'filterCourses'
})
export class FilterCoursesPipe implements PipeTransform {
  transform(
    courses: Course[], 
    filters: {
      matiere?: string;
      category?: string;
      level?: string;
      type?: string;
      search?: string;
    }
  ): Course[] {
    if (!courses) return [];
    
    return courses.filter(course => {
      if (filters.matiere && course.matiereId !== filters.matiere) return false;
      if (filters.category && course.category !== filters.category) return false;
      if (filters.level && course.level !== filters.level) return false;
      if (filters.type && course.type !== filters.type) return false;
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }
}
```

### duration-format.pipe.ts
```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationFormat'
})
export class DurationFormatPipe implements PipeTransform {
  transform(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours}h${remainingMinutes}min` 
      : `${hours}h`;
  }
}
```

**Utilisation:**
```html
<span>{{ course.duration | durationFormat }}</span>
<!-- Affiche: "2h30min" ou "45min" -->
```

---

## ⚠️ Gestion des Erreurs

### error-handler.service.ts
```typescript
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Requête invalide';
            break;
          case 401:
            errorMessage = 'Non autorisé - Veuillez vous connecter';
            break;
          case 403:
            errorMessage = 'Accès refusé';
            break;
          case 404:
            errorMessage = 'Ressource non trouvée';
            break;
          case 409:
            errorMessage = 'Conflit - Ressource déjà existante';
            break;
          case 500:
            errorMessage = 'Erreur serveur';
            break;
          default:
            errorMessage = `Erreur ${error.status}: ${error.statusText}`;
        }
      }
    }

    console.error('Erreur API:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Une erreur inattendue est survenue';
  }
}
```

---

## 🎯 Cas d'Usage Complets

### 1. Affichage des cours pour l'utilisateur connecté

```typescript
// Dans le composant Dashboard
ngOnInit() {
  this.authService.currentUser$.subscribe(user => {
    if (user?.classe) {
      // Charger UNIQUEMENT les cours de la classe de l'utilisateur
      this.courseService.getByClasse(user.classe).subscribe(courses => {
        this.userCourses = courses;
      });
    }
  });
}
```

### 2. Filtrage par matière

```typescript
// Dans le composant Courses
filterByMatiere(matiereId: string) {
  this.courseService.getByMatiere(matiereId).subscribe(courses => {
    this.filteredCourses = courses.filter(c => 
      c.classe === this.currentUser?.classe // Double filtrage: matière ET classe
    );
  });
}
```

### 3. Recherche multi-critères

```typescript
searchCourses(criteria: {
  classe: string;
  matieres?: string[];
  category?: string;
  level?: string;
  searchText?: string;
}) {
  this.courseService.getByClasse(criteria.classe).subscribe(allCourses => {
    let filtered = allCourses;

    // Filtrer par matières
    if (criteria.matieres && criteria.matieres.length > 0) {
      filtered = filtered.filter(c => 
        criteria.matieres!.includes(c.matiereId || '')
      );
    }

    // Filtrer par catégorie
    if (criteria.category) {
      filtered = filtered.filter(c => c.category === criteria.category);
    }

    // Filtrer par niveau
    if (criteria.level) {
      filtered = filtered.filter(c => c.level === criteria.level);
    }

    // Recherche textuelle
    if (criteria.searchText) {
      const search = criteria.searchText.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search)
      );
    }

    this.searchResults = filtered;
  });
}
```

### 4. Vérification d'accès à un cours

```typescript
canAccessCourse(course: Course): Observable<boolean> {
  return this.authService.currentUser$.pipe(
    map(user => {
      if (!user) return false;

      // Vérifier la classe
      if (course.classe !== user.classe) return false;

      // Vérifier l'abonnement actif
      if (!user.hasActiveSubscription) return false;

      // Pour ELEMENTAIRE, accès à tout
      if (user.niveauScolaire === 'ELEMENTAIRE') return true;

      // Pour autres niveaux, vérifier les matières de l'abonnement
      return this.subscriptionService.getActiveSubscription(user.uid).pipe(
        map(sub => {
          if (!sub || !sub.matieres) return false;
          return sub.matieres.includes(course.matiereId || '');
        })
      );
    })
  );
}
```

### 5. Initialisation complète d'un Dashboard

```typescript
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  courses: Course[] = [];
  matieres: Matiere[] = [];
  subscription: Subscription | null = null;
  stats = {
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0
  };

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private matiereService: MatiereService,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.loadDashboardData();
      }
    });
  }

  loadDashboardData() {
    if (!this.currentUser) return;

    // Charger en parallèle
    Promise.all([
      this.courseService.getByClasse(this.currentUser.classe!).toPromise(),
      this.matiereService.getByClasse(this.currentUser.classe!).toPromise(),
      this.subscriptionService.getActiveSubscription(this.currentUser.uid).toPromise()
    ]).then(([courses, matieres, subscription]) => {
      this.courses = courses || [];
      this.matieres = matieres || [];
      this.subscription = subscription || null;

      // Filtrer les cours accessibles selon l'abonnement
      if (this.subscription) {
        if (this.currentUser!.niveauScolaire !== 'ELEMENTAIRE') {
          // Filtrer par matières d'abonnement
          this.courses = this.courses.filter(c =>
            this.subscription!.matieres?.includes(c.matiereId || '')
          );
        }
        // Pour ELEMENTAIRE, tous les cours sont accessibles
      }

      this.calculateStats();
    });
  }

  calculateStats() {
    this.stats.totalCourses = this.courses.length;
    // Implémenter la logique de progression...
  }
}
```

---

## 📝 Notes Importantes

### Règles Métier

1. **Niveau ELEMENTAIRE**:
   - TypeAbonnement: `CLASSE`
   - Accès à TOUTES les matières de la classe
   - Pas de sélection de matières dans l'UI

2. **Niveaux MOYEN/SECONDAIRE/UNIVERSITAIRE**:
   - TypeAbonnement: `MATIERE`
   - Choix de **exactement 3 matières**
   - Validation stricte côté API

3. **Hiérarchie des filtres**:
   ```
   Niveau Scolaire → Classe → Matière → Catégorie
   ```

4. **Prix uniforme**: 5000 FCFA/an pour tous les niveaux

### Sécurité

- **Token JWT**: Automatiquement ajouté via `AuthInterceptor`
- **Validation côté serveur**: Ne jamais faire confiance au client
- **Guards Angular**: Protéger les routes sensibles

**auth.guard.ts**
```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.getCurrentUser()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
```

### Performance

1. **Lazy Loading** des modules
2. **Pagination** pour listes longues
3. **Cache** les matières (changent rarement)
4. **Debounce** sur la recherche (300ms)

```typescript
// Exemple de debounce sur recherche
this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged()
).subscribe(search => {
  this.applyFilters();
});
```

---

## 📚 Ressources Supplémentaires

- **Swagger UI**: https://us-central1-myschool-f862b.cloudfunctions.net/api/api-docs
- **Documentation Backend**: Voir `SUBSCRIPTION_API_TESTS.md`
- **Modèles métier**: Voir `MODELE_METIER.md`
- **Paiement Wave**: Voir `WAVE_PAYMENT_FLOW.md`

---

**Version**: 1.0  
**Dernière mise à jour**: 10 janvier 2026  
**Auteur**: Équipe MySchool Dev
