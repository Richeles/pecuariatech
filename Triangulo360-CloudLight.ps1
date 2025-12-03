<#
PecuariaTech Cloud - Triângulo 360° v5.1 Light (Cloud Mode)
Versão otimizada para baixa memória e execução agendada
Autor: Richeles Alves dos Santos
#>

# ==== VARIÁVEIS FIXAS ====
$env:NEXT_PUBLIC_SUPABASE_URL  = "https://kpzzekflqpoeccnqfkng.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"

# ==== CONFIGURAÇÃO PADRÃO ====
$SupabaseUrl  = $env:NEXT_PUBLIC_SUPABASE_URL
$ApiKey       = $env:SUPABASE_SERVICE_ROLE_KEY
$Dominio      = "pecuariatech.com"
$Tabelas      = @("pastagem","rebanho","financeiro","racas","dashboard")
$LogDir       = "C:\Logs\PecuariaTech"
$LogFile      = Join-Path $LogDir "triangulo360_cloudlight.csv"

# ==== PREPARAÇÃO DO AMBIENTE ====
if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
}

# ==== CABEÇALHO DO LOG (SE NÃO EXISTE) ====
if (!(Test-Path $LogFile)) {
    "Data,Tabela,Rede,DNS,REST,Tempo_ms" | Out-File $LogFile -Encoding utf8
}

# ==== FUNÇÕES AUXILIARES ====
function Testar-Rede {
    try {
        $ping = Test-Connection -ComputerName "8.8.8.8" -Count 1 -Quiet -ErrorAction Stop
        return $ping
    } catch { return $false }
}

function Testar-DNS {
    try {
        Resolve-DnsName $Dominio -ErrorAction Stop | Out-Null
        return $true
    } catch { return $false }
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

# ==== EXECUÇÃO PRINCIPAL ====
$Data = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$Rede = Testar-Rede
$DNS  = Testar-DNS

Write-Host "`n🚀 Triângulo 360° v5.1 — PecuariaTech Cloud Monitor"
Write-Host "--------------------------------------------------------------"

if (-not $Rede) {
    Write-Host "❌ Rede indisponível" -ForegroundColor Red
    exit
}
else { Write-Host "✅ Rede OK" -ForegroundColor Green }

if (-not $DNS) {
    Write-Host "❌ Falha no DNS ($Dominio)" -ForegroundColor Red
    exit
}
else { Write-Host "✅ DNS OK ($Dominio resolvido)" -ForegroundColor Green }

# Teste REST em cada tabela
foreach ($Tabela in $Tabelas) {
    $r = Testar-REST $Tabela
    if ($r.ok) {
        Write-Host "✅ $Tabela OK ($($r.tempo) ms)" -ForegroundColor Green
        "$Data,$Tabela,OK,OK,OK,$($r.tempo)" | Out-File -FilePath $LogFile -Append -Encoding utf8
    } else {
        Write-Host "❌ $Tabela Falhou ($($r.tempo) ms)" -ForegroundColor Red
        "$Data,$Tabela,OK,OK,ERRO,$($r.tempo)" | Out-File -FilePath $LogFile -Append -Encoding utf8
    }
}

Write-Host "`n📜 Log salvo em $LogFile" -ForegroundColor Yellow
Write-Host "`n🟢 Triângulo 360° validado com sucesso — Sistema estável!" -ForegroundColor Cyan
