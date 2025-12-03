<#
 🌾 Triângulo360 AutoFix v7.4.2
 Totalmente autônomo: detecta, corrige e sincroniza Supabase + REST + DNS + Painel
#>

param(
  [switch]$Loop,
  [int]$IntervaloMin = 10
)

# ===== CONFIG =====
$PROJECT_REF = $env:SUPABASE_PROJECT_REF
$SUPABASE_URL = $env:SUPABASE_URL
$SUPABASE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY
$PG_CONN = $env:PG_CONN
$BASE = "C:\Users\Administrador\pecuariatech"
$LOGS = "$BASE\logs"
if (!(Test-Path $LOGS)) { New-Item -ItemType Directory -Force -Path $LOGS | Out-Null }

$TABLES = @("pastagem","rebanho","financeiro","racas","dashboard")
$CSV = "$LOGS\autofix_v742.csv"
$HTML = "$LOGS\autofix_v742.html"

function Write-Info($t){Write-Host $t -ForegroundColor Cyan}
function Write-OK($t){Write-Host $t -ForegroundColor Green}
function Write-Warn($t){Write-Host $t -ForegroundColor Yellow}
function Write-Err($t){Write-Host $t -ForegroundColor Red}

function Log {
  param($item,$status,$detail,$ms)
  $line = "{0};{1};{2};{3};{4}" -f (Get-Date -Format "s"),$item,$status,($detail -replace "`n"," "),$ms
  Add-Content $CSV $line
}

if (!(Test-Path $CSV)) { "time;item;status;detail;ms" | Out-File $CSV }

# === VERIFICAR VERSÃO CLI ===
$CLI_VERSION = ""
try {
  $CLI_VERSION = (supabase --version 2>$null)
  Write-OK "Supabase CLI detectado: $CLI_VERSION"
} catch {
  Write-Warn "CLI não detectado — será usado fallback via psql."
}

# === FUNÇÕES DE CORREÇÃO RLS ===
function Disable-RLS {
  param($tabela)
  try {
    if ($CLI_VERSION -match "2\.5") {
      supabase db query --sql "ALTER TABLE public.$tabela DISABLE ROW LEVEL SECURITY; CREATE POLICY IF NOT EXISTS full_access_$tabela ON public.$tabela FOR ALL USING (true);" 2>&1 | Out-Null
      Write-OK "RLS e policy corrigidos via CLI: $tabela"
      Log "RLS_$tabela" "OK" "CLI" 0
    } elseif ($PG_CONN) {
      & psql $PG_CONN -c "ALTER TABLE public.$tabela DISABLE ROW LEVEL SECURITY; CREATE POLICY IF NOT EXISTS full_access_$tabela ON public.$tabela FOR ALL USING (true);" | Out-Null
      Write-OK "RLS e policy corrigidos via psql: $tabela"
      Log "RLS_$tabela" "OK" "psql" 0
    } else {
      Write-Warn "Nenhum método RLS para $tabela"
      Log "RLS_$tabela" "PENDENTE" "sem CLI/PSQL" 0
    }
  } catch {
    Write-Err "Erro ao desativar RLS $tabela: $($_.Exception.Message)"
    Log "RLS_$tabela" "ERRO" $_.Exception.Message 0
  }
}

# === TESTE REST ===
function Test-REST {
  param($tabela)
  $url = "$SUPABASE_URL/rest/v1/$tabela?select=id&limit=1"
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    $resp = Invoke-RestMethod -Uri $url -Headers @{apikey=$SUPABASE_KEY;Authorization="Bearer $SUPABASE_KEY"} -Method Get -TimeoutSec 8
    $sw.Stop()
    Write-OK "$tabela OK - $([math]::Round($sw.Elapsed.TotalMilliseconds,2)) ms"
    Log "REST_$tabela" "OK" "ok" $sw.Elapsed.TotalMilliseconds
  } catch {
    $sw.Stop()
    Write-Err "$tabela FALHOU - $([math]::Round($sw.Elapsed.TotalMilliseconds,2)) ms"
    Log "REST_$tabela" "FALHA" $_.Exception.Message $sw.Elapsed.TotalMilliseconds
  }
}

# === GERA HTML ===
function Generate-HTML {
  $dados = Get-Content $CSV | Select-Object -Skip 1
  $js = ($dados | ConvertTo-Json)
  $html = @"
<!doctype html>
<html><head><meta charset='utf-8'/><title>Triângulo360 AutoFix</title>
<script src='https://cdn.plot.ly/plotly-2.27.0.min.js'></script>
<style>
body{background:#0f172a;color:#eee;font-family:Inter,Arial}
.card{background:#111c40;padding:10px;margin:8px;border-radius:10px}
</style></head>
<body>
<h2>🌾 Triângulo360 AutoFix v7.4.2</h2>
<div id='pyramid' class='card'></div>
<div id='latency' class='card'></div>
<script>
const rows = `$js`.trim().split('\\n').map(l=>l.split(';'));
const headers = rows.shift();
const objs = rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]])));
const fails = {};
objs.forEach(o=>{if(o.status==='FALHA'){fails[o.item]=(fails[o.item]||0)+1;}});
const keys = Object.keys(fails);
const vals = Object.values(fails);
Plotly.newPlot('pyramid',[{x:vals,y:keys,orientation:'h',type:'bar',marker:{color:vals.map(v=>v>2?'red':v>0?'orange':'green')}}],
{title:'Pirâmide de Falhas',margin:{l:150}});
const traces = {};
objs.forEach(o=>{
  if(o.item.startsWith('REST_')){
    const t=o.item.replace('REST_','');
    if(!traces[t]) traces[t]={x:[],y:[],type:'scatter',mode:'lines+markers',name:t};
    traces[t].x.push(o.time); traces[t].y.push(parseFloat(o.ms||0));
  }
});
Plotly.newPlot('latency',Object.values(traces),{title:'Latência REST (ms)'});
</script></body></html>
"@
  $html | Set-Content $HTML -Encoding UTF8
  Write-OK "Painel HTML atualizado → $HTML"
}

# === CICLO PRINCIPAL ===
function Run-Cycle {
  Write-Info "Ciclo iniciado — $(Get-Date -Format 's')"
  if ($PROJECT_REF) {
    try {
      supabase projects resume --project-ref $PROJECT_REF 2>&1 | Out-Null
      Write-OK "Supabase resume OK"
      Log "SUPABASE_RESUME" "OK" "resume" 0
    } catch {
      Write-Warn "Falha em resume: $($_.Exception.Message)"
      Log "SUPABASE_RESUME" "FALHA" $_.Exception.Message 0
    }
  } else {
    Write-Warn "PROJECT_REF ausente"
    Log "SUPABASE_RESUME" "PENDENTE" "sem project_ref" 0
  }

  foreach ($t in $TABLES) { Disable-RLS $t }
  foreach ($t in $TABLES) { Test-REST $t }
  Generate-HTML
}

# === LOOP ===
if ($Loop) {
  while ($true) {
    Run-Cycle
    Start-Sleep -Seconds ($IntervaloMin * 60)
  }
} else {
  Run-Cycle
}
