# ===========================================
# UltraRLSFix v9 — Fort Knox Edition
# ===========================================

$URL = $env:SUPABASE_URL
$SERVICE = $env:SUPABASE_SERVICE_ROLE_KEY

$headers = @{
    apikey = $SERVICE
    Authorization = "Bearer $SERVICE"
    Content-Type = "application/json"
}

# Criar pastas de logs e relatórios
$base = "C:\Users\Administrador\pecuariatech\UltraRLSFix-Reports"
if (!(Test-Path $base)) { New-Item -ItemType Directory -Path $base | Out-Null }

$logFile = "$base\UltraRLSFix-v9.log"
$reportHTML = "$base\Relatorio-RLS-Auditoria.html"

function Log {
    param([string]$msg)
    $stamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    "$stamp | $msg" | Out-File -FilePath $logFile -Append
}

Write-Host "`n🟣 UltraRLSFix v9 — Fort Knox Edition" -ForegroundColor Magenta
Log "Iniciando execução UltraRLSFix v9"

# Carregar tabelas REAIS vindas do JSON
$tables = @(
    "rebanho","tapete","financeiro","triangulo_logs","pastagem",
    "triangulo_monitor_v55","triangulo_monitor","function_performance_logs",
    "vendas","racas","unilog","triangulo360_logs","monitor_gps","dashboard"
)

$views = @("triangulo_monitor","triangulo_monitor_v55")

function ExecSQL($sql) {
    $body = @{ query = $sql } | ConvertTo-Json -Depth 5

    try {
        Invoke-RestMethod `
            -Uri "$URL/rest/v1/query" `
            -Method Post `
            -Headers $headers `
            -Body $body

        return $true
    }
    catch {
        return $false
    }
}

# Página HTML (estrutura)
$html = @"
<html>
<head>
<title>Relatório de Auditoria RLS - UltraRLSFix v9</title>
<meta charset='UTF-8'>
<style>
body { background:#111; color:#eee; font-family:Arial; padding:20px; }
h1 { color:#9b59b6; }
.ok { color:#2ecc71; }
.fail { color:#e74c3c; }
.warn { color:#f1c40f; }
.box { background:#222; padding:10px; margin:10px 0; border-radius:6px; }
</style>
</head>
<body>
<h1>UltraRLSFix v9 — Auditoria Completa</h1>
"@

foreach ($tabela in $tables) {

    $html += "<div class='box'><h2>$tabela</h2>"

    if ($views -contains $tabela) {
        Write-Host "⚠ $tabela é VIEW — ignorando" -ForegroundColor Yellow
        Log "$tabela ignorada (VIEW)"
        $html += "<p class='warn'>Ignorada — VIEW não suporta RLS</p></div>"
        continue
    }

    # 1 — Ativar RLS
    $enable = ExecSQL("ALTER TABLE public.$tabela ENABLE ROW LEVEL SECURITY;")

    if ($enable) {
        Write-Host "✔ RLS ativado em $tabela" -ForegroundColor Green
        Log "RLS ativado em $tabela"
        $html += "<p class='ok'>RLS ativado</p>"
    } else {
        Write-Host "❌ Falha ao ativar RLS em $tabela" -ForegroundColor Red
        Log "Falha ao ativar RLS em $tabela"
        $html += "<p class='fail'>Falha ao ativar RLS</p>"
    }

    # 2 — Política SERVICE ROLE
    $policy_service = @"
CREATE POLICY service_role_full_$tabela
ON public.$tabela
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
"@

    if (ExecSQL($policy_service)) {
        Write-Host "✔ SERVICE ROLE liberado" -ForegroundColor Green
        Log "Política SERVICE_ROLE criada em $tabela"
        $html += "<p class='ok'>Política SERVICE_ROLE aplicada</p>"
    } else {
        Write-Host "⚠ SERVICE ROLE já existe" -ForegroundColor Yellow
        Log "Política SERVICE_ROLE já existia em $tabela"
        $html += "<p class='warn'>Política SERVICE_ROLE já existia</p>"
    }

    # 3 — ANON bloqueado
    $policy_anon = @"
CREATE POLICY anon_none_$tabela
ON public.$tabela
FOR SELECT
TO anon
USING (false);
"@

    if (ExecSQL($policy_anon)) {
        Write-Host "✔ ANON bloqueado" -ForegroundColor Green
        Log "Política ANON criada em $tabela"
        $html += "<p class='ok'>Política ANON bloqueada</p>"
    } else {
        Write-Host "⚠ ANON já existia" -ForegroundColor Yellow
        Log "Política ANON já existia em $tabela"
        $html += "<p class='warn'>Política ANON já existia</p>"
    }

    # 4 — Teste de leitura SERVICE ROLE
    try {
        Invoke-RestMethod `
            -Uri "$URL/rest/v1/$tabela?select=*" `
            -Headers $headers `
            -Method Get | Out-Null

        Write-Host "✔ SERVICE ROLE consegue ler $tabela" -ForegroundColor Green
        Log "Leitura SERVICE ROLE OK ($tabela)"
        $html += "<p class='ok'>SERVICE ROLE consegue ler</p>"
    }
    catch {
        Write-Host "❌ SERVICE ROLE sem acesso!" -ForegroundColor Red
        Log "ERRO: SERVICE ROLE não consegue ler $tabela"
        $html += "<p class='fail'>SERVICE ROLE NÃO consegue ler</p>"

        # AUTO-REPAIR MODE
        ExecSQL("ALTER TABLE public.$tabela ENABLE ROW LEVEL SECURITY;") | Out-Null
        ExecSQL($policy_service) | Out-Null
        ExecSQL($policy_anon) | Out-Null
        Log "Auto-Repair executado em $tabela"
        $html += "<p class='warn'>Auto-Repair aplicado</p>"
    }

    $html += "</div>"
}

$html += "</body></html>"
$html | Out-File -FilePath $reportHTML -Encoding utf8

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "🎉 UltraRLSFix v9 — COMPLETO"
Write-Host "📄 Relatório salvo em: $reportHTML"
Write-Host "📝 Log salvo em: $logFile"
Write-Host "==========================================`n"

Log "Execução finalizada."
