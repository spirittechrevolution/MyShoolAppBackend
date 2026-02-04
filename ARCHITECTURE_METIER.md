# 🏗️ Architecture Métier MySchool

## Vue d'ensemble de la Hiérarchie

```
👤 UTILISATEUR
   │
   ├── Niveau Scolaire (choisi à l'inscription)
   │   ├── ELEMENTAIRE
   │   ├── MOYEN
   │   ├── SECONDAIRE
   │   └── UNIVERSITAIRE
   │
   └── Abonnement
       │
       ├── Si ELEMENTAIRE
       │   └── Choisir 1 CLASSE (CM1, CM2, etc.)
       │        └── Accès à TOUTES les MATIÈRES de cette classe
       │
       └── Si MOYEN/SECONDAIRE/UNIVERSITAIRE
           └── Choisir 3 MATIÈRES obligatoires
                └── Accès à TOUS les COURS de ces 3 matières
```

---

## 📝 Flux d'Inscription et d'Abonnement

### **Étape 1 : Inscription**

L'utilisateur crée son compte et **DOIT choisir son niveau scolaire** :

```
Inscription MySchool
├── Nom, Prénom, Email, Téléphone
├── Mot de passe
└── ⚠️ CHOIX OBLIGATOIRE : Niveau Scolaire
    ├── 📖 ELEMENTAIRE
    ├── 📘 MOYEN
    ├── 📗 SECONDAIRE
    └── 📕 UNIVERSITAIRE
```

**Ce niveau est enregistré dans le profil et détermine :**
- Les matières disponibles pour l'abonnement
- Le catalogue de cours accessibles
- L'organisation du contenu pédagogique

---

### **Étape 2 : Abonnement (selon le niveau)**

#### **Cas A : Niveau ELEMENTAIRE**

```
User : Amadou (10 ans)
Niveau choisi à l'inscription : ELEMENTAIRE
   │
   ├── Abonnement → Choisir UNE CLASSE
   │    ├── CI
   │    ├── CP
   │    ├── CE1
   │    ├── CE2
   │    ├── CM1
   │    └── CM2  ✅ (Amadou choisit CM2)
   │
   └── Accès débloqué : TOUS les cours de CM2
        ├── Mathématiques CM2
        ├── Français CM2
        ├── Anglais CM2
        ├── Sciences CM2
        ├── Histoire-Géo CM2
        └── Tous les autres cours CM2
```

#### **Cas B : Niveau MOYEN / SECONDAIRE / UNIVERSITAIRE**

```
User : Cheikh (17 ans)
Niveau choisi à l'inscription : SECONDAIRE
   │
   ├── Abonnement → Choisir 3 MATIÈRES obligatoires
   │    
   │    Matières disponibles pour SECONDAIRE :
   │    ├── Mathématiques Secondaire
   │    ├── Physique-Chimie Secondaire
   │    ├── SVT Secondaire
   │    ├── Français Secondaire
   │    ├── Anglais Secondaire
   │    ├── Histoire-Géo Secondaire
   │    ├── Philosophie Secondaire
   │    └── Informatique Secondaire
   │    
   │    ⚠️ Cheikh DOIT choisir EXACTEMENT 3 matières :
   │    ✅ Mathématiques Secondaire
   │    ✅ Physique-Chimie Secondaire
   │    ✅ SVT Secondaire
   │
   └── Accès débloqué : TOUS les cours de ces 3 matières
        │
        ├── 📐 Mathématiques Secondaire (tous les cours)
        │    ├── Cours Algèbre
        │    ├── Cours Géométrie
        │    ├── Cours Fonctions
        │    ├── Cours Analyse
        │    ├── Cours Probabilités
        │    └── ... (tous les autres cours de Maths Secondaire)
        │
        ├── ⚗️ Physique-Chimie Secondaire (tous les cours)
        │    ├── Cours Mécanique
        │    ├── Cours Électricité
        │    ├── Cours Optique
        │    ├── Cours Chimie Organique
        │    └── ... (tous les autres cours de PC Secondaire)
        │
        └── 🌿 SVT Secondaire (tous les cours)
             ├── Cours Biologie
             ├── Cours Géologie
             ├── Cours Corps Humain
             ├── Cours Génétique
             └── ... (tous les autres cours de SVT Secondaire)
```

---

## 🗂️ Structure Complète des Données

### **1. Utilisateur**
```
User {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  
  ⚠️ niveauScolaire: 'ELEMENTAIRE' | 'MOYEN' | 'SECONDAIRE' | 'UNIVERSITAIRE'
  // Choisi à l'inscription, détermine les options d'abonnement
}
```

### **2. Matière**
```
Matiere {
  id: string
  nom: string  // "Mathématiques", "Physique-Chimie", "SVT", etc.
  
  ⚠️ niveauScolaire: 'ELEMENTAIRE' | 'MOYEN' | 'SECONDAIRE' | 'UNIVERSITAIRE'
  // Une matière est liée à un niveau spécifique
  
  description: string
  icone: string
}

Exemples :
- Matiere { id: "mat_sec_1", nom: "Mathématiques", niveauScolaire: "SECONDAIRE" }
- Matiere { id: "mat_moy_1", nom: "Mathématiques", niveauScolaire: "MOYEN" }
- Matiere { id: "pc_sec_2", nom: "Physique-Chimie", niveauScolaire: "SECONDAIRE" }
```

### **3. Cours**
```
Cours {
  id: string
  titre: string  // "Algèbre", "Géométrie", "Fonctions", etc.
  description: string
  
  ⚠️ niveauScolaire: 'ELEMENTAIRE' | 'MOYEN' | 'SECONDAIRE' | 'UNIVERSITAIRE'
  ⚠️ matiereId: string  // Référence à la matière parente
  ⚠️ classe?: string     // Pour ELEMENTAIRE uniquement : "CM1", "CM2", etc.
  
  professeurId: string
  prix?: number          // Pour achat à la carte
  chapitres: Chapter[]
}

Exemples :
- Cours { titre: "Algèbre", niveauScolaire: "SECONDAIRE", matiereId: "mat_sec_1" }
- Cours { titre: "Maths CM2", niveauScolaire: "ELEMENTAIRE", classe: "CM2" }
```

### **4. Abonnement**
```
Abonnement {
  id: string
  userId: string
  
  ⚠️ niveauScolaire: 'ELEMENTAIRE' | 'MOYEN' | 'SECONDAIRE' | 'UNIVERSITAIRE'
  // Hérité du profil utilisateur
  
  ⚠️ typeAbonnement: 'CLASSE' | 'MATIERE'
  // CLASSE pour ELEMENTAIRE, MATIERE pour les autres niveaux
  
  // Pour ELEMENTAIRE
  classe?: string  // "CM1", "CM2", "CE1", etc.
  
  // Pour MOYEN/SECONDAIRE/UNIVERSITAIRE
  matieres?: string[]  // ["mat_sec_1", "pc_sec_2", "svt_sec_3"]
  // ⚠️ DOIT contenir EXACTEMENT 3 matières
  
  dateDebut: Date
  dateFin: Date      // +1 an
  prix: 5000         // FCFA
  statut: 'ACTIF' | 'EXPIRE' | 'ANNULE'
}

Exemple Elementaire :
{
  userId: "user123",
  niveauScolaire: "ELEMENTAIRE",
  typeAbonnement: "CLASSE",
  classe: "CM2",
  matieres: null,
  prix: 5000,
  statut: "ACTIF"
}

Exemple Secondaire :
{
  userId: "user456",
  niveauScolaire: "SECONDAIRE",
  typeAbonnement: "MATIERE",
  classe: null,
  matieres: ["mat_sec_1", "pc_sec_2", "svt_sec_3"],
  prix: 5000,
  statut: "ACTIF"
}
```

---

## 🔒 Règles Métier

### **Règle 1 : Choix du niveau à l'inscription**
- ✅ Obligatoire lors de la création du compte
- ✅ Détermine les options d'abonnement disponibles
- ⚠️ Ne peut pas être changé (sauf demande administrateur)

### **Règle 2 : Abonnement ELEMENTAIRE**
- ✅ L'utilisateur choisit UNE classe
- ✅ Accès à TOUTES les matières de cette classe
- ✅ Pas de limite de matières

### **Règle 3 : Abonnement MOYEN/SECONDAIRE/UNIVERSITAIRE**
- ⚠️ L'utilisateur DOIT choisir EXACTEMENT 3 matières
- ✅ Les matières proposées correspondent au niveau de l'utilisateur
- ✅ Accès à TOUS les cours de ces 3 matières
- ❌ Impossible de choisir 1, 2 ou 4+ matières

### **Règle 4 : Matières par niveau**
- ✅ Chaque matière est liée à un niveau spécifique
- ❌ Un utilisateur SECONDAIRE ne peut pas choisir une matière UNIVERSITAIRE
- ✅ "Mathématiques Secondaire" ≠ "Mathématiques Universitaire"

### **Règle 5 : Accès aux cours**
```
Vérification d'accès :
1. Récupérer le niveau de l'utilisateur
2. Récupérer ses abonnements actifs
3. Si ELEMENTAIRE :
   - Vérifier si cours.classe == abonnement.classe
4. Si MOYEN/SECONDAIRE/UNIVERSITAIRE :
   - Vérifier si cours.matiereId dans abonnement.matieres
5. Si pas d'abonnement :
   - Vérifier achat individuel du cours
```

### **Règle 6 : Prix unique**
- ✅ 5 000 FCFA/an pour tous les niveaux
- ✅ 5 000 FCFA = 1 classe (élémentaire) ou 3 matières (autres)

---

## 🎯 Exemples Concrets

### **Exemple 1 : Parcours Élémentaire**

```
1. Inscription
   └── Amadou (10 ans) → Niveau : ELEMENTAIRE

2. Abonnement (5000 FCFA/an)
   └── Choix : Classe CM2

3. Accès débloqué
   └── TOUS les cours avec :
        - niveauScolaire = "ELEMENTAIRE"
        - classe = "CM2"
   
   Résultat : 8 matières × 5 cours/matière = 40 cours disponibles
```

### **Exemple 2 : Parcours Secondaire**

```
1. Inscription
   └── Cheikh (17 ans) → Niveau : SECONDAIRE

2. Abonnement (5000 FCFA/an)
   └── Choix obligatoire de 3 matières :
        ✅ Mathématiques Secondaire (id: mat_sec_1)
        ✅ Physique-Chimie Secondaire (id: pc_sec_2)
        ✅ SVT Secondaire (id: svt_sec_3)

3. Accès débloqué
   └── TOUS les cours avec :
        - niveauScolaire = "SECONDAIRE"
        - matiereId dans ["mat_sec_1", "pc_sec_2", "svt_sec_3"]
   
   Résultat :
   - Maths : 15 cours
   - Physique-Chimie : 12 cours
   - SVT : 10 cours
   Total = 37 cours disponibles
```

### **Exemple 3 : Tentative Invalide**

```
❌ CAS INVALIDE 1 : Choix de 2 matières seulement

User : Fatou (Niveau : SECONDAIRE)
Abonnement : Maths + Physique seulement

Erreur : "Vous devez choisir exactement 3 matières"
```

```
❌ CAS INVALIDE 2 : Mauvais niveau de matière

User : Moussa (Niveau : MOYEN)
Abonnement : 
  - Mathématiques Moyen ✅
  - Physique Moyen ✅
  - Mathématiques Universitaire ❌ (mauvais niveau)

Erreur : "Les matières doivent correspondre à votre niveau (MOYEN)"
```

---

## 📊 Catalogue de Matières par Niveau

### **ELEMENTAIRE** (Pas d'abonnement par matière)
Les élèves s'abonnent à une **classe** et ont accès à toutes les matières :
- Mathématiques
- Français
- Anglais
- Sciences
- Histoire-Géographie
- Arts
- Sport
- Informatique

### **MOYEN** (Collège - 6ème à 3ème)
Matières disponibles pour sélection de 3 :
- Mathématiques Moyen
- Physique-Chimie Moyen
- SVT Moyen
- Français Moyen
- Anglais Moyen
- Espagnol Moyen
- Arabe Moyen
- Histoire-Géo Moyen
- Éducation Civique Moyen
- Informatique Moyen

### **SECONDAIRE** (Lycée - 2nde à Terminale)
Matières disponibles pour sélection de 3 :
- Mathématiques Secondaire
- Physique-Chimie Secondaire
- SVT Secondaire
- Français Secondaire
- Anglais Secondaire
- Espagnol Secondaire
- Arabe Secondaire
- Histoire-Géo Secondaire
- Philosophie Secondaire
- Informatique Secondaire
- Économie Secondaire

### **UNIVERSITAIRE**
Matières disponibles pour sélection de 3 (selon la filière) :
- Mathématiques Universitaire
- Physique Universitaire
- Chimie Universitaire
- Biologie Universitaire
- Informatique Universitaire
- Droit Universitaire
- Économie Universitaire
- Gestion Universitaire
- Littérature Universitaire
- Langues Universitaire

---

## 🔄 Flux d'Interface Utilisateur

### **1. Page d'Inscription**

```
┌─────────────────────────────────────┐
│  Créer votre compte MySchool        │
├─────────────────────────────────────┤
│                                      │
│  Nom : [___________]                 │
│  Prénom : [___________]              │
│  Email : [___________]               │
│  Téléphone : [___________]           │
│  Mot de passe : [___________]        │
│                                      │
│  ⚠️ Choisissez votre niveau :       │
│  ○ Élémentaire (CI à CM2)           │
│  ○ Moyen (6ème à 3ème)              │
│  ○ Secondaire (2nde à Terminale)    │
│  ○ Universitaire                     │
│                                      │
│        [S'INSCRIRE]                  │
└─────────────────────────────────────┘
```

### **2. Page d'Abonnement - Élémentaire**

```
┌─────────────────────────────────────┐
│  Votre abonnement (5 000 FCFA/an)   │
├─────────────────────────────────────┤
│                                      │
│  Vous êtes au niveau : ELEMENTAIRE   │
│                                      │
│  Choisissez votre classe :           │
│  ○ CI   ○ CP                        │
│  ○ CE1  ○ CE2                       │
│  ○ CM1  ● CM2  ✅                   │
│                                      │
│  Vous aurez accès à :                │
│  ✓ Mathématiques CM2                 │
│  ✓ Français CM2                      │
│  ✓ Anglais CM2                       │
│  ✓ Sciences CM2                      │
│  ✓ Tous les autres cours CM2        │
│                                      │
│        [PAYER 5 000 FCFA]            │
└─────────────────────────────────────┘
```

### **3. Page d'Abonnement - Secondaire**

```
┌─────────────────────────────────────┐
│  Votre abonnement (5 000 FCFA/an)   │
├─────────────────────────────────────┤
│                                      │
│  Vous êtes au niveau : SECONDAIRE    │
│                                      │
│  ⚠️ Choisissez 3 matières :         │
│  (2/3 sélectionnées)                 │
│                                      │
│  ☑ Mathématiques        [15 cours]  │
│  ☑ Physique-Chimie      [12 cours]  │
│  ☐ SVT                  [10 cours]  │
│  ☐ Français             [8 cours]   │
│  ☐ Anglais              [8 cours]   │
│  ☐ Histoire-Géo         [7 cours]   │
│  ☐ Philosophie          [5 cours]   │
│  ☐ Informatique         [6 cours]   │
│                                      │
│  ⚠️ Veuillez sélectionner 1 matière │
│  supplémentaire pour continuer       │
│                                      │
│        [CONTINUER]  (désactivé)      │
└─────────────────────────────────────┘

// Après sélection de 3 matières :

┌─────────────────────────────────────┐
│  Récapitulatif                       │
├─────────────────────────────────────┤
│  ✅ Mathématiques (15 cours)         │
│  ✅ Physique-Chimie (12 cours)       │
│  ✅ SVT (10 cours)                   │
│                                      │
│  Total : 37 cours accessibles        │
│  Prix : 5 000 FCFA/an                │
│                                      │
│        [PAYER 5 000 FCFA]  ✅       │
└─────────────────────────────────────┘
```

---

## 💡 Résumé Architecture Technique

```typescript
// Structure des collections Firestore

Collection: users
Document: {
  id: string
  nom: string
  prenom: string
  niveauScolaire: 'ELEMENTAIRE' | 'MOYEN' | 'SECONDAIRE' | 'UNIVERSITAIRE'  // ⚠️ Déterminant
}

Collection: matieres
Document: {
  id: string
  nom: string
  niveauScolaire: 'ELEMENTAIRE' | 'MOYEN' | 'SECONDAIRE' | 'UNIVERSITAIRE'  // ⚠️ Liée au niveau
  description: string
  icone: string
}

Collection: cours
Document: {
  id: string
  titre: string
  niveauScolaire: 'ELEMENTAIRE' | 'MOYEN' | 'SECONDAIRE' | 'UNIVERSITAIRE'
  matiereId: string           // ⚠️ Référence à la matière
  classe?: string             // ⚠️ Seulement pour ELEMENTAIRE
  professeurId: string
  chapitres: Reference[]
}

Collection: abonnements
Document: {
  id: string
  userId: string
  niveauScolaire: string      // ⚠️ Hérité du user
  typeAbonnement: 'CLASSE' | 'MATIERE'
  
  // Pour ELEMENTAIRE
  classe?: string
  
  // Pour MOYEN/SECONDAIRE/UNIVERSITAIRE
  matieres?: string[]         // ⚠️ Array de 3 IDs de matières
  
  dateDebut: Timestamp
  dateFin: Timestamp
  prix: 5000
  statut: string
}
```

---

## ✅ Validation des Règles

### **Lors de l'abonnement MOYEN/SECONDAIRE/UNIVERSITAIRE**

```typescript
function validerAbonnement(user, matieresSelectionnees) {
  // Règle 1 : Exactement 3 matières
  if (matieresSelectionnees.length !== 3) {
    throw Error("Vous devez choisir exactement 3 matières")
  }
  
  // Règle 2 : Les matières doivent correspondre au niveau du user
  for (let matiereId of matieresSelectionnees) {
    let matiere = getMatiereById(matiereId)
    if (matiere.niveauScolaire !== user.niveauScolaire) {
      throw Error(`La matière ${matiere.nom} ne correspond pas à votre niveau`)
    }
  }
  
  // Règle 3 : Pas de doublon
  if (new Set(matieresSelectionnees).size !== 3) {
    throw Error("Vous avez sélectionné la même matière plusieurs fois")
  }
  
  // ✅ Validation OK
  return true
}
```

### **Lors de la vérification d'accès à un cours**

```typescript
function verifierAccesCours(user, cours) {
  // Récupérer l'abonnement actif du user
  let abonnement = getAbonnementActif(user.id)
  
  if (!abonnement) {
    return verifierAchatIndividuel(user.id, cours.id)
  }
  
  // Vérifier le niveau
  if (cours.niveauScolaire !== user.niveauScolaire) {
    return false
  }
  
  // Cas ELEMENTAIRE
  if (abonnement.typeAbonnement === 'CLASSE') {
    return cours.classe === abonnement.classe
  }
  
  // Cas MOYEN/SECONDAIRE/UNIVERSITAIRE
  if (abonnement.typeAbonnement === 'MATIERE') {
    return abonnement.matieres.includes(cours.matiereId)
  }
  
  return false
}
```

---

## 🎯 Points Clés à Retenir

1. ✅ **Le niveau est choisi À L'INSCRIPTION** et détermine tout le reste
2. ✅ **Élémentaire** = Abonnement par CLASSE (accès à toutes les matières)
3. ✅ **Moyen/Secondaire/Universitaire** = Abonnement à **3 MATIÈRES exactement**
4. ✅ Les matières sont **liées à un niveau** (Maths Secondaire ≠ Maths Universitaire)
5. ✅ Un user ne peut choisir QUE des matières de son niveau
6. ✅ Prix unique : **5 000 FCFA/an** pour tous les niveaux

---

*Document créé le 4 février 2026*
