<#
PecuariaTech Cloud - Triângulo 360° v5.2 CloudSync
Versão com sincronização automática para o Supabase
Autor: Richeles Alves dos Santos
#>

# ==== VARIÁVEIS ====
$env:NEXT_PUBLIC_SUPABASE_URL  = "https://kpzzekflqpoeccnqfkng.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"

$SupabaseUrl  = $env:NEXT_PUBLIC_SUPABASE_URL
$ApiKey       = $env:SUPABASE_SERVICE_ROLE_KEY
$Dominio      = "pecuariatech.com"
$Tabelas      = @("pastagem","rebanho","financeiro","racas","dashboard")
$LogDir       = "C:\Logs\PecuariaTech"
$LogFile      = Join-Path $LogDir "triangulo360_cloudsync.csv"

# ==== PREPARAÇÃO DO AMBIENTE ====
if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
}

if (!(Test-Path $LogFile)) {
    "Data,Tabela,Rede,DNS,REST,Tempo_ms,StatusEnvio" | Out-File $LogFile -Encoding utf8
}

# ==== FUNÇÕES ====
function Testar-Rede {
    try { return (Test-Connection -ComputerName "8.8.8.8" -Count 1 -Quiet) } catch { return $false }
}

function Testar-DNS {
    try { Resolve-DnsName $Dominio -ErrorAction Stop | Out-Null; return $true } catch { return $false }
}

function Testar-REST($Tabela) {
    $Tempo = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $Uri = "$SupabaseUrl/rest/v1/$Tabela"
        $resp = Invoke-RestMethod -Uri $Uri -Headers @{apikey=$ApiKey} -Method GET -ErrorAction Stop
        $Tempo.Stop()
        return @{ok=$true; tempo=$Tempo.ElapsedMilliseconds}
    } catch {
        $Tempo.Stop()
        return @{ok=$false; tempo=$Tempo.ElapsedMilliseconds}
    }
}

function Enviar-LogSupabase($Tabela, $Tempo, $Status) {
    try {
        $Body = @{
            data_execucao = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            tabela = $Tabela
            tempo_ms = $Tempo
            status_rest = if ($Status) {"OK"} else {"ERRO"}
            origem = "CloudSync"
        } | ConvertTo-Json

        Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/triangulo_logs" `
            -Headers @{apikey=$ApiKey; Authorization="Bearer $ApiKey"; "Content-Type"="application/json"} `
            -Method POST -Body $Body -ErrorAction Stop | Out-Null

        return "ENVIADO"
    } catch {
        return "FALHOU"
    }
}

# ==== EXECUÇÃO ====
Write-Host "`n🚀 Triângulo 360° v5.2 — PecuariaTech CloudSync"
Write-Host "--------------------------------------------------------------"

$Data = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$Rede = Testar-Rede
$DNS  = Testar-DNS

if (-not $Rede) { Write-Host "❌ Rede indisponível" -ForegroundColor Red; exit }
else { Write-Host "✅ Rede OK" -ForegroundColor Green }

if (-not $DNS) { Write-Host "❌ Falha no DNS ($Dominio)" -ForegroundColor Red; exit }
else { Write-Host "✅ DNS OK ($Dominio resolvido)" -ForegroundColor Green }

foreach ($Tabela in $Tabelas) {
    $r = Testar-REST $Tabela
    if ($r.ok) {
        Write-Host "✅ $Tabela OK ($($r.tempo) ms)" -ForegroundColor Green
        $envio = Enviar-LogSupabase $Tabela $r.tempo $true
        "$Data,$Tabela,OK,OK,OK,$($r.tempo),$envio" | Out-File -FilePath $LogFile -Append -Encoding utf8
    } else {
        Write-Host "❌ $Tabela Falhou ($($r.tempo) ms)" -ForegroundColor Red
        $envio = Enviar-LogSupabase $Tabela $r.tempo $false
        "$Data,$Tabela,OK,OK,ERRO,$($r.tempo),$envio" | Out-File -FilePath $LogFile -Append -Encoding utf8
    }
}

Write-Host "`n📜 Log salvo em $LogFile" -ForegroundColor Yellow
Write-Host "🟢 Sincronização remota concluída com Supabase — CloudSync ativo!" -ForegroundColor Cyan
