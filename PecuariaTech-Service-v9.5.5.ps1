<#
🌾 PecuariaTech-Service v9.5.5 — Loop Continuum
Mantém o v9.5.4 + execução contínua automática (5 min)
#>

$base      = "C:\Users\Administrador\pecuariatech"
$htmlPath  = "$base\status.html"
$logPath   = "$base\logs\status_triangulo360.csv"
$interval  = 300   # segundos (5 min)

function Say($m,$c="White"){Write-Host $m -ForegroundColor $c}
function Log($m){$ts=(Get-Date -Format "yyyy-MM-dd HH:mm:ss");Write-Host "$ts $m"}

# ==== Variáveis Supabase ====
if(-not $env:PECUARIA_SUPABASE_URL){
    $url=Read-Host "Informe a URL do Supabase (ex: https://xxxx.supabase.co)"
    setx PECUARIA_SUPABASE_URL $url|Out-Null; $env:PECUARIA_SUPABASE_URL=$url
}
if(-not $env:PECUARIA_SUPABASE_KEY){
    $key=Read-Host "Informe a Service Role Key do Supabase"
    setx PECUARIA_SUPABASE_KEY $key|Out-Null; $env:PECUARIA_SUPABASE_KEY=$key
}
$SUPABASE_URL=$env:PECUARIA_SUPABASE_URL
$SUPABASE_KEY=$env:PECUARIA_SUPABASE_KEY
if(-not $SUPABASE_URL -or -not $SUPABASE_KEY){Say "[ERROR] Variáveis Supabase ausentes!" Red;exit}

# ==== Estrutura ====
$logDir=Split-Path $logPath
if(!(Test-Path $logDir)){New-Item -ItemType Directory -Path $logDir|Out-Null}
if(!(Test-Path $logPath)){"time;item;status;detail;ms"|Out-File $logPath}

# ==== Testes ====
function Test-DNS{
  try{Resolve-DnsName "pecuariatech.com" -ErrorAction Stop|Out-Null
      Log "[OK] DNS resolvido.";return "OK"}
  catch{Log "[FAIL] DNS";return "FAIL"}}

function Test-HTTPS{
  $url="https://www.pecuariatech.com"
  $sw=[Diagnostics.Stopwatch]::StartNew()
  try{$r=Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
      $sw.Stop();Log "[OK] HTTPS $($r.StatusCode) em $([math]::Round($sw.Elapsed.TotalMilliseconds)) ms"
      return "OK"}
  catch{$sw.Stop();Log "[FAIL] HTTPS $($_.Exception.Message)";return "FAIL"}}

function Test-REST($t){
  $url="$SUPABASE_URL/rest/v1/$t?limit=1"
  $sw=[Diagnostics.Stopwatch]::StartNew()
  try{$r=Invoke-RestMethod -Uri $url -Headers @{apikey=$SUPABASE_KEY;Authorization="Bearer $SUPABASE_KEY"} -TimeoutSec 10 -ErrorAction Stop
      $sw.Stop();Log "[OK] REST $t em $([math]::Round($sw.Elapsed.TotalMilliseconds)) ms";return "OK"}
  catch{$sw.Stop();Log "[FAIL] REST $t $($_.Exception.Message)";return "FAIL"}}

function Write-LogCsv($item,$status,$detail,$ms){
  Add-Content $logPath ("{0};{1};{2};{3};{4}" -f (Get-Date -Format "s"),$item,$status,($detail -replace ";",","),$ms)
}

# ==== HTML ====
function Generate-HTML{
  $rows=Get-Content $logPath|Select-Object -Skip 1
  $parsed=@()
  foreach($ln in $rows){
    $p=$ln -split ';',5
    if($p.Count -lt 5){continue}
    [double]$ms=[double]$p[4]
    $parsed+=[PSCustomObject]@{time=$p[0];item=$p[1];status=$p[2];detail=$p[3];ms=$ms}
  }
  $json=$parsed|ConvertTo-Json -Compress
  $html=@"
<!DOCTYPE html><html><head><meta charset="utf-8">
<title>PecuariaTech — Triângulo 360º</title>
<script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
<style>
body{background:#0f172a;color:#eee;font-family:Arial;text-align:center;margin:0;padding:10px}
.card{background:#111c40;padding:10px;margin:8px;border-radius:10px}
</style></head><body>
<h2>🌾 PecuariaTech — Triângulo 360º</h2>
<div id="chart" class="card"></div>
<script>
const data=$json;
const fails={};
for(const r of data){if(r.status==="FAIL")fails[r.item]=(fails[r.item]||0)+1;}
Plotly.newPlot("chart",[{
x:Object.values(fails),y:Object.keys(fails),
type:"bar",orientation:"h"}],
{title:"Falhas do Sistema (Triângulo 360º)",margin:{l:160,r:20,t:40,b:40}});
</script></body></html>
"@
  [System.IO.File]::WriteAllText($htmlPath,$html,[System.Text.Encoding]::UTF8)
  Log "[OK] Painel HTML atualizado → $htmlPath"
}

# ==== LOOP CONTÍNUO ====
Log "[INFO] === PecuariaTech Cloud Service v9.5.5 iniciado (Loop Continuum) ==="
try{Start-Process $htmlPath}catch{}
$tables=@("pastagem","rebanho","financeiro","racas","dashboard")

while($true){
  Log "=== Novo ciclo $(Get-Date -Format 'HH:mm:ss') ==="
  $dns=Test-DNS
  $https=Test-HTTPS
  foreach($t in $tables){Test-REST $t}
  Generate-HTML
  Log "[DONE] Ciclo concluído. Aguardando $interval s..."
  Start-Sleep -Seconds $interval
}
