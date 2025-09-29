# -----------------------------------------
# Script Único de Teste - Supabase PecuariaTech
# -----------------------------------------

Write-Host "`n[INFO] Iniciando teste de conexão com Supabase..." -ForegroundColor Cyan

# ---------- CONFIGURAÇÃO ----------
$SupabaseUrl  = "https://kpzzekflqpoeccnqfkng.supabase.co"
$Table        = "rebanho"

# Cabeçalhos (Service Role Key é necessário para bypass de RLS)
$Headers = @{
    "apikey"        = $env:SUPABASE_SERVICE_ROLE_KEY
    "Authorization" = "Bearer $env:SUPABASE_SERVICE_ROLE_KEY"
    "Content-Type"  = "application/json"
    "Prefer"        = "return=representation"
}

# Registro de teste
$BovinoTeste = @{
    nome         = "Boi Teste PowerShell"
    raca         = "Nelore"
    cruzamento   = "Nelore Puro"
    clima_ideal  = "Tropical"
    peso_inicial = 320
    peso_atual   = 330
    data_entrada = (Get-Date -Format "yyyy-MM-dd")
    pastagem_id  = "00000000-0000-0000-0000-000000000000"
}

# ---------- INSERÇÃO ----------
try {
    $Json = $BovinoTeste | ConvertTo-Json -Depth 10 -Compress
    $resp = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/$Table" -Method Post -Headers $Headers -Body $Json
    $recordId = $resp.id

    Write-Host "[SUCESSO] Registro inserido em $Table com ID: $recordId" -ForegroundColor Green
}
catch {
    Write-Host "[ERRO] Falha na inserção: $($_.Exception.Message)" -ForegroundColor Red
}

# ---------- LIMPEZA ----------
try {
    if ($recordId) {
        Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/$Table?id=eq.$recordId" -Method Delete -Headers $Headers
        Write-Host "[INFO] Registro de teste removido do Supabase." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "[ERRO] Falha ao remover registro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n[INFO] Teste concluído." -ForegroundColor Cyan
