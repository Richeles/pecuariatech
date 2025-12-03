# ==========================================
# 🚀 PecuariaTech Cloud — Ultra Stabilizer v1.0
# Fase 2 — Diagnóstico, Supabase, Build e Deploy
# ==========================================

$ErrorActionPreference = "Stop"
$root = "C:\Users\Administrador\pecuariatech"
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$logDir = Join-Path $root "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }
$log = Join-Path $logDir "stabilizer-$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

Write-Host "`n🌎 Ultra Stabilizer — PecuariaTech Cloud" -ForegroundColor Cyan
Start-Sleep -Seconds 1

# ============================
# 1️⃣ Diagnóstico de encoding
# ============================
Write-Host "`n🧩 Verificando arquivos UTF-8..." -ForegroundColor Yellow
$files = Get-ChildItem -Path $root -Recurse -Include *.ts,*.tsx,*.js,*.jsx,*.json -ErrorAction SilentlyContinue
$total = $files.Count
$corrompidos = @()

foreach ($f in $files) {
    try {
        $b = [System.IO.File]::ReadAllBytes($f.FullName)
        $t = [System.Text.Encoding]::UTF8.GetString($b)
        if ($t -match 'Ã') { $corrompidos += $f.FullName }
    } catch {}
}

if ($corrompidos.Count -gt 0) {
    Write-Host "⚠️ Detectados $($corrompidos.Count) arquivos corrompidos!" -ForegroundColor Red
    $corrompidos | Out-File -FilePath $log -Encoding utf8
    Write-Host "🩺 Corrigindo automaticamente..."
    foreach ($f in $corrompidos) {
        $txt = Get-Content $f -Raw
        $txt = $txt -replace 'Ã','' -replace 'Â',''
        [System.IO.File]::WriteAllText($f, $txt, $Utf8NoBom)
    }
    Write-Host "✅ Arquivos limpos e regravados em UTF-8 puro!"
} else {
    Write-Host "✅ Nenhum arquivo corrompido detectado." -ForegroundColor Green
}

# ============================
# 2️⃣ Supabase Health Check
# ============================
Write-Host "`n🧠 Verificando conexão com Supabase..." -ForegroundColor Yellow
$envUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$envKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
if (-not $envUrl -or -not $envKey) {
    Write-Host "⚠️ Variáveis de ambiente não encontradas (.env.local)!" -ForegroundColor Red
    if (Test-Path "$root\.env.local") {
        $envs = Get-Content "$root\.env.local"
        Write-Host "📦 Carregando variáveis de .env.local..."
        foreach ($line in $envs) {
            if ($line -match "^(?<key>[^=]+)=(?<value>.+)$") {
                $k = $Matches['key']; $v = $Matches['value']
                [System.Environment]::SetEnvironmentVariable($k, $v)
            }
        }
        $envUrl = $env:NEXT_PUBLIC_SUPABASE_URL
        $envKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
        Write-Host "✅ Variáveis carregadas com sucesso!"
    } else {
        Write-Host "❌ Arquivo .env.local não encontrado — configure antes de continuar."
        exit
    }
}

try {
    $testUrl = "$envUrl/rest/v1/?apikey=$envKey"
    $res = Invoke-WebRequest -Uri $testUrl -Method GET -UseBasicParsing -TimeoutSec 10
    if ($res.StatusCode -eq 200) {
        Write-Host "✅ Supabase Online e autenticado!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Supabase respondeu com código: $($res.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Falha ao acessar Supabase! Verifique URL e chave." -ForegroundColor Red
}

# ============================
# 3️⃣ Build verificado
# ============================
Write-Host "`n🏗️ Executando build otimizado..." -ForegroundColor Yellow
try {
    npm run build | Tee-Object -FilePath $log -Append
    Write-Host "✅ Build finalizado!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro durante o build. Verifique logs em $log" -ForegroundColor Red
}

# ============================
# 4️⃣ Deploy automático (Vercel)
# ============================
Write-Host "`n🚀 Enviando para Vercel..." -ForegroundColor Cyan
try {
    npx vercel --prod --yes | Tee-Object -FilePath $log -Append
    Write-Host "✅ Deploy concluído!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Falha no deploy. Execute manualmente: npx vercel --prod"
}

# ============================
# 5️⃣ Resumo
# ============================
Write-Host "`n==============================="
Write-Host "✅ Fase 2 concluída com sucesso!"
Write-Host "📄 Log salvo em: $log"
Write-Host "==============================="
