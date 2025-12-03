# 🚀 Triângulo 360° — v6.6.1 Full Orquestração — PecuariaTech Cloud
# Autor: Richeles
# E-mail admin: pecuariatech.br@gmail.com
# Módulos: Rede, DNS, REST, SecuritySync, CloudSync e Dashboard

# ==== VARIÁVEIS ====
$SUPABASE_URL = $env:NEXT_PUBLIC_SUPABASE_URL
$API_KEY      = $env:SUPABASE_SERVICE_ROLE_KEY
$ADMIN_EMAIL  = "pecuariatech.br@gmail.com"
$DOMINIO      = "pecuariatech.com"
$TABELAS      = @("pastagem","rebanho","financeiro","racas","dashboard")

$LOG_DIR = "C:\Logs\PecuariaTech"
$LOG_TRI = Join-Path $LOG_DIR "triangulo360_v6.csv"
$LOG_OUT = Join-Path $LOG_DIR "triangulo360_full_orq_v661.csv"

if (-not (Test-Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null
}

# ==== FUNÇÕES ====
function Head($t){ Write-Host $t -ForegroundColor Yellow }
function Ok($t){ Write-Host $t -ForegroundColor Green }
function Warn($t){ Write-Host $t -ForegroundColor DarkYellow }
function Err($t){ Write-Host $t -ForegroundColor Red }
function LogCsv($etapa,$modulo,$status,$ms){
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$ts,$etapa,$modulo,$status,$ms" | Out-File -FilePath $LOG_OUT -Append -Encoding UTF8
}

Clear-Host
Write-Host "`n🚀 Triângulo 360° v6.6.1 — Full Orquestração" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------------"

# ==== VERIFICAÇÃO INICIAL ====
if (-not $SUPABASE_URL -or -not $API_KEY) {
    Err "❌ Variáveis de ambiente ausentes. Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
    exit 1
}

# ==== 1) REDE ====
Head "[##############################] Verificando Rede..."
try {
    $null = Invoke-WebRequest -Uri "https://1.1.1.1" -UseBasicParsing -TimeoutSec 8
    Ok "✅ Rede OK — conexão com a Internet ativa"
    LogCsv "REDE" "-" "OK" "0"
} catch {
    Err "❌ Rede Falhou"
    LogCsv "REDE" "-" "FALHA" "0"
}

# ==== 2) DNS ====
Head "[##############################] Verificando DNS..."
try {
    Resolve-DnsName $DOMINIO -ErrorAction Stop | Out-Null
    Ok "✅ DNS OK ($DOMINIO resolvido)"
    LogCsv "DNS" $DOMINIO "OK" "0"
} catch {
    Err "❌ DNS Falhou ($DOMINIO)"
    LogCsv "DNS" $DOMINIO "FALHA" "0"
}

# ==== 3) REST ====
Head "[##############################] Verificando endpoints REST Supabase..."
$restResultados = @()
foreach ($tb in $TABELAS) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $null = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/$tb?select=id&limit=1" `
        -Headers @{ apikey=$API_KEY; Authorization="Bearer $API_KEY" } -TimeoutSec 15
        $sw.Stop()
        $tempo = [math]::Round($sw.Elapsed.TotalMilliseconds,2)
        Ok "✅ $tb OK ($tempo ms)"
        $restResultados += [PSCustomObject]@{ modulo=$tb; status="OK"; tempo_ms=$tempo }
        LogCsv "REST" $tb "OK" $tempo
    } catch {
        $sw.Stop()
        $tempo = [math]::Round($sw.Elapsed.TotalMilliseconds,2)
        Err "❌ $tb Falhou ($tempo ms)"
        $restResultados += [PSCustomObject]@{ modulo=$tb; status="FALHA"; tempo_ms=$tempo }
        LogCsv "REST" $tb "FALHA" $tempo
    }
}

# ==== 4) SECURITYSYNC LIGHT ====
Head "[##############################] SecuritySync Light..."
try {
    $body = @{ modulo="v6.6.1"; status="OK"; tempo_ms=0.0 } | ConvertTo-Json
    Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/triangulo_logs" -Method Post `
        -Headers @{ apikey=$API_KEY; Authorization="Bearer $API_KEY"; "Content-Type"="application/json" } `
        -Body $body | Out-Null
    Ok "✅ Inserção de teste confirmada (service_role ativo)"
    LogCsv "SECURITYSYNC" "triangulo_logs" "OK" "0"
} catch {
    Warn "⚠️ Falha na inserção (verifique RLS)."
    LogCsv "SECURITYSYNC" "triangulo_logs" "FALHA" "0"
}

# ==== 5) CLOUDSYNC ====
Head "[##############################] CloudSync — enviando logs..."
if (-not (Test-Path $LOG_TRI)) {
    Warn "⚠️ Log local não encontrado ($LOG_TRI) — criando novo..."
    "data,etapa,modulo,status,tempo_ms" | Out-File $LOG_TRI
}

try {
    $linhas = Get-Content $LOG_TRI | Where-Object { $_ -and -not $_.StartsWith("data") }
    $enviados = 0
    foreach ($ln in $linhas) {
        $p = $ln.Split(",")
        if ($p.Count -ge 5) {
            $mod = $p[2].Trim()
            $stat = $p[3].Trim()
            $msStr = $p[4].Trim() -replace "[^\d\,\.]" , ""
            $tempo = [double]::Parse($msStr, [System.Globalization.CultureInfo]::InvariantCulture)
            $payload = @{ modulo=$mod; status=$stat; tempo_ms=$tempo } | ConvertTo-Json
            Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/triangulo_logs" -Method Post `
                -Headers @{ apikey=$API_KEY; Authorization="Bearer $API_KEY"; "Content-Type"="application/json" } `
                -Body $payload | Out-Null
            $enviados++
        }
    }
    Ok "☁️ CloudSync concluído — $enviados registro(s) enviados"
    LogCsv "CLOUDSYNC" "triangulo_logs" "OK" $enviados
} catch {
    Warn "⚠️ Falha ao enviar dados ao Supabase"
    LogCsv "CLOUDSYNC" "triangulo_logs" "FALHA" "0"
}

# ==== 6) DASHBOARD FINAL ====
Head "`n📊 Resultados do Triângulo 360°"
$okCount = ($restResultados | Where-Object {$_.status -eq "OK"}).Count
foreach ($r in $restResultados) {
    $emoji = if ($r.status -eq "OK") {"🟢"} else {"🔴"}
    Write-Host ("{0,-14} {1,10} ms   {2}" -f $r.modulo, $r.tempo_ms, $emoji)
}
$estab = [math]::Round(($okCount / $TABELAS.Count) * 100, 0)
Write-Host ""
Write-Host ("📈 Estabilidade geral: {0}% módulos estáveis" -f $estab)
Write-Host ""
Write-Host "📜 Log salvo em $LOG_OUT"
Write-Host ("🕓 Execução concluída às {0}" -f (Get-Date -Format "HH:mm:ss"))
Write-Host "--------------------------------------------------------------"
Write-Host "🟢 Triângulo 360° v6.6.1 — Full Orquestração finalizado com sucesso!"
Write-Host "--------------------------------------------------------------`n"
