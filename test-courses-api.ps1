# Script de test des endpoints API de cours
# Teste différentes requêtes pour identifier lesquelles nécessitent des indexes

$baseUrl = "https://us-central1-myschool-f862b.cloudfunctions.net/api"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "🧪 Test des endpoints API de cours`n" -ForegroundColor Cyan
Write-Host "=" * 60

# Test 1: Tous les cours
Write-Host "`n📝 TEST 1: GET /courses (tous les cours)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/courses" -Method Get -Headers $headers
    Write-Host "✅ SUCCÈS - $($response.count) cours trouvés" -ForegroundColor Green
} catch {
    Write-Host "❌ ÉCHEC: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Cours publiés
Write-Host "`n📝 TEST 2: GET /courses/published" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/courses/published" -Method Get -Headers $headers
    Write-Host "✅ SUCCÈS - $($response.count) cours publiés" -ForegroundColor Green
} catch {
    Write-Host "❌ ÉCHEC: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Cours par classe
Write-Host "`n📝 TEST 3: GET /courses/classe/6ème" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/courses/classe/6ème" -Method Get -Headers $headers
    Write-Host "✅ SUCCÈS - $($response.count) cours pour 6ème" -ForegroundColor Green
} catch {
    Write-Host "❌ ÉCHEC: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Message: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 4: Cours par niveau
Write-Host "`n📝 TEST 4: GET /courses/niveau/MOYEN" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/courses/niveau/MOYEN" -Method Get -Headers $headers
    Write-Host "✅ SUCCÈS - $($response.count) cours pour MOYEN" -ForegroundColor Green
} catch {
    Write-Host "❌ ÉCHEC: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Cours par type
Write-Host "`n📝 TEST 5: GET /courses/type/VIDEO" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/courses/type/VIDEO" -Method Get -Headers $headers
    Write-Host "✅ SUCCÈS - $($response.count) cours VIDEO" -ForegroundColor Green
} catch {
    Write-Host "❌ ÉCHEC: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Cours par niveau de difficulté
Write-Host "`n📝 TEST 6: GET /courses/level/DEBUTANT" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/courses/level/DEBUTANT" -Method Get -Headers $headers
    Write-Host "✅ SUCCÈS - $($response.count) cours DEBUTANT" -ForegroundColor Green
} catch {
    Write-Host "❌ ÉCHEC: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" -NoNewline
Write-Host "=" * 60
Write-Host "`n💡 NOTE:" -ForegroundColor Cyan
Write-Host "   Si un test échoue avec une erreur d'index manquant,"
Write-Host "   cliquez sur le lien fourni dans l'erreur pour créer l'index."
Write-Host "`n"
