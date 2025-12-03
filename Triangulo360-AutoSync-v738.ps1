<#
Triângulo 360° · AutoSync++ v7.3.8
PowerShell 7.5+

• Supabase: resume projeto, DISABLE RLS por tabela, checa REST e latências
• Vercel: valida/adiciona domínio via CLI; se não houver, gera cURL template
• Logs: CSV/JSON/TXT + rotação diária (ZIP em \archive)
• Painel HTML (Plotly) com pirâmide e séries de latência; abre a cada 3 ciclos
• Alertas: Telegram e WhatsApp (CallMeBot OU Webhook genérico)
• Push opcional de resumo para tabela 'triangulo_logs' no Supabase
#>

param(
  [int]   $IntervaloMin = 10,
  [switch]$Loop
)

# ============ CONFIG ============ #
$BASE_DIR   = "C:\Users\Administrador\pecuariatech"
$LOG_DIR    = Join-Path $BASE_DIR "logs"
$ARCH_DIR   = Join-Path $LOG_DIR "archive"
$CSV_FILE   = Join-Path $LOG_DIR "autosync_v738.csv"
$JSON_FILE  = Join-Path $LOG_DIR "autosync_v738.json"
$TXT_FILE   = Join-Path $LOG_DIR "autosync_v738.txt"
$HTML_FILE  = Join-Path $LOG_DIR "autosync_v738.html"
$CURL_FILE  = Join-Path $LOG_DIR "vercel_alias_template.sh"

# Ambiente (edite se preferir setar fixo)
$SUPABASE_URL      = $env:SUPABASE_URL
$SUPABASE_SERVICE  = $env:SUPABASE_SERVICE_ROLE_KEY
$SUPABASE_PROJECT  = $env:SUPABASE_PROJECT_REF     # ex: girkgszyajljunwsnwav
$SITE_URL          = $env:NEXT_PUBLIC_SITE_URL
if (-not $SITE_URL) { $SITE_URL = "https://pecuariatech.vercel.app" }

# Vercel (opcionais para correção automática)
$VERCEL_TOKEN      = $env:VERCEL_TOKEN
$VERCEL_PROJECT_ID = $env:VERCEL_PROJECT_ID
$DOMINIO_WWW       = "www.pecuariatech.com"

# Alertas (opcionais)
$TELEGRAM_TOKEN    = $env:TELEGRAM_TOKEN
$TELEGRAM_CHAT_ID  = $env:TELEGRAM_CHAT_ID
# WhatsApp CallMeBot (opcional)
$WAPP_PHONE        = $env:WAPP_PHONE        # ex: 5567999999999
$WAPP_APIKEY       = $env:WAPP_APIKEY
# WhatsApp Webhook genérico (alternativo)
$WAPP_WEBHOOK_URL  = $env:WAPP_WEBHOOK_URL  # POST JSON {message: "...", severity: "..."}

# Conexão psql (fallback para RLS)
$PG_CONN           = $env:PG_CONN           # ex: "postgres://user:pass@host:5432/db"

# Tabelas para monitorar
$TABLES = @("pastagem","rebanho","financeiro","racas","dashboard")

# ============ Helpers ============ #
function Head($t){ Write-Host "`n$t" -ForegroundColor Cyan }
function Ok($t){ Write-Host $t -ForegroundColor Green }
function Warn($t){ Write-Host $t -ForegroundColor Yellow }
function Err($t){ Write-Host $t -ForegroundColor Red }

if (!(Test-Path $LOG_DIR))  { New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null }
if (!(Test-Path $ARCH_DIR)) { New-Item -ItemType Directory -Path $ARCH_DIR -Force | Out-Null }

function Ensure-Headers {
  if (-not (Test-Path $CSV_FILE))  { "time;item;status;detail;ms" | Out-File -Encoding UTF8 -FilePath $CSV_FILE }
  if (-not (Test-Path $JSON_FILE)) { "[]" | Out-File -Encoding UTF8 -FilePath $JSON_FILE }
  if (-not (Test-Path $TXT_FILE))  { "# Triângulo360 AutoSync++ Logs" | Out-File -Encoding UTF8 -FilePath $TXT_FILE }
}
Ensure-Headers

function Append-Json($path, $obj){
  try { $arr = Get-Content $path -Raw | ConvertFrom-Json } catch { $arr = @() }
  $arr += $obj
  $arr | ConvertTo-Json -Depth 6 | Set-Content -Path $path -Encoding UTF8
}

function LogLine($obj){
  $line = "{0};{1};{2};{3};{4}" -f $obj.time, $obj.item, $obj.status, ($obj.detail -replace "`n"," "), $obj.ms
  $line | Out-File -Append -Encoding UTF8 -FilePath $CSV_FILE
  $line | Out-File -Append -Encoding UTF8 -FilePath $TXT_FILE
  Append-Json -path $JSON_FILE -obj $obj
}

# Rotação diária (por data no header do arquivo)
function Rotate-LogsIfNeeded {
  $today = (Get-Date -Format "yyyy-MM-dd")
  $marker = Join-Path $LOG_DIR "day.marker"
  $old = if (Test-Path $marker) { Get-Content $marker -Raw } else { "" }
  if ($old -ne $today) {
    $stamp = (Get-Date -Format "yyyyMMdd_HHmmss")
    $zipPath = Join-Path $ARCH_DIR "autosync_$stamp.zip"
    $toZip = @()
    if (Test-Path $CSV_FILE)  { $toZip += $CSV_FILE }
    if (Test-Path $JSON_FILE) { $toZip += $JSON_FILE }
    if (Test-Path $TXT_FILE)  { $toZip += $TXT_FILE }
    if ($toZip.Count -gt 0) {
      try { Compress-Archive -Path $toZip -DestinationPath $zipPath -Force; Ok "Logs compactados: ${zipPath}" }
      catch { Warn "Falhou ao compactar logs: $($_.Exception.Message)" }
      foreach($f in $toZip){ Remove-Item -Path $f -Force -ErrorAction SilentlyContinue }
      Ensure-Headers
    }
    $today | Set-Content -Path $marker -Encoding UTF8
  }
}

# Alertas
function Send-Telegram($text){
  if ($TELEGRAM_TOKEN -and $TELEGRAM_CHAT_ID) {
    try {
      Invoke-RestMethod -Uri "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" `
        -Method Post -ContentType "application/json" `
        -Body (@{chat_id=$TELEGRAM_CHAT_ID; text=$text} | ConvertTo-Json) | Out-Null
      Ok "Telegram enviado"
    } catch { Warn "TG falhou: $($_.Exception.Message)" }
  }
}
function Send-WhatsApp($text){
  if ($WAPP_PHONE -and $WAPP_APIKEY) {
    # CallMeBot (GET)
    try {
      $enc = [uri]::EscapeDataString($text)
      $url = "https://api.callmebot.com/whatsapp.php?phone=${WAPP_PHONE}&text=${enc}&apikey=${WAPP_APIKEY}"
      Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15 | Out-Null
      Ok "WhatsApp (CallMeBot) enviado"
      return
    } catch { Warn "WA CallMeBot falhou: $($_.Exception.Message)" }
  }
  if ($WAPP_WEBHOOK_URL) {
    try {
      Invoke-RestMethod -Uri $WAPP_WEBHOOK_URL -Method Post -ContentType "application/json" `
        -Body (@{message=$text; severity="warning"} | ConvertTo-Json) | Out-Null
      Ok "WhatsApp (Webhook) enviado"
    } catch { Warn "WA Webhook falhou: $($_.Exception.Message)" }
  }
}

# Painel HTML (Plotly)
function Generate-HTMLPanel {
  $lines = @()
  if (Test-Path $CSV_FILE) { $lines = Get-Content $CSV_FILE -Tail 300 }
  if ($lines.Count -lt 2) { return }
  $rows = @()
  foreach ($ln in $lines[1..($lines.Count-1)]) {
    if ($ln -match '^(.*?)\;(.*?)\;(.*?)\;(.*?)\;(.*)$') {
      $rows += [PSCustomObject]@{
        time   = $matches[1]
        item   = $matches[2]
        status = $matches[3]
        detail = $matches[4]
        ms     = ($matches[5] -as [double])
      }
    }
  }
  $jsData = ($rows | ConvertTo-Json -Depth 6)
  $html = @"
<!doctype html>
<html><head>
<meta charset="utf-8"/>
<title>Triângulo360 AutoSync++</title>
<script src="https://cdn.plot.ly/plotly-2.24.1.min.js"></script>
<style>
body{font-family:Inter,system-ui,Arial;background:#0b1229;color:#e5e7eb;margin:12px}
.card{background:#0f1a3a;padding:12px;border-radius:12px;margin-bottom:12px;box-shadow:0 8px 24px rgba(0,0,0,0.45)}
h1{margin:0 0 8px 0;font-size:20px}
a{color:#93c5fd}
</style>
</head>
<body>
<div class="card">
  <h1>Triângulo360 AutoSync++</h1>
  <div>Site: <a href="$SITE_URL" target="_blank">$SITE_URL</a></div>
  <div>Atualizado: <span id="last"></span></div>
</div>
<div id="pyr" class="card"></div>
<div id="lat" class="card"></div>
<div id="log" class="card"></div>
<script>
const data = $jsData || [];
document.getElementById('last').innerText = (data.length ? data[data.length-1].time : '-');

const failCount = {};
data.forEach(d => { if(d.status==='FALHA'){ failCount[d.item]=(failCount[d.item]||0)+1 } });
const items = Object.keys(failCount).map(k=>({name:k,val:failCount[k]})).sort((a,b)=>b.val-a.val);
const labels = items.map(i=>i.name);
const values = items.map(i=>i.val);
Plotly.newPlot('pyr',[{type:'bar',x:values,y:labels,orientation:'h',
 marker:{color:values.map(v=>v>2?'red':v==2?'orange':'green')},text:values.map(String),textposition:'auto'}],
 {title:'Pirâmide de incongruências (contagem FALHA)', margin:{l:160}});

const series={};
data.forEach(d=>{ const m=Number(d.ms); if(!isNaN(m)){ (series[d.item]=series[d.item]||[]).push({x:d.time,y:m}); }});
const traces = Object.keys(series).map(k=>({x:series[k].map(p=>p.x), y:series[k].map(p=>p.y), name:k, mode:'lines+markers'}));
Plotly.newPlot('lat', traces, {title:'Latência (ms)', xaxis:{type:'category'}});

let t='<table style="width:100%;border-collapse:collapse"><tr><th>time</th><th>item</th><th>status</th><th>detail</th><th>ms</th></tr>';
data.slice(-60).reverse().forEach(d=>{ t+=`<tr><td>${d.time}</td><td>${d.item}</td><td>${d.status}</td><td>${d.detail}</td><td>${d.ms||''}</td></tr>`; });
t+='</table>'; document.getElementById('log').innerHTML=t;
</script>
</body></html>
"@
  $html | Set-Content -Path $HTML_FILE -Encoding UTF8
  Ok "Painel HTML gerado: ${HTML_FILE}"
}

# Supabase: resume projeto
function Supabase-Resume {
  if (Get-Command supabase -ErrorAction SilentlyContinue) {
    if ($SUPABASE_PROJECT) {
      try {
        Write-Host "→ supabase projects resume --project-ref ${SUPABASE_PROJECT}" -ForegroundColor DarkCyan
        $out = supabase projects resume --project-ref $SUPABASE_PROJECT 2>&1
        Ok "Projeto Supabase: resume solicitado"
        return $true
      } catch { Warn "resume falhou: $($_.Exception.Message)" }
    } else { Warn "SUPABASE_PROJECT_REF ausente" }
  } else { Warn "CLI Supabase não encontrada" }
  return $false
}

# Supabase: DISABLE RLS por tabela
function Supabase-DisableRLS($table){
  $ok = $false
  if (Get-Command supabase -ErrorAction SilentlyContinue -Verbose:$false) {
    try {
      $sql = "ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;"
      $out = supabase db query --project-ref $SUPABASE_PROJECT --sql "$sql" 2>&1
      Ok "RLS OFF via CLI: ${table}"
      $ok = $true
    } catch { Warn "CLI RLS OFF falhou (${table}): $($_.Exception.Message)" }
  }
  if (-not $ok -and $PG_CONN) {
    try {
      & psql $PG_CONN -c "ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;" 2>&1 | Out-Null
      Ok "RLS OFF via psql: ${table}"
      $ok = $true
    } catch { Warn "psql RLS OFF falhou (${table}): $($_.Exception.Message)" }
  }
  if (-not $ok) {
    $sqlFile = Join-Path $LOG_DIR "disable_rls_${table}.sql"
    "ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;" | Set-Content -Path $sqlFile -Encoding UTF8
    Warn "Gerado SQL manual: ${sqlFile}"
  }
  return $ok
}

# Vercel: tentar adicionar domínio via CLI; fallback cURL template
function Vercel-FixDomain {
  try {
    $dns = Resolve-DnsName $DOMINIO_WWW -Type CNAME -ErrorAction Stop
    $cname = ($dns | Select-Object -First 1).NameHost
    if ($cname -match "vercel-dns\.com") { Ok "CNAME ok (${cname})"; return }
    Warn "CNAME atual (${cname}) incorreto; tentando corrigir…"
  } catch {
    Warn "DNS CNAME não resolvido (${DOMINIO_WWW}); tentando adicionar…"
  }

  if (Get-Command vercel -ErrorAction SilentlyContinue) {
    try {
      if ($VERCEL_PROJECT_ID) {
        & vercel domains add $DOMINIO_WWW --project $VERCEL_PROJECT_ID 2>&1 | Out-Null
        Ok "vercel domains add executado"
      } else {
        & vercel domains add $DOMINIO_WWW 2>&1 | Out-Null
        Ok "vercel domains add (sem project id) executado"
      }
      return
    } catch { Warn "vercel CLI falhou: $($_.Exception.Message)" }
  }

  if ($VERCEL_TOKEN -and $VERCEL_PROJECT_ID) {
    $curl = @"
curl -X POST "https://api.vercel.com/v10/projects/$VERCEL_PROJECT_ID/domains" ^
 -H "Authorization: Bearer $VERCEL_TOKEN" ^
 -H "Content-Type: application/json" ^
 -d "{\""name\"":\""${DOMINIO_WWW}\""}"
"@
    $curl | Set-Content -Path $CURL_FILE -Encoding UTF8
    Ok "Template cURL salvo: ${CURL_FILE}"
  } else {
    Warn "Sem Vercel CLI ou token/ID — ajuste manual necessário."
  }
}

# REST check + latência
function Check-REST($table){
  $time = (Get-Date).ToString("s")
  $url = "${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1"
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    $resp = Invoke-RestMethod -Uri $url -Headers @{ apikey=$SUPABASE_SERVICE; Authorization="Bearer $SUPABASE_SERVICE" } -TimeoutSec 12 -Method Get -ErrorAction Stop
    $sw.Stop()
    $ms = [math]::Round($sw.Elapsed.TotalMilliseconds,2)
    LogLine ([PSCustomObject]@{ time=$time; item="REST_${table}"; status="OK"; detail="ok"; ms=$ms })
    Ok "REST ${table} OK - ${ms} ms"
    return @{ok=$true; ms=$ms}
  } catch {
    $sw.Stop()
    $ms = [math]::Round($sw.Elapsed.TotalMilliseconds,2)
    $msg = $_.Exception.Message
    LogLine ([PSCustomObject]@{ time=$time; item="REST_${table}"; status="FALHA"; detail=$msg; ms=$ms })
    Err "REST ${table} FALHA - ${ms} ms"
    return @{ok=$false; ms=$ms; err=$msg}
  }
}

# Push resumo para Supabase (opcional)
function Push-ResumoSupabase($summary){
  try {
    if ($SUPABASE_URL -and $SUPABASE_SERVICE) {
      Invoke-RestMethod -Uri "${SUPABASE_URL}/rest/v1/triangulo_logs" `
        -Method Post -Headers @{apikey=$SUPABASE_SERVICE; Authorization="Bearer $SUPABASE_SERVICE"; "Content-Type"="application/json"} `
        -Body ($summary | ConvertTo-Json -Depth 6) | Out-Null
      Ok "Resumo enviado para triangulo_logs"
    }
  } catch { Warn "Falhou push triangulo_logs: $($_.Exception.Message)" }
}

# ------ CICLO ------ #
$cycle = 0
function Do-Cycle {
  param([int]$cycleIndex)

  Rotate-LogsIfNeeded

  $now = (Get-Date).ToString("s")
  Head "Ciclo ${cycleIndex} — ${now}"

  # 1) Supabase resume
  $resumeOk = Supabase-Resume
  LogLine ([PSCustomObject]@{ time=$now; item="SUPABASE_RESUME"; status=($resumeOk?"OK":"TENTATIVA"); detail="projects resume"; ms=0 })

  # 2) RLS OFF (tentativa)
  foreach($t in $TABLES){ [void](Supabase-DisableRLS -table $t) }

  # 3) Vercel domínio
  Vercel-FixDomain

  # 4) REST checks
  $fails = @()
  $latByTable = @{}
  foreach($t in $TABLES){
    $r = Check-REST -table $t
    $latByTable[$t] = $r.ms
    if (-not $r.ok){ $fails += $t }
  }

  # 5) Painel HTML
  Generate-HTMLPanel
  if ($cycleIndex % 3 -eq 0) {
    try { Start-Process $HTML_FILE; Ok "Painel aberto" } catch { Warn "Não abriu painel: $($_.Exception.Message)" }
  }

  # 6) Alertas (se houver falhas)
  if ($fails.Count -gt 0) {
    $msg = "🚨 Triângulo360 AutoSync++ v7.3.8`nFalhas: ${fails}`nHora: $(Get-Date -Format 'HH:mm:ss')"
    Send-Telegram $msg
    Send-WhatsApp $msg
  }

  # 7) Push resumo no Supabase (opcional)
  $estab = [math]::Round((($TABLES.Count - $fails.Count)/$TABLES.Count)*100,0)
  $summary = [PSCustomObject]@{
    origem     = "autosync_v738"
    estabilidade = $estab
    falhas       = $fails
    latencias_ms = $latByTable
    timestamp    = (Get-Date).ToString("s")
  }
  Push-ResumoSupabase -summary $summary
}

# ------ RUN ------ #
if ($Loop) {
  while ($true) {
    Clear-Host
    $cycle++
    Do-Cycle -cycleIndex $cycle
    Start-Sleep -Seconds ($IntervaloMin*60)
  }
} else {
  $cycle = 1
  Do-Cycle -cycleIndex $cycle
}
