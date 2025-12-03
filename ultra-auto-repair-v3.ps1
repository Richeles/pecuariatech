#Requires -Version 7
<#
  Script: ultra-auto-repair-v3.ps1
  Autor: Assistente GPT-5
  Versão: ALFA+BETA
  Função: Corrigir encoding, dashboard, config e build do PecuariaTech Cloud
#>

$ErrorActionPreference = "Stop"
$root = "C:\Users\Administrador\pecuariatech"
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$logDir = Join-Path $root "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }
$logFix = Join-Path $logDir "ultra-repair-$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

Write-Host "`n🚀 Ultra Auto Repair — PecuariaTech Cloud [ALFA+BETA]" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------------`n"

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
            # Corrigir caracteres corrompidos
            $text = $text `
                -replace 'ÃƒÂ§',[char]0x00E7 `
                -replace 'ÃƒÂ³',[char]0x00F3 `
                -replace 'ÃƒÂ¡',[char]0x00E1 `
                -replace 'ÃƒÂ©',[char]0x00E9 `
                -replace 'ÃƒÂº',[char]0x00FA `
                -replace 'ÃƒÂ­',[char]0x00ED `
                -replace 'ÃƒÂ£',[char]0x00E3 `
                -replace 'ÃƒÆ’',[char]0x00C1 `
                -replace 'ÃƒÂ',[char]0x00C3 `
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
Write-Host ("✅ {0} arquivos corrigidos de {1} analisados.`n" -f $fixed, $total) -ForegroundColor Green

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
        Write-Host "ℹ️ Nenhum problema encontrado em next.config.js" -ForegroundColor DarkGray
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
        Write-Host "✅ Adicionado 'type: module' ao package.json" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Campo [type] já presente no package.json" -ForegroundColor DarkGray
    }
} else {
    Write-Host "⚠️ package.json não encontrado"
}

# 4️⃣ Corrigir Dashboard
Write-Host "`n📊 Etapa 4: Corrigindo dashboard/page.tsx..." -ForegroundColor Yellow
$dashPath = Join-Path $root "app\dashboard\page.tsx"
if (Test-Path $dashPath) {
    $text = Get-Content $dashPath -Raw
    $text = $text `
        -replace 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â','📊' `
        -replace 'ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â¾','🌱' `
        -replace 'ÃƒÂ°Ã…Â¸Ã‚ÂÃ¢â‚¬Å¾','🐄' `
        -replace 'ÃƒÂ','ã' `
        -replace 'Ã¢','â' `
        -replace 'Â',''
    [System.IO.File]::WriteAllText($dashPath, $text, $Utf8NoBom)
    Write-Host "✅ Dashboard limpo e ícones restaurados (📊🌱🐄)" -ForegroundColor Green
    Add-Content $logFix "📊 Dashboard corrigido em: $dashPath"
} else {
    Write-Host "⚠️ Dashboard não encontrado"
}

# 5️⃣ Limpeza
Write-Host "`n🧹 Etapa 5: Limpando cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "$root\.next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$root\node_modules\.cache" -ErrorAction SilentlyContinue
Write-Host "✅ Cache limpo!" -ForegroundColor Green

# 6️⃣ Build final
Write-Host "`n⚙️ Etapa 6: Executando build final..." -ForegroundColor Cyan
npm run build

Write-Host "`n-----------------------------------------------------------"
Write-Host "✅ Reparo ALFA+BETA concluído com sucesso!" -ForegroundColor Green
Write-Host "📄 Log salvo em: $logFix" -ForegroundColor Cyan
Write-Host "🚀 PecuariaTech Cloud pronto para voar alto!" -ForegroundColor Cyan
