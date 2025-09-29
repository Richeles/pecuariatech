# Supabase Insert Script - Ultrabiológico
# Script para inserir um registro na tabela 'rebanho'

# Defina os dados do registro
$Record = @{
    nome = "Boi Exemplo"            # Nome do boi
    raca = "Nelore"                 # Raça
    peso_atual = 350                # Peso atual em kg
    ganho_peso_dia = 1.2            # Ganho de peso por dia em kg
    data_cadastro = "2025-09-12"    # Formato yyyy-MM-dd
} | ConvertTo-Json -Depth 10 -Compress

Write-Host "[INFO] Enviando registro para o Supabase..." -ForegroundColor Cyan

# Tente enviar para o Supabase
try {
    $response = Invoke-RestMethod -Uri "$env:NEXT_SUPABASE_URL/rest/v1/rebanho" `
        -Method Post `
        -Headers @{
            "apikey" = $env:NEXT_SUPABASE_ANON_KEY
            "Authorization" = "Bearer $env:NEXT_SUPABASE_ANON_KEY"
            "Content-Type" = "application/json"
            "Prefer" = "return=representation"
        } `
        -Body $Record

    Write-Host "[SUCESSO] Registro inserido com sucesso!" -ForegroundColor Green
    $response | ConvertTo-Json | Write-Host
}
catch {
    Write-Host "[ERRO] Falha ao inserir no Supabase:" $_.Exception.Message -ForegroundColor Red
}
