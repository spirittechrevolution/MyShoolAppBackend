Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "   TESTS COMPLETS API ABONNEMENT" -ForegroundColor Cyan  
Write-Host "=====================================" -ForegroundColor Cyan

# Fonction pour tester un payload
function Test-Subscription {
    param (
        [string]$TestName,
        [string]$Body
    )
    
    Write-Host "`n---------- $TestName ----------" -ForegroundColor Yellow
    Write-Host "Payload: $Body"
    
    try {
        $response = Invoke-RestMethod `
            -Uri "https://us-central1-myschool-f862b.cloudfunctions.net/api/subscriptions/create-payment" `
            -Method POST `
            -Body $Body `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        if ($response.success) {
            Write-Host "✅ SUCCES" -ForegroundColor Green
            Write-Host "   Amount: $($response.data.amount) XOF"
            Write-Host "   Classe: $($response.data.classe)"
            Write-Host "   Type: $($response.data.typeAbonnement)"
            if ($response.data.matieres) {
                Write-Host "   Matières: $($response.data.matieres -join ', ')"
            }
        } else {
            Write-Host "❌ ECHEC: $($response.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ ERREUR: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# TEST 1: ELEMENTAIRE (CM2) - Type CLASSE
$test1 = '{"userId":"VLzZCBlJstQOWhJy9Xg4MEO7ESK2","classe":"CM2","niveauScolaire":"ELEMENTAIRE","typeAbonnement":"CLASSE"}'
Test-Subscription -TestName "TEST 1: ELEMENTAIRE (CM2)" -Body $test1

# TEST 2: MOYEN (6ème) - Type MATIERE avec 3 matières
$test2 = '{"userId":"VLzZCBlJstQOWhJy9Xg4MEO7ESK2","classe":"6ème","niveauScolaire":"MOYEN","typeAbonnement":"MATIERE","matieres":["Mathématiques","Français","SVT"]}'
Test-Subscription -TestName "TEST 2: MOYEN (6ème)" -Body $test2

# TEST 3: MOYEN (3ème BFEM) - Type MATIERE avec 3 matières  
$test3 = '{"userId":"VLzZCBlJstQOWhJy9Xg4MEO7ESK2","classe":"3ème (BFEM)","niveauScolaire":"MOYEN","typeAbonnement":"MATIERE","matieres":["Histoire-Géographie","SVT","Français"]}'
Test-Subscription -TestName "TEST 3: MOYEN (3ème BFEM)" -Body $test3

# TEST 4: SECONDAIRE (Terminale S) - Type MATIERE avec 3 matières
$test4 = '{"userId":"VLzZCBlJstQOWhJy9Xg4MEO7ESK2","classe":"Terminale S","niveauScolaire":"SECONDAIRE","typeAbonnement":"MATIERE","matieres":["Mathématiques","Physique","Philosophie"]}'
Test-Subscription -TestName "TEST 4: SECONDAIRE (Terminale S)" -Body $test4

# TEST 5: UNIVERSITAIRE (Licence 1 Info) - Type MATIERE avec 3 matières
$test5 = '{"userId":"VLzZCBlJstQOWhJy9Xg4MEO7ESK2","classe":"Licence 1 Informatique","niveauScolaire":"UNIVERSITAIRE","typeAbonnement":"MATIERE","matieres":["Algorithmique","Base de données","Réseaux"]}'
Test-Subscription -TestName "TEST 5: UNIVERSITAIRE (Licence 1 Info)" -Body $test5

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "   TESTS TERMINÉS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
