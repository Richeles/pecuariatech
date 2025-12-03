#Requires -Version 7
$ErrorActionPreference = "Stop"
$root = "C:\Users\Administrador\pecuariatech"
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$logDir = Join-Path $root "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }
$logFix = Join-Path $logDir "repair-$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

Write-Host "`n=== PecuariaTech Cloud | Reparo Final de Encoding ===" -ForegroundColor Cyan

# Corrigir arquivos UTF-8
$files = Get-ChildItem -Path $root -Recurse -Include *.ts,*.tsx,*.js,*.jsx,*.json -ErrorAction SilentlyContinue
$total = $files.Count
$fixed = 0
foreach ($f in $files) {
    try {
        $b = [System.IO.File]::ReadAllBytes($f.FullName)
        $t = [System.Text.Encoding]::UTF8.GetString($b)
        if ($t -match 'Ã') {
            $t = $t `
                -replace 'ÃƒÂ§',[char]0x00E7 `
                -replace 'ÃƒÂ³',[char]0x00F3 `
                -replace 'ÃƒÂ¡',[char]0x00E1 `
                -replace 'ÃƒÂ©',[char]0x00E9 `
                -replace 'ÃƒÂº',[char]0x00FA `
                -replace 'ÃƒÂ­',[char]0x00ED `
                -replace 'ÃƒÂ£',[char]0x00E3 `
                -replace 'ÃƒÆ’',[char]0x00C1 `
                -replace 'Ã¢â‚¬','-' `
                -replace 'Ã‚Â','' `
                -replace 'Â',''
            [System.IO.File]::WriteAllText($f.FullName, $t, $Utf8NoBom)
            Add-Content $logFix "Corrigido: $($f.FullName)"
            $fixed++
        }
    } catch {}
}
Write-Host ("Arquivos corrigidos: {0}" -f $fixed)

# Corrigir dashboard
$dash = Join-Path $root "app\dashboard\page.tsx"
if (Test-Path $dash) {
    $text = Get-Content $dash -Raw
    $text = $text `
        -replace 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â','[char]0x1F4CA' `  # 📊
        -replace 'ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â¾','[char]0x1F331' `  # 🌱
        -replace 'ÃƒÂ°Ã…Â¸Ã‚ÂÃ¢â‚¬Å¾','[char]0x1F404'   # 🐄
    [System.IO.File]::WriteAllText($dash, $text, $Utf8NoBom)
    Add-Content $logFix "Dashboard reparado"
    Write-Host "Dashboard corrigido (ícones restaurados)"
}

# Corrigir next.config.js
$cfg = Join-Path $root "next.config.js"
if (Test-Path $cfg) {
    $data = Get-Content $cfg -Raw
    $data = $data -replace 'experimental\s*:\s*true', 'experimental: { serverActions: { bodySizeLimit: "2mb" } }'
    [System.IO.File]::WriteAllText($cfg, $data, $Utf8NoBom)
    Write-Host "next.config.js ajustado"
}

# Garantir type: module
$pkg = Join-Path $root "package.json"
if (Test-Path $pkg) {
    $json = Get-Content $pkg -Raw | ConvertFrom-Json
    if (-not $json.PSObject.Properties.Name -contains "type") {
        $json | Add-Member -NotePropertyName "type" -NotePropertyValue "module"
        $json | ConvertTo-Json -Depth 10 | Out-File $pkg -Encoding utf8
        Write-Host "type: module adicionado"
    }
}

# Build final
Write-Host "`nExecutando build otimizado..." -ForegroundColor Cyan
npm run build
Write-Host "`n=== Reparo concluído com sucesso ==="
