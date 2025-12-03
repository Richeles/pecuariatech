Write-Host "🌐 Iniciando Tri360 Remote — sincronização com Supabase..." -ForegroundColor Cyan

# === CONFIGURAÇÃO BASE ===
$DB_URL = "db.kpzzekflqpoeccnqfkng.supabase.co"
$LOG_FILE = "C:\Users\Administrador\pecuariatech\tri360_secure_log.txt"
$PSQL_PATH = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

# === CARREGAR SENHA CRIPTOGRAFADA ===
$senhaArquivo = "$env:APPDATA\supabase_cred.key"
if (-not (Test-Path $senhaArquivo)) {
    Write-Host "⚠️ Senha não encontrada — executando Tri360-Adaptive..." -ForegroundColor Yellow
    & "C:\Users\Administrador\pecuariatech\instalar-reparar-supabase-tri360-adaptive.ps1"
}
$senha = Get-Content $senhaArquivo | ConvertTo-SecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($senha)
$senhaPura = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
$senhaCodificada = [uri]::EscapeDataString($senhaPura)

# === TESTE DE CONEXÃO ===
Write-Host "🔌 Testando conexão com Supabase..."
$connectionString = "postgresql://postgres:$senhaCodificada@$DB_URL:5432/postgres"
try {
    $check = & $PSQL_PATH $connectionString -c "SELECT current_database();" 2>&1
    if ($check -match "postgres") {
        Write-Host "✅ Conexão Supabase OK."
    } else {
        throw "Falha de conexão detectada."
    }
}
catch {
    Write-Host "❌ Conexão falhou — acionando Tri360-Adaptive..." -ForegroundColor Red
    & "C:\Users\Administrador\pecuariatech\instalar-reparar-supabase-tri360-adaptive.ps1"
}

# === COLETA DE DADOS DO LOG LOCAL ===
if (-not (Test-Path $LOG_FILE)) {
    Write-Host "🧾 Log local ausente — criando novo..."
    New-Item -Path $LOG_FILE -ItemType File -Force | Out-Null
}
$hash = (Get-FileHash $LOG_FILE -Algorithm SHA256).Hash
$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$mensagem = "Boot Tri360-Remote executado em $timestamp"

# === INSERÇÃO NO SUPABASE ===
Write-Host "📤 Enviando log de inicialização ao Supabase..."
$sql = @"
insert into public.logs_reparo (data_execucao, arquivos_verificados, arquivos_corrigidos, arquivos_padronizados, mensagem, sucesso)
values (now(), 0, 0, 0, 'Boot Tri360 Remote | Hash: $hash', true);
"@

try {
    & $PSQL_PATH $connectionString -c $sql | Out-Null
    Write-Host "✅ Log remoto inserido com sucesso na tabela logs_reparo." -ForegroundColor Green
}
catch {
    Write-Host "❌ Falha ao inserir log remoto no Supabase." -ForegroundColor Red
}

# === FINALIZAÇÃO ===
Add-Content $LOG_FILE "[$timestamp] Sincronização Tri360 Remote concluída. Hash: $hash"
Write-Host "📁 Log atualizado: $LOG_FILE" -ForegroundColor Yellow
Write-Host "🔺 Sistema Triangular 360° Remote — Sincronização completa." -ForegroundColor Cyan
