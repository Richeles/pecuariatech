# ============================================
# PecuariaTech-Service v10
# FULL AUTO DEPLOY
# Corrige TSX, Triangulo 360, Build, Deploy
# ============================================

$basePath = "C:\Users\Administrador\pecuariatech"
$dominio = "https://www.pecuariatech.com"
$outputLog = Join-Path $basePath "PecuariaTech_v10_Log.txt"

Write-Host "=== PecuariaTech-Service v10 Iniciado ==="
"=== LOG PecuariaTech-Service v10 ===" | Out-File $outputLog

# ============================================
# 1. FIX AUTOMATICO DE ASPAS / use client
# ============================================

Write-Host "[1/7] Corrigindo arquivos TS e TSX..."

$files = Get-ChildItem -Recurse -Path $basePath -Include *.tsx,*.ts -ErrorAction SilentlyContinue

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Corrige aspas duplicadas
    $content = $content -replace '""', '"'

    # Corrige "use client" no topo
    if ($content -match '"use client";') {
        $content = $content -replace '"use client";', ''
        $content = '"use client";' + "`n" + $content.Trim()
    }

    Set-Content $file.FullName $content -Encoding UTF8
    Write-Host "Corrigido: $($file.FullName)"
    "Corrigido: $($file.FullName)" | Out-File $outputLog -Append
}

# ============================================
# 2. TRIANGULO 360 (Rede, DNS, REST)
# ============================================

Write-Host "[2/7] Executando Triangulo 360..."
"--- TRIANGULO 360 ---" | Out-File $outputLog -Append

# Teste Rede
try {
    if (Test-Connection -ComputerName "8.8.8.8" -Count 2 -Quiet) {
        Write-Host "Rede OK"
        "Rede OK" | Out-File $outputLog -Append
    } else {
        Write-Host "Rede FALHOU"
        exit
    }
} catch {
    Write-Host "Erro no teste de rede"
    exit
}

# Teste DNS Supabase
try {
    Resolve-DnsName "supabase.com" -ErrorAction Stop
    Write-Host "DNS Supabase OK"
    "DNS Supabase OK" | Out-File $outputLog -Append
} catch {
    Write-Host "DNS Supabase FALHOU"
    exit
}

# Teste REST Supabase
try {
    Invoke-WebRequest -Uri "https://supabase.com" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "REST Supabase OK"
    "REST Supabase OK" | Out-File $outputLog -Append
} catch {
    Write-Host "REST Supabase FALHOU"
    exit
}

# Teste DNS Dominio
try {
    Resolve-DnsName "www.pecuariatech.com" -ErrorAction Stop
    Write-Host "DNS Dominio OK"
    "DNS Dominio OK" | Out-File $outputLog -Append
} catch {
    Write-Host "DNS Dominio FALHOU"
    exit
}

# Teste REST do site em producao
try {
    Invoke-WebRequest -Uri $dominio -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "Dominio responde HTTP OK"
    "Dominio responde HTTP OK" | Out-File $outputLog -Append
} catch {
    Write-Host "Dominio nao respondeu (pode nao ter build recente)."
    "Dominio sem resposta" | Out-File $outputLog -Append
}

# ============================================
# 3. REMOVER BUILD ANTIGO
# ============================================

Write-Host "[3/7] Limpando build antigo..."

cd $basePath

if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force
}

Write-Host "Build antigo removido."

# ============================================
# 4. INSTALAR DEPENDENCIAS
# ============================================

Write-Host "[4/7] Instalando dependencias..."
npm install
"Dependencias instaladas" | Out-File $outputLog -Append

# ============================================
# 5. BUILD LOCAL
# ============================================

Write-Host "[5/7] Executando build local..."

try {
    npm run build
    Write-Host "Build OK"
    "Build OK" | Out-File $outputLog -Append
} catch {
    Write-Host "Build FALHOU"
    exit
}

# ============================================
# 6. DEPLOY PARA VERCEL
# ============================================

Write-Host "[6/7] Enviando deploy para Vercel..."

vercel --prod --yes
"Deploy enviado" | Out-File $outputLog -Append

# ============================================
# 7. TESTE FINAL DO DOMINIO
# ============================================

Write-Host "[7/7] Testando site final..."

try {
    $resp = Invoke-WebRequest -Uri $dominio -Method GET -TimeoutSec 10
    Write-Host "Site ONLINE: $dominio"
    "Site ONLINE" | Out-File $outputLog -Append
} catch {
    Write-Host "Site ainda nao respondeu. Aguarde propagacao."
    "Site nao respondeu" | Out-File $outputLog -Append
}

Write-Host "=== PecuariaTech-Service v10 Finalizado ==="
"=== FINALIZADO ===" | Out-File $outputLog -Append
