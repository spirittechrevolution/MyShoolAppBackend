# Documentation des Tests - MySchool Backend

## 📊 Vue d'ensemble

**Couverture globale**: 63.36%
- **114 tests** dans 14 suites de tests
- **100% de réussite** ✅

## 🧪 Architecture des Tests

### 1. Tests des Routes (`src/__tests__/routes/`)
Tests d'intégration utilisant Supertest pour tester les endpoints API réels.

#### Routes testées:
- ✅ **user.routes.test.ts** (9 tests) - Gestion des utilisateurs
- ✅ **course.routes.test.ts** (7 tests) - Gestion des cours
- ✅ **chapter.routes.test.ts** (8 tests) - Gestion des chapitres
- ✅ **lesson.routes.test.ts** (9 tests) - Gestion des leçons
- ✅ **exercise.routes.test.ts** (10 tests) - Gestion des exercices
- ✅ **instructor.routes.test.ts** (8 tests) - Gestion des instructeurs
- ✅ **enrollment.routes.test.ts** (9 tests) - Gestion des inscriptions

**Total Routes**: 60 tests

### 2. Tests des Services (`src/__tests__/services/`)
Tests unitaires utilisant des mocks Jest pour isoler la logique métier.

#### Services testés:
- ✅ **user.service.test.ts** (8 tests)
- ✅ **course.service.test.ts** (7 tests)
- ✅ **chapter.service.test.ts** (7 tests)
- ✅ **lesson.service.test.ts** (8 tests)
- ✅ **exercise.service.test.ts** (8 tests)
- ✅ **instructor.service.test.ts** (9 tests)
- ✅ **enrollment.service.test.ts** (8 tests)

**Total Services**: 54 tests

## 📈 Couverture par Catégorie

| Catégorie | Statements | Branches | Functions | Lines |
|-----------|-----------|----------|-----------|-------|
| **Models** | 100% ✅ | 88.02% | 100% ✅ | 100% ✅ |
| **Routes** | 89.3% ✅ | 100% ✅ | 72.58% | 100% ✅ |
| **Services** | 67.85% | 40.67% | 61.94% | 69.73% |
| **Controllers** | 67.02% | 55% | 75.36% | 65.4% |

## 🚀 Commandes Disponibles

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch
npm run test:watch

# Exécuter les tests avec rapport de couverture
npm run test:coverage

# Exécuter les tests puis nettoyer les données de test
npm run test:clean
```

## 🔧 Configuration

### Jest Configuration (`jest.config.js`)
```javascript
preset: 'ts-jest'
testEnvironment: 'node'
setupFiles: ['<rootDir>/src/__tests__/setup.ts']
```

### Setup (`src/__tests__/setup.ts`)
- Définit `NODE_ENV=test` pour éviter que le serveur écoute pendant les tests
- Évite les conflits de port

## 🎯 Stratégie de Test

### Tests de Routes
- **Approche**: Tests d'intégration E2E
- **Outil**: Supertest
- **Données**: Crée des données réelles dans Firestore
- **Lifecycle**: 
  - `beforeAll`: Crée les données de test nécessaires
  - `afterAll`: Nettoie les données créées

### Tests de Services  
- **Approche**: Tests unitaires isolés
- **Outil**: Jest mocks
- **Données**: Mocks Firestore (pas de données réelles)
- **Avantage**: Rapides, pas de dépendances externes

## 🧹 Nettoyage des Données de Test

### Script de Nettoyage (`src/scripts/cleanup-test-data.ts`)

Supprime automatiquement:
- Utilisateurs avec firstName contenant "Test" ou "Updated"
- Cours avec title contenant "Test"
- Chapitres avec title contenant "Test"
- Leçons avec title contenant "Test"
- Exercices avec title contenant "Test"
- Instructeurs avec name contenant "Test", "TEST" ou "TO DELETE"
- Inscriptions avec userId ou courseId contenant "test"

**Exécution automatique**: `npm run test:clean`

## 📝 Exemples de Tests

### Test de Route (avec données réelles)
```typescript
describe('User API Endpoints', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Créer l'utilisateur de test
    const response = await request(app)
      .post('/api/users')
      .send({ firstName: 'Test', ... });
    testUserId = response.body.data.uid;
  });

  afterAll(async () => {
    // Nettoyer
    await request(app).delete(`/api/users/${testUserId}`);
  });

  it('should return a user by ID', async () => {
    const response = await request(app)
      .get(`/api/users/${testUserId}`)
      .expect(200);
    
    expect(response.body.data.uid).toBe(testUserId);
  });
});
```

### Test de Service (avec mocks)
```typescript
describe('UserService', () => {
  const mockDocGet = jest.fn();
  
  jest.mock('../../config/firebase.config', () => ({
    db: {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({ get: mockDocGet })),
      })),
    },
  }));

  it('should return a user by ID', async () => {
    mockDocGet.mockResolvedValue({
      exists: true,
      id: 'test-id',
      data: () => ({ firstName: 'Test' }),
    });

    const user = await userService.getById('test-id');
    expect(user?.firstName).toBe('Test');
  });
});
```

## ✅ Bonnes Pratiques

1. **Isolation des Tests**: Chaque test est indépendant
2. **Données de Test**: Les tests de routes créent leurs propres données
3. **Nettoyage**: Utiliser `afterAll` pour nettoyer les données
4. **Mocks**: Les services utilisent des mocks pour isoler la logique
5. **Assertions Claires**: Utiliser des assertions explicites et descriptives

## 🔄 Workflow de Développement

1. **Développer** une nouvelle fonctionnalité
2. **Écrire** les tests (routes + services)
3. **Exécuter** `npm test` pour valider
4. **Vérifier** la couverture avec `npm run test:coverage`
5. **Nettoyer** avec `npm run test:clean` avant commit

## 🎓 Améliorations Futures

- [ ] Augmenter la couverture des services (objectif: 80%)
- [ ] Ajouter tests de performance
- [ ] Implémenter tests de sécurité
- [ ] Ajouter tests d'authentification
- [ ] Configurer CI/CD pour tests automatiques
- [ ] Générer rapports de couverture HTML

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
