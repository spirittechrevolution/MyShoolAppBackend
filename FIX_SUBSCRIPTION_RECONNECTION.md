# 🔍 Diagnostic & Fix: Les utilisateurs perdent accès après reconnexion

## 🔴 Problème Identifié

Après qu'un utilisateur se subscribe et se reconnecte, il demande une subscription au lieu d'accéder au cours.

### Causes Trouvées:

**1️⃣ Abonnements PENDING non activés**
- 13 abonnements en statut PENDING dans la base de données
- 0 paiements associés à ces abonnements  
- Les utilisateurs ont créé une session de paiement Wave mais n'ont jamais:
  - Complété le paiement
  - OU le webhook Wave n'a pas activé l'abonnement
  - OU l'abonnement n'a jamais été créé correctement

**2️⃣ Flux de paiement rompu**
```
Frontend → createSubscriptionPayment
  ↓
✅ Subscription créé (PENDING)
✅ Payment document créé (PENDING)
  ↓
Frontend redirige vers Wave checkout URL
  ↓
❌ Utilisateur paye OU ferme le paiement
  ✗ Webhook n'est pas appelé OU échoue silencieusement
❌ Abonnement reste PENDING
❌ hasActiveSubscription = false
  ↓
Utilisateur reconnecte et n'a pas accès aux cours
```

**3️⃣ User document non mis à jour**
- `hasActiveSubscription` reste `false` ou `undefined`
- `subscriptionStatus` reste `undefined`
- Même si une subscription existe, elle n'est pas visible au système

## ✅ Solution Implémentée

### Backend Changes (✅ DÉPLOYÉ)

#### 1. Nouveau endpoint: `GET /api/subscriptions/sync-status/:userId`

Ce endpoint:
1. Récupère le vrai statut de l'abonnement depuis Firestore
2. Met à jour le user document avec les bonnes valeurs
3. Retourne les informations d'accès actualisées

**Réponse (abonnement ACTIF):**
```json
{
  "success": true,
  "data": {
    "synced": true,
    "hasActiveSubscription": true,
    "subscription": {
      "id": "abc123",
      "classe": "4ème",
      "typeAbonnement": "MATIERE",
      "niveauScolaire": "MOYEN",
      "endDate": "2026-03-10T...",
      "matieres": ["Français", "Mathématiques", "Pc collège"]
    }
  },
  "message": "Abonnement synchronisé avec succès"
}
```

**Réponse (pas d'abonnement)**:
```json
{
  "success": true,
  "data": {
    "synced": true,
    "hasActiveSubscription": false,
    "subscription": null
  },
  "message": "Statut synchronisé: pas d'abonnement actif"
}
```

#### 2. Amélioration de `getActiveSubscription()`

La méthode met maintenant à jour le user document:
- Quand elle trouve un abonnement ACTIF → met à jour `hasActiveSubscription: true`
- Quand elle ne trouve rien → met à jour `hasActiveSubscription: false`
- Gère automatiquement l'expiration des abonnements

#### 3. Synchronisation du middleware d'accès

Le middleware `checkCourseAccess` utilise maintenant `getActiveSubscription()` qui met à jour les informations de l'utilisateur en temps réel.

---

## 📱 Frontend Implementation Guide

### Étape 1: Adapter le service d'authentification

Après que l'utilisateur se connecte avec succès, appelez le nouvel endpoint:

```typescript
// auth.service.ts
async login(email: string, password: string): Promise<User> {
  const result = await firebase.auth().signInWithEmailAndPassword(email, password);
  const user = result.user;
  
  // ✅ NOUVEAU: Synchroniser le statut de l'abonnement
  await this.syncSubscriptionStatus(user.uid);
  
  return user;
}

private async syncSubscriptionStatus(userId: string): Promise<void> {
  try {
    const response = await fetch(
      `https://api-xa66eyezzq-uc.a.run.app/api/subscriptions/sync-status/${userId}`
    );
    const result = await response.json();
    
    if (result.success) {
      // Mettre en cache les informations d'accès
      localStorage.setItem('userSubscription', JSON.stringify(result.data));
      console.log('✅ Subscription status synced');
    }
  } catch (error) {
    console.warn('⚠️ Could not sync subscription status:', error);
    // Continuer même si la sync échoue - l'accès sera vérifié sur demande
  }
}
```

### Étape 2: Améliorer le vérificateur d'accès aux cours

```typescript
// course.service.ts ou course-access.service.ts

async canAccessCourse(courseId: string, userId: string): Promise<boolean> {
  try {
    // 1. Récupérer les infos d'accès mises en cache
    const cachedSub = JSON.parse(localStorage.getItem('userSubscription') || 'null');
    if (cachedSub?.hasActiveSubscription) {
      // L'utilisateur a un abonnement - très probable qu'il ait accès
      return true;
    }
    
    // 2. Sinon, faire une vérification en temps réel
    const response = await fetch(
      `https://api-xa66eyezzq-uc.a.run.app/api/subscriptions/check-course-access/${userId}/${courseId}`
    );
    const result = await response.json();
    
    //  3. Si pas accès, cette vérification met à jour le user document automatiquement
    // Si le user a un abonnement expiré, le backend l'aura marqué comme expiré
    return result.data?.hasAccess || false;
    
  } catch (error) {
    console.error('Error checking course access:', error);
    return false;
  }
}
```

### Étape 3: Afficher l'état d'accès correct

```typescript
// course-list.component.ts

displayCourse(course: Course): void {
  const userSubscription = JSON.parse(localStorage.getItem('userSubscription') || 'null');
  
  course.accessInfo = {
    hasAccess: userSubscription?.hasActiveSubscription || false,
    subscriptionType: userSubscription?.subscription?.typeAbonnement,
    subscriptionEndDate: userSubscription?.subscription?.endDate,
    requiresSubscription: true
  };
}
```

### Étape 4: Gérer la mise en cache

```typescript
// Avant de naviguer/recharger
window.addEventListener('beforeunload', () => {
  // Conserver les informations d'accès en cache
  // Elles seront mises à jour au prochain login
});

// On logout  
async logout(): Promise<void> {
  localStorage.removeItem('userSubscription');
  await firebase.auth().signOut();
}
```

---

## 🔧 Architecture Améliorée

```
┌─────────────────────────────────────────┐
│ Utilisateur se reconnecte                │
└──────────────────┬──────────────────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ Login successful    │
        │ Firebase Auth OK    │
        └──────────┬──────────┘
                   │
                   ▼
    ┌──────────────────────────────────┐
    │ POST /api/subscriptions/         │
    │        sync-status/:userId       │
    └──────────────┬───────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                      ▼
   ✅ ACTIF               ❌ INACTIF
   └─► hasActiveSubscription = true
       │
       ▼
   Cache localement
   localStorage['userSubscription']
       │
       ▼
   ✅ Utilisateur peut accéder aux cours
```

---

## ✅ Checklist Déploiement

- ✅ Backend changes déployées à Firebase
- ✅ Nouvel endpoint `/sync-status/:userId` disponible
- ✅ `getActiveSubscription()` met à jour user docs
- ⏳ Frontend adaptation (À faire par l'équipe Frontend)
  - [ ] Appeler `/sync-status` après login
  - [ ] Mettre en cache les infos d'abonnement
  - [ ] Afficher l'accès correct aux utilisateurs
  - [ ] Gérer le logout (nettoyer le cache)
  - [ ] Retester l'accès après reconnexion

---

## 🧪 Test Local

Pour tester le nouveau endpoint:

```bash
# 1. Obtenir un userId (ex: Y1uiYrCsrAMMNIBtxNEwuFHWK992)
# 2. Le user doit avoir un abonnement ACTIF en BD

curl -X GET "http://localhost:5001/myschool-f862b/us-central1/api/subscriptions/sync-status/Y1uiYrCsrAMMNIBtxNEwuFHWK992" \
  -H "Content-Type: application/json"

# Réponse attendue:
# {
#   "success": true,
#   "data": {
#     "synced": true,
#     "hasActiveSubscription": true,
#     "subscription": { ... }
#   }
# }
```

---

## 📊 Monitoring

Vérifier régulièrement:
1. Nombre d'abonnements PENDING (devrait diminuer après webhook calls)
2. Nombre d'utilisateurs avec `hasActiveSubscription = true` (devrait augmenter après sync)
3. Logs du webhook Wave pour voir les succès/erreurs d'activation


