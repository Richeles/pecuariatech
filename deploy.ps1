# ================================================
# DEPLOY PECUARIATECH + ALERTA WHATSAPP (CORRIGIDO)
# ================================================

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "$timestamp [START] Iniciando deploy PecuariaTech..." -ForegroundColor Cyan

# --- Etapa 1: Deploy para Vercel ---
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "$timestamp [OK] Deploy concluído com sucesso!" -ForegroundColor Green

    # --- Etapa 2: Envio de Alerta via WhatsApp ---
    $numero = "5567999564560"  # Número do Richeles
    $mensagem = "🚀 Deploy PecuariaTech concluído com sucesso em $timestamp!"
    $url = "https://wa.me/$numero?text=" + [uri]::EscapeDataString($mensagem)

    Write-Host "Abrindo WhatsApp..." -ForegroundColor Yellow
    Start-Process $url
}
else {
    Write-Host "$timestamp [ERRO] Falha no deploy da PecuariaTech!" -ForegroundColor Red
}
