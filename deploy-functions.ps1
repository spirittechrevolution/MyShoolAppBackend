# Script de déploiement des Cloud Functions pour MySchool
# Exécuter avec: .\deploy-functions.ps1

Write-Host "🚀 Déploiement des Cloud Functions MySchool" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Vérifier Firebase CLI
Write-Host "📦 Vérification de Firebase CLI..." -ForegroundColor Yellow
$firebaseVersion = firebase --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Firebase CLI n'est pas installé" -ForegroundColor Red
    Write-Host "Installation: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Firebase CLI version: $firebaseVersion" -ForegroundColor Green
Write-Host ""

# Étape 2: Connexion Firebase
Write-Host "🔐 Vérification de la connexion Firebase..." -ForegroundColor Yellow
firebase projects:list 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vous n'êtes pas connecté à Firebase" -ForegroundColor Red
    Write-Host "Connexion en cours..." -ForegroundColor Yellow
    firebase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Échec de la connexion" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Connecté à Firebase" -ForegroundColor Green
Write-Host ""

# Étape 3: Sélectionner le projet
Write-Host "🎯 Configuration du projet Firebase..." -ForegroundColor Yellow
firebase use myschool-f862b
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Projet myschool-f862b non trouvé" -ForegroundColor Red
    Write-Host "Projets disponibles:" -ForegroundColor Yellow
    firebase projects:list
    exit 1
}
Write-Host "✅ Projet: myschool-f862b" -ForegroundColor Green
Write-Host ""

# Étape 4: Compiler les fonctions
Write-Host "🔨 Compilation des Cloud Functions..." -ForegroundColor Yellow
Set-Location functions
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec de la compilation" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✅ Compilation réussie" -ForegroundColor Green
Write-Host ""

# Étape 5: Choisir le type de déploiement
Write-Host "📤 Type de déploiement:" -ForegroundColor Yellow
Write-Host "1. Tester localement (émulateurs)" -ForegroundColor Cyan
Write-Host "2. Déployer en production" -ForegroundColor Cyan
Write-Host "3. Déployer les règles Firestore" -ForegroundColor Cyan
Write-Host "4. Déployer tout (functions + rules)" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Votre choix (1-4)"

switch ($choice) {
    "1" {
        Write-Host "🧪 Démarrage des émulateurs..." -ForegroundColor Yellow
        Write-Host "Interface UI: http://localhost:4000" -ForegroundColor Cyan
        Write-Host "Functions: http://localhost:5001" -ForegroundColor Cyan
        Write-Host "Firestore: http://localhost:8080" -ForegroundColor Cyan
        Write-Host ""
        firebase emulators:start
    }
    "2" {
        Write-Host "🚀 Déploiement des Cloud Functions..." -ForegroundColor Yellow
        firebase deploy --only functions
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Déploiement réussi!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📊 Fonctions déployées:" -ForegroundColor Cyan
            Write-Host "  - onEnrollmentCreated" -ForegroundColor White
            Write-Host "  - onEnrollmentCompleted" -ForegroundColor White
            Write-Host "  - onLessonCreated" -ForegroundColor White
            Write-Host "  - onExerciseCreated" -ForegroundColor White
            Write-Host "  - calculateEnrollmentProgress" -ForegroundColor White
            Write-Host "  - getCourseStatistics" -ForegroundColor White
            Write-Host "  - cleanupOldCancelledEnrollments" -ForegroundColor White
            Write-Host "  - sendInactiveUserReminders" -ForegroundColor White
            Write-Host ""
            Write-Host "🌐 Console: https://console.firebase.google.com/project/myschool-f862b/functions" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Échec du déploiement" -ForegroundColor Red
        }
    }
    "3" {
        Write-Host "🔒 Déploiement des règles Firestore..." -ForegroundColor Yellow
        firebase deploy --only firestore:rules,firestore:indexes
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Règles déployées!" -ForegroundColor Green
        } else {
            Write-Host "❌ Échec du déploiement" -ForegroundColor Red
        }
    }
    "4" {
        Write-Host "🚀 Déploiement complet..." -ForegroundColor Yellow
        firebase deploy
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Déploiement complet réussi!" -ForegroundColor Green
        } else {
            Write-Host "❌ Échec du déploiement" -ForegroundColor Red
        }
    }
    default {
        Write-Host "❌ Choix invalide" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✨ Terminé!" -ForegroundColor Green
