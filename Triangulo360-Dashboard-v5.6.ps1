# Triângulo 360° v5.6 — PecuariaTech Cloud Dashboard
# --------------------------------------------------------------
# Consulta Supabase → view triangulo_monitor_v55
# Exibe status por módulo com emojis e salva log CSV local.

$ErrorActionPreference = "Stop"
$logPath = "C:\Logs\PecuariaTech"
if (!(Test-Path $logPath)) { New-Item -ItemType Directory -Path $logPath | Out-Null }

$logFile = "$logPath\triangulo360_dashboard_v56.csv"
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$serviceKey = $env:SUPABASE_SERVICE_ROLE_KEY
$view = "triangulo_monitor_v55"

function Write-Line($msg, $color = "White") {
    Write-Host $msg -ForegroundColor $color
}

Clear-Host
Write-Line "🚀 Triângulo 360° v5.6 — PecuariaTech Cloud Dashboard" "Cyan"
Write-Line "--------------------------------------------------------------" "DarkGray"

try {
    $uri = "$supabaseUrl/rest/v1/$view?select=*"
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
        foreach ($item in $dados) {
            $modulo = $item.modulo
            $total = $item.total_testes
            $ok = $item.total_ok
            $falhas = $item.total_falhas
            $tempo = [math]::Round($item.tempo_medio_ms, 2)
            $ultima = $item.ultima_execucao
            $status = $item.status_geral

            switch -Regex ($status) {
                "🟢" { $color = "Green" }
                "🟠" { $color = "Yellow" }
                "🔴" { $color = "Red" }
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
    }

    Write-Host ""
    Write-Line "🟢 Dashboard atualizado com sucesso — Sistema estável!" "Green"
}
catch {
    Write-Line "❌ Erro ao consultar Supabase: $_" "Red"
}
finally {
    Write-Line "--------------------------------------------------------------" "DarkGray"
    Write-Line "Fim do ciclo — Triângulo 360° Dashboard v5.6" "Cyan"
}
