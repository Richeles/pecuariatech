<#
Triângulo360 AutoSync v7.3.9 (Unificado)
----------------------------------------
• Auto-correção Supabase (resume project / disable RLS)
• Verificação REST e latência por tabela
• Correção CNAME Vercel (CLI ou template cURL)
• Logs CSV / JSON / TXT + rotação diária (.zip)
• Painel HTML interativo (Plotly) + pirâmide de erros
• Alertas via Telegram e WhatsApp
• Push opcional para tabela triangulo_logs no Supabase
#>

param(
  [int]$IntervaloMin = 10,
  [switch]$Loop
)

# === CONFIGURAÇÃO ===
$BASE_DIR  = "C:\Users\Administrador\pecuariatech"
$LOG_DIR   = Join-Path $BASE_DIR "logs"
$ARCH_DIR  = Join-Path $LOG_DIR "archive"
$CSV_FILE  = Join-Path $LOG_DIR "autosync_v739.csv"
$JSON_FILE = Join-Path $LOG_DIR "autosync_v739.json"
$TXT_FILE  = Join-Path $LOG_DIR "autosync_v739.txt"
$HTML_FILE = Join-Path $LOG_DIR "autosync_v739.html"

# Variáveis de ambiente
$SUPABASE_URL      = $env:SUPABASE_URL
$SUPABASE_SERVICE  = $env:SUPABASE_SERVICE_ROLE_KEY
$SUPABASE_PROJECT  = $env:SUPABASE_PROJECT_REF
$SITE_URL          = if ($env:NEXT_PUBLIC_SITE_URL) { $env:NEXT_PUBLIC_SITE_URL } else { "https://pecuariatech.vercel.app" }

# Vercel
$VERCEL_TOKEN      = $env:VERCEL_TOKEN
$VERCEL_PROJECT_ID = $env:VERCEL_PROJECT_ID
$DOMINIO_WWW       = "www.pecuariatech.com"

# Alertas
$TELEGRAM_TOKEN    = $env:TELEGRAM_TOKEN
$TELEGRAM_CHAT_ID  = $env:TELEGRAM_CHAT_ID
$WAPP_PHONE        = $env:WAPP_PHONE
$WAPP_APIKEY       = $env:WAPP_APIKEY
$WAPP_WEBHOOK_URL  = $env:WAPP_WEBHOOK_URL

# Banco
$PG_CONN           = $env:PG_CONN

$TABLES = @("pastagem","rebanho","financeiro","racas","dashboard")

# === FUNÇÕES AUXILIARES ===
function Head($t){ Write-Host "`n$t" -ForegroundColor Cyan }
function Ok($t){ Write-Host $t -ForegroundColor Green }
function Warn($t){ Write-Host $t -ForegroundColor Yellow }
function Err($t){ Write-Host $t -ForegroundColor Red }

if (!(Test-Path $LOG_DIR))  { New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null }
if (!(Test-Path $ARCH_DIR)) { New-Item -ItemType Directory -Path $ARCH_DIR -Force | Out-Null }

function Ensure-Headers {
  if (-not (Test-Path $CSV_FILE))  { "time;item;status;detail;ms" | Out-File -Encoding UTF8 -FilePath $CSV_FILE }
  if (-not (Test-Path $JSON_FILE)) { "[]" | Out-File -Encoding UTF8 -FilePath $JSON_FILE }
  if (-not (Test-Path $TXT_FILE))  { "# Triângulo360 AutoSync Logs" | Out-File -Encoding UTF8 -FilePath $TXT_FILE }
}
Ensure-Headers

function Append-Json($path, $obj){
  try { $arr = Get-Content $path -Raw | ConvertFrom-Json } catch { $arr = @() }
  $arr += $obj
  $arr | ConvertTo-Json -Depth 6 | Set-Content -Path $path -Encoding UTF8
}

function LogLine($obj){
  $line = "{0};{1};{2};{3};{4}" -f $obj.time,$obj.item,$obj.status,($obj.detail -replace "`n"," "),$obj.ms
  $line | Out-File -Append -Encoding UTF8 -FilePath $CSV_FILE
  $line | Out-File -Append -Encoding UTF8 -FilePath $TXT_FILE
  Append-Json -path $JSON_FILE -obj $obj
}

function Rotate-Logs {
  $today = (Get-Date -Format "yyyy-MM-dd")
  $marker = Join-Path $LOG_DIR "day.marker"
  $old = if (Test-Path $marker) { Get-Content $marker -Raw } else { "" }
  if ($old -ne $today) {
    $stamp = (Get-Date -Format "yyyyMMdd_HHmmss")
    $zipPath = Join-Path $ARCH_DIR "autosync_$stamp.zip"
    try {
      Compress-Archive -Path "$LOG_DIR\*.csv","$LOG_DIR\*.json","$LOG_DIR\*.txt" -DestinationPath $zipPath -Force
      Ok "Logs compactados → $zipPath"
      Remove-Item "$LOG_DIR\*.csv","$LOG_DIR\*.json","$LOG_DIR\*.txt" -Force -ErrorAction SilentlyContinue
      Ensure-Headers
      $today | Set-Content -Path $marker -Encoding UTF8
    } catch { Warn "Falha ao compactar logs: $($_.Exception.Message)" }
  }
}

function Send-Telegram($text){
  if ($TELEGRAM_TOKEN -and $TELEGRAM_CHAT_ID) {
    try {
      Invoke-RestMethod -Uri "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" `
        -Method Post -ContentType "application/json" `
        -Body (@{chat_id=$TELEGRAM_CHAT_ID; text=$text} | ConvertTo-Json) | Out-Null
      Ok "Telegram enviado"
    } catch { Warn "Falha Telegram: $($_.Exception.Message)" }
  }
}
function Send-WhatsApp($text){
  if ($WAPP_PHONE -and $WAPP_APIKEY) {
    try {
      $msg = [uri]::EscapeDataString($text)
      $url = "https://api.callmebot.com/whatsapp.php?phone=${WAPP_PHONE}&text=${msg}&apikey=${WAPP_APIKEY}"
      Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15 | Out-Null
      Ok "WhatsApp enviado (CallMeBot)"
      return
    } catch { Warn "WhatsApp falhou (CallMeBot)" }
  }
  if ($WAPP_WEBHOOK_URL) {
    try {
      Invoke-RestMethod -Uri $WAPP_WEBHOOK_URL -Method Post -ContentType "application/json" `
        -Body (@{message=$text;severity="warning"} | ConvertTo-Json) | Out-Null
      Ok "WhatsApp enviado (Webhook)"
    } catch { Warn "WhatsApp falhou (Webhook)" }
  }
}

function Supabase-Resume {
  if (Get-Command supabase -ErrorAction SilentlyContinue) {
    if ($SUPABASE_PROJECT) {
      try {
        supabase projects resume --project-ref $SUPABASE_PROJECT 2>&1 | Out-Null
        Ok "Supabase resume OK"
        return $true
      } catch { Warn "resume falhou: $($_.Exception.Message)" }
    } else { Warn "PROJECT_REF ausente" }
  } else { Warn "CLI Supabase não encontrada" }
  return $false
}

function Supabase-DisableRLS($table){
  $sql = "ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;"
  try {
    if (Get-Command supabase -ErrorAction SilentlyContinue) {
      supabase db query --project-ref $SUPABASE_PROJECT --sql "$sql" 2>&1 | Out-Null
      Ok "RLS OFF via CLI: $table"
      return $true
    } elseif ($PG_CONN) {
      & psql $PG_CONN -c "$sql" 2>&1 | Out-Null
      Ok "RLS OFF via psql: $table"
      return $true
    }
  } catch { Warn "RLS OFF falhou ($table): $($_.Exception.Message)" }
  return $false
}

function Vercel-FixDomain {
  try {
    $dns = Resolve-DnsName $DOMINIO_WWW -Type CNAME -ErrorAction Stop
    $cname = ($dns | Select-Object -First 1).NameHost
    if ($cname -match "vercel-dns") { Ok "CNAME ok: $cname"; return }
    Warn "CNAME incorreto ($cname), tentando ajustar..."
  } catch { Warn "DNS $DOMINIO_WWW não resolvido" }

  if (Get-Command vercel -ErrorAction SilentlyContinue) {
    try {
      vercel domains add $DOMINIO_WWW --project $VERCEL_PROJECT_ID 2>&1 | Out-Null
      Ok "vercel domains add executado"
    } catch { Warn "Vercel CLI falhou: $($_.Exception.Message)" }
  } elseif ($VERCEL_TOKEN -and $VERCEL_PROJECT_ID) {
    $curl = @"
curl -X POST "https://api.vercel.com/v10/projects/$VERCEL_PROJECT_ID/domains" ^
 -H "Authorization: Bearer $VERCEL_TOKEN" ^
 -H "Content-Type: application/json" ^
 -d "{\""name\"":\""${DOMINIO_WWW}\""}"
"@
    $curl | Set-Content -Path (Join-Path $LOG_DIR "vercel_add_domain.sh") -Encoding UTF8
    Warn "Template cURL salvo para adicionar domínio."
  }
}

function Check-REST($table){
  $time = (Get-Date).ToString("s")
  $url = "$SUPABASE_URL/rest/v1/$table?select=id&limit=1"
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    $resp = Invoke-RestMethod -Uri $url -Headers @{apikey=$SUPABASE_SERVICE;Authorization="Bearer $SUPABASE_SERVICE"} -TimeoutSec 10 -ErrorAction Stop
    $sw.Stop()
    $ms=[math]::Round($sw.Elapsed.TotalMilliseconds,2)
    LogLine([PSCustomObject]@{time=$time;item="REST_$table";status="OK";detail="ok";ms=$ms})
    Ok "$table OK - ${ms} ms"
    return @{ok=$true;ms=$ms}
  } catch {
    $sw.Stop()
    $ms=[math]::Round($sw.Elapsed.TotalMilliseconds,2)
    $msg=$_.Exception.Message
    LogLine([PSCustomObject]@{time=$time;item="REST_$table";status="FALHA";detail=$msg;ms=$ms})
    Err "$table FALHOU - ${ms} ms"
    return @{ok=$false;ms=$ms;err=$msg}
  }
}

function Generate-HTMLPanel {
  $lines = Get-Content $CSV_FILE -Tail 200
  if ($lines.Count -lt 2){return}
  $rows=@()
  foreach($ln in $lines[1..($lines.Count-1)]) {
    if ($ln -match '^(.*?)\;(.*?)\;(.*?)\;(.*?)\;(.*)$') {
      $rows += [PSCustomObject]@{time=$matches[1];item=$matches[2];status=$matches[3];detail=$matches[4];ms=($matches[5]-as [double])}
    }
  }
  $js=($rows|ConvertTo-Json -Depth 5)
  $html=@"
<!doctype html><html><head>
<meta charset='utf-8'/><title>Triângulo360 Painel</title>
<script src="https://cdn.plot.ly/plotly-2.24.1.min.js"></script>
<style>body{font-family:Inter,system-ui,Arial;background:#0b1229;color:#e5e7eb;margin:12px}.card{background:#0f1a3a;padding:12px;border-radius:12px;margin-bottom:12px;box-shadow:0 8px 24px rgba(0,0,0,0.45)}</style>
</head><body>
<div class="card"><h2>Painel AutoSync v7.3.9</h2><div>Atualizado: <span id='last'></span></div></div>
<div id="pyr" class="card"></div><div id="lat" class="card"></div>
<script>
const data=$js||[];document.getElementById('last').innerText=data.length?data[data.length-1].time:'-';
const fails={};data.forEach(d=>{if(d.status==='FALHA')fails[d.item]=(fails[d.item]||0)+1});
const items=Object.keys(fails).map(k=>({n:k,v:fails[k]})).sort((a,b)=>b.v-a.v);
Plotly.newPlot('pyr',[{type:'bar',x:items.map(i=>i.v),y:items.map(i=>i.n),orientation:'h',marker:{color:items.map(i=>i.v>2?'red':i.v>0?'orange':'green')}}],{title:'Pirâmide de erros'});
const lat={};data.forEach(d=>{const m=Number(d.ms);if(!isNaN(m)){(lat[d.item]=lat[d.item]||[]).push({x:d.time,y:m});}});
const traces=Object.keys(lat).map(k=>({x:lat[k].map(p=>p.x),y:lat[k].map(p=>p.y),mode:'lines+markers',name:k}));
Plotly.newPlot('lat',traces,{title:'Latência (ms) por tabela',xaxis:{type:'category'}});
</script></body></html>
"@
  $html|Set-Content -Path $HTML_FILE -Encoding UTF8
  Ok "Painel HTML atualizado"
}

# === LOOP PRINCIPAL ===
function Do-Cycle([int]$i){
  Rotate-Logs
  $now=(Get-Date).ToString("s")
  Head "Ciclo $i — $now"

  $resumeOk = Supabase-Resume
  if ($resumeOk) { $status="OK" } else { $status="TENTATIVA" }
  LogLine([PSCustomObject]@{time=$now;item="SUPABASE_RESUME";status=$status;detail="projects resume";ms=0})

  foreach($t in $TABLES){ [void](Supabase-DisableRLS $t) }
  Vercel-FixDomain

  $fails=@(); $lat=@{}
  foreach($t in $TABLES){
    $r=Check-REST $t; $lat[$t]=$r.ms
    if(-not $r.ok){$fails+=$t}
  }

  Generate-HTMLPanel
  if($i%3 -eq 0){ try{Start-Process $HTML_FILE}catch{} }

  if($fails.Count -gt 0){
    $msg="🚨 Falhas: $($fails -join ', ') — $(Get-Date -Format 'HH:mm:ss')"
    Send-Telegram $msg; Send-WhatsApp $msg
  }

  $estab=[math]::Round((($TABLES.Count-$fails.Count)/$TABLES.Count)*100,0)
  LogLine([PSCustomObject]@{time=$now;item="ESTABILIDADE";status="$estab%";detail="ok";ms=0})
}

# === EXECUÇÃO ===
if($Loop){
  $c=1; while($true){Clear-Host;Do-Cycle $c;Start-Sleep -Seconds ($IntervaloMin*60);$c++}
}else{
  Do-Cycle 1
}
