<#
╔══════════════════════════════════════════════════════════════════╗
║ PecuariaTech Cloud — Triângulo 360° Dashboard v5.4               ║
║ Versão leve, colorida e integrada ao Supabase Cloud              ║
║ Desenvolvido para execução local com logs em nuvem               ║
╚══════════════════════════════════════════════════════════════════╝
#>

# ==== VARIÁVEIS FIXAS ====
$env:NEXT_PUBLIC_SUPABASE_URL  = "https://kpzzekflqpoeccnqfkng.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"

# ==== CONFIGURAÇÕES ====
$SupabaseUrl = "$env:NEXT_PUBLIC_SUPABASE_URL/rest/v1/triangulo_monitor"
$ApiKey      = $env:SUPABASE_SERVICE_ROLE_KEY
$LogDir      = "C:\Logs\PecuariaTech"
$LogFile     = Join-Path $LogDir "triangulo360_dashboard.csv"

# ==== FUNÇÃO DE EXIBIÇÃO COLORIDA ====
function Escrever-Linha($Texto, $Cor = "White") {
    $Cores = @{
        "Verde" = "Green"
        "Amarelo" = "Yellow"
        "Vermelho" = "Red"
        "Ciano" = "Cyan"
        "Branco" = "White"
        "Azul" = "Blue"
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
Escrever-Linha "🚀 Triângulo 360° v5.4 — PecuariaTech Cloud Dashboard" "Ciano"
Escrever-Linha "--------------------------------------------------------------" "Branco"

# ==== TESTE DE REDE / DNS ====
try {
    $dns = Resolve-DnsName "pecuariatech.com" -ErrorAction Stop
    Escrever-Linha "✅ DNS OK (pecuariatech.com resolvido)" "Verde"
} catch {
    Escrever-Linha "❌ DNS Falhou — verifique sua conexão" "Vermelho"
    exit
}

# ==== CONSULTA AO SUPABASE ====
try {
    $response = Invoke-RestMethod -Uri $SupabaseUrl -Headers @{apikey = $ApiKey; Authorization = "Bearer $ApiKey"}
} catch {
    Escrever-Linha "❌ Erro ao conectar ao Supabase: $_" "Vermelho"
    exit
}

# ==== EXIBE OS RESULTADOS ====
if ($response) {
    Escrever-Linha "`n📊 Monitoramento Triângulo 360°" "Ciano"
    Escrever-Linha "--------------------------------------------------------------" "Branco"

    $dados = @()
    foreach ($r in $response) {
        $modulo = $r.modulo
        $ok     = [int]$r.total_ok
        $falha  = [int]$r.total_falhas
        $tempo  = [math]::Round($r.media_tempo_ms,2)
        $hora   = $r.ultima_execucao

        if ($ok -gt 0 -and $falha -eq 0) {
            $status = "🟢 OK"
            $cor = "Verde"
        } elseif ($falha -gt 0 -and $falha -lt $ok) {
            $status = "🟠 Parcial"
            $cor = "Amarelo"
        } else {
            $status = "🔴 Falhou"
            $cor = "Vermelho"
        }

        Escrever-Linha ("{0,-12} {1,8} {2,8} {3,8} {4,12} {5,15}" -f $modulo, $ok, $falha, $tempo, $status, $hora) $cor

        $dados += [pscustomobject]@{
            modulo = $modulo
            total_ok = $ok
            total_falhas = $falha
            media_tempo_ms = $tempo
            status = $status
            ultima_execucao = $hora
        }
    }

    # ==== EXPORTA LOG ====
    $dados | Export-Csv -Path $LogFile -Delimiter ";" -NoTypeInformation -Force
    Escrever-Linha "`n📜 Log salvo em $LogFile" "Amarelo"
    Escrever-Linha "`n🟢 Dashboard atualizado com sucesso — Sistema estável!" "Verde"
} else {
    Escrever-Linha "❌ Nenhum dado retornado do Supabase" "Vermelho"
}
