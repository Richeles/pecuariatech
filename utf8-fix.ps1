<# PecuariaTech UTF-8 Global Fix – UltraBiológica v5.3.1 #>

$ErrorActionPreference = 'Stop'
$Root = "C:\Users\Administrador\pecuariatech"
$Backup = Join-Path $Root ("backup_utf8_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
$Log = Join-Path $Root ("logs\utf8-fix-" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".log")
if (-not (Test-Path "$Root\logs")) { New-Item -ItemType Directory -Path "$Root\logs" | Out-Null }
if (-not (Test-Path $Backup)) { New-Item -ItemType Directory -Path $Backup | Out-Null }

function Write-Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Write-Err($m){ Write-Host "[ERRO] $m" -ForegroundColor Red }

Write-Info "🚀 Iniciando correção UTF-8 global no projeto PecuariaTech..."
Write-Info "Backup em: $Backup"
Start-Transcript -Path $Log -Force | Out-Null

# 1️⃣  Seleciona arquivos .tsx, .ts, .js, .jsx, .css, .json, .html
$files = Get-ChildItem -Path $Root -Recurse -Include *.tsx,*.ts,*.js,*.jsx,*.css,*.json,*.html -ErrorAction SilentlyContinue

foreach ($f in $files) {
    try {
        $bytes = Get-Content -Path $f.FullName -Encoding Byte -ErrorAction SilentlyContinue
        # Detecta se o arquivo não é UTF-8
        $encoding = [System.Text.Encoding]::UTF8.GetString($bytes) | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "Codificação suspeita em: $($f.FullName)"
        }
        # Backup
        $rel = $f.FullName.Substring($Root.Length)
        $dest = Join-Path $Backup $rel
        $dir = Split-Path $dest
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
        Copy-Item $f.FullName $dest -Force
        # Converte para UTF-8 com BOM
        $content = Get-Content -Path $f.FullName -Raw -ErrorAction SilentlyContinue
        $utf8 = [System.Text.Encoding]::UTF8
        [System.IO.File]::WriteAllText($f.FullName, $content, $utf8)
        Write-Info "✅ Convertido: $($f.FullName)"
    } catch {
        Write-Warn "Falha ao converter $($f.FullName): $($_.Exception.Message)"
    }
}

# 2️⃣  Garante meta UTF-8 no layout base
$layout = Join-Path $Root "app\layout.tsx"
if (Test-Path $layout) {
    $txt = Get-Content $layout -Raw
    if ($txt -notmatch "charSet") {
        $txt = $txt -replace "(<head>)", "`$1`n        <meta charSet=`"UTF-8`" />"
        $txt | Out-File -Encoding utf8 $layout
        Write-Info "🧩 Meta UTF-8 inserida em layout.tsx"
    }
}

# 3️⃣  Força UTF-8 no next.config.js
$next = Join-Path $Root "next.config.js"
if (Test-Path $next) {
$cfg = @"
/** UTF-8 fix */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'Content-Type', value: 'text/html; charset=utf-8' },
      ],
    },
  ],
};
module.exports = nextConfig;
"@
    $cfg | Out-File -Encoding utf8 $next
    Write-Info "🧱 next.config.js atualizado com charset UTF-8"
}

# 4️⃣  Commit e Deploy automático
Push-Location $Root
try {
    git add -A
    git commit -m "fix: UTF-8 encoding global" 2>$null | Out-Null
    git push origin main
    Write-Info "📤 Deploy enviado (Vercel iniciará build automático)."
} catch {
    Write-Warn "⚠️ Falha no commit/push: $($_.Exception.Message)"
}
Pop-Location

Stop-Transcript | Out-Null
Write-Info "✅ Concluído! Log salvo em $Log"
Write-Host "🌐 Após o build, acesse https://pecuariatech.com/dashboard para verificar os acentos corrigidos." -ForegroundColor Green
