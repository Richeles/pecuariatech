<#
───────────────────────────────────────────────────────────────
🌾 PecuariaTech · Triângulo 360° CloudOps v7.3.5
───────────────────────────────────────────────────────────────
Verifica e unifica:
- DNS / SSL / HTTPS
- Supabase REST + RLS
- CLI / Scheduler / CORS
- Logs e latência em CSV + PDF (texto)
- Pirâmide 3D sobreposta no terminal
───────────────────────────────────────────────────────────────
#>

# === CONFIGURAÇÕES ===
$DOMINIO_RAIZ   = "pecuariatech.com"
$DOMINIO_WWW    = "www.pecuariatech.com"
$URL_PROD       = $env:NEXT_PUBLIC_SITE_URL
if (-not $URL_PROD -or $URL_PROD -notmatch '^https?://') { $URL_PROD = "https://pecuariatech.vercel.app" }

$SUPABASE_URL   = $env:NEXT_PUBLIC_SUPABASE_URL
$API_ANON       = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
$API_SERVICE    = $env:SUPABASE_SERVICE_ROLE_KEY
$TABELAS        = @("pastagem","rebanho","financeiro","racas","dashboard")

$LOG_DIR        = "C:\Logs\PecuariaTech"
$CSV_OUT        = Join-Path $LOG_DIR "incongruencias_v735.csv"
$TXT_OUT        = Join-Path $LOG_DIR "incongruencias_v735.txt"
$PDF_OUT        = Join-Path $LOG_DIR "incongruencias_v735.pdf"

$SCRIPTS_CHAIN  = @(
  "C:\Users\Administrador\pecuariatech\Triangulo360-SetupCloud-v7.2.5.ps1",
  "C:\Users\Administrador\pecuariatech\Triangulo360-SetupCloud-v7.2.4.ps1",
  "C:\Users\Administrador\pecuariatech\Triangulo360-FullAutoReport-v733.ps1"
)

# === FUNÇÕES DE SUPORTE ===
function Head($t){ Write-Host "`n$t" -ForegroundColor Cyan }
function Ok($t){ Write-Host $t -ForegroundColor Green }
function Warn($t){ Write-Host $t -ForegroundColor Yellow }
function Err($t){ Write-Host $t -ForegroundColor Red }

if (!(Test-Path $LOG_DIR)) { New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null }

$checks = @()
$lat = @{}
function Add-Check($n,$s,$d){ $checks += [PSCustomObject]@{Item=$n;Status=$s;Detalhe=$d} }
function Measure-Block([scriptblock]$b){ $sw=[System.Diagnostics.Stopwatch]::StartNew();$r=&$b;$sw.Stop();return @{r=$r;ms=[math]::Round($sw.Elapsed.TotalMilliseconds,2)} }

# === CONTINUIDADE ===
Head "⚙️ Continuidade — alinhando versões anteriores"
foreach($s in $SCRIPTS_CHAIN){
  if (Test-Path $s){
    try {
      Write-Host "→ Executando: $s" -ForegroundColor DarkCyan
      & $s | Out-Null
      Ok "✓ Script finalizado: $s"
    } catch {
      Warn "☁️ Falha não crítica ao executar ${s}: $($_.Exception.Message)"
    }
  }
}

# === DNS ===
Head "🌐 DNS — resolvendo domínio"
try {
  $r1 = Measure-Block { Resolve-DnsName $DOMINIO_RAIZ -ErrorAction Stop | Out-Null }
  $lat["DNS-$DOMINIO_RAIZ"]=$r1.ms
  Ok "✅ DNS raiz ok ($($r1.ms) ms)"
  Add-Check "DNS($DOMINIO_RAIZ)" "OK" "Resolveu em $($r1.ms) ms"
} catch { Err "❌ Falha DNS raiz: $($_.Exception.Message)"; Add-Check "DNS($DOMINIO_RAIZ)" "FALHA" $_.Exception.Message }

try {
  $r2 = Measure-Block { Resolve-DnsName $DOMINIO_WWW -Type CNAME -ErrorAction Stop }
  $cname = ($r2.r | Select-Object -First 1).NameHost
  $okCname = $cname -match "vercel-dns\.com"
  Add-Check "DNS($DOMINIO_WWW)" ($(if($okCname){"OK"}else{"INCOMPLETO"}), "CNAME=$cname")
  if($okCname){ Ok "✅ $DOMINIO_WWW → $cname" } else { Warn "🟠 CNAME incorreto ($cname)" }
} catch { Err "❌ Falha DNS www: $($_.Exception.Message)" }

# === HTTPS ===
Head "🔐 HTTPS — testando $URL_PROD"
try {
  $r3 = Measure-Block { Invoke-WebRequest -Uri $URL_PROD -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop }
  $lat["HTTPS"]=$r3.ms
  $ok = $r3.r.StatusCode -eq 200
  Add-Check "HTTPS" ($(if($ok){"OK"}else{"FALHA"}), "$($r3.ms) ms")
  if($ok){ Ok "✅ HTTPS ativo ($($r3.ms) ms)" } else { Err "❌ HTTPS retornou código inesperado" }
} catch { Err "❌ HTTPS falhou: $($_.Exception.Message)" }

# === SUPABASE REST/RLS ===
Head "🧠 Supabase REST/RLS"
if (!$SUPABASE_URL){ Add-Check "SUPABASE_URL" "FALHA" "variável ausente"; Err "❌ SUPABASE_URL ausente" }
foreach($tb in $TABELAS){
  $endpoint = "$SUPABASE_URL/rest/v1/$tb?select=id&limit=1"
  $anon = Measure-Block { try { Invoke-WebRequest -Uri $endpoint -Headers @{apikey=$API_ANON;Authorization="Bearer $API_ANON"} -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop } catch { $_ } }
  $svc  = Measure-Block { try { Invoke-WebRequest -Uri $endpoint -Headers @{apikey=$API_SERVICE;Authorization="Bearer $API_SERVICE"} -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop } catch { $_ } }
  $anonOk = ($anon.r -isnot [System.Management.Automation.ErrorRecord])
  $svcOk  = ($svc.r -isnot [System.Management.Automation.ErrorRecord])
  $st = if($svcOk){ if($anonOk){"OK"} else {"RLS"} } else {"FALHA"}
  Add-Check "REST($tb)" $st "anon=$anonOk;svc=$svcOk;ms(a)=$($anon.ms);ms(s)=$($svc.ms)"
  switch($st){
    "OK" { Ok "✅ $tb ok ($($anon.ms)/$($svc.ms) ms)" }
    "RLS" { Warn "🟠 $tb restrição RLS" }
    "FALHA" { Err "❌ $tb falhou REST" }
  }
}

# === CLI / SCHEDULER ===
Head "🧰 Supabase CLI / Scheduler"
try {
  $cli = (supabase --version) 2>$null
  $okVer = $cli -match "^2\."
  Add-Check "CLI" ($(if($okVer){"OK"}else{"DESATUALIZADA"}), "$cli")
  if($okVer){ Ok "✅ CLI detectada ($cli)" } else { Warn "🟠 CLI antiga ($cli)" }
} catch { Err "❌ CLI não encontrada" }

# === CORS ===
Head "🌀 CORS — pré-flight OPTIONS"
try {
  $cors = Invoke-WebRequest -Uri $URL_PROD -Method Options -TimeoutSec 10 -UseBasicParsing -ErrorAction SilentlyContinue
  $allow = $cors.Headers["Access-Control-Allow-Origin"]
  if($allow){ Add-Check "CORS" "OK" "Allow=$allow"; Ok "✅ CORS liberado ($allow)" } else { Add-Check "CORS" "INCOMPLETO" "Sem Allow-Origin"; Warn "🟠 CORS parcial" }
} catch { Add-Check "CORS" "INDEFINIDO" "Sem resposta" }

# === EXPORTAÇÃO ===
Head "💾 Exportando relatórios"
$checks | ForEach-Object { "$($_.Item);$($_.Status);$($_.Detalhe)" } | Set-Content -Encoding UTF8 -Path $CSV_OUT
$checks | Out-File -FilePath $TXT_OUT -Encoding UTF8
Copy-Item $TXT_OUT $PDF_OUT -Force
Ok "✅ CSV/TXT/PDF salvos em $LOG_DIR"

# === TRIÂNGULO 3D ===
Head "🔺 Triângulo 360° — Pirâmide de erros"
function Score($s){
  switch($s){
    "FALHA" {3}
    "DESATUALIZADA" {2}
    "AUSENTE" {2}
    "RLS" {2}
    "INCOMPLETO" {1}
    default {0}
  }
}
$grupos = $checks | Group-Object {($_.Item -split "[(]")[0]} | ForEach-Object {
  [PSCustomObject]@{Grupo=$_.Name;Peso=($_.Group | % {Score $_.Status} | Measure-Object -Sum).Sum}
}
$rank = $grupos | Sort-Object Peso -Descending
$max = [math]::Max(1,($rank.Peso | Measure-Object -Maximum).Maximum)

Write-Host ""
Write-Host "              /\                      " -ForegroundColor DarkGray
Write-Host "             /  \   (verso ░░░ sombras)" -ForegroundColor DarkGray
foreach($r in $rank){
  $bar="█"*([math]::Round(($r.Peso/$max)*12))
  $pad=" "*(12-$bar.Length)
  Write-Host "            /$pad$bar░░\ ← $($r.Grupo) ($($r.Peso))" -ForegroundColor (if($r.Peso -ge 3){"Red"}elseif($r.Peso -eq 2){"Yellow"}else{"Green"})
}
Write-Host "           /________________\         " -ForegroundColor DarkGray

# === FIM ===
Head "✅ Concluído com sucesso"
Write-Host "📁 Logs: $LOG_DIR"
Write-Host "🌐 Site: $URL_PROD"
Write-Host "📜 Relatórios: incongruencias_v735.csv / txt / pdf"
