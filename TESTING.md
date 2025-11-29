# Tests

## Structure des tests

Le projet dispose d'une suite de tests complète comprenant :

### Tests des routes (Integration Tests)
Tests des endpoints API utilisant Supertest :
- `src/__tests__/routes/user.routes.test.ts` - Tests des endpoints utilisateurs
- `src/__tests__/routes/enrollment.routes.test.ts` - Tests des endpoints inscriptions
- `src/__tests__/routes/course.routes.test.ts` - Tests des endpoints cours
- `src/__tests__/routes/instructor.routes.test.ts` - Tests des endpoints formateurs
- `src/__tests__/routes/chapter.routes.test.ts` - Tests des endpoints chapitres
- `src/__tests__/routes/lesson.routes.test.ts` - Tests des endpoints leçons
- `src/__tests__/routes/exercise.routes.test.ts` - Tests des endpoints exercices

### Tests des services (Unit Tests)
Tests unitaires des services avec mocks Firestore :
- `src/__tests__/services/user.service.test.ts` - Tests du service utilisateurs
- `src/__tests__/services/enrollment.service.test.ts` - Tests du service inscriptions
- `src/__tests__/services/course.service.test.ts` - Tests du service cours
- `src/__tests__/services/instructor.service.test.ts` - Tests du service formateurs
- `src/__tests__/services/chapter.service.test.ts` - Tests du service chapitres
- `src/__tests__/services/lesson.service.test.ts` - Tests du service leçons
- `src/__tests__/services/exercise.service.test.ts` - Tests du service exercices

## Exécution des tests

### Lancer tous les tests
```bash
npm test
```

### Mode watch (développement)
```bash
npm run test:watch
```

### Générer un rapport de couverture
```bash
npm run test:coverage
```

Le rapport de couverture sera disponible dans le dossier `coverage/` :
- `coverage/lcov-report/index.html` - Rapport HTML détaillé
- `coverage/lcov.info` - Fichier LCOV pour CI/CD

## Configuration

La configuration Jest se trouve dans `jest.config.js` :
- Preset TypeScript : `ts-jest`
- Pattern de test : `src/__tests__/**/*.test.ts`
- Environnement : Node.js
- Couverture activée pour tous les fichiers dans `src/`

## Notes importantes

### Tests des routes
- Utilisent l'application Express réelle
- Nécessitent une connexion à Firestore
- Utilisent des IDs réels de la base de données
- Testent les flux complets (requête → route → service → Firestore)

### Tests des services
- Utilisent des mocks Firestore pour l'isolation
- Tests unitaires purs sans dépendances externes
- Vérifient la logique métier de chaque service

## Bonnes pratiques

1. **Avant de commiter** : Lancez `npm test` pour vérifier que tous les tests passent
2. **Nouvelle fonctionnalité** : Ajoutez des tests correspondants
3. **Bug fix** : Ajoutez un test qui reproduit le bug avant de le corriger
4. **Couverture** : Visez au moins 80% de couverture de code

## Dépannage

### Les tests échouent avec des erreurs Firestore
- Vérifiez que votre fichier `.env` est configuré correctement
- Assurez-vous que le service account est valide
- Vérifiez la connexion à la base de données "myschool-1"

### Timeout errors
- Augmentez le timeout Jest dans la configuration si nécessaire
- Vérifiez la performance de votre connexion Firestore
