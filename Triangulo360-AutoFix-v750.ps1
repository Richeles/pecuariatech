<#
🌾 Triângulo360 AutoFix v7.5.0 — Supabase + REST + Painel + Alertas + Assinatura
Autor: Richeles Alves
#>

param(
  [switch]$Loop,
  [int]$IntervaloMin = 10
)

# ============ CONFIGURAÇÕES ============
$PROJECT_REF = $env:SUPABASE_PROJECT_REF
$SUPABASE_URL = $env:SUPABASE_URL
$SUPABASE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY
$PG_CONN = $env:PG_CONN
$TELEGRAM_TOKEN = $env:TELEGRAM_TOKEN
$TELEGRAM_CHAT = $env:TELEGRAM_CHAT_ID
$WHATSAPP_WEBHOOK = $env:WHATSAPP_WEBHOOK

$BASE = "C:\Users\Administrador\pecuariatech"
$LOGS = "$BASE\logs"
$ARCHIVE = "$LOGS\archive"
if (!(Test-Path $LOGS)) { New-Item -ItemType Directory -Force -Path $LOGS | Out-Null }
if (!(Test-Path $ARCHIVE)) { New-Item -ItemType Directory -Force -Path $ARCHIVE | Out-Null }

$TABLES = @("pastagem","rebanho","financeiro","racas","dashboard")
$CSV = "$LOGS\autofix_v750.csv"
$HTML = "$LOGS\autofix_v750.html"

# ============ FUNÇÕES DE SUPORTE ============
function Say($msg,$color){ Write-Host $msg -ForegroundColor $color }
function Log($item,$status,$detail,$ms){
  $line = "{0};{1};{2};{3};{4}" -f (Get-Date -Format "s"),$item,$status,($detail -replace "`n"," "),$ms
  Add-Content $CSV $line
}

# ============ INICIALIZAÇÃO ============
if (!(Test-Path $CSV)) { "time;item;status;detail;ms" | Out-File $CSV }
$now = Get-Date -Format "yyyyMMdd_HHmmss"
$zip = "$ARCHIVE\autosync_$now.zip"
Get-ChildItem $LOGS -File -Include *.csv,*.txt,*.json | Compress-Archive -DestinationPath $zip -Force
Say "📦 Logs compactados → $zip" Yellow

# ============ FUNÇÕES ============
function Disable-RLS($tabela){
  try {
    if (Get-Command supabase -ErrorAction SilentlyContinue) {
      supabase db query --sql "ALTER TABLE public.$tabela DISABLE ROW LEVEL SECURITY; CREATE POLICY IF NOT EXISTS full_access_$tabela ON public.$tabela FOR ALL USING (true);" 2>&1 | Out-Null
      Say "✅ RLS corrigido via CLI: $tabela" Green
      Log "RLS_$tabela" "OK" "CLI" 0
    } elseif ($PG_CONN) {
      & psql $PG_CONN -c "ALTER TABLE public.$tabela DISABLE ROW LEVEL SECURITY;" | Out-Null
      Say "✅ RLS corrigido via psql: $tabela" Green
      Log "RLS_$tabela" "OK" "psql" 0
    } else {
      Say "⚠️ Sem método RLS para $tabela" Yellow
      Log "RLS_$tabela" "PENDENTE" "sem CLI/PSQL" 0
    }
  } catch {
    Say "❌ Erro ao desativar RLS ${tabela}: $($_.Exception.Message)" Red
    Log "RLS_$tabela" "ERRO" $_.Exception.Message 0
  }
}

function Test-REST($tabela){
  $url = "$SUPABASE_URL/rest/v1/$tabela?select=id&limit=1"
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    $resp = Invoke-RestMethod -Uri $url -Headers @{apikey=$SUPABASE_KEY;Authorization="Bearer $SUPABASE_KEY"} -TimeoutSec 10
    $sw.Stop()
    Say "✅ $tabela OK - $([math]::Round($sw.Elapsed.TotalMilliseconds,2)) ms" Green
    Log "REST_$tabela" "OK" "ok" $sw.Elapsed.TotalMilliseconds
    return $true
  } catch {
    $sw.Stop()
    Say "❌ $tabela FALHOU - $([math]::Round($sw.Elapsed.TotalMilliseconds,2)) ms" Red
    Log "REST_$tabela" "FALHA" $_.Exception.Message $sw.Elapsed.TotalMilliseconds
    return $false
  }
}

function Send-Alert($msg){
  if ($TELEGRAM_TOKEN -and $TELEGRAM_CHAT) {
    try {
      Invoke-RestMethod -Uri "https://api.telegram.org/bot$TELEGRAM_TOKEN/sendMessage" -Method Post -Body (@{chat_id=$TELEGRAM_CHAT;text=$msg}) | Out-Null
      Say "📲 Alerta Telegram enviado" Green
    } catch { Say "⚠️ Falha Telegram: $($_.Exception.Message)" Yellow }
  }
  if ($WHATSAPP_WEBHOOK) {
    try {
      Invoke-RestMethod -Uri $WHATSAPP_WEBHOOK -Method Post -Body (@{message=$msg} | ConvertTo-Json) | Out-Null
      Say "📱 Alerta WhatsApp enviado" Green
    } catch { Say "⚠️ Falha WhatsApp: $($_.Exception.Message)" Yellow }
  }
}

function Generate-HTML {
  $dados = Get-Content $CSV | Select-Object -Skip 1
  $js = ($dados | ConvertTo-Json)
  $html = @"
<!doctype html>
<html><head><meta charset='utf-8'/><title>Triângulo360 AutoFix v7.5.0</title>
<script src='https://cdn.plot.ly/plotly-2.27.0.min.js'></script>
<style>
body{background:#0f172a;color:#eee;font-family:Inter,Arial;text-align:center}
.card{background:#111c40;padding:10px;margin:8px;border-radius:10px}
</style></head>
<body>
<h2>🌾 Triângulo360 AutoFix v7.5.0</h2>
<div id='pyramid' class='card'></div>
<div id='latency' class='card'></div>
<script>
const rows = `$js`.trim().split('\\n').map(l=>l.split(';'));
const headers = rows.shift();
const objs = rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]])));
const fails = {};
objs.forEach(o=>{if(o.status==='FALHA'){fails[o.item]=(fails[o.item]||0)+1;}});
const keys = Object.keys(fails); const vals = Object.values(fails);
Plotly.newPlot('pyramid',[{x:vals,y:keys,orientation:'h',type:'bar',marker:{color:vals.map(v=>v>2?'red':v>0?'orange':'green')}}],
{title:'Pirâmide de Falhas 3D',scene:{camera:{eye:{x:1.3,y:1.3,z:0.7}}},margin:{l:150}});
const traces = {}; objs.forEach(o=>{
 if(o.item.startsWith('REST_')){
  const t=o.item.replace('REST_','');
  if(!traces[t]) traces[t]={x:[],y:[],type:'scatter3d',mode:'lines+markers',name:t};
  traces[t].x.push(o.time); traces[t].y.push(parseFloat(o.ms||0)); traces[t].z.push(Math.random()*5);
 }});
Plotly.newPlot('latency',Object.values(traces),{title:'Latência REST (3D)',scene:{xaxis:{title:'tempo'},yaxis:{title:'ms'},zaxis:{title:'módulo'}}});
</script></body></html>
"@
  $html | Set-Content $HTML -Encoding UTF8
  Say "📊 Painel HTML gerado → $HTML" Green
}

function Run-Cycle {
  Say "`n🕓 Iniciando ciclo às $(Get-Date -Format 'HH:mm:ss')" Cyan
  if ($PROJECT_REF) {
    try {
      supabase projects resume --project-ref $PROJECT_REF 2>&1 | Out-Null
      Say "✅ Supabase resume OK" Green
      Log "SUPABASE_RESUME" "OK" "resume" 0
    } catch {
      Say "⚠️ Falha em resume: $($_.Exception.Message)" Yellow
      Log "SUPABASE_RESUME" "FALHA" $_.Exception.Message 0
    }
  } else {
    Say "⚠️ PROJECT_REF ausente" Yellow
  }

  foreach ($t in $TABLES) { Disable-RLS $t }

  $falhas = @()
  foreach ($t in $TABLES) { if (-not (Test-REST $t)) { $falhas += $t } }

  Generate-HTML

  if ($falhas.Count -gt 0) {
    $msg = "🚨 Triângulo360 Alerta — Falha em: $($falhas -join ', ')"
    Send-Alert $msg
  } else {
    Send-Alert "✅ Triângulo360 OK — Todos os módulos operando normalmente"
  }
}

# ============ EXECUÇÃO ============
if ($Loop) {
  while ($true) {
    Run-Cycle
    Start-Sleep -Seconds ($IntervaloMin * 60)
  }
} else {
  Run-Cycle
}

# ============ BLOCO DE ASSINATURA ============
# Para registrar como confiável:
# Set-AuthenticodeSignature "C:\Users\Administrador\pecuariatech\Triangulo360-AutoFix-v750.ps1" @(Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert)[0]
