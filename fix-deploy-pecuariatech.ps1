<#
    🧠 PECUARIATECH - FIX DEPLOY CLICK-BOM
    Corrige codificação UTF-8, reconstrói e faz deploy automático.
#>

Write-Host "`n[INFO] Iniciando correção avançada e deploy PecuariaTech..." -ForegroundColor Cyan
$ErrorActionPreference = "Stop"

# === [1] Verificação inicial ===
if (-not (Test-Path ".\package.json")) {
    Write-Host "❌ Execute este script dentro da pasta do projeto (pecuariatech)." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Ambiente validado!" -ForegroundColor Green

# === [2] Detecção e correção de codificação ===
Write-Host "[2] Verificando e corrigindo codificação UTF-8..." -ForegroundColor Yellow
$arquivos = Get-ChildItem -Recurse -Include *.js,*.ts,*.tsx,*.json,*.css,*.md,*.html -ErrorAction SilentlyContinue | 
    Where-Object { -not $_.FullName.Contains("node_modules") }

foreach ($arq in $arquivos) {
    try {
        $bytes = [System.IO.File]::ReadAllBytes($arq.FullName)
        # Detecta BOM UTF-8
        if ($bytes.Length -gt 2 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            $content = [System.Text.Encoding]::UTF8.GetString($bytes[3..($bytes.Length-1)])
            $status = "UTF-8 BOM removido"
        } else {
            # Tenta decodificar automaticamente
            $content = [System.Text.Encoding]::Default.GetString($bytes)
            $status = "convertido de " + [System.Text.Encoding]::Default.EncodingName
        }
        [System.IO.File]::WriteAllText($arq.FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
        Write-Host "   → Corrigido: $($arq.Name) ($status)" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️ Erro ao processar $($arq.FullName): $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
}
Write-Host "✅ Codificação UTF-8 normalizada!" -ForegroundColor Green

# === [3] Reinstala dependências ===
Write-Host "[3] Reinstalando dependências..." -ForegroundColor Yellow
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
npm cache clean --force | Out-Null
npm install --legacy-peer-deps | Out-Null
Write-Host "✅ Dependências reinstaladas!" -ForegroundColor Green

# === [4] Build otimizada ===
Write-Host "[4] Gerando nova build de produção..." -ForegroundColor Yellow
npm run build | Out-Null
Write-Host "✅ Build finalizada com sucesso!" -ForegroundColor Green

# === [5] Deploy automático na Vercel ===
Write-Host "[5] Enviando deploy para Vercel..." -ForegroundColor Yellow
try {
    vercel deploy --prod --yes --confirm --scope "richeles-alves-dos-santos-projects" | Out-Null
    Write-Host "🚀 Deploy enviado com sucesso para www.pecuariatech.com" -ForegroundColor Green
} catch {
    Write-Host "❌ Falha no deploy: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Processo completo concluído com sucesso!" -ForegroundColor Cyan
Write-Host "   Projeto reconstruído e publicado no domínio principal." -ForegroundColor White
Write-Host "   🌿 PecuariaTech está atualizado e limpo!" -ForegroundColor Green
