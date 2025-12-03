# ============================================================
# Script: reparar-bom-v4.ps1
# Autor: Richeles + GPT-5
# Objetivo: Remover BOM, padronizar UTF-8, registrar logs localmente e no Supabase
# ============================================================

Write-Host "🚀 Iniciando reparo e registro de logs (v4)..." -ForegroundColor Cyan

# === CONFIGURAÇÕES ===
$pasta = "C:\Users\Administrador\pecuariatech"
$packagePath = Join-Path $pasta "package.json"
$nextConfigPath = Join-Path $pasta "next.config.js"
$logLocal = Join-Path $pasta "reparo-log.txt"

# Chaves do Supabase (usa as variáveis já definidas no .env.local)
$SUPABASE_URL = "https://kpzzekflqpoeccnqfkng.supabase.co"
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"

# === VARIÁVEIS ===
$extensoes = "*.json","*.js","*.ts","*.tsx","*.env","*.yml","*.yaml"
$totalArquivos = 0
$totalCorrigidos = 0
$totalPadronizados = 0
$mensagem = ""

# === FUNÇÃO: Corrigir UTF-8 ===
function Corrigir-UTF8([string]$arquivo) {
    $bytes = [System.IO.File]::ReadAllBytes($arquivo)
    $corrigido = $false
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
        return "padronizado"
    }
}

# === EXECUÇÃO PRINCIPAL ===
foreach ($ext in $extensoes) {
    $arquivos = Get-ChildItem -Path $pasta -Recurse -Include $ext -ErrorAction SilentlyContinue
    foreach ($arq in $arquivos) {
        $totalArquivos++
        $resultado = Corrigir-UTF8 $arq.FullName
        if ($resultado -eq "corrigido") { $totalCorrigidos++ }
        if ($resultado -eq "padronizado") { $totalPadronizados++ }
    }
}

# === package.json ===
if (Test-Path $packagePath) {
    $json = Get-Content $packagePath -Raw | ConvertFrom-Json
    if (-not $json.type) {
        Write-Host "📦 Adicionando campo 'type': 'module'" -ForegroundColor Yellow
        $json | Add-Member -NotePropertyName "type" -NotePropertyValue "module"
        $json | ConvertTo-Json -Depth 5 | Out-File $packagePath -Encoding UTF8
    }
}

# === next.config.js ===
if (Test-Path $nextConfigPath) {
    $conteudo = Get-Content $nextConfigPath -Raw
    if ($conteudo -match "serverActions\s*:\s*true") {
        Write-Host "🛠 Corrigindo formato de serverActions..." -ForegroundColor Yellow
        $conteudo = $conteudo -replace "serverActions\s*:\s*true", 'serverActions: { bodySizeLimit: "2mb" }'
        Set-Content -Path $nextConfigPath -Value $conteudo -Encoding UTF8
    }
}

# === GERAÇÃO DE LOG LOCAL ===
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$logMsg = @"
[$timestamp]
Arquivos verificados: $totalArquivos
Corrigidos (BOM removido): $totalCorrigidos
Padronizados UTF-8: $totalPadronizados
---------------------------------------------
"@
Add-Content -Path $logLocal -Value $logMsg
Write-Host "🧾 Log salvo em $logLocal" -ForegroundColor Cyan

# === ENVIO PARA SUPABASE ===
try {
    $body = @{
        arquivos_verificados = $totalArquivos
        arquivos_corrigidos = $totalCorrigidos
        arquivos_padronizados = $totalPadronizados
        mensagem = "Reparo automático executado em $timestamp"
        sucesso = $true
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/logs_reparo" `
        -Method Post `
        -Headers @{
            "apikey" = $SUPABASE_KEY
            "Authorization" = "Bearer $SUPABASE_KEY"
            "Content-Type" = "application/json"
            "Prefer" = "return=minimal"
        } `
        -Body $body

    Write-Host "☁️ Log enviado ao Supabase com sucesso." -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Falha ao enviar log ao Supabase: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📊 Relatório Final" -ForegroundColor Cyan
Write-Host "📂 Total: $totalArquivos | 🧩 Corrigidos: $totalCorrigidos | ⚙️ Padronizados: $totalPadronizados"
Write-Host "🏁 Execução concluída." -ForegroundColor Green
Write-Host "💡 Agora execute: npm run dev" -ForegroundColor White
