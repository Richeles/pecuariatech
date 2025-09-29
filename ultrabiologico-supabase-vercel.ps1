# ultrabiologico-supabase-vercel.ps1
# Script único para automatizar ambiente PecuariaTech (Supabase + Vercel + Domínio)

# ===== CONFIGURAÇÕES INICIAIS =====
$ProjectName = "pecuariatech"
$ProjectPath = "C:\Users\Administrador\$ProjectName"
$EnvFile = "$ProjectPath\.env.local"
$LogFile = "$ProjectPath\ultrabiologico-local.log"

# ===== CRIAR PASTA DO PROJETO =====
Write-Host "[INFO] Criando pasta do projeto..." -ForegroundColor Cyan
if (-Not (Test-Path $ProjectPath)) {
    New-Item -ItemType Directory -Path $ProjectPath | Out-Null
}

# ===== INICIALIZAR LOG =====
"==== Início da execução: $(Get-Date) ====" | Out-File -FilePath $LogFile -Encoding utf8

# ===== VERIFICAR NODE/NPM =====
Write-Host "[INFO] Verificando Node.js e npm..." -ForegroundColor Yellow
try {
    node -v | Out-File -Append $LogFile
    npm -v | Out-File -Append $LogFile
} catch {
    Write-Host "[ERRO] Node.js não encontrado. Instale manualmente em https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# ===== INSTALAR DEPENDÊNCIAS =====
Write-Host "[INFO] Instalando dependências globais..." -ForegroundColor Cyan
npm install -g vercel supabase | Out-File -Append $LogFile

# ===== LOGIN VERCEL =====
Write-Host "[LOGIN] Fazendo login no Vercel..." -ForegroundColor Green
vercel login | Out-File -Append $LogFile

# ===== LOGIN SUPABASE =====
Write-Host "[LOGIN] Fazendo login no Supabase..." -ForegroundColor Green
supabase login | Out-File -Append $LogFile

# ===== CRIAR PROJETO NEXT.JS =====
if (-Not (Test-Path "$ProjectPath\next.config.js")) {
    Write-Host "[INFO] Criando app Next.js..." -ForegroundColor Cyan
    npx create-next-app@latest $ProjectPath --typescript --eslint --use-npm | Out-File -Append $LogFile
}

# ===== CONFIGURAR VARIÁVEIS SUPABASE =====
Write-Host "[INFO] Configurando variáveis do Supabase..." -ForegroundColor Yellow
if (-Not (Test-Path $EnvFile)) {
@"
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=chave_anon_publica
SUPABASE_SERVICE_ROLE_KEY=chave_service_role
"@ | Out-File -FilePath $EnvFile -Encoding utf8
}

# ===== DEPLOY VERCEL =====
Write-Host "[DEPLOY] Fazendo deploy no Vercel..." -ForegroundColor Green
cd $ProjectPath
vercel --prod --yes | Out-File -Append $LogFile

# ===== FINAL =====
Write-Host "[SUCESSO] Deploy concluído! Verifique seu projeto online." -ForegroundColor Green
"==== Fim da execução: $(Get-Date) ====" | Out-File -Append $LogFile
