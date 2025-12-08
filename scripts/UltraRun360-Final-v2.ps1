Write-Host "🚀 UltraRun360º — Iniciando..." -ForegroundColor Cyan

# --------------------------------------------
# 1. GARANTIR QUE ESTAMOS NA RAIZ DO PROJETO
# --------------------------------------------
Set-Location "C:\Users\Administrador\pecuariatech"

# --------------------------------------------
# 2. CORRIGIR POSTINSTALL (ERRO DO PRISMA)
# --------------------------------------------
Write-Host "🔧 Corrigindo postinstall do package.json..."

$packagePath = ".\package.json"
$packageJson = Get-Content $packagePath -Raw | ConvertFrom-Json

# Remover scripts quebrados
$packageJson.scripts.PSObject.Properties.Remove("postinstall")

# Salvar de volta
$packageJson | ConvertTo-Json -Depth 100 | Out-File $packagePath -Encoding UTF8

# --------------------------------------------
# 3. INSTALAR DEPENDÊNCIAS
# --------------------------------------------
Write-Host "📦 Instalando dependências..."
npm install

# --------------------------------------------
# 4. REMOVER ARQUIVOS GRANDES E CACHE SWC
# --------------------------------------------
Write-Host "🧹 Limpando arquivos grandes e cache..."

$swc = Get-ChildItem -Recurse -Filter "swc.win32-x64-msvc.node"
foreach ($file in $swc) {
    Write-Host "Removido: $($file.FullName)"
    Remove-Item $file.FullName -Force
}

# --------------------------------------------
# 5. REINSTALAR NEXT
# --------------------------------------------
Write-Host "📦 Garantindo instalação do Next.js correta..."
npm install next@latest

# --------------------------------------------
# 6. BUILD DO PROJETO
# --------------------------------------------
Write-Host "🏗️ Gerando build do Next.js..."
npm run build

# --------------------------------------------
# 7. INICIAR SERVIDOR
# --------------------------------------------
Write-Host "🌐 Iniciando servidor Next.js..."
npm run dev
