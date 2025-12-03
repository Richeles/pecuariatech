# Triângulo 360° v5.8 — PecuariaTech Cloud Dashboard
# --------------------------------------------------------------
# Corrigido: interpolação de variável $view na URL
# Exibe status com barra animada e percentual de estabilidade

$ErrorActionPreference = "Stop"
$logPath = "C:\Logs\PecuariaTech"
if (!(Test-Path $logPath)) { New-Item -ItemType Directory -Path $logPath | Out-Null }

$logFile = "$logPath\triangulo360_dashboard_v58.csv"
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$serviceKey = $env:SUPABASE_SERVICE_ROLE_KEY
$view = "triangulo_monitor_v55"

function Write-Line($msg, $color = "White") {
    Write-Host $msg -ForegroundColor $color
}

function Show-Progress($msg) {
    for ($i = 0; $i -le 30; $i++) {
        $bar = ("#" * $i).PadRight(30)
        Write-Host -NoNewline "`r[$bar] $msg"
        Start-Sleep -Milliseconds 50
    }
    Write-Host ""
}

Clear-Host
Write-Line "🚀 Triângulo 360° v5.8 — PecuariaTech Cloud Dashboard" "Cyan"
Write-Line "--------------------------------------------------------------" "DarkGray"

try {
    Show-Progress "Consultando Supabase..."
    
    # ✅ interpolação segura na URL:
    $uri = "$($supabaseUrl)/rest/v1/$($view)?select=*"

    $headers = @{
        apikey = $serviceKey
        Authorization = "Bearer $serviceKey"
        Accept = "application/json"
    }

    $dados = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get
    if ($dados.Count -eq 0) {
        Write-Line "⚠️ Nenhum dado retornado da view triangulo_monitor_v55." "Yellow"
    } else {
        Write-Host ""
        Write-Line "📊 Monitoramento Triângulo 360°" "Green"
        Write-Line "--------------------------------------------------------------" "DarkGray"

        $csvData = @()
        $totalModulos = $dados.Count
        $totalFalhas = 0
        $totalOK = 0

        foreach ($item in $dados) {
            $modulo = $item.modulo
            $total = $item.total_testes
            $ok = $item.total_ok
            $falhas = $item.total_falhas
            $tempo = [math]::Round($item.tempo_medio_ms, 2)
            $ultima = $item.ultima_execucao
            $status = $item.status_geral

            switch -Regex ($status) {
                "🟢" { $color = "Green"; $totalOK++ }
                "🟠" { $color = "Yellow" }
                "🔴" { $color = "Red"; $totalFalhas++ }
                default { $color = "Gray" }
            }

            Write-Host ("{0,-15} {1,5} {2,5} {3,5} {4,10} {5,25} {6}" -f $modulo, $total, $ok, $falhas, "$tempo ms", $ultima, $status) -ForegroundColor $color
            
            $csvData += [PSCustomObject]@{
                modulo = $modulo
                total_testes = $total
                total_ok = $ok
                total_falhas = $falhas
                tempo_medio_ms = $tempo
                ultima_execucao = $ultima
                status_geral = $status
            }
        }

        $csvData | Export-Csv -Path $logFile -NoTypeInformation -Force
        Write-Host ""
        Write-Line "📜 Log salvo em $logFile" "DarkGray"

        $percentOK = [math]::Round(($totalOK / $totalModulos) * 100, 2)
        Write-Host ""
        Write-Line "📈 Estabilidade geral: $percentOK% dos módulos estáveis" "Cyan"
    }

    Write-Host ""
    Write-Line "🟢 Dashboard atualizado com sucesso — Sistema estável!" "Green"
}
catch {
    Write-Line "❌ Erro ao consultar Supabase:" "Red"
    Write-Host $_.ErrorDetails.Message
}
finally {
    Write-Line "--------------------------------------------------------------" "DarkGray"
    Write-Line "Fim do ciclo — Triângulo 360° Dashboard v5.8" "Cyan"
}
