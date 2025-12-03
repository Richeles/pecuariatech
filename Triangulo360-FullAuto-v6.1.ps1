# ================================================================
# 🚀 Triângulo 360° v6.1 — PecuariaTech Full Auto Cloud (Agendado)
# ================================================================
# Execução automática do Triângulo 360° (rede, DNS, REST, log e sync)
# Cria tarefa agendada para rodar automaticamente a cada 60 minutos
# ---------------------------------------------------------------

$ErrorActionPreference = "Stop"
$logDir = "C:\Logs\PecuariaTech"
if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

$logFile = "$logDir\triangulo360_v6.csv"
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$serviceKey  = $env:SUPABASE_SERVICE_ROLE_KEY
$tabelas     = @("pastagem","rebanho","financeiro","racas","dashboard")
$tabelaLogs  = "triangulo_logs"
$Dominio     = "pecuariatech.com"

function Write-Line($msg, $color = "White") { Write-Host $msg -ForegroundColor $color }

function Show-Progress($msg) {
    for ($i = 0; $i -le 30; $i++) {
        $bar = ("#" * $i).PadRight(30)
        Write-Host -NoNewline "`r[$bar] $msg"
        Start-Sleep -Milliseconds 40
    }
    Write-Host ""
}

Clear-Host
Write-Line "🚀 Triângulo 360° v6.1 — PecuariaTech Full Auto Cloud (Agendado)" "Cyan"
Write-Line "--------------------------------------------------------------" "DarkGray"

# === ETAPA 1: Teste de rede e DNS ===
try {
    Show-Progress "Verificando Rede..."
    if (-not (Test-Connection -ComputerName "8.8.8.8" -Count 1 -Quiet)) { throw "Sem conexão com a Internet." }
    Write-Line "✅ Rede OK — conexão com a Internet ativa" "Green"

    $dns = Resolve-DnsName $Dominio -ErrorAction Stop
    Write-Line "✅ DNS OK ($Dominio resolvido)" "Green"
}
catch {
    Write-Line "❌ Falha na verificação inicial: $_" "Red"
    exit
}

# === ETAPA 2: Teste REST Supabase ===
Show-Progress "Verificando endpoints REST Supabase..."
$headers = @{
    apikey = $serviceKey
    Authorization = "Bearer $serviceKey"
    Accept = "application/json"
}

$resultados = @()
foreach ($tabela in $tabelas) {
    $inicio = Get-Date
    try {
        $uri = "$($supabaseUrl)/rest/v1/$($tabela)?select=id&limit=1"
        $res = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get -TimeoutSec 10
        $tempo = [math]::Round((New-TimeSpan -Start $inicio -End (Get-Date)).TotalMilliseconds, 2)
        $status = "🟢 OK"
        Write-Line "✅ $tabela OK ($tempo ms)" "Green"
    }
    catch {
        $tempo = [math]::Round((New-TimeSpan -Start $inicio -End (Get-Date)).TotalMilliseconds, 2)
        $status = "🔴 Falhou"
        Write-Line "❌ $tabela Falhou ($tempo ms)" "Red"
    }
    $resultados += [PSCustomObject]@{
        modulo = $tabela
        status = $status
        tempo_ms = $tempo
        data_hora = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }
}

$resultados | Export-Csv -Path $logFile -NoTypeInformation -Force
Write-Line "📜 Log local salvo em $logFile" "Gray"

# === ETAPA 3: Sincronização Cloud ===
Show-Progress "Enviando logs ao Supabase..."
foreach ($linha in $resultados) {
    $body = @{
        modulo = $linha.modulo
        status = $linha.status
        tempo_ms = $linha.tempo_ms
        data_hora = $linha.data_hora
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri "$($supabaseUrl)/rest/v1/$($tabelaLogs)" `
            -Method Post -Headers (@{ apikey=$serviceKey; Authorization="Bearer $serviceKey"; "Content-Type"="application/json" }) `
            -Body $body | Out-Null
        Write-Line "☁️ Enviado: $($linha.modulo) → $($linha.status)" "Cyan"
    }
    catch {
        Write-Line "⚠️ Falha ao enviar $($linha.modulo): $_" "Yellow"
    }
}

# === ETAPA 4: Dashboard local ===
Write-Host ""
Write-Line "📊 Resultados do Triângulo 360°" "Green"
Write-Line "--------------------------------------------------------------" "DarkGray"

$total = $resultados.Count
$ok = ($resultados | Where-Object { $_.status -match "🟢" }).Count
$falhas = $total - $ok
$percent = [math]::Round(($ok / $total) * 100, 2)

foreach ($linha in $resultados) {
    $color = if ($linha.status -match "🟢") { "Green" } else { "Red" }
    Write-Host ("{0,-15} {1,10} {2,10}" -f $linha.modulo, "$($linha.tempo_ms) ms", $linha.status) -ForegroundColor $color
}

Write-Host ""
Write-Line "📈 Estabilidade geral: $percent% módulos estáveis" "Cyan"
Write-Line "🕓 Execução concluída às $(Get-Date -Format 'HH:mm:ss')" "Gray"
Write-Line "--------------------------------------------------------------" "DarkGray"
Write-Line "🟢 Triângulo 360° v6.1 — Ciclo completo finalizado com sucesso!" "Green"

# === ETAPA 5: Criação de tarefa agendada automática ===
try {
    $taskName = "Triangulo360_AutoMonitor"
    $scriptPath = "C:\Users\Administrador\pecuariatech\Triangulo360-FullAuto-v6.1.ps1"
    $acao = New-ScheduledTaskAction -Execute "pwsh.exe" -Argument "-File `"$scriptPath`""
    $gatilho = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(2) -RepetitionInterval (New-TimeSpan -Minutes 60) -RepetitionDuration (New-TimeSpan -Days 30)
    Register-ScheduledTask -TaskName $taskName -Action $acao -Trigger $gatilho -RunLevel Highest -Force | Out-Null
    Write-Line "`n🕒 Tarefa agendada criada: $taskName (executa a cada 60 min)" "Cyan"
}
catch {
    Write-Line "⚠️ Erro ao criar tarefa agendada: $_" "Yellow"
}
finally {
    Write-Line "--------------------------------------------------------------" "DarkGray"
    Write-Line "Fim do ciclo — Triângulo 360° v6.1 (Agendado)" "Cyan"
}
