# ============================================================
# Script: reparar-bom-v4.1.ps1
# Autor: Richeles + GPT-5
# Objetivo: Manutenção automatizada com log local + Supabase
# ============================================================

$inicio = Get-Date
Write-Host "🚀 Iniciando reparo e registro de logs (v4.1)..." -ForegroundColor Cyan

# === CONFIGURAÇÕES ===
$pasta = Split-Path -Parent $MyInvocation.MyCommand.Definition  # Detecta a raiz do projeto automaticamente
$packagePath = Join-Path $pasta "package.json"
$nextConfigPath = Join-Path $pasta "next.config.js"
$logLocal = Join-Path $pasta "reparo-log.txt"

# Supabase
$SUPABASE_URL = "https://kpzzekflqpoeccnqfkng.supabase.co"
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"

$extensoes = "*.json","*.js","*.ts","*.tsx","*.env","*.yml","*.yaml"
$totalArquivos = 0
$totalCorrigidos = 0
$totalPadronizados = 0

# === FUNÇÃO PRINCIPAL ===
function Corrigir-UTF8([string]$arquivo) {
    try {
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
    catch {
        Write-Host "⚠️ Acesso negado ou erro em: $arquivo" -ForegroundColor DarkYellow
        return "ignorado"
    }
}

# === EXECUÇÃO ===
foreach ($ext in $extensoes) {
    $arquivos = Get-ChildItem -Path $pasta -Recurse -Include $ext -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\\.next\\' -and $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\\\.vercel\\' }

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
        $json | Add-Member -NotePropertyName "type" -NotePropertyValue "module"
        $json | ConvertTo-Json -Depth 5 | Out-File $packagePath -Encoding UTF8
        Write-Host "📦 Adicionado 'type': 'module' ao package.json" -ForegroundColor Yellow
    }
}

# === next.config.js ===
if (Test-Path $nextConfigPath) {
    $conteudo = Get-Content $nextConfigPath -Raw
    if ($conteudo -match "serverActions\s*:\s*true") {
        $conteudo = $conteudo -replace "serverActions\s*:\s*true", 'serverActions: { bodySizeLimit: "2mb" }'
        Set-Content -Path $nextConfigPath -Value $conteudo -Encoding UTF8
        Write-Host "🛠 Corrigido formato serverActions em next.config.js" -ForegroundColor Yellow
    }
}

# === LOG LOCAL ===
$fim = Get-Date
$duracao = [math]::Round(($fim - $inicio).TotalSeconds, 2)
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$logMsg = @"
[$timestamp]
Duração: ${duracao}s
Arquivos verificados: $totalArquivos
Corrigidos: $totalCorrigidos
Padronizados: $totalPadronizados
---------------------------------------------
"@
Add-Content -Path $logLocal -Value $logMsg
Write-Host "🧾 Log local salvo em $logLocal" -ForegroundColor Cyan

# === LOG SUPABASE ===
try {
    $body = @{
        arquivos_verificados = $totalArquivos
        arquivos_corrigidos = $totalCorrigidos
        arquivos_padronizados = $totalPadronizados
        mensagem = "Reparo automático executado em $timestamp (${duracao}s)"
        sucesso = $true
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/logs_reparo" `
        -Method Post `
        -Headers @{
            "apikey" = $SUPABASE_KEY
            "Authorization" = "Bearer $SUPABASE_KEY"
            "Content-Type" = "application/json"
            "Prefer" = "return=minimal"
        } `
        -Body $body

    Write-Host "☁️ Log enviado com sucesso ao Supabase." -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Falha ao enviar log ao Supabase: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📊 Relatório Final" -ForegroundColor Cyan
Write-Host "📂 Total: $totalArquivos | 🧩 Corrigidos: $totalCorrigidos | ⚙️ Padronizados: $totalPadronizados | 🕒 ${duracao}s"
Write-Host "🏁 Execução concluída." -ForegroundColor Green
Write-Host "💡 Agora execute: npm run dev" -ForegroundColor White
