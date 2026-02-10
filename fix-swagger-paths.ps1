# Script pour enlever /api/ des commentaires Swagger dans les routes

$files = Get-ChildItem -Path "functions\src\routes\*.ts" -File

Write-Host "📝 Correction de $($files.Count) fichiers de routes..." -ForegroundColor Cyan

foreach ($file in $files) {
    Write-Host "  - $($file.Name)" -ForegroundColor Yellow
    
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace '(\* +)/api/', '$1/'
    
    if ($content -ne $newContent) {
        Set-Content $file.FullName -Value $newContent -NoNewline
        Write-Host "    ✅ Modifié" -ForegroundColor Green
    } else {
        Write-Host "    ⏭️  Aucun changement" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Terminé ! Régénérons Swagger..." -ForegroundColor Green

# Régénérer Swagger
Set-Location functions
node generate-swagger.js
Set-Location ..

Write-Host "`n📦 Compilation TypeScript..." -ForegroundColor Cyan
Set-Location functions
npm run build
Set-Location ..

Write-Host "`n🚀 Prêt pour le déploiement!" -ForegroundColor Green
Write-Host "Lancez: firebase deploy --only functions:api" -ForegroundColor Yellow
