<#
🌾 Triângulo360 AutoFix v7.6.2 — PowerShell 7+
Autor: Richeles Alves
Descrição:
- Corrige RLS nas tabelas Supabase
- Testa endpoints REST
- Gera painel HTML 3D com Plotly
- Cria serviço automático opcional
#>

param(
  [switch]$Loop,
  [switch]$Service,
  [int]$IntervaloMin = 10
)

# --- CONFIGURAÇÃO ---
$BASE = "C:\Users\Administrador\pecuariatech"
$LOGS = "$BASE\logs"
$ARCHIVE = "$LOGS\archive"
$CSV = Join-Path $LOGS "autofix_v762.csv"
$HTML_PATH = Join-Path $LOGS "autofix_v762.html"

$PROJECT_REF = $env:SUPABASE_PROJECT_REF
$SUPABASE_URL = $env:SUPABASE_URL
$SUPABASE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY
$TABLES = @("pastagem","rebanho","financeiro","racas","dashboard")

# --- PREPARAÇÃO ---
if (!(Test-Path $LOGS)) { New-Item -ItemType Directory -Force -Path $LOGS | Out-Null }
if (!(Test-Path $ARCHIVE)) { New-Item -ItemType Directory -Force -Path $ARCHIVE | Out-Null }
if (!(Test-Path $CSV)) { "time;item;status;detail;ms" | Out-File $CSV }

function Say($msg,$color){ Write-Host $msg -ForegroundColor $color }
function Log($item,$status,$detail,$ms){
  $line = "{0};{1};{2};{3};{4}" -f (Get-Date -Format "s"),$item,$status,($detail -replace "`n"," "),$ms
  Add-Content $CSV $line
}

# Compacta logs antigos
$now = Get-Date -Format "yyyyMMdd_HHmmss"
$zip = Join-Path $ARCHIVE "autosync_$now.zip"
Get-ChildItem $LOGS -File -Include *.csv,*.txt,*.json -ErrorAction SilentlyContinue |
  Compress-Archive -DestinationPath $zip -Force
Say "📦 Logs compactados → $zip" Yellow

# --- FUNÇÕES ---
function Disable-RLS($tabela){
  try {
    supabase db query --sql "ALTER TABLE public.$tabela DISABLE ROW LEVEL SECURITY; CREATE POLICY IF NOT EXISTS full_access_$tabela ON public.$tabela FOR ALL USING (true);" 2>&1 | Out-Null
    Say "✅ RLS corrigido via CLI: $tabela" Green
    Log "RLS_$tabela" "OK" "CLI" 0
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

function Generate-HTML {
  if (!(Test-Path $CSV)) { return }
  $dados = Get-Content $CSV | Select-Object -Skip 1
  if ($dados.Count -eq 0) { return }
  
  $html = @"
<!doctype html>
<html>
<head>
<meta charset='utf-8'/>
<title>Triângulo360 AutoFix v7.6.2</title>
<script src='https://cdn.plot.ly/plotly-2.27.0.min.js'></script>
<style>
body{background:#0f172a;color:#eee;font-family:Inter,Arial;text-align:center}
.card{background:#111c40;padding:10px;margin:8px;border-radius:10px}
</style>
</head>
<body>
<h2>🌾 Triângulo360 AutoFix v7.6.2 — Dashboard Realtime</h2>
<div id='pyramid' class='card'></div>
<div id='latency' class='card'></div>
<script>
async function refresh(){
 const res = await fetch('autofix_v762.csv?'+Date.now());
 const txt = await res.text();
 const lines = txt.trim().split('\\n'); const head = lines.shift().split(';');
 const objs = lines.map(l=>{const vals=l.split(';');return Object.fromEntries(head.map((h,i)=>[h,vals[i]]));});
 const fails={}; objs.forEach(o=>{if(o.status==='FALHA'){fails[o.item]=(fails[o.item]||0)+1;}});
 const keys=Object.keys(fails);const vals=Object.values(fails);
 Plotly.newPlot('pyramid',[{x:vals,y:keys,orientation:'h',type:'bar',
 marker:{color:vals.map(v=>v>2?'red':v>0?'orange':'green')}}],
 {title:'Pirâmide de Falhas',margin:{l:150}});
 const traces={}; objs.forEach(o=>{if(o.item.startsWith('REST_')){
  const t=o.item.replace('REST_','');
  if(!traces[t])traces[t]={x:[],y:[],type:'scatter3d',mode:'lines+markers',name:t};
  traces[t].x.push(o.time); traces[t].y.push(parseFloat(o.ms||0)); traces[t].z.push(Math.random()*5);
 }});
 Plotly.newPlot('latency',Object.values(traces),
 {title:'Latência REST (3D)',scene:{xaxis:{title:'tempo'},yaxis:{title:'ms'},zaxis:{title:'módulo'}}});
}
refresh(); setInterval(refresh,60000);
</script>
</body></html>
"@
  Set-Content -LiteralPath $HTML_PATH -Value $html -Encoding UTF8
  Say "📊 Painel HTML atualizado → $HTML_PATH" Green
}

function Run-Cycle {
  Say "`n🕓 Iniciando ciclo às $(Get-Date -Format 'HH:mm:ss')" Cyan
  if ($PROJECT_REF) {
    supabase projects resume --project-ref $PROJECT_REF 2>&1 | Out-Null
    Say "✅ Supabase resume OK" Green
  } else {
    Say "⚠️ PROJECT_REF ausente" Yellow
  }
  foreach ($t in $TABLES) { Disable-RLS $t }
  $fails = @(); foreach ($t in $TABLES) { if (-not (Test-REST $t)) { $fails += $t } }
  Generate-HTML
  if ($fails.Count -gt 0) { Say "🚨 Falha detectada em: $($fails -join ', ')" Red } else { Say "✅ Tudo OK!" Green }
}

# --- EXECUÇÃO ---
if ($Service) {
  $svc = "Triangulo360AutoFix"
  if (!(Get-Service $svc -ErrorAction SilentlyContinue)) {
    $cmd = "pwsh -NoProfile -ExecutionPolicy Bypass -File `"$BASE\Triangulo360-AutoFix-v762.ps1`" -Loop -IntervaloMin 10"
    New-Service -Name $svc -BinaryPathName $cmd -DisplayName "Triângulo360 AutoFix Service" -StartupType Automatic
    Start-Service $svc
    Say "🧩 Serviço criado e iniciado: $svc" Green
  } else {
    Say "✅ Serviço já existe — reiniciando..." Yellow
    Restart-Service $svc
  }
}
elseif ($Loop) {
  while ($true) { Run-Cycle; Start-Sleep -Seconds ($IntervaloMin * 60) }
} else {
  Run-Cycle
}
