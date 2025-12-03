<#
ULTRABIOLOGICO FULL-AUTOMATIC DEPLOY SCRIPT
- Autor: ChatGPT (assistente)
- Use: Salve como ultrabiologico-deploy.ps1 e rode na raiz do projeto Next.js
#>

# ---------- CONFIG ----------
$ProjectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ProjectPath) { $ProjectPath = (Get-Location).Path }

Set-Location $ProjectPath

$timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$logFile = Join-Path $ProjectPath "deploy-report-$timestamp.txt"

Function Log {
    param([string]$s)
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | $s"
    $line | Tee-Object -FilePath $logFile -Append
    Write-Host $s
}

Log "🧬 INICIANDO ULTRABIOLOGICO FULL-AUTOMATIC - Projeto: $ProjectPath"

# ---------- 0. Safety checks ----------
if (-not (Test-Path (Join-Path $ProjectPath "package.json"))) {
    Log "❌ package.json não encontrado. Saindo."
    exit 1
}

# ---------- 1. Backup arquivos importantes ----------
$backupDir = Join-Path $ProjectPath "backup_ultrabiologico_$timestamp"
New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
Log "📦 Criando backup em $backupDir"

# backup básico: postcss and pages files
$toBackup = @("postcss.config.js", "tailwind.config.js")
$pagesFiles = @(
    "pages\index.tsx",
    "pages\financeiro\index.tsx",
    "pages\pastagem\index.tsx"
)
foreach ($f in $toBackup + $pagesFiles) {
    $p = Join-Path $ProjectPath $f
    if (Test-Path $p) {
        $dest = Join-Path $backupDir ($f -replace '[\\/]', '_')
        Copy-Item -Path $p -Destination $dest -Force
        Log "📥 Backup: $f -> $dest"
    }
}

# ---------- 2. Remove arquivos conflitantes pages/ (se existirem) ----------
foreach ($f in $pagesFiles) {
    $full = Join-Path $ProjectPath $f
    if (Test-Path $full) {
        try {
            Remove-Item -Path $full -Force
            Log "🗑 Removido arquivo conflitante: $f"
        } catch {
            Log "⚠ Falha ao remover ${f}: $_"
        }
    } else {
        Log "ℹ Não existe: $f"
    }
}

# ---------- 3. Ensure postcss.config.js (Tailwind PostCSS plugin syntax) ----------
$postcssPath = Join-Path $ProjectPath "postcss.config.js"
$postcssDesired = @"
/** @type {import('postcss').ProcessOptions} */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"@
if (Test-Path $postcssPath) {
    Copy-Item $postcssPath "$postcssPath.bak_$timestamp" -Force
    Log "📦 Backup postcss.config.js criado"
}
Set-Content -Path $postcssPath -Value $postcssDesired -Encoding UTF8
Log "✅ postcss.config.js atualizado"

# ---------- 4. Normalize globals.css files (set Tailwind directives) ----------
$cssFiles = Get-ChildItem -Path $ProjectPath -Recurse -Include "globals.css" -ErrorAction SilentlyContinue
if ($cssFiles.Count -eq 0) { Log "ℹ Nenhum globals.css encontrado." }
foreach ($css in $cssFiles) {
    $cssPath = $css.FullName
    $tailwindCss = "@tailwind base;`n@tailwind components;`n@tailwind utilities;"
    Set-Content -Path $cssPath -Value $tailwindCss -Encoding UTF8
    Log "✅ Ajustado: $cssPath"
}

# ---------- 5. Clean node_modules & locks ----------
Log "🔄 Removendo node_modules e lock files (se existirem)..."
Remove-Item -Recurse -Force (Join-Path $ProjectPath "node_modules") -ErrorAction SilentlyContinue
Remove-Item -Force (Join-Path $ProjectPath "package-lock.json") -ErrorAction SilentlyContinue
Remove-Item -Force (Join-Path $ProjectPath "yarn.lock") -ErrorAction SilentlyContinue
Log "✅ Limpeza local concluída"

# ---------- 6. Install dependencies ----------
Log "🔧 Instalando dependências (npm install). Isto pode levar alguns minutos..."
$installOk = $true
try {
    npm install 2>&1 | Tee-Object -FilePath $logFile -Append
} catch {
    Log "❌ npm install falhou: $_"
    $installOk = $false
}
if (-not $installOk) { Log "❌ Abortar: dependências não instaladas"; exit 1 }

# ---------- 7. Optional: ensure @tailwindcss/postcss present ----------
# (install if missing)
$hasTailwindPostcss = (npm list @tailwindcss/postcss --depth=0 2>$null | Out-String) -match "@tailwindcss/postcss"
if (-not $hasTailwindPostcss) {
    Log "⚡ Instalando @tailwindcss/postcss..."
    npm install -D @tailwindcss/postcss 2>&1 | Tee-Object -FilePath $logFile -Append
} else { Log "✅ @tailwindcss/postcss ok" }

# ---------- 8. Run build ----------
Log "🏗 Rodando build: npm run build ..."
$buildExit = $null
try {
    npm run build 2>&1 | Tee-Object -FilePath $logFile -Append | ForEach-Object { $_ }
    $buildExit = $LASTEXITCODE
} catch {
    Log "❌ Erro durante build: $_"
    $buildExit = 1
}

if ($buildExit -ne 0) {
    Log "❌ Build falhou. Verifique $logFile para detalhes."
    # continue to send report anyway
} else {
    Log "✅ Build finalizado com sucesso."
}

# ---------- 9. Deploy via Vercel CLI (se estiver logado) ----------
Log "🚀 Deploy: vercel --prod (executando)..."
$vercelOut = & vercel --prod 2>&1 | Tee-Object -FilePath $logFile -Append
# tente extrair a URL de Production
$prodUrl = $null
foreach ($line in $vercelOut) {
    if ($line -match "Production:\s*(https?://\S+)") {
        $prodUrl = $Matches[1]
    }
}
if (-not $prodUrl) {
    # tentativa alternativa: procurar "https://" na saída
    $maybe = ($vercelOut | Select-String -Pattern "https?://\S+" -AllMatches).Matches.Value | Select-Object -First 1
    if ($maybe) { $prodUrl = $maybe }
}
if ($prodUrl) { Log "✅ Deploy publicado em: $prodUrl" } else { Log "⚠ Não foi possível extrair URL de produção do vercel output." }

# ---------- 10. Health-checks (production + www domain) ----------
$checks = @()
if ($prodUrl) {
    try {
        $r = Invoke-WebRequest -Uri $prodUrl -UseBasicParsing -TimeoutSec 20 -ErrorAction Stop
        $checks += @{ url = $prodUrl; status = $r.StatusCode; ok = $true }
        Log "🔎 Health check OK para $prodUrl (HTTP $($r.StatusCode))"
    } catch {
        $checks += @{ url = $prodUrl; status = $_.Exception.Message; ok = $false }
        Log "⚠ Health check FALHOU para ${prodUrl}: $($_.Exception.Message)"
    }
}

# check custom domain www.pecuariatech.com
$custom = "https://www.pecuariatech.com"
try {
    $r2 = Invoke-WebRequest -Uri $custom -UseBasicParsing -TimeoutSec 20 -ErrorAction Stop
    $checks += @{ url = $custom; status = $r2.StatusCode; ok = $true }
    Log "🔎 Health check OK para $custom (HTTP $($r2.StatusCode))"
} catch {
    $checks += @{ url = $custom; status = $_.Exception.Message; ok = $false }
    Log "⚠ Health check FALHOU para ${prodUrl}: $($_.Exception.Message)"
}

# ---------- 11. Prepare message summary ----------
$summary = @()
$summary += "PecuariaTech - Deploy Report: $timestamp"
if ($prodUrl) { $summary += "Production URL: $prodUrl" } else { $summary += "Production URL: (não detectada)" }
foreach ($c in $checks) {
    $ok = if ($c.ok) { "OK" } else { "FALHOU" }
    $summary += "$($c.url) -> $ok ($($c.status))"
}
if ($buildExit -ne 0) {
    $summary += "Build: FALHOU (ver logs em $logFile)"
} else {
    $summary += "Build: OK"
}

$summaryText = $summary -join "`n"

# ---------- 12. Send Telegram message if configured ----------
$tgToken = $env:TELEGRAM_BOT_TOKEN
$tgChat = $env:TELEGRAM_CHAT_ID
if ($tgToken -and $tgChat) {
    try {
        $payload = @{ chat_id = $tgChat; text = $summaryText } | ConvertTo-Json
        $tgUrl = "https://api.telegram.org/bot$tgToken/sendMessage"
        Invoke-RestMethod -Uri $tgUrl -Method Post -Body $payload -ContentType "application/json" -ErrorAction Stop
        Log "📨 Relatório enviado por Telegram para chat_id $tgChat"
    } catch {
        Log "⚠ Falha ao enviar Telegram: $_"
    }
} else {
    Log "ℹ Telegram não configurado (defina TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID para ativar)"
}

# ---------- 13. Send WhatsApp via Twilio if configured ----------
$twSid = $env:TWILIO_SID
$twToken = $env:TWILIO_TOKEN
$twFrom = $env:TWILIO_WHATSAPP_FROM
$twTo = $env:WHATSAPP_TO
if ($twSid -and $twToken -and $twFrom -and $twTo) {
    try {
        $twUrl = "https://api.twilio.com/2010-04-01/Accounts/$twSid/Messages.json"
        $body = @{ From = $twFrom; To = $twTo; Body = $summaryText }
        $bytes = Invoke-RestMethod -Uri $twUrl -Method Post -Body $body -Credential (New-Object System.Management.Automation.PSCredential($twSid,(ConvertTo-SecureString $twToken -AsPlainText -Force))) -ErrorAction Stop
        Log "📲 Relatório enviado via Twilio WhatsApp para $twTo"
    } catch {
        Log "⚠ Falha ao enviar WhatsApp (Twilio): $_"
    }
} else {
    Log "ℹ Twilio/WhatsApp não configurado (defina TWILIO_SID/TWILIO_TOKEN/TWILIO_WHATSAPP_FROM/WHATSAPP_TO para ativar)"
}

# ---------- 14. Final ----------
Log "🧬 ULTRABIOLOGICO FULL-AUTOMATIC CONCLUIDO. Log salvo em $logFile"







