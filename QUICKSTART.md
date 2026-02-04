# 🚀 GUIDE DE DÉMARRAGE RAPIDE - Système par Classe

## ⏱️ 15 minutes pour être opérationnel

---

## Étape 1 : Migration des données (5 min)

### Test en dry-run (recommandé)

```bash
npm run migrate
```

Ce mode **DRY RUN** ne modifie rien - il montre seulement ce qui serait changé.

**Résultats attendus** :
```
[DRY RUN] Utilisateurs à mettre à jour: X
[DRY RUN] Cours à mettre à jour: Y
[DRY RUN] Abonnements à mettre à jour: Z
[DRY RUN] Matières à mettre à jour: W
```

### Exécution réelle

```bash
npm run migrate -- --real
```

⚠️ **ATTENTION** : Cette commande modifie les données en base !

**Résultats attendus** :
```
✅ Utilisateurs mis à jour: X
✅ Cours mis à jour: Y
✅ Abonnements mis à jour: Z
✅ Matières mises à jour: W
```

---

## Étape 2 : Initialisation des matières (2 min)

```bash
npm run init-matieres
```

**Ce script crée** :
- 5 matières pour **CM2** (Maths, Français, Anglais, Sciences, Histoire-Géo)
- 6 matières pour **3ème (BFEM)** (Maths, PC, SVT, Français, Anglais, Histoire-Géo)
- 6 matières pour **Terminale S** (Maths, PC, SVT, Français, Philo, Anglais)
- 5 matières pour **Licence 2** (Maths, Physique, Info, Chimie, Économie)

**Total** : ~22 matières créées

---

## Étape 3 : Build et déploiement (5 min)

```bash
# Build TypeScript
cd functions
npm run build

# Déployer sur Firebase
cd ..
firebase deploy --only functions
```

**Attendre le déploiement** (2-3 minutes)

---

## Étape 4 : Tests rapides (3 min)

### Test 1 : Classes disponibles

```bash
curl https://api-xa66eyezzq-uc.a.run.app/api/users/classes-disponibles
```

**Résultat attendu** : Objet avec ELEMENTAIRE, MOYEN, SECONDAIRE, UNIVERSITAIRE

---

### Test 2 : Matières pour Licence 2

```bash
curl https://api-xa66eyezzq-uc.a.run.app/api/matieres/classe/Licence%202
```

**Résultat attendu** : 5 matières (Maths, Physique, Info, Chimie, Économie)

---

### Test 3 : Création utilisateur avec classe

```bash
curl -X POST https://api-xa66eyezzq-uc.a.run.app/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Test123!",
    "phone": "221771234567",
    "niveauScolaire": "UNIVERSITAIRE",
    "classe": "Licence 2",
    "role": { "libelle": "student" }
  }'
```

**Résultat attendu** : `{ success: true, data: {...} }`

---

## ✅ Checklist post-déploiement

- [ ] Migration exécutée sans erreur
- [ ] Matières créées (vérifier dans Firestore console)
- [ ] Build functions réussi
- [ ] Déploiement Firebase OK
- [ ] Test 1 : Classes disponibles ✅
- [ ] Test 2 : Matières par classe ✅
- [ ] Test 3 : Création user avec classe ✅

---

## 🎯 Prochaines actions

### Pour l'admin

1. **Ajouter plus de matières** via Postman/API :
   ```bash
   curl -X POST https://api-xa66eyezzq-uc.a.run.app/api/matieres \
     -H "Content-Type: application/json" \
     -d '{
       "nom": "Algorithmique",
       "niveauScolaire": "UNIVERSITAIRE",
       "classe": "Licence 2",
       "icone": "💻",
       "ordre": 6,
       "description": "Introduction aux algorithmes"
     }'
   ```

2. **Créer matières pour autres classes** :
   - Licence 1, Licence 3
   - Terminale L, Terminale G
   - Autres classes selon besoins

### Pour le frontend

1. **Page d'inscription** :
   - Dropdown niveau scolaire
   - Dropdown classe (fetch de `/api/users/classes-disponibles/:niveau`)
   - Validation avant envoi

2. **Page abonnement** :
   - Fetch matières : `/api/matieres/classe/{userClasse}`
   - Si ELEMENTAIRE : Bouton "S'abonner à la classe"
   - Sinon : Sélection 3 matières + bouton "S'abonner"

3. **Page cours** :
   - Filtrer par classe : `/api/courses/classe/{userClasse}`
   - Afficher par matière si abonnement MATIERE

---

## 🐛 Dépannage

### Erreur : "classe obligatoire"
**Cause** : User créé sans classe  
**Solution** : Ajouter `classe` dans le body de création

### Erreur : "Classe n'existe pas pour ce niveau"
**Cause** : Classe invalide  
**Solution** : Vérifier classes valides via `/api/users/classes-disponibles`

### Erreur : "3 matières requises"
**Cause** : Abonnement MATIERE sans 3 matières  
**Solution** : Envoyer tableau de 3 IDs dans `matieres`

### Matières non trouvées
**Cause** : Script d'initialisation pas exécuté  
**Solution** : `npm run init-matieres`

---

## 📚 Documentation complète

- [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) - Vue d'ensemble
- [ADMIN_MATIERES_GUIDE.md](ADMIN_MATIERES_GUIDE.md) - Gestion matières
- [ARCHITECTURE_METIER.md](ARCHITECTURE_METIER.md) - Architecture détaillée

---

## 🎉 C'est terminé !

Votre système d'abonnement par classe est maintenant opérationnel.

**Les utilisateurs peuvent** :
- ✅ S'inscrire avec classe précise
- ✅ Voir les matières de leur classe
- ✅ Souscrire à un abonnement CLASSE (élémentaire) ou MATIERE (autres)
- ✅ Accéder aux cours de leur classe/matières

**Les admins peuvent** :
- ✅ Créer/modifier/supprimer des matières
- ✅ Voir les abonnements par classe
- ✅ Gérer le contenu par classe/matière

**Le système gère** :
- ✅ Contrôle d'accès automatique
- ✅ Validation classe + matières
- ✅ Migration des données existantes
- ✅ Compatibilité temporaire ancien système

---

**Prêt pour la production !** 🚀
