# Triângulo 360° v5.9 — PecuariaTech CloudSync Dashboard
# --------------------------------------------------------------
# Sincroniza logs locais com a tabela triangulo_logs no Supabase
# Mantém histórico de execuções do Triângulo 360°

$ErrorActionPreference = "Stop"

# === Caminhos e configs ===
$logPath = "C:\Logs\PecuariaTech"
$csvFile = "$logPath\triangulo360_dashboard_v58.csv"
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$serviceKey = $env:SUPABASE_SERVICE_ROLE_KEY
$tabela = "triangulo_logs"

function Write-Line($msg, $color = "White") {
    Write-Host $msg -ForegroundColor $color
}

function Show-Progress($msg) {
    for ($i = 0; $i -le 30; $i++) {
        $bar = ("#" * $i).PadRight(30)
        Write-Host -NoNewline "`r[$bar] $msg"
        Start-Sleep -Milliseconds 40
    }
    Write-Host ""
}

Clear-Host
Write-Line "🚀 Triângulo 360° v5.9 — PecuariaTech CloudSync Dashboard" "Cyan"
Write-Line "--------------------------------------------------------------" "DarkGray"

if (!(Test-Path $csvFile)) {
    Write-Line "⚠️ Log local não encontrado em $csvFile" "Yellow"
    exit
}

try {
    Show-Progress "Lendo arquivo CSV..."
    $dados = Import-Csv $csvFile
    $total = $dados.Count
    Write-Line "📦 Total de registros a enviar: $total" "Gray"
    Start-Sleep -Milliseconds 500

    Show-Progress "Enviando dados ao Supabase..."

    foreach ($linha in $dados) {
        $body = @{
            modulo          = $linha.modulo
            status          = $linha.status_geral
            tempo_ms        = [double]$linha.tempo_medio_ms
            data_hora       = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        } | ConvertTo-Json

        $headers = @{
            apikey = $serviceKey
            Authorization = "Bearer $serviceKey"
            "Content-Type" = "application/json"
        }

        try {
            Invoke-RestMethod -Uri "$($supabaseUrl)/rest/v1/$($tabela)" `
                -Method Post -Headers $headers -Body $body | Out-Null
            Write-Line "✅ Enviado: $($linha.modulo) → $($linha.status_geral)" "Green"
        }
        catch {
            Write-Line "⚠️ Falha ao enviar $($linha.modulo): $_" "Yellow"
        }

        Start-Sleep -Milliseconds 200
    }

    Write-Line "`n📊 Sincronização concluída com Supabase!" "Cyan"
    Write-Line "📜 Fonte: $csvFile" "Gray"
    Write-Line "🕓 Execução finalizada às $(Get-Date -Format 'HH:mm:ss')" "Gray"
    Write-Line "--------------------------------------------------------------" "DarkGray"
    Write-Line "🟢 CloudSync ativo — histórico de logs atualizado!" "Green"
}
catch {
    Write-Line "❌ Erro geral na sincronização: $_" "Red"
}
finally {
    Write-Line "--------------------------------------------------------------" "DarkGray"
    Write-Line "Fim do ciclo — Triângulo 360° v5.9 CloudSync Dashboard" "Cyan"
}
