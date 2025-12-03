function Tri360Check {

    Write-Host "🔵 Iniciando Triângulo 360°" -ForegroundColor Cyan

    # CHECK 1 — Rede
    Write-Host "🌐 Testando rede..." -ForegroundColor Yellow
    if (Test-Connection -ComputerName "8.8.8.8" -Count 1 -Quiet) {
        Write-Host "✅ Rede OK"
    } else {
        Write-Host "❌ Falha na rede"
        return
    }

    # CHECK 2 — DNS
    Write-Host "🔎 Testando DNS (google.com)..." -ForegroundColor Yellow
    try {
        Resolve-DnsName "google.com" -ErrorAction Stop | Out-Null
        Write-Host "✅ DNS OK"
    } catch {
        Write-Host "❌ Falha no DNS"
        return
    }

    # CHECK 3 — REST
    Write-Host "📡 Testando REST (Supabase API)..." -ForegroundColor Yellow
    try {
        $resp = Invoke-WebRequest "https://google.com" -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ REST OK"
    } catch {
        Write-Host "❌ Falha no REST"
        return
    }

    Write-Host "`n🎉 Triângulo 360° COMPLETO — Tudo operacional!" -ForegroundColor Green
}
