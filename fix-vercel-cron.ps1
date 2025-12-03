Write-Host "🔧 Iniciando correção automática da Vercel..." -ForegroundColor Cyan

$path = "C:\Users\Administrador\pecuariatech\vercel.json"

if (!(Test-Path $path)) {
    Write-Host "❌ Arquivo vercel.json não encontrado. Nada para corrigir." -ForegroundColor Red
    exit
}

Write-Host "📂 Arquivo vercel.json encontrado. Lendo..." -ForegroundColor Yellow
$json = Get-Content $path -Raw | ConvertFrom-Json

if ($json.crons) {
    Write-Host "⚠️ Removendo crons inválidos para plano Hobby..." -ForegroundColor Yellow
    $json.PSObject.Properties.Remove("crons")
} else {
    Write-Host "✔️ Nenhum cron encontrado (já está limpo)." -ForegroundColor Green
}

# Salvar de volta
($json | ConvertTo-Json -Depth 10) | Set-Content $path

Write-Host "✅ Arquivo vercel.json corrigido!" -ForegroundColor Green
Write-Host "🚀 Tentando fazer deploy novamente..." -ForegroundColor Cyan

vercel --prod
