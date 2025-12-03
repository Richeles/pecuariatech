# ============================================================
# UltraSQL v3 — Cloud-Compatible Edition (Sem SQL Bruto)
# PecuariaTech Cloud — Triângulo 360° SQL Layer
# Desenvolvido exclusivamente para aricheles
# ============================================================

$SUPABASE_URL = $env:SUPABASE_URL
$SERVICE_ROLE = $env:SUPABASE_SERVICE_ROLE_KEY
$ANON_KEY     = $env:SUPABASE_ANON_KEY

if (-not $SUPABASE_URL -or -not $SERVICE_ROLE -or -not $ANON_KEY) {
    Write-Host "❌ Variáveis de ambiente faltando (URL, SERVICE ROLE, ANON)." -ForegroundColor Red
    exit
}

Write-Host "`n🔵 UltraSQL v3 — Iniciando..." -ForegroundColor Cyan

$headers_service = @{
    apikey = $SERVICE_ROLE
    Authorization = "Bearer $SERVICE_ROLE"
}

$headers_anon = @{
    apikey = $ANON_KEY
    Authorization = "Bearer $ANON_KEY"
}

$tabelas = @("pastagem","rebanho","financeiro","racas")

$json_result = @()

function Test-Tabela {
    param($nome)

    Write-Host "`n🔍 Testando tabela: $nome" -ForegroundColor Yellow

    $obj = [ordered]@{
        tabela = $nome
        anon_select = "?"
        service_role_select = "?"
        rls = "?"
    }

    # ANON
    try {
        Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/$nome?limit=1" -Headers $headers_anon -Method Get
        $obj.anon_select = "OK"
        Write-Host "   ✔ ANON SELECT OK" -ForegroundColor Green
    }
    catch {
        $obj.anon_select = "BLOQUEADO"
        Write-Host "   ⚠ ANON bloqueado (RLS ativo)" -ForegroundColor Yellow
    }

    # SERVICE ROLE
    try {
        Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/$nome?limit=1" -Headers $headers_service -Method Get
        $obj.service_role_select = "OK"
        Write-Host "   ✔ SERVICE ROLE OK" -ForegroundColor Green
    }
    catch {
        $obj.service_role_select = "ERRO"
        Write-Host "   ❌ SERVICE ROLE NÃO CONSEGUE LER!" -ForegroundColor Red
    }

    # Testar RLS por metadados
    try {
        $resp = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/$nome?select=*" -Headers $headers_anon -Method Get
        if ($resp) {
            $obj.rls = "Desativado"
            Write-Host "   ⚠ RLS DESATIVADO" -ForegroundColor Red
        }
    }
    catch {
        $obj.rls = "Ativo"
        Write-Host "   ✔ RLS ATIVO" -ForegroundColor Green
    }

    return $obj
}

foreach ($t in $tabelas) {
    $json_result += Test-Tabela $t
}

# ------------------------------------------------------------
# Salvar JSON
# ------------------------------------------------------------

$json_path = ".\UltraSQL_v3_result.json"
$json_result | ConvertTo-Json -Depth 5 | Set-Content $json_path -Encoding UTF8

Write-Host "`n📄 JSON salvo em: $json_path" -ForegroundColor Cyan

# ------------------------------------------------------------
# Gerar HTML
# ------------------------------------------------------------

$html_path = ".\UltraSQL_v3_report.html"

$html = @"
<html>
<head>
<title>UltraSQL v3 Result</title>
<style>
body { font-family: Arial; background: #111; color: #fff; }
table { width: 80%; margin: auto; border-collapse: collapse; }
td,th { border: 1px solid #444; padding: 10px; text-align: center; }
.ok { color: #4cff4c; }
.no { color: #ff4c4c; }
.warn { color: #ffd24c; }
</style>
</head>
<body>
<h2 style='text-align:center;'>UltraSQL v3 — Relatório PecuariaTech</h2>
<table>
<tr><th>Tabela</th><th>ANON</th><th>SERVICE ROLE</th><th>RLS</th></tr>
"@

foreach ($item in $json_result) {
    $html += "<tr>"
    $html += "<td>$($item.tabela)</td>"
    $html += "<td>$($item.anon_select)</td>"
    $html += "<td>$($item.service_role_select)</td>"
    $html += "<td>$($item.rls)</td>"
    $html += "</tr>"
}

$html += @"
</table>
</body>
</html>
"@

$html | Set-Content $html_path -Encoding UTF8

Write-Host "📄 HTML salvo em: $html_path" -ForegroundColor Cyan

Write-Host "`n=========================================="
Write-Host "🎉 UltraSQL v3 Finalizado — Compatível 100%"
Write-Host "==========================================" -ForegroundColor Green
