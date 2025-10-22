<# PecuariaTech UTF-8 Espelho + Cache Analítico v5.3.3 #>

$ErrorActionPreference = 'Stop'
$Root = "C:\Users\Administrador\pecuariatech"
$Backup = Join-Path $Root ("backup_utf8_restore_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
$CacheDir = Join-Path $Root "cache\analytics"
$Log = Join-Path $Root ("logs\utf8-restore-analytics-" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".log")

# Diretórios de apoio
foreach ($d in @("$Root\logs", $Backup, $CacheDir)) {
    if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d | Out-Null }
}

Start-Transcript -Path $Log -Force | Out-Null
Write-Host "[INFO] ⚙️ Iniciando restauração UTF-8 e cache analítico..."

# 1️⃣ Restaurar UTF-8 (usando a técnica de espelho)
$files = Get-ChildItem -Path $Root -Recurse -Include *.tsx,*.ts,*.js,*.jsx,*.css,*.json,*.html -ErrorAction SilentlyContinue
foreach ($f in $files) {
    $text = Get-Content -Path $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($text -match "Ã" -or $text -match "Â" -or $text -match "ðŸ") {
        Write-Host "[WARN] Corrigindo codificação em: $($f.Name)"
        $rel = $f.FullName.Substring($Root.Length)
        $dest = Join-Path $Backup $rel
        $dir = Split-Path $dest
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
        Copy-Item $f.FullName $dest -Force
        $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
        $decoded = [System.Text.Encoding]::GetEncoding(1252).GetString($bytes)
        [System.IO.File]::WriteAllText($f.FullName, $decoded, [System.Text.Encoding]::UTF8)
    }
}

# 2️⃣ Cache Analítico (armazenar resultados pré-computados)
Write-Host "[INFO] 🧠 Gerando cache analítico..."
$Data = @{
    timestamp = (Get-Date)
    cpu_load = (Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue
    memory_used = (Get-Counter '\Memory\Available MBytes').CounterSamples.CookedValue
    analytics_id = [guid]::NewGuid().ToString()
    description = "Cache analítico gerado automaticamente – UltraBiológica v5.3.3"
}
$Json = $Data | ConvertTo-Json -Depth 5
$Hash = (Get-Date -Format "yyyyMMddHHmmss")
$CacheFile = Join-Path $CacheDir "analysis_$Hash.json"
$Json | Out-File -Encoding utf8 $CacheFile
Write-Host "[INFO] 💾 Cache salvo em $CacheFile"

# Limpeza de caches antigos (>7 dias)
Get-ChildItem -Path $CacheDir -Filter *.json | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item -Force -ErrorAction SilentlyContinue

# 3️⃣ Commit + Deploy
Push-Location $Root
git add -A
git commit -m "fix: UTF-8 espelho + cache analítico v5.3.3" 2>$null | Out-Null
git push origin main
Pop-Location
Write-Host "[INFO] 📤 Deploy enviado (Vercel iniciará build automático)."

# 4️⃣ Som e abertura automática
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName PresentationFramework
[System.Media.SystemSounds]::Asterisk.Play()
Start-Sleep -Seconds 2
Start-Process "https://pecuariatech.com/dashboard"

Stop-Transcript | Out-Null
Write-Host "[INFO] ✅ Concluído! Cache ativo, acentuação restaurada e deploy enviado."
Write-Host "🌐 Abra https://pecuariatech.com/dashboard e confira o painel atualizado." -ForegroundColor Green
