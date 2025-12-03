Write-Host "🔵 Iniciando Fix-Tri360..." -ForegroundColor Cyan

$URL = $env:SUPABASE_URL
$SERVICE = $env:SUPABASE_SERVICE_ROLE_KEY

$headers = @{
    apikey        = $SERVICE
    Authorization = "Bearer $SERVICE"
    Content-Type  = "application/json"
}

# Lista das tabelas internas
$tables = @(
    "triangulo_logs",
    "triangulo_monitor",
    "triangulo_monitor_v55",
    "triangulo360_logs",
    "monitor_gps"
)

function Exec-SQL($sql) {
    $body = @{ query = $sql } | ConvertTo-Json

    try {
        Invoke-RestMethod `
            -Uri "$URL/rest/v1/query" `
            -Method POST `
            -Headers $headers `
            -Body $body

        Write-Host "   ✔ OK: $sql" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ ERRO: $sql" -ForegroundColor Red
    }
}

foreach ($t in $tables) {

    Write-Host "`n====================================" -ForegroundColor Yellow
    Write-Host "Tabela: $t"
    Write-Host "===================================="

    Exec-SQL "ALTER TABLE public.$t ENABLE ROW LEVEL SECURITY;"

    Exec-SQL "DROP POLICY IF EXISTS anon_all_$t ON public.$t;"
    Exec-SQL "DROP POLICY IF EXISTS public_policy_$t ON public.$t;"
    Exec-SQL "DROP POLICY IF EXISTS open_$t ON public.$t;"

    Exec-SQL @"
CREATE POLICY tri360_service_$t
ON public.$t
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
"@
}

Write-Host "`n🎉 Fix-Tri360 Finalizado com sucesso!" -ForegroundColor Green
