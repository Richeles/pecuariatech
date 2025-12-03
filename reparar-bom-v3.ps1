# ============================================================
# Script: reparar-bom-v3.ps1
# Autor: Richeles + GPT-5
# Objetivo: Remover BOM, padronizar UTF-8, e corrigir configs Next.js
# ============================================================

Write-Host "🚀 Iniciando verificação e reparo do projeto PecuariaTech..." -ForegroundColor Cyan

# Caminho base
$pasta = "C:\Users\Administrador\pecuariatech"
$packagePath = Join-Path $pasta "package.json"
$nextConfigPath = Join-Path $pasta "next.config.js"

# Extensões-alvo
$extensoes = "*.json","*.js","*.ts","*.tsx","*.env","*.yml","*.yaml"

$totalArquivos = 0
$totalCorrigidos = 0
$totalPadronizados = 0

function Corrigir-UTF8([string]$arquivo) {
    $bytes = [System.IO.File]::ReadAllBytes($arquivo)
    $corrigido = $false

    # Remove BOM (EF BB BF)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        $bytes = $bytes[3..($bytes.Length - 1)]
        $corrigido = $true
    }

    $conteudo = [System.Text.Encoding]::UTF8.GetString($bytes)
    [System.IO.File]::WriteAllText($arquivo, $conteudo, (New-Object System.Text.UTF8Encoding $false))

    if ($corrigido) {
        Write-Host "🧩 Corrigido (BOM removido): $arquivo" -ForegroundColor Green
        return "corrigido"
    } else {
        Write-Host "⚙️ Padronizado UTF-8: $arquivo" -ForegroundColor Yellow
        return "padronizado"
    }
}

# 🔍 Passo 1: Corrigir BOM e padronizar UTF-8
foreach ($ext in $extensoes) {
    $arquivos = Get-ChildItem -Path $pasta -Recurse -Include $ext -ErrorAction SilentlyContinue
    foreach ($arq in $arquivos) {
        $totalArquivos++
        $resultado = Corrigir-UTF8 $arq.FullName
        if ($resultado -eq "corrigido") { $totalCorrigidos++ }
        if ($resultado -eq "padronizado") { $totalPadronizados++ }
    }
}

# 🔧 Passo 2: Verificar e corrigir package.json
if (Test-Path $packagePath) {
    Write-Host "`n🧠 Verificando package.json..." -ForegroundColor Cyan
    $json = Get-Content $packagePath -Raw | ConvertFrom-Json

    if (-not $json.type) {
        Write-Host "📦 Adicionando campo 'type': 'module'" -ForegroundColor Yellow
        $json | Add-Member -NotePropertyName "type" -NotePropertyValue "module"
        $json | ConvertTo-Json -Depth 5 | Out-File $packagePath -Encoding UTF8
    } else {
        Write-Host "✅ package.json já possui 'type': $($json.type)" -ForegroundColor Green
    }
}

# ⚙️ Passo 3: Corrigir next.config.js
if (Test-Path $nextConfigPath) {
    Write-Host "`n🔧 Verificando next.config.js..." -ForegroundColor Cyan
    $conteudo = Get-Content $nextConfigPath -Raw

    if ($conteudo -match "serverActions\s*:\s*true") {
        Write-Host "🛠 Corrigindo formato de serverActions..." -ForegroundColor Yellow
        $conteudo = $conteudo -replace "serverActions\s*:\s*true", 'serverActions: { bodySizeLimit: "2mb" }'
        Set-Content -Path $nextConfigPath -Value $conteudo -Encoding UTF8
        Write-Host "✅ serverActions corrigido para formato de objeto." -ForegroundColor Green
    } else {
        Write-Host "✔️ next.config.js já está no formato correto." -ForegroundColor Green
    }
}

# 🧾 Relatório final
Write-Host "`n📊 Relatório Final" -ForegroundColor Cyan
Write-Host "📂 Total de arquivos verificados: $totalArquivos"
Write-Host "🧩 Corrigidos (BOM removido): $totalCorrigidos" -ForegroundColor Green
Write-Host "⚙️ Padronizados UTF-8: $totalPadronizados" -ForegroundColor Yellow
Write-Host "`n✅ Verificação de package.json e next.config.js concluída." -ForegroundColor Cyan
Write-Host "🏁 Execução finalizada." -ForegroundColor Green
Write-Host "`n💡 Agora execute: npm run dev" -ForegroundColor White
