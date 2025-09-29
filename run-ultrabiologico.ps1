param (
    [string]$EnvPath = ".\scripts\.env.local"
)

Write-Host "🚀 Iniciando execução forçada dos módulos ultrabiológicos..." -ForegroundColor Cyan

# 1. Garante que o .env existe
if (-Not (Test-Path $EnvPath)) {
    @"
NEXT_PUBLIC_SUPABASE_URL=https://kpzzekflqpoeccnqfkng.supabase.co
SUPABASE_SERVICE_ROLE_KEY=COLE_SUA_CHAVE_SERVICE      # <-- Substitua pela chave Service Role real
SUPABASE_ANON_KEY=COLE_SUA_CHAVE_ANON                # <-- Substitua pela chave Anon real
TELEGRAM_BOT_TOKEN=COLE_SEU_TOKEN_TELEGRAM           # <-- Substitua pelo token real do bot
TELEGRAM_CHAT_ID=COLE_SEU_CHAT_ID                    # <-- Substitua pelo chat ID real
WHATSAPP_API_URL=COLE_SUA_URL_WHATSAPP               # <-- Substitua pelo endpoint real da API
WHATSAPP_API_TOKEN=COLE_SEU_TOKEN_WHATSAPP           # <-- Substitua pelo token real da API
"@ | Out-File -Encoding utf8 $EnvPath

    Write-Host "✅ .env.local criado em $EnvPath" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .env.local já existe em $EnvPath" -ForegroundColor Yellow
}

# 2. Executa o pipeline TS
Write-Host "▶️ Executando scripts\ultrabiologico.ts..." -ForegroundColor Cyan
npx ts-node .\scripts\ultrabiologico.ts

# 3. Finaliza
Write-Host "🏁 Execução concluída." -ForegroundColor Green
