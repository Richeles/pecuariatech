# encoding: UTF-8
Clear-Host
Write-Host "==============================================="
Write-Host " Iniciando UltraChat + UltraBiológico Planos v4"
Write-Host "==============================================="

# Funções utilitárias
function Write-Info($msg)  { Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Write-Ok($msg)    { Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-Warn($msg)  { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-ErrorMsg($msg) { Write-Host "[ERRO]  $msg" -ForegroundColor Red }

# 1. Autenticação simples
$senhaCorreta = "36@Artropodes"
$tentativa = Read-Host "Digite a senha para continuar"
if ($tentativa -ne $senhaCorreta) {
    Write-ErrorMsg "Senha incorreta. Execução abortada."
    exit
}
Write-Ok "Senha validada com sucesso."

# 2. Verifica o .env.local
$envFile = ".env.local"
if (Test-Path $envFile) {
    try {
        $linhas = Get-Content $envFile -Encoding UTF8 | Where-Object { $_ -match "=" }
        Write-Ok "Variáveis de ambiente detectadas:"
        $linhas | ForEach-Object { Write-Host " - $_" }
    } catch {
        Write-Warn "Falha ao ler o arquivo .env.local: $($_.Exception.Message)"
    }
} else {
    Write-Warn ".env.local não encontrado. Continuando assim mesmo."
}

# 3. Operações principais simuladas
try {
    Write-Info "Inicializando conexão com Supabase..."
    Start-Sleep -Seconds 2
    Write-Ok "Supabase conectado com sucesso."

    Write-Info "Sincronizando planos UltraChat e UltraBiológico..."
    Start-Sleep -Seconds 3
    Write-Ok "Planos sincronizados com sucesso."

    Write-Info "Atualizando variáveis globais..."
    Start-Sleep -Seconds 2
    Write-Ok "Atualização concluída."

    Write-Info "Verificando status da nuvem..."
    Start-Sleep -Seconds 1
    Write-Ok "Tudo operacional."

} catch {
    Write-ErrorMsg "Erro durante a execução principal: $($_.Exception.Message)"
    exit
}

# 4. Conclusão
Write-Host ""
Write-Host "==============================================="
Write-Host " Execução concluída com sucesso."
Write-Host "==============================================="
