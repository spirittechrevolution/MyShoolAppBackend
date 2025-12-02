# Test de la clé Gemini API
# Remplacez YOUR_API_KEY par votre vraie clé

$apiKey = "AIzaSyD6MM49d4szdR7y6IsLUwCJC5PaiUwdWjM"
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=$apiKey"

$body = @{
    contents = @(
        @{
            parts = @(
                @{
                    text = "Bonjour, peux-tu me dire quel modèle tu es ?"
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

$headers = @{
    "Content-Type" = "application/json"
}

try {
    Write-Host "Test de la clé Gemini API..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -Headers $headers
    Write-Host "✅ Succès ! Réponse :" -ForegroundColor Green
    $response.candidates[0].content.parts[0].text
} catch {
    Write-Host "❌ Erreur :" -ForegroundColor Red
    $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Détails: $responseBody" -ForegroundColor Red
    }
}
