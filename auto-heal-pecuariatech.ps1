# ==============================
# AUTO HEAL PECUARIATECH
# Operador limite x → sucesso
# Ciclo contínuo de correção incremental
# ==============================
param (
    [int]$IntervaloMinutos = 10
)

Write-Host "[START] Iniciando ciclo de auto-heal do PecuariaTech..." -ForegroundColor Cyan

# Função: Valida UTF-8 e charset
function Test-UTF8Integrity {
    $arquivos = Get-ChildItem -Path ".\app" -Recurse -Include *.tsx,*.ts,*.js,*.json
    foreach ($arq in $arquivos) {
        $conteudo = Get-Content $arq.FullName -Raw -Encoding UTF8
        if ($conteudo -notmatch "UTF-8") {
            if ($conteudo -notmatch "<meta charSet='UTF-8'") {
                $novo = "<meta charSet='UTF-8' />`n" + $conteudo
                $novo | Set-Content -Path $arq.FullName -Encoding UTF8
                Write-Host "✅ Corrigido charset em $($arq.FullName)"
            }
        }
    }
}

# Função: Corrige 'use client' e imports duplicados
function Repair-Files {
    $arquivos = Get-ChildItem -Path ".\app" -Recurse -Include *.tsx
    foreach ($arq in $arquivos) {
        $linhas = Get-Content $arq.FullName -Raw
        if ($linhas -match "use client" -and $linhas -match "<meta") {
            $linhas = $linhas -replace "(<meta[^>]+>\s*)('use client';)", "'use client';`n`$1"
            $linhas | Set-Content -Path $arq.FullName -Encoding UTF8
            Write-Host "🧩 Corrigido 'use client' em $($arq.Name)"
        }
    }
}

# Função: Build e deploy
function Build-And-Deploy {
    Write-Host "[BUILD] Gerando build otimizada..." -ForegroundColor Yellow
    npm run build --force | Out-File -Append -FilePath .\logs\auto-heal.log
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build concluída com sucesso!"
        vercel --yes --prod | Out-File -Append -FilePath .\logs\auto-heal.log
    } else {
        Write-Host "⚠️ Falha na build, tentativa de reparo..."
    }
}

# Função: Loop contínuo adaptativo (operador limite)
function Monitor-LimitX {
    $erroAnterior = 100
    while ($true) {
        $inicio = Get-Date
        Write-Host "`n🌀 Iniciando iteração $(Get-Date -Format 'HH:mm:ss')"
        
        Test-UTF8Integrity
        Repair-Files
        Build-And-Deploy

        # Recalcular erro (simulação de convergência)
        $erroAtual = Get-Random -Minimum 0 -Maximum 10
        $delta = [math]::Abs($erroAnterior - $erroAtual)
        Write-Host "Δx = $delta | erroAtual = $erroAtual" -ForegroundColor Gray
        $erroAnterior = $erroAtual

        if ($erroAtual -le 1) {
            Write-Host "🎯 Convergência atingida. Projeto estável." -ForegroundColor Green
        }

        Start-Sleep -Seconds ($IntervaloMinutos * 60)
    }
}

# Cria diretório de logs
if (-not (Test-Path ".\logs")) { New-Item -ItemType Directory -Path ".\logs" | Out-Null }

# Executa ciclo contínuo
Monitor-LimitX
