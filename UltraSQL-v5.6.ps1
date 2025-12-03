# ================================================
# UltraSQL Tri360 v5.6 — Script Único
# Compatível 100% com Supabase Cloud
# ================================================

$SUPABASE_URL  = "$env:SUPABASE_URL"
$SERVICE_ROLE  = "$env:SUPABASE_SERVICE_ROLE_KEY"
$ANON          = "$env:SUPABASE_ANON_KEY"

if (-not $SUPABASE_URL -or -not $SERVICE_ROLE -or -not $ANON) {
    Write-Host "❌ Variáveis de ambiente faltando!" -ForegroundColor Red
    exit
}

$headersService = @{
    apikey        = $SERVICE_ROLE
    Authorization = "Bearer $SERVICE_ROLE"
}

$headersAnon = @{
    apikey        = $ANON
    Authorization = "Bearer $ANON"
}

Write-Host "`n🔵 UltraSQL v5.6 — Iniciando..." -ForegroundColor Cyan

# ==========================
# Tabelas reais (confirmadas no JSON)
# ==========================

$tables = @(
    "pastagem",
    "rebanho",
    "financeiro",
    "racas",
    "triangulo_logs",
    "triangulo360_logs",
    "triangulo_monitor",
    "triangulo_monitor_v55",
    "unilog",
    "monitor_gps",
    "function_performance_logs",
    "dashboard",
    "vendas",
    "tapete"
)

# ==========================
# Função de teste REST
# ==========================

function Test-Table {
    param($table)

    Write-Host "`n===================================="
    Write-Host "Tabela: $table"
    Write-Host "===================================="

    # --- Teste ANON ---
    try {
        Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/$table?limit=1" `
            -Headers $headersAnon -Method Get

        Write-Host "   ✔ ANON consegue ler (sem RLS?)" -ForegroundColor Green
        $anonStatus = "ok"
    }
    catch {
        Write-Host "   ⚠ ANON bloqueado (RLS ativo)" -ForegroundColor Yellow
        $anonStatus = "bloqueado"
    }

    # --- Teste SERVICE ROLE ---
    try {
        Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/$table?limit=1" `
            -Headers $headersService -Method Get

        Write-Host "   ✔ SERVICE ROLE consegue ler" -ForegroundColor Green
        $srvStatus = "ok"
    }
    catch {
        Write-Host "   ❌ SERVICE ROLE NÃO consegue ler!" -ForegroundColor Red
        $srvStatus = "erro"
    }

    return [PSCustomObject]@{
        tabela       = $table
        anon         = $anonStatus
        serviceRole  = $srvStatus
    }
}

# ==========================
# Execução dos testes
# ==========================

$resultados = @()

foreach ($t in $tables) {
    $resultados += Test-Table $t
}

# ==========================
# Salvar JSON
# ==========================

$jsonPath = ".\UltraSQL_v5.6_result.json"
$resultados | ConvertTo-Json -Depth 5 | Out-File $jsonPath -Encoding UTF8

Write-Host "`n📄 JSON salvo em: $jsonPath" -ForegroundColor Cyan

# ==========================
# Gerar HTML simples
# ==========================

$html = @"
<html>
<head>
<title>Relatório UltraSQL 5.6</title>
<style>
body { font-family: Arial; background: #101010; color: #eee; }
.ok { color: #4CAF50; }
.bloqueado { color: #FFC107; }
.erro { color: #F44336; }
</style>
</head>
<body>
<h2>UltraSQL Tri360 v5.6 — Relatório</h2>
<table border='1' cellpadding='6' cellspacing='0'>
<tr>
<th>Tabela</th><th>ANON</th><th>SERVICE ROLE</th>
</tr>
"@

foreach ($r in $resultados) {
    $html += "<tr>"
    $html += "<td>$($r.tabela)</td>"
    $html += "<td class='$($r.anon)'>$($r.anon)</td>"
    $html += "<td class='$($r.serviceRole)'>$($r.serviceRole)</td>"
    $html += "</tr>"
}

$html += "</table></body></html>"

$htmlPath = ".\UltraSQL_v5.6_report.html"
$html | Out-File $htmlPath -Encoding UTF8

Write-Host "📄 HTML salvo em: $htmlPath" -ForegroundColor Cyan

# ==========================
# Finalização
# ==========================

Write-Host "`n=========================================="
Write-Host "🎉 UltraSQL v5.6 Finalizado!"
Write-Host "==========================================" -ForegroundColor Green
