<#
───────────────────────────────────────────────────────────────
 🌾 PecuariaTech · Triângulo 360° v7.3.4 — Incongruências + 3D
───────────────────────────────────────────────────────────────
• Verifica: DNS/SSL (domínio), REST/RLS (Supabase), CLI/Scheduler,
  Vercel (CNAME), latências e CORS basilisco.
• Gera: CSV + TXT(PDF simples), e Triângulo 360° “3D” no terminal.
• Continuidade: tenta rodar scripts anteriores (se presentes) para
  “potencializar” e alinhar camadas que não geram consonância.
───────────────────────────────────────────────────────────────
#>

# ==== CONFIG BÁSICA (ajuste se precisar) ====
$DOMINIO_RAIZ   = "pecuariatech.com"
$DOMINIO_WWW    = "www.pecuariatech.com"   # esperado CNAME -> vercel-dns.com
$URL_PROD       = $env:NEXT_PUBLIC_SITE_URL
if (-not $URL_PROD -or $URL_PROD -notmatch '^https?://') { $URL_PROD = "https://pecuariatech.vercel.app" }

$SUPABASE_URL   = $env:NEXT_PUBLIC_SUPABASE_URL
$API_ANON       = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
$API_SERVICE    = $env:SUPABASE_SERVICE_ROLE_KEY
$TABELAS        = @("pastagem","rebanho","financeiro","racas","dashboard")

$LOG_DIR        = "C:\Logs\PecuariaTech"
$CSV_OUT        = Join-Path $LOG_DIR "incongruencias_v734.csv"
$PDF_TXT        = Join-Path $LOG_DIR "incongruencias_v734.pdf"   # (conteúdo texto UTF-8)
$RAW_TXT        = Join-Path $LOG_DIR "incongruencias_v734.txt"

# Scripts de continuidade (executa se existirem)
$SCRIPTS_CHAIN  = @(
  "C:\Users\Administrador\pecuariatech\Triangulo360-SetupCloud-v7.2.5.ps1",
  "C:\Users\Administrador\pecuariatech\Triangulo360-FullAutoReport-v733.ps1",
  "C:\Users\Administrador\pecuariatech\Triangulo360-SetupCloud-v7.2.4.ps1"
)

# ==== UTILITÁRIOS ====
function Head($t){ Write-Host "`n$t" -ForegroundColor Cyan }
function Ok($t){ Write-Host $t -ForegroundColor Green }
function Warn($t){ Write-Host $t -ForegroundColor Yellow }
function Err($t){ Write-Host $t -ForegroundColor Red }

if (-not (Test-Path $LOG_DIR)) { New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null }

$checks = @()
$lat    = @{}
function Add-Check($nome, $status, $detalhe){
  $checks += [PSCustomObject]@{ Item=$nome; Status=$status; Detalhe=$detalhe }
}

function Measure-Block([scriptblock]$code){
  $sw=[System.Diagnostics.Stopwatch]::StartNew()
  $res = & $code
  $sw.Stop()
  return @{ result=$res; ms=[math]::Round($sw.Elapsed.TotalMilliseconds,2) }
}

# ==== 0) CONTINUIDADE: tentar “potencializar” camadas chamando scripts prévios ====
Head "⚙️ Continuidade — alinhando scripts antigos"
foreach($s in $SCRIPTS_CHAIN){
  if (Test-Path $s){
    try{
      Write-Host "→ Executando: $s" -ForegroundColor DarkCyan
      & $s | Out-Null
      Ok "✓ Script finalizado: $s"
    } catch {
      Warn "☁️ Falha não crítica ao executar $s: $($_.Exception.Message)"
    }
  }
}

# ==== 1) DNS do domínio / Vercel ====
Head "🌐 DNS — raiz e www"
try{
  $m1 = Measure-Block { Resolve-DnsName $DOMINIO_RAIZ -ErrorAction Stop | Out-Null }
  $lat["DNS-$DOMINIO_RAIZ"]=$m1.ms
  Add-Check "DNS($DOMINIO_RAIZ)" "OK" "Resolveu em $($m1.ms) ms"
  Ok "✅ $DOMINIO_RAIZ resolvido ($($m1.ms) ms)"
}catch{ Add-Check "DNS($DOMINIO_RAIZ)" "FALHA" $_.Exception.Message; Err "❌ DNS raiz falhou: $($_.Exception.Message)" }

try{
  $m2 = Measure-Block { Resolve-DnsName $DOMINIO_WWW -Type CNAME -ErrorAction Stop }
  $lat["DNS-$DOMINIO_WWW"]=$m2.ms
  $res2 = $m2.result
  $cname = ($res2 | Select-Object -First 1).NameHost
  $okCname = ($cname -match "vercel-dns\.com")
  Add-Check "DNS($DOMINIO_WWW)" ($(if($okCname){"OK"}else{"INCOMPLETO"}), "CNAME => $cname; $($m2.ms) ms")
  if($okCname){ Ok "✅ $DOMINIO_WWW CNAME → $cname ($($m2.ms) ms)" } else { Warn "🟠 $DOMINIO_WWW não aponta para vercel-dns.com (atual: $cname)" }
}catch{ Add-Check "DNS($DOMINIO_WWW)" "FALHA" $_.Exception.Message; Err "❌ DNS www falhou: $($_.Exception.Message)" }

# ==== 2) HTTPS do site ====
Head "🔐 HTTPS — disponibilidade e headers"
try{
  $m3 = Measure-Block { Invoke-WebRequest -Uri $URL_PROD -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop }
  $lat["HTTPS($URL_PROD)"]=$m3.ms
  $resp = $m3.result
  $hsts = $resp.Headers["Strict-Transport-Security"]
  $csp  = $resp.Headers["Content-Security-Policy"]
  Add-Check "HTTPS($URL_PROD)" ($(if($resp.StatusCode -eq 200){"OK"}else{"FALHA"}), "HSTS=$(if($hsts){"on"}else{"off"}); CSP=$(if($csp){"on"}else{"off"}); $($m3.ms) ms")
  if($resp.StatusCode -eq 200){ Ok "✅ HTTPS 200 ($($m3.ms) ms) – HSTS=$(if($hsts){"on"}else{"off"}) CSP=$(if($csp){"on"}else{"off"})" }
}catch{
  Add-Check "HTTPS($URL_PROD)" "FALHA" $_.Exception.Message
  Err "❌ HTTPS falhou: $($_.Exception.Message)"
}

# ==== 3) Supabase REST / RLS (anon vs service role) ====
Head "🧠 Supabase REST — anon vs service_role"
if (-not $SUPABASE_URL){ Err "❌ SUPABASE_URL vazio"; Add-Check "SUPABASE_URL" "FALHA" "VAR ausente" }
if (-not $API_ANON){ Warn "🟠 ANON KEY ausente"; Add-Check "ANON_KEY" "INCOMPLETO" "VAR ausente" }
if (-not $API_SERVICE){ Warn "🟠 SERVICE KEY ausente"; Add-Check "SERVICE_KEY" "INCOMPLETO" "VAR ausente" }

foreach($tb in $TABELAS){
  $endpoint = "$SUPABASE_URL/rest/v1/$tb?select=id&limit=1"
  # anon
  $mAnon = Measure-Block {
    try { Invoke-WebRequest -Uri $endpoint -Headers @{ apikey=$API_ANON; Authorization="Bearer $API_ANON" } -TimeoutSec 12 -UseBasicParsing -ErrorAction Stop }
    catch { $_ }
  }
  $anonOk = ($mAnon.result -isnot [System.Management.Automation.ErrorRecord])
  $lat["REST-anon-$tb"] = $mAnon.ms

  # service
  $mSvc = Measure-Block {
    try { Invoke-WebRequest -Uri $endpoint -Headers @{ apikey=$API_SERVICE; Authorization="Bearer $API_SERVICE" } -TimeoutSec 12 -UseBasicParsing -ErrorAction Stop }
    catch { $_ }
  }
  $svcOk = ($mSvc.result -isnot [System.Management.Automation.ErrorRecord])
  $lat["REST-svc-$tb"] = $mSvc.ms

  $status = if($svcOk){ if($anonOk){"OK"} else {"RLS"} } else {"FALHA"}
  $det = "anon=$($anonOk); svc=$($svcOk); ms(a)=$($mAnon.ms) ms(s)=$($mSvc.ms)"
  Add-Check "REST($tb)" $status $det

  switch($status){
    "OK"   { Ok   "✅ $tb — anon+svc OK ($($mAnon.ms)/$($mSvc.ms) ms)" }
    "RLS"  { Warn "🟠 $tb — service OK, anon bloqueado (RLS) ($($mAnon.ms)/$($mSvc.ms) ms)" }
    "FALHA"{ Err  "❌ $tb — falha em service role (ou endpoint) ($($mAnon.ms)/$($mSvc.ms) ms)" }
  }
}

# ==== 4) CLI Supabase & Scheduler ====
Head "🧰 Supabase CLI — versão e scheduler"
try{
  $cli = (supabase --version) 2>$null
  $okVer = ($cli -match "^2\.")
  Add-Check "CLI(Supabase)" ($(if($okVer){"OK"}else{"DESATUALIZADA"}), "$cli")
  if($okVer){ Ok "✅ CLI $cli" } else { Warn "🟠 CLI antiga ($cli). Atualize para >=2.58.x" }

  # detectar suporte a schedule/cron
  $help = (supabase functions --help) 2>$null
  $hasSchedule = ($help -match "schedule") -or ((supabase --help) -match "cron")
  Add-Check "Scheduler(Support)" ($(if($hasSchedule){"OK"}else{"AUSENTE"}), "help scan")
  if($hasSchedule){ Ok "✅ Suporte de agendamento detectado" } else { Warn "🟠 Agendador indisponível nesta versão da CLI" }
}catch{
  Add-Check "CLI(Supabase)" "FALHA" $_.Exception.Message
  Err "❌ Supabase CLI falhou: $($_.Exception.Message)"
}

# ==== 5) CORS básico (OPTIONS) ====
Head "🌀 CORS — pré-flight"
try{
  $cors = Invoke-WebRequest -Uri $URL_PROD -Method Options -TimeoutSec 10 -UseBasicParsing -ErrorAction SilentlyContinue
  $allow = $cors.Headers["Access-Control-Allow-Origin"]
  $st = if($allow){ "OK" } else { "INCOMPLETO" }
  Add-Check "CORS(OPTIONS)" $st "Allow-Origin=$allow"
  if($allow){ Ok "✅ CORS liberado ($allow)" } else { Warn "🟠 CORS sem Allow-Origin explícito (pode ser controlado por CDN/framework)" }
}catch{
  Add-Check "CORS(OPTIONS)" "INDEFINIDO" "Sem resposta clara"
  Warn "🟡 Pré-flight sem resposta clara"
}

# ==== 6) Exportar CSV / TXT(PDF simples) ====
Head "💾 Exportando relatórios"
$csvLines = @("Item;Status;Detalhe")
foreach($c in $checks){ $csvLines += "$($c.Item);$($c.Status);$($c.Detalhe)" }
$csvLines | Out-File -FilePath $CSV_OUT -Encoding UTF8
Ok "CSV: $CSV_OUT"

$sumDns   = ($checks | ?{$_.Item -like 'DNS*'})
$sumHttps = ($checks | ?{$_.Item -like 'HTTPS*'})
$sumRest  = ($checks | ?{$_.Item -like 'REST*'})
$sumCli   = ($checks | ?{$_.Item -like 'CLI*'})
$sumSch   = ($checks | ?{$_.Item -like 'Scheduler*'})
$sumCors  = ($checks | ?{$_.Item -like 'CORS*'})

$txt = @"
Relatório de Incongruências — Triângulo 360° v7.3.4
Domínio: $DOMINIO_RAIZ / $DOMINIO_WWW
Produção: $URL_PROD
Gerado em: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')

== DNS ==
$($sumDns | ForEach-Object {" - " + $_.Item + " | " + $_.Status + " | " + $_.Detalhe} | Out-String)

== HTTPS ==
$($sumHttps | ForEach-Object {" - " + $_.Item + " | " + $_.Status + " | " + $_.Detalhe} | Out-String)

== REST/RLS ==
$($sumRest | ForEach-Object {" - " + $_.Item + " | " + $_.Status + " | " + $_.Detalhe} | Out-String)

== CLI/Scheduler ==
$($sumCli | ForEach-Object {" - " + $_.Item + " | " + $_.Status + " | " + $_.Detalhe} | Out-String)
$($sumSch  | ForEach-Object {" - " + $_.Item + " | " + $_.Status + " | " + $_.Detalhe} | Out-String)

== CORS ==
$($sumCors | ForEach-Object {" - " + $_.Item + " | " + $_.Status + " | " + $_.Detalhe} | Out-String)

Latências (ms):
$($lat.GetEnumerator() | Sort-Object Name | ForEach-Object { " - " + $_.Name + ": " + $_.Value } | Out-String)
"@
$txt | Out-File -FilePath $RAW_TXT -Encoding UTF8
$txt | Out-File -FilePath $PDF_TXT -Encoding UTF8  # texto salvo com extensão .pdf
Ok "TXT/PDF: $RAW_TXT / $PDF_TXT"

# ==== 7) Triângulo 360° Sobreposto — Pirâmide 3D ====
Head "🔺 Triângulo 360° — Pirâmide de erros (maior → menor)"

# pontuação por severidade (maior impacto = maior peso)
function Score($status){
  switch($status){
    "FALHA"       { return 3 }
    "DESATUALIZADA" { return 2 }
    "AUSENTE"     { return 2 }
    "INCOMPLETO"  { return 1 }
    "RLS"         { return 2 }
    default       { return 0 }
  }
}

$grupos = @(
  @{ Nome="REST/RLS"; Itens=($checks | ?{$_.Item -like "REST(*)"}) },
  @{ Nome="HTTPS";    Itens=($checks | ?{$_.Item -like "HTTPS*"}) },
  @{ Nome="DNS";      Itens=($checks | ?{$_.Item -like "DNS*"}) },
  @{ Nome="CLI";      Itens=($checks | ?{$_.Item -like "CLI*"}) },
  @{ Nome="Scheduler";Itens=($checks | ?{$_.Item -like "Scheduler*"}) },
  @{ Nome="CORS";     Itens=($checks | ?{$_.Item -like "CORS*"}) }
)

$rank = $grupos | ForEach-Object {
  $score = ($_.Itens | ForEach-Object { Score $_.Status } | Measure-Object -Sum).Sum
  [PSCustomObject]@{ Grupo=$_.Nome; Peso=([int]$score) }
} | Sort-Object Peso -Descending

# Render 3D: topo = maior peso
$camadas = $rank | Select-Object -First 6
$label = $camadas.Grupo
$bars  = $camadas.Peso

# normaliza para largura 12
$max = [math]::Max(1, ($bars | Measure-Object -Maximum).Maximum)
function Bar($v){ ("█" * [math]::Max(1,[math]::Round(($v/$max)*12))) }

Write-Host ""
Write-Host "              /\                      " -ForegroundColor DarkGray
Write-Host "             /  \   (verso ░░░ sombras)" -ForegroundColor DarkGray
for($i=0; $i -lt $camadas.Count; $i++){
  $pad = " " * (12 - [math]::Round(($bars[$i]/$max)*6))
  $face = (Bar $bars[$i])
  $back = ("░" * ([math]::Max(1,12 - $face.Length)))
  $ln = "            /$pad$face$back\   ← "+$label[$i]+" ("+$bars[$i]+")"
  Write-Host $ln -ForegroundColor (if($i -eq 0){"Red"} elseif($i -le 2){"Yellow"} else {"Green"})
}
Write-Host "           /________________\         " -ForegroundColor DarkGray

# ==== 8) Resumo final ====
Head "✅ Concluído"
Write-Host "CSV: $CSV_OUT"
Write-Host "TXT: $RAW_TXT"
Write-Host "PDF: $PDF_TXT (texto simples)"
Write-Host "URL: $URL_PROD"
