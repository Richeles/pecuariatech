Write-Host "🐂 UltraCow Installer — adicionando boi animado..." -ForegroundColor Green

$root = "C:\Users\Administrador\pecuariatech"
$publicFolder = "$root\public"
$boiImage = "$publicFolder\boi.png"
$imageUrl = "https://i.imgur.com/jnL9dOa.png"

# 1) Criar pasta public se não existir
if (!(Test-Path $publicFolder)) {
    Write-Host "📁 Criando pasta /public..."
    New-Item -ItemType Directory -Path $publicFolder | Out-Null
}

# 2) Baixar a imagem
Write-Host "⬇️ Baixando boi..."
Invoke-WebRequest -Uri $imageUrl -OutFile $boiImage -ErrorAction SilentlyContinue

# 3) Validar
if (Test-Path $boiImage) {
    Write-Host "✔ Imagem instalada com sucesso em /public/boi.png" -ForegroundColor Cyan
    Write-Host "👉 Agora já pode usar ela na animação 🐂"
} else {
    Write-Host "❌ Falha ao baixar a imagem" -ForegroundColor Red
}
