# Test des API d'abonnement MySchool pour chaque niveau scolaire
# Date: 2026-02-10

$apiUrl = "https://us-central1-myschool-f862b.cloudfunctions.net/api"
$userId = "VLzZCBlJstQOWhJy9Xg4MEO7ESK2"

Write-Host "`n==============================================" -ForegroundColor Magenta
Write-Host "   TESTS API ABONNEMENT MYSCHOOL" -ForegroundColor Magenta
Write-Host "==============================================" -ForegroundColor Magenta

# ========== TEST 1: ELEMENTAIRE (CM2 - Toute la classe) ==========
Write-Host "`n========== TEST 1: ELEMENTAIRE (CM2) ==========" -ForegroundColor Cyan
Write-Host "Type: CLASSE - Accès à TOUS les cours de CM2" -ForegroundColor Gray

$payload1 = @{
    userId = $userId
    classe = "CM2"
    niveauScolaire = "ELEMENTAIRE"
    typeAbonnement = "CLASSE"
} | ConvertTo-Json

Write-Host "`nPayload:" -ForegroundColor Yellow
Write-Host $payload1

try {
    $response1 = Invoke-RestMethod -Uri "$apiUrl/subscriptions/create-payment" -Method POST -Body $payload1 -ContentType "application/json"
    Write-Host "`n✅ Succès!" -ForegroundColor Green
    Write-Host "Réponse:" -ForegroundColor Green
    $response1 | ConvertTo-Json -Depth 5
    Write-Host "`nPayment URL: $($response1.data.paymentUrl)" -ForegroundColor Magenta
} catch {
    Write-Host "`n❌ Erreur HTTP $($_.Exception.Response.StatusCode.value__):" -ForegroundColor Red
    Write-Host $_.ErrorDetails.Message
}

Start-Sleep -Seconds 2

# ========== TEST 2: MOYEN (3ème BFEM - 3 matières) ==========
Write-Host "`n========== TEST 2: MOYEN (3ème BFEM) ==========" -ForegroundColor Cyan
Write-Host "Type: MATIERE - 3 matières obligatoires" -ForegroundColor Gray

$payload2 = @{
    userId = $userId
    classe = "3ème (BFEM)"
    niveauScolaire = "MOYEN"
    typeAbonnement = "MATIERE"
    matieres = @("Mathématiques", "Physique-Chimie", "SVT")
} | ConvertTo-Json

Write-Host "`nPayload:" -ForegroundColor Yellow
Write-Host $payload2

try {
    $response2 = Invoke-RestMethod -Uri "$apiUrl/subscriptions/create-payment" -Method POST -Body $payload2 -ContentType "application/json"
    Write-Host "`n✅ Succès!" -ForegroundColor Green
    Write-Host "Réponse:" -ForegroundColor Green
    $response2 | ConvertTo-Json -Depth 5
    Write-Host "`nPayment URL: $($response2.data.paymentUrl)" -ForegroundColor Magenta
} catch {
    Write-Host "`n❌ Erreur HTTP $($_.Exception.Response.StatusCode.value__):" -ForegroundColor Red
    Write-Host $_.ErrorDetails.Message
}

Start-Sleep -Seconds 2

# ========== TEST 3: SECONDAIRE (Terminale S - 3 matières) ==========
Write-Host "`n========== TEST 3: SECONDAIRE (Terminale S) ==========" -ForegroundColor Cyan
Write-Host "Type: MATIERE - 3 matières obligatoires" -ForegroundColor Gray

$payload3 = @{
    userId = $userId
    classe = "Terminale S"
    niveauScolaire = "SECONDAIRE"
    typeAbonnement = "MATIERE"
    matieres = @("Mathématiques", "Physique", "Philosophie")
} | ConvertTo-Json

Write-Host "`nPayload:" -ForegroundColor Yellow
Write-Host $payload3

try {
    $response3 = Invoke-RestMethod -Uri "$apiUrl/subscriptions/create-payment" -Method POST -Body $payload3 -ContentType "application/json"
    Write-Host "`n✅ Succès!" -ForegroundColor Green
    Write-Host "Réponse:" -ForegroundColor Green
    $response3 | ConvertTo-Json -Depth 5
    Write-Host "`nPayment URL: $($response3.data.paymentUrl)" -ForegroundColor Magenta
} catch {
    Write-Host "`n❌ Erreur HTTP $($_.Exception.Response.StatusCode.value__):" -ForegroundColor Red
    Write-Host $_.ErrorDetails.Message
}

Start-Sleep -Seconds 2

# ========== TEST 4: UNIVERSITAIRE (Licence Info - 3 matières) ==========
Write-Host "`n========== TEST 4: UNIVERSITAIRE (Licence 1 Info) ==========" -ForegroundColor Cyan
Write-Host "Type: MATIERE - 3 matières obligatoires" -ForegroundColor Gray

$payload4 = @{
    userId = $userId
    classe = "Licence 1 Informatique"
    niveauScolaire = "UNIVERSITAIRE"
    typeAbonnement = "MATIERE"
    matieres = @("Algorithmique", "Base de données", "Réseaux")
} | ConvertTo-Json

Write-Host "`nPayload:" -ForegroundColor Yellow
Write-Host $payload4

try {
    $response4 = Invoke-RestMethod -Uri "$apiUrl/subscriptions/create-payment" -Method POST -Body $payload4 -ContentType "application/json"
    Write-Host "`n✅ Succès!" -ForegroundColor Green
    Write-Host "Réponse:" -ForegroundColor Green
    $response4 | ConvertTo-Json -Depth 5
    Write-Host "`nPayment URL: $($response4.data.paymentUrl)" -ForegroundColor Magenta
} catch {
    Write-Host "`n❌ Erreur HTTP $($_.Exception.Response.StatusCode.value__):" -ForegroundColor Red
    Write-Host $_.ErrorDetails.Message
}

# ========== TEST 5: Erreur - MOYEN avec seulement 2 matières (devrait échouer) ==========
Write-Host "`n========== TEST 5: ERREUR - MOYEN avec 2 matières ==========" -ForegroundColor Cyan
Write-Host "Test de validation: Devrait retourner une erreur 400" -ForegroundColor Gray

$payload5 = @{
    userId = $userId
    classe = "4ème"
    niveauScolaire = "MOYEN"
    typeAbonnement = "MATIERE"
    matieres = @("Mathématiques", "Français")
} | ConvertTo-Json

Write-Host "`nPayload (invalide):" -ForegroundColor Yellow
Write-Host $payload5

try {
    $response5 = Invoke-RestMethod -Uri "$apiUrl/subscriptions/create-payment" -Method POST -Body $payload5 -ContentType "application/json"
    Write-Host "`n⚠️ Inattendu: La requête a réussi alors qu'elle devrait échouer!" -ForegroundColor Yellow
    $response5 | ConvertTo-Json -Depth 5
} catch {
    Write-Host "`n✅ Erreur attendue - Validation fonctionne!" -ForegroundColor Green
    Write-Host "HTTP $($_.Exception.Response.StatusCode.value__):" -ForegroundColor Red
    Write-Host $_.ErrorDetails.Message
}

# ========== TEST 6: Erreur - ELEMENTAIRE avec matières (devrait échouer) ==========
Write-Host "`n========== TEST 6: ERREUR - ELEMENTAIRE avec matières ==========" -ForegroundColor Cyan
Write-Host "Test de validation: Devrait retourner une erreur 400" -ForegroundColor Gray

$payload6 = @{
    userId = $userId
    classe = "CM1"
    niveauScolaire = "ELEMENTAIRE"
    typeAbonnement = "CLASSE"
    matieres = @("Mathématiques")
} | ConvertTo-Json

Write-Host "`nPayload (invalide):" -ForegroundColor Yellow
Write-Host $payload6

try {
    $response6 = Invoke-RestMethod -Uri "$apiUrl/subscriptions/create-payment" -Method POST -Body $payload6 -ContentType "application/json"
    Write-Host "`n⚠️ Inattendu: La requête a réussi alors qu'elle devrait échouer!" -ForegroundColor Yellow
    $response6 | ConvertTo-Json -Depth 5
} catch {
    Write-Host "`n✅ Erreur attendue - Validation fonctionne!" -ForegroundColor Green
    Write-Host "HTTP $($_.Exception.Response.StatusCode.value__):" -ForegroundColor Red
    Write-Host $_.ErrorDetails.Message
}

Write-Host "`n==============================================" -ForegroundColor Magenta
Write-Host "   FIN DES TESTS" -ForegroundColor Magenta
Write-Host "==============================================" -ForegroundColor Magenta
