# Script pour tester l'API avec la classe correcte de l'utilisateur
# User VLzZCBlJstQOWhJy9Xg4MEO7ESK2 est en classe "6ème", niveau MOYEN

Write-Host "`n========== TEST: MOYEN (6eme) ==========" -ForegroundColor Cyan

$body = '{"userId":"VLzZCBlJstQOWhJy9Xg4MEO7ESK2","classe":"6ème","niveauScolaire":"MOYEN","typeAbonnement":"MATIERE","matieres":["Mathématiques","Français","Anglais"]}'

Write-Host "Payload: $body" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://us-central1-myschool-f862b.cloudfunctions.net/api/subscriptions/create-payment" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "`n✅ Succès!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    
    Write-Host "`nERREUR HTTP $statusCode" -ForegroundColor Red
    Write-Host $errorBody
