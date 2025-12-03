# ==========================================
# UltraSQL v2 - Fix (Versão compatível)
# Corrigido para Supabase Cloud
# ==========================================

$SUPABASE_URL = $env:SUPABASE_URL
$SERVICE_ROLE = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $SUPABASE_URL -or -not $SERVICE_ROLE) {
    Write-Host "❌ Erro: variáveis de ambiente ausentes." -ForegroundColor Red
    exit
}

Write-Host "`n🔵 UltraSQL v2 — Iniciando..." -ForegroundColor Cyan

$headers = @{
    apikey = $SERVICE_ROLE
    Authorization = "Bearer $SERVICE_ROLE"
}

# Tabelas que você usa
$tabelas = @("pastagem","rebanho","financeiro","racas")

function Testar-Tabela {
    param($tabela)

    Write-Host "`n🔍 Testando tabela: $tabela"

    try {
        Invoke-RestMethod `
            -Uri "$SUPABASE_URL/rest/v1/$tabela?limit=1" `
            -Headers $headers `
            -Method Get

        Write-Host "   ✔ SERVICE ROLE possui acesso" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ SERVICE ROLE NÃO conseguiu ler $tabela" -ForegroundColor Red
    }
}

foreach ($t in $tabelas) {
    Testar-Tabela $t
}

Write-Host "`n🎉 UltraSQL v2 Finalizado!" -ForegroundColor Green
