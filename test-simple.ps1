# Test API abonnement avec la vraie classe de l'utilisateur test
$apiUrl = "https://us-central1-myschool-f862b.cloudfunctions.net/api"
$userId = "VLzZCBlJstQOWhJy9Xg4MEO7ESK2"

Write-Host "`n========== TEST MOYEN (6eme) ==========" -ForegroundColor Cyan

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
    Write-Host "`nSUCCES!" -ForegroundColor Green
    Write-Host "Reponse:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
    Write-Host "`nDetails:" -ForegroundColor Magenta
    Write-Host "Payment URL: $($response.data.paymentUrl)"
    Write-Host "Montant: $($response.data.amount) $($response.data.currency)"
    Write-Host "Type: $($response.data.typeAbonnement)"
    $matieresStr = $response.data.matieres -join ", "
    Write-Host "Matieres: $matieresStr"
} catch {
    Write-Host "`nERREUR:" -ForegroundColor Red
    $_.ErrorDetails.Message
}
