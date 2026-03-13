# Erreur de Paiement: "Impossible de déterminer la classe à partir des matières"

## 🔴 Symptômes

Lors de la création d'un paiement pour un abonnement (MOYEN/SECONDAIRE/UNIVERSITAIRE), l'utilisateur reçoit cette erreur:
```
{
  success: false,
  message: 'Impossible de déterminer la classe à partir des matières sélectionnées'
}
```

## 🔍 Causes Possibles

### 1. **Matières non initialisées en production** ⚠️ CAUSE LA PLUS COMMUNE
- Les matières n'ont pas été créées dans Firestore avec `isActive: true`
- Solution: Réexécuter le script d'initialisation

### 2. **Matières inactives** 
- Les matières existent mais sont marquées comme `isActive: false`
- Solution: Les réactiver ou réinitialiser

### 3. **Discordance dans les noms de matières**
- Le frontend envoie des noms de matières qui ne correspondent pas exactement aux noms en Firestore (casse, espaces)
- Solution: Vérifier la correspondance des noms

### 4. **Problème lors du déploiement**
- Les matières locales ne match pas avec la prod
- Solution: Vérifier le déploiement depuis la dernière modification

## 🛠️ Étapes de Diagnostic

### Étape 1: Exécuter le diagnostic des matières

```bash
node diagnose-matieres.js
```

Ce script vérifiera:
- ✅ Le nombre total de matières
- ✅ Le nombre de matières actives/inactives par niveau
- ✅ La disponibilité des matières requises
- ✅ Les problèmes de recherche Firestore

**Sortie exemple problématique:**
```
📊 Total de documents: 0

❌ ERREUR: Aucune matière trouvée! Exécutez: npm run init-matieres
```

### Étape 2: Réinitialiser les matières

Si les matières ne sont pas trouvées ou sont inactives:

```bash
npm run init-matieres
```

**Sortie attendue:**
```
🚀 Initialisation des matières...

📚 Classe: CM2
  ✅ Mathématiques (créée/mise à jour)
  ✅ Français (créée/mise à jour)
  (...autres matières...)

✅ Initialisation terminée! XXX matières créées/mises à jour
```

### Étape 3: Vérifier après réinitialisation

```bash
node diagnose-matieres.js
```

Devrait afficher:
```
✅ Actives: 6    (exemple pour MOYEN)
❌ Inactives: 0
📊 Total: 6
```

## 🚀 En Production

### Option 1: Via Cloud Functions (Recommandé)

Si vous n'avez pas d'accès terminal à Firebase Hosting:

1. Créer une fonction Cloud Function pour initialiser les matières
2. Appeler l'endpoint via HTTP POST depuis le frontend

### Option 2: Via Firebase CLI

```bash
# Assurez-vous d'être connecté
firebase login

# Exécuter le script localement (il utilisera serviceAccountKey.json en prod)
node init-matieres.js

# Ou créer un script spécial pour la prod
npm run init-matieres
```

### Option 3: Créer une fonction Cloud Function de maintenance

Fichier: `functions/src/maintenance.function.ts`

```typescript
export const reinitMatieres = onRequest(async (req, res) => {
  // Vérifier l'autorisation admin
  if (req.query.token !== process.env.MAINTENANCE_TOKEN) {
    res.status(403).json({ error: 'Non autorisé' });
    return;
  }

  // Appeler le script d'init
  const result = await initializeMatieres();
  res.json(result);
});
```

Puis accéder via:
```
POST https://us-central1-myschool-f862b.cloudfunctions.net/reinitMatieres?token=YOUR_TOKEN
```

## 🧪 Test de Création de Paiement

Après avoir réinitialisé les matières:

```bash
curl -X POST https://api-xa66eyezzq-uc.a.run.app/api/subscriptions/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-test",
    "niveauScolaire": "MOYEN",
    "typeAbonnement": "MATIERE",
    "matieres": ["Mathématiques", "Physique-Chimie", "SVT"]
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "paymentId": "payment-xxx",
    "subscriptionId": "subscription-xxx",
    "checkoutUrl": "https://checkout.wave.com/..."
  }
}
```

## 📊 Structure des Matières

Les matières doivent avoir cette structure en Firestore:

```typescript
{
  nom: "Mathématiques",              // Doit correspondre exactement
  niveauScolaire: "MOYEN",           // ELEMENTAIRE | MOYEN | SECONDAIRE | UNIVERSITAIRE
  classe: "3ème (BFEM)",             // Classe associée
  isActive: true,                    // CRITIQUE: DOIT être true
  icone: "🔢",
  ordre: 1,
  description: "Cours de mathématiques",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🔗 Logs Utiles

Vérifier les logs Cloud Functions:

```bash
firebase functions:log --only subscriptions
```

Chercher les lignes:
- `❌ Matière "XXX" non trouvée` → Matière inexistante
- `⚠️ Matière trouvée mais INACTIVE` → Matière `isActive: false`
- `Matières disponibles pour MOYEN:` → Liste ce qui est trouvé

## ✅ Checklist de Résolution

- [ ] Exécuter `node diagnose-matieres.js`
- [ ] Si 0 matière: Exécuter `npm run init-matieres`
- [ ] Si matières inactives: Exécuter `npm run init-matieres` (reactivation)
- [ ] Vérifier les logs Cloud Functions
- [ ] Tester l'endpoint create-payment avec un cas réel
- [ ] Vérifier que les noms de matières correspondent entre frontend et backend
- [ ] Après déploiement en prod: Réexécuter le diagnostic en prod

## 📞 Support Supplémentaire

Si le problème persiste:

1. Vérifier que `serviceAccountKey.json` est au bon endroit
2. Vérifier la variable `databaseId: 'myschool-1'` dans les fichiers de configuration
3. Vérifier que le projet Firebase est correctement lié: `firebase use myschool-f862b`
4. Consulter les logs des Cloud Functions pour messages d'erreur détaillés
