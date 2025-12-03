#Requires -Version 7
<#
  Script: ultra-auto-repair-v2.ps1
  Autor: Assistente GPT-5
  Versão: 7.2
  Função: Corrigir encoding, configuração e build do PecuariaTech Cloud
#>

$ErrorActionPreference = "Stop"
$root = "C:\Users\Administrador\pecuariatech"
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$logDir = Join-Path $root "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }
$logFix = Join-Path $logDir "ultra-repair-$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

Write-Host "`n🧠 Ultra Auto Repair — PecuariaTech Cloud v7.2" -ForegroundColor Cyan
Write-Host "------------------------------------------------------`n"

# 1️⃣ Corrigir encoding corrompido
Write-Host "🧩 Etapa 1: Corrigindo encoding UTF-8..." -ForegroundColor Yellow

$files = Get-ChildItem -Path $root -Recurse -Include *.ts,*.tsx,*.js,*.jsx,*.json,*.html,*.css -ErrorAction SilentlyContinue
$total = $files.Count
$i = 0
$fixed = 0

foreach ($file in $files) {
    $i++
    Write-Progress -Activity "Corrigindo encoding..." -Status ("{0}/{1}: {2}" -f $i, $total, $file.Name) -PercentComplete (($i / $total) * 100)
    try {
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $text  = [System.Text.Encoding]::UTF8.GetString($bytes)

        if ($text -match 'Ãƒ|Ã‚|Ã¢â‚¬|Â|Ã…') {
            # Correções Unicode seguras
            $text = $text `
                -replace 'ÃƒÂ§',[char]0x00E7 `  # ç
                -replace 'ÃƒÂ³',[char]0x00F3 `  # ó
                -replace 'ÃƒÂ¡',[char]0x00E1 `  # á
                -replace 'ÃƒÂ©',[char]0x00E9 `  # é
                -replace 'ÃƒÂº',[char]0x00FA `  # ú
                -replace 'ÃƒÂ­',[char]0x00ED `  # í
                -replace 'ÃƒÂ£',[char]0x00E3 `  # ã
                -replace 'ÃƒÆ’',[char]0x00C1 `  # Á
                -replace 'ÃƒÂ',[char]0x00C3 `  # Ã
                -replace 'Ã¢â‚¬','-' `
                -replace 'Ã‚Â','' `
                -replace 'Â','' `
                -replace 'Ãƒ','' `
                -replace '[\u200B-\u200F\uFEFF]',''

            # Backup antes de salvar
            $backup = "$($file.FullName).bak"
            Copy-Item $file.FullName $backup -Force
            [System.IO.File]::WriteAllText($file.FullName, $text, $Utf8NoBom)
            Add-Content $logFix "✔️ Corrigido: $($file.FullName)"
            $fixed++
        }
    }
    catch {
        Add-Content $logFix "💀 Falha: $($file.FullName) → $($_.Exception.Message)"
    }
}
Write-Host "✅ $fixed arquivos corrigidos de $total analisados.`n" -ForegroundColor Green

# 2️⃣ Corrigir experimental.serverActions
Write-Host "⚙️ Etapa 2: Ajustando next.config.js..." -ForegroundColor Yellow
$nextConfig = Join-Path $root "next.config.js"
if (Test-Path $nextConfig) {
    $content = Get-Content $nextConfig -Raw -ErrorAction SilentlyContinue
    if ($content -match 'experimental\.serverActions') {
        $content = $content -replace 'experimental\s*:\s*true', 'experimental: { serverActions: { bodySizeLimit: "2mb" } }'
        $content = $content -replace 'experimental\.serverActions\s*=\s*(true|false)', ''
        [System.IO.File]::WriteAllText($nextConfig, $content, $Utf8NoBom)
        Add-Content $logFix "🧠 Ajustado experimental.serverActions em next.config.js"
        Write-Host "✅ next.config.js corrigido!" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Nenhum problema encontrado em next.config.js"
    }
} else {
    Write-Host "⚠️ next.config.js não encontrado"
}

# 3️⃣ Garantir "type": "module" no package.json
Write-Host "`n📦 Etapa 3: Verificando package.json..." -ForegroundColor Yellow
$pkgPath = Join-Path $root "package.json"
if (Test-Path $pkgPath) {
    $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
    if (-not $pkg.PSObject.Properties.Name -contains "type") {
        $pkg | Add-Member -NotePropertyName "type" -NotePropertyValue "module"
        $pkg | ConvertTo-Json -Depth 10 | Out-File $pkgPath -Encoding utf8
        Add-Content $logFix "🧩 Adicionado type: module ao package.json"
        Write-Host "✅ Adicionado 'type': 'module' ao package.json" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Campo 'type' já presente."
    }
} else {
    Write-Host "⚠️ package.json não encontrado"
}

# 4️⃣ Limpeza
Write-Host "`n🧹 Etapa 4: Limpando cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "$root\.next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$root\node_modules\.cache" -ErrorAction SilentlyContinue
Write-Host "✅ Cache limpo!" -ForegroundColor Green

# 5️⃣ Build
Write-Host "`n⚙️ Etapa 5: Executando build otimizado..." -ForegroundColor Cyan
npm run build

Write-Host "`n------------------------------------------------------"
Write-Host "✅ Reparo completo! Log salvo em: $logFix" -ForegroundColor Green
Write-Host "🚀 PecuariaTech Cloud pronto para decolar!" -ForegroundColor Cyan
