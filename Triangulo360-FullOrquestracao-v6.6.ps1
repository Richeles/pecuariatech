# 🚀 Triângulo 360° — v6.6 Full Orquestração — PecuariaTech Cloud
# Pipeline único: Rede + DNS + REST + SecuritySync Light + CloudSync + Resumo
# Admin: pecuariatech.br@gmail.com

# ========== VARS ==========
$SUPABASE_URL = $env:NEXT_PUBLIC_SUPABASE_URL
$API_KEY      = $env:SUPABASE_SERVICE_ROLE_KEY
$ADMIN_EMAIL  = "pecuariatech.br@gmail.com"
$DOMINIO      = "pecuariatech.com"

$TABELAS = @("pastagem","rebanho","financeiro","racas","dashboard")
$LOG_DIR = "C:\Logs\PecuariaTech"
$LOG_TRI  = Join-Path $LOG_DIR "triangulo360_v6.csv"                 # log de latência gerado por v6.1
$LOG_OUT  = Join-Path $LOG_DIR "triangulo360_full_orq_v66.csv"       # log deste ciclo

# ========== UI HELPERS ==========
function Head($t){ Write-Host $t -ForegroundColor Yellow }
function Ok($t){ Write-Host $t -ForegroundColor Green }
function Warn($t){ Write-Host $t -ForegroundColor DarkYellow }
function Err($t){ Write-Host $t -ForegroundColor Red }
function LogCsv($etapa,$modulo,$status,$ms){
  if(-not (Test-Path $LOG_DIR)){ New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null }
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  "$ts,$etapa,$modulo,$status,$ms" | Out-File -FilePath $LOG_OUT -Append -Encoding UTF8
}

Clear-Host
Write-Host "`n🚀 Triângulo 360° v6.6 — Full Orquestração" -ForegroundColor Cyan
Write-Host     "--------------------------------------------------------------" -ForegroundColor Cyan

# ========== PRECHECK ==========
if(-not $SUPABASE_URL -or -not $API_KEY){
  Err "Variáveis de ambiente ausentes (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."
  exit 1
}

# ========== 1) REDE ==========
Head "[##############################] Verificando Rede..."
try{
  $null = Invoke-WebRequest -Uri "https://1.1.1.1" -UseBasicParsing -TimeoutSec 8
  Ok  "✅ Rede OK — conexão com a Internet ativa"
  LogCsv "REDE" "-" "OK" "0"
}catch{
  Err "❌ Rede Falhou"
  LogCsv "REDE" "-" "FALHA" "0"
}

# ========== 2) DNS ==========
Head "[##############################] Verificando DNS..."
try{
  $dns = Resolve-DnsName $DOMINIO -ErrorAction Stop
  Ok  "✅ DNS OK ($DOMINIO resolvido)"
  LogCsv "DNS" $DOMINIO "OK" "0"
}catch{
  Err "❌ DNS Falhou ($DOMINIO)"
  LogCsv "DNS" $DOMINIO "FALHA" "0"
}

# ========== 3) REST por TABELA ==========
Head "[##############################] Verificando endpoints REST Supabase..."
$restResultados = @()
foreach($tb in $TABELAS){
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try{
    $null = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/$tb?select=id&limit=1" `
      -Headers @{ apikey=$API_KEY; Authorization="Bearer $API_KEY" } -TimeoutSec 15
    $sw.Stop()
    $ms = "{0:N2}" -f $sw.Elapsed.TotalMilliseconds
    Ok "✅ $tb OK ($ms ms)"
    $restResultados += [PSCustomObject]@{ modulo=$tb; status="OK"; tempo_ms=[double]$ms }
    LogCsv "REST" $tb "OK" $ms
  }catch{
    $sw.Stop()
    $ms = "{0:N2}" -f $sw.Elapsed.TotalMilliseconds
    Err "❌ $tb Falhou ($ms ms)"
    $restResultados += [PSCustomObject]@{ modulo=$tb; status="FALHA"; tempo_ms=[double]$ms }
    LogCsv "REST" $tb "FALHA" $ms
  }
}

# ========== 4) SecuritySync Light (valida escrita service_role) ==========
Head "[##############################] SecuritySync Light — valida inserção em triangulo_logs..."
$secOk = $false
try{
  $body = @{ modulo="full-orq-v6.6"; status="OK"; tempo_ms=0.0 } | ConvertTo-Json
  $null = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/triangulo_logs" -Method Post `
    -Headers @{ apikey=$API_KEY; Authorization="Bearer $API_KEY"; "Content-Type"="application/json" } `
    -Body $body
  Ok "✅ Inserção de teste confirmada (service_role ativo)"
  LogCsv "SECURITYSYNC" "triangulo_logs" "OK" "0"
  $secOk = $true
}catch{
  Warn "⚠️ Não foi possível inserir em triangulo_logs — verifique RLS/Policies"
  LogCsv "SECURITYSYNC" "triangulo_logs" "FALHA" "0"
}

# ========== 5) CloudSync (envia arquivo local triangulo360_v6.csv, se existir) ==========
Head "[##############################] CloudSync — enviando log local para Supabase..."
if(Test-Path $LOG_TRI){
  try{
    $linhas = Get-Content $LOG_TRI | Where-Object { $_ -and -not $_.StartsWith("data") }
    $enviados = 0
    foreach($ln in $linhas){
      # Formato esperado (do v6.1): "2025-11-10 20:43:27, REST, pastagem, OK, 490.92"
      $parts = $ln.Split(",").ForEach({ $_.Trim() })
      if($parts.Count -ge 5){
        $mod = $parts[2]
        $stat = $parts[3]
        $ms   = [double]($parts[4] -replace "[^\d\.\,]","." -replace ",",".")

        $payload = @{ modulo=$mod; status=($stat -eq "OK" ? "OK" : "FALHA"); tempo_ms=$ms } | ConvertTo-Json
        try{
          $null = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/triangulo_logs" -Method Post `
            -Headers @{ apikey=$API_KEY; Authorization="Bearer $API_KEY"; "Content-Type"="application/json" } `
            -Body $payload
          $enviados++
        }catch{
          # ignora parcial — mantém ciclo fluindo
        }
      }
    }
    Ok "☁️ CloudSync concluído — enviados $enviados registro(s)"
    LogCsv "CLOUDSYNC" "triangulo_logs" "OK" $enviados
  }catch{
    Warn "⚠️ CloudSync falhou — não foi possível ler/enviar CSV local"
    LogCsv "CLOUDSYNC" "triangulo_logs" "FALHA" "0"
  }
}else{
  Warn "⚠️ Log local não encontrado ($LOG_TRI) — pulando envio"
  LogCsv "CLOUDSYNC" "triangulo_logs" "AVISO" "0"
}

# ========== 6) Resumo/Dashboard local ==========
Head "`n📊 Resultados do Triângulo 360°"
$okCount = ($restResultados | Where-Object {$_.status -eq "OK"}).Count
foreach($r in $restResultados){
  $emoji = ($r.status -eq "OK") ? "🟢" : "🔴"
  $msFmt = "{0:N2} ms" -f $r.tempo_ms
  Write-Host ("{0,-14} {1,10} {2,8}" -f $r.modulo, $msFmt, $emoji)
}
$estab = [math]::Round(($okCount / $TABELAS.Count) * 100, 0)
Write-Host ""
Write-Host ("📈 Estabilidade geral: {0}% módulos estáveis" -f $estab)

# ========== 7) Fim ==========
Write-Host ""
Write-Host "📜 Log deste ciclo: $LOG_OUT"
Write-Host ("🕓 Execução concluída às {0}" -f (Get-Date -Format "HH:mm:ss"))
Write-Host "--------------------------------------------------------------"
Write-Host "🟢 Triângulo 360° v6.6 — Full Orquestração finalizado com sucesso!"
Write-Host "--------------------------------------------------------------`n"
