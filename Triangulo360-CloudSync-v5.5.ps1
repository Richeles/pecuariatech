<#
╔══════════════════════════════════════════════════════════════════╗
║ PecuariaTech Cloud — Triângulo 360° v5.5 CloudSync Auto          ║
║ Executa verificações, gera logs e envia dados ao Supabase        ║
║ Feito para rodar leve e automático no Windows Scheduler          ║
╚══════════════════════════════════════════════════════════════════╝
#>

# ==== VARIÁVEIS FIXAS ====
$env:NEXT_PUBLIC_SUPABASE_URL  = "https://kpzzekflqpoeccnqfkng.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"

# ==== CONFIGURAÇÕES ====
$SupabaseUrl = "$env:NEXT_PUBLIC_SUPABASE_URL/rest/v1/triangulo_logs"
$ApiKey      = $env:SUPABASE_SERVICE_ROLE_KEY
$LogDir      = "C:\Logs\PecuariaTech"
$LogFile     = Join-Path $LogDir "triangulo360_cloudsync.csv"
$Tabelas     = @("pastagem","rebanho","financeiro","racas","dashboard")

# ==== FUNÇÃO DE EXIBIÇÃO COLORIDA ====
function Escrever-Linha($Texto, $Cor = "White") {
    $Cores = @{
        "Verde" = "Green"
        "Amarelo" = "Yellow"
        "Vermelho" = "Red"
        "Ciano" = "Cyan"
        "Branco" = "White"
    }
    $CorFinal = $Cores[$Cor]
    if (-not $CorFinal) { $CorFinal = "White" }
    Write-Host $Texto -ForegroundColor $CorFinal
}

# ==== CRIA DIRETÓRIO DE LOG ====
if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
}

# ==== CABEÇALHO ====
Escrever-Linha ""
Escrever-Linha "🚀 Triângulo 360° v5.5 — PecuariaTech CloudSync Auto" "Ciano"
Escrever-Linha "--------------------------------------------------------------" "Branco"

# ==== TESTE DE REDE / DNS ====
try {
    Resolve-DnsName "pecuariatech.com" -ErrorAction Stop | Out-Null
    Escrever-Linha "✅ DNS OK (pecuariatech.com resolvido)" "Verde"
} catch {
    Escrever-Linha "❌ Falha no DNS — verifique a conexão" "Vermelho"
    exit
}

# ==== EXECUÇÃO PRINCIPAL ====
$Resultados = @()
foreach ($tabela in $Tabelas) {
    $url = "$env:NEXT_PUBLIC_SUPABASE_URL/rest/v1/$tabela"
    $inicio = Get-Date
    try {
        $resposta = Invoke-RestMethod -Uri $url -Headers @{apikey = $ApiKey; Authorization = "Bearer $ApiKey"} -ErrorAction Stop
        $tempo = [math]::Round(((Get-Date) - $inicio).TotalMilliseconds, 2)
        Escrever-Linha "✅ $tabela OK ($tempo ms)" "Verde"
        $status = "OK"
    } catch {
        $tempo = [math]::Round(((Get-Date) - $inicio).TotalMilliseconds, 2)
        Escrever-Linha "❌ $tabela Falhou ($tempo ms)" "Vermelho"
        $status = "Falhou"
    }

    $Resultados += [pscustomobject]@{
        modulo  = $tabela
        status  = $status
        tempo_ms = $tempo
        data_hora = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }
}

# ==== EXPORTA LOG LOCAL ====
$Resultados | Export-Csv -Path $LogFile -Delimiter ";" -NoTypeInformation -Force
Escrever-Linha "`n📜 Log local salvo em $LogFile" "Amarelo"

# ==== ENVIA RESULTADOS AO SUPABASE ====
foreach ($item in $Resultados) {
    try {
        Invoke-RestMethod -Uri $SupabaseUrl `
            -Method Post `
            -Headers @{apikey = $ApiKey; Authorization = "Bearer $ApiKey"; "Content-Type" = "application/json"} `
            -Body (ConvertTo-Json $item)
        Escrever-Linha "☁️ Enviado: $($item.modulo) ($($item.status))" "Ciano"
    } catch {
        Escrever-Linha "⚠️ Falha ao enviar $($item.modulo) ao Supabase" "Amarelo"
    }
}

Escrever-Linha "`n🟢 Sincronização completa — dados enviados com sucesso!" "Verde"
Escrever-Linha "--------------------------------------------------------------" "Branco"
