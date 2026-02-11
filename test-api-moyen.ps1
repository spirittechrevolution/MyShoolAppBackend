Write-Host "Test API MOYEN (6eme)" -ForegroundColor Cyan

$body = '{"userId":"VLzZCBlJstQOWhJy9Xg4MEO7ESK2","classe":"6ème","niveauScolaire":"MOYEN","typeAbonnement":"MATIERE","matieres":["Mathématiques","Français","Anglais"]}'

Write-Host "Payload:" $body

$response = Invoke-RestMethod -Uri "https://us-central1-myschool-f862b.cloudfunctions.net/api/subscriptions/create-payment" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop

Write-Host "Réponse:"
$response | ConvertTo-Json -Depth 5
