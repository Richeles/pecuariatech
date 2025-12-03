# =======================================================
# 🌐 Triângulo 360° Dashboard Visual — PowerShell v6.7
# Autor: Richeles
# =======================================================

$SUPABASE_URL = $env:NEXT_PUBLIC_SUPABASE_URL
$API_KEY      = $env:SUPABASE_SERVICE_ROLE_KEY
$TABELAS      = @("pastagem","rebanho","financeiro","racas","dashboard")

# Funções de visual
function Head($txt){ Write-Host "`n$txt" -ForegroundColor Yellow }
function Ok($txt){ Write-Host $txt -ForegroundColor Green }
function Warn($txt){ Write-Host $txt -ForegroundColor DarkYellow }
function Err($txt){ Write-Host $txt -ForegroundColor Red }
function Azul($txt){ Write-Host $txt -ForegroundColor Cyan }

# Função de barra visual
function Barra($valor){
    $total = 20
    $cheio = [math]::Round(($valor/100)*$total)
    $vazio = $total - $cheio
    $barra = ("█" * $cheio) + ("░" * $vazio)
    return $barra
}

Clear-Host
Write-Host "`n🌾 PecuariaTech Cloud — Triângulo 360° Dashboard CLI v6.7" -ForegroundColor Cyan
Write-Host "------------------------------------------------------------------"

if (-not $SUPABASE_URL -or -not $API_KEY) {
    Err "❌ Variáveis de ambiente não configuradas!"
    exit
}

# ==== 1) Teste REST de módulos ====
Head "🔍 Testando módulos Supabase..."
$Resultados = @()
foreach ($tb in $TABELAS) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $null = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/$tb?select=id&limit=1" `
            -Headers @{ apikey=$API_KEY; Authorization="Bearer $API_KEY" } -TimeoutSec 10
        $sw.Stop()
        $ms = [math]::Round($sw.Elapsed.TotalMilliseconds,2)
        $Resultados += [PSCustomObject]@{Modulo=$tb;Status="OK";Tempo=$ms}
        Ok ("✅ {0,-12} {1,8} ms" -f $tb, $ms)
    } catch {
        $sw.Stop()
        $ms = [math]::Round($sw.Elapsed.TotalMilliseconds,2)
        $Resultados += [PSCustomObject]@{Modulo=$tb;Status="FALHA";Tempo=$ms}
        Err ("❌ {0,-12} {1,8} ms" -f $tb, $ms)
    }
}

# ==== 2) Cálculo de estabilidade ====
$okCount = ($Resultados | Where-Object {$_.Status -eq "OK"}).Count
$estabilidade = [math]::Round(($okCount / $TABELAS.Count) * 100,0)
$barra = Barra $estabilidade
Head "`n📊 Estabilidade Geral"
Write-Host ("Estabilidade: {0}% {1}" -f $estabilidade, $barra)

# ==== 3) Logs recentes ====
Head "`n🧾 Logs Recentes do Triângulo 360°"
try {
    $logs = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/triangulo_logs?select=modulo,status,tempo_ms,created_at&order=created_at.desc&limit=10" `
        -Headers @{ apikey=$API_KEY; Authorization="Bearer $API_KEY" } -TimeoutSec 10
    if ($logs) {
        foreach ($l in $logs) {
            $color = switch ($l.status) {
                "OK" { "Green" }
                "FALHA" { "Red" }
                "PENDENTE" { "DarkYellow" }
                default { "Gray" }
            }
            $tempo = [math]::Round([double]$l.tempo_ms,2)
            Write-Host ("{0,-12} {1,-8} {2,6} ms  {3}" -f $l.modulo,$l.status,$tempo,$l.created_at) -ForegroundColor $color
        }
    } else {
        Warn "Sem logs encontrados."
    }
} catch {
    Warn "⚠️ Falha ao consultar logs no Supabase."
}

# ==== 4) Mini gráfico ASCII de histórico ====
Head "`n📈 Gráfico ASCII — Histórico de Estabilidade"
try {
    $historico = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/triangulo_logs?select=status,created_at&order=created_at.desc&limit=20" `
        -Headers @{ apikey=$API_KEY; Authorization="Bearer $API_KEY" } -TimeoutSec 10
    if ($historico) {
        $dataPoints = @()
        $grupo = 0
        $chunk = 5  # agrupa 5 registros
        for ($i=0; $i -lt $historico.Count; $i+=$chunk) {
            $sub = $historico[$i..([Math]::Min($i+$chunk-1,$historico.Count-1))]
            $ok = ($sub | Where-Object {$_.status -eq "OK"}).Count
            $perc = [math]::Round(($ok / $sub.Count)*100,0)
            $dataPoints += $perc
        }
        $grafico = $dataPoints | ForEach-Object { ("█" * ($_ / 10)) }
        for ($i=0; $i -lt $grafico.Count; $i++) {
            $col = if ($dataPoints[$i] -ge 80) { "Green" } elseif ($dataPoints[$i] -ge 50) { "DarkYellow" } else { "Red" }
            Write-Host ("{0,3}% {1}" -f $dataPoints[$i], $grafico[$i]) -ForegroundColor $col
        }
    }
} catch {
    Warn "⚠️ Não foi possível gerar gráfico histórico."
}

# ==== 5) Resumo final ====
Head "`n🕓 Atualizado em $(Get-Date -Format 'HH:mm:ss')"
if ($estabilidade -ge 80) {
    Ok "🟢 Sistema Estável — Operação Normal"
} elseif ($estabilidade -ge 50) {
    Warn "🟡 Sistema Parcial — Verifique módulos falhos"
} else {
    Err "🔴 Sistema Instável — Atenção necessária!"
}

Write-Host "------------------------------------------------------------------"
Write-Host "📜 Dados obtidos de $SUPABASE_URL/rest/v1/triangulo_logs"
Write-Host "------------------------------------------------------------------`n"
