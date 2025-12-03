# ==================================================================
# UltraSQL v7.0 — Triângulo 360° Enterprise Edition
# Compatível 100% com Supabase Cloud
# Autor: aricheles + Tri360 AI Engine
# ==================================================================

Write-Host "`n🟣 UltraSQL v7 — Iniciando..." -ForegroundColor Magenta

$URL  = $env:SUPABASE_URL
$ANON = $env:SUPABASE_ANON_KEY
$SERVICE = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $URL -or -not $ANON -or -not $SERVICE) {
    Write-Host "❌ Variáveis de ambiente faltando!" -ForegroundColor Red
    exit
}

$headersAnon = @{ apikey = $ANON; Authorization = "Bearer $ANON" }
$headersSrv  = @{ apikey = $SERVICE; Authorization = "Bearer $SERVICE" }

# ============================================================
# 1) LER ARQUIVO estrutura_rest.json
# ============================================================

$jsonPath = "C:\Users\Administrador\pecuariatech\estrutura_rest.json"

if (-not (Test-Path $jsonPath)) {
    Write-Host "❌ O arquivo estrutura_rest.json não foi encontrado!" -ForegroundColor Red
    exit
}

$json = Get-Content $jsonPath -Raw | ConvertFrom-Json

# extrai as rotas
$tabelas = $json.paths.psobject.Properties.Name | Where-Object { $_ -match "^/" -and $_ -ne "/" }
$tabelas = $tabelas | ForEach-Object { $_.TrimStart("/") }

Write-Host "`n🔍 Tabelas detectadas automaticamente:" -ForegroundColor Cyan
$tabelas | ForEach-Object { Write-Host "   • $_" }

# ============================================================
# 2) Função de teste REST
# ============================================================

function Test-Tabela($nome) {

    Write-Host "`n====================================" -ForegroundColor Yellow
    Write-Host "Tabela: $nome" -ForegroundColor White
    Write-Host "====================================" -ForegroundColor Yellow

    # Teste ANON
    try {
        Invoke-RestMethod -Uri "$URL/rest/v1/$nome" -Headers $headersAnon -Method Get -ErrorAction Stop
        Write-Host "   ✔ ANON consegue ler (PERIGOSO!)" -ForegroundColor Red
        $anon = "permitido"
    }
    catch {
        Write-Host "   ⚠ ANON bloqueado (RLS ativo)" -ForegroundColor Yellow
        $anon = "bloqueado"
    }

    # Teste SERVICE ROLE
    try {
        Invoke-RestMethod -Uri "$URL/rest/v1/$nome" -Headers $headersSrv -Method Get -ErrorAction Stop
        Write-Host "   ✔ SERVICE ROLE consegue ler" -ForegroundColor Green
        $srv = "ok"
    }
    catch {
        Write-Host "   ❌ SERVICE ROLE NÃO consegue ler!" -ForegroundColor Red
        $srv = "erro"
    }

    return [PSCustomObject]@{
        tabela = $nome
        anon   = $anon
        service_role = $srv
    }
}

# ============================================================
# 3) Testar todas as tabelas detectadas
# ============================================================

$resultados = @()

foreach ($t in $tabelas) {
    $resultado = Test-Tabela $t
    $resultados += $resultado
}

# ============================================================
# 4) Gerar JSON final
# ============================================================

$jsonOut = "UltraSQL_v7_result.json"
$resultados | ConvertTo-Json -Depth 10 | Out-File $jsonOut -Encoding utf8

Write-Host "`n📄 Arquivo JSON gerado: $jsonOut" -ForegroundColor Cyan

# ============================================================
# 5) Gerar HTML PRO
# ============================================================

$htmlOut = "UltraSQL_v7_report.html"

$html = @"
<html>
<head>
<title>UltraSQL v7 — Triângulo 360 Enterprise</title>
<style>
body { font-family: Arial; background:#111; color:#eee; padding:20px; }
.ok { color:#00ff00; }
.erro { color:#ff4444; }
.bloqueado { color:#ffaa00; }
</style>
</head>
<body>
<h2>UltraSQL v7 — Triângulo 360° Enterprise Edition</h2>
<table border='1' cellpadding='6' cellspacing='0'>
<tr><th>Tabela</th><th>Anon</th><th>Service Role</th></tr>
"@

foreach ($r in $resultados) {

    $cssAnon = if ($r.anon -eq "bloqueado") { "bloqueado" } else { "erro" }
    $cssSrv  = if ($r.service_role -eq "ok") { "ok" } else { "erro" }

    $html += "<tr>
<td>$($r.tabela)</td>
<td class='$cssAnon'>$($r.anon)</td>
<td class='$cssSrv'>$($r.service_role)</td>
</tr>"
}

$html += "</table></body></html>"

$html | Out-File $htmlOut -Encoding utf8

Write-Host "📄 Arquivo HTML salvo em: $htmlOut" -ForegroundColor Cyan

# ============================================================
# FINAL
# ============================================================

Write-Host "`n==========================================" -ForegroundColor Magenta
Write-Host "🎉 UltraSQL v7 — FINALIZADO com sucesso!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Magenta
