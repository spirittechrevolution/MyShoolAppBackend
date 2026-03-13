@echo off
REM Déploiement Firebase des functions
cd /d "d:\PersonalProject\MyShoolAppBackend"

echo 🚀 Compilation des functions...
cd functions
call npm run build
if errorlevel 1 (
    echo ❌ Erreur compilation
    exit /b 1
)

cd ..
echo.
echo ✅ Compilation réussie
echo.
echo 📤 Déploiement Firebase en cours...
call npx firebase deploy --only functions --project myschool-f862b

if errorlevel 1 (
    echo ❌ Erreur déploiement
    exit /b 1
)

echo.
echo ✅ ✅ Déploiement réussi!
echo.
echo 📋 Vérification post-déploiement...
call node verify-classes.js

pause
