# Test API abonnement avec la vraie classe de l'utilisateur test
$apiUrl = "https://us-central1-myschool-f862b.cloudfunctions.net/api"
$userId = "VLzZCBlJstQOWhJy9Xg4MEO7ESK2"  # Cet utilisateur est en 6ème (MOYEN)

Write-Host "`n========== TEST RÉEL: MOYEN (6ème) ==========" -ForegroundColor Cyan

$payload = @{
    userId = $userId
    classe = "6ème"
    niveauScolaire = "MOYEN"
    typeAbonnement = "MATIERE"
    matieres = @("Mathématiques", "Français", "Anglais")
} | ConvertTo-Json

Write-Host "`nPayload:" -ForegroundColor Yellow
$payload

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/subscriptions/create-payment" -Method POST -Body $payload -ContentType "application/json"
    Write-Host "`n✅ SUCCÈS!" -ForegroundColor Green
    Write-Host "Réponse:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
    Write-Host "`n🔗 Payment URL:" -ForegroundColor Magenta
    Write-Host $response.data.paymentUrl
    Write-Host "`n💰 Montant: $($response.data.amount) $($response.data.currency)" -ForegroundColor Yellow
    Write-Host "📚 Type: $($response.data.typeAbonnement)" -ForegroundColor Yellow
    $matieresStr = $response.data.matieres -join ", "
    Write-Host "🎓 Matières: $matieresStr" -ForegroundColor Yellow
} catch {
    Write-Host "`n❌ Erreur HTTP $($_.Exception.Response.StatusCode.value__):" -ForegroundColor Red
    $_.ErrorDetails.Message
}
