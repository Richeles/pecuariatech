<#
  apply_pecuariatech_final.ps1
  Script automático "ALL" para aplicar schema, APIs, planos e deploy do PecuariaTech
#>

# ---------------------------
# CONFIGURAÇÃO INICIAL
# ---------------------------
$ProjectPath = "C:\Users\Administrador\pecuariatech"
$LogDir = Join-Path $ProjectPath "scripts\logs"
$LogFile = Join-Path $LogDir ("apply_pecuariatech_" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".log")

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

function Log($level, $message) {
    $time = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $line = "[$time] [$level] $message"
    $line | Out-File -FilePath $LogFile -Append -Encoding utf8
    if ($level -eq "ERROR") { Write-Host $line -ForegroundColor Red }
    elseif ($level -eq "WARN") { Write-Host $line -ForegroundColor Yellow }
    else { Write-Host $line -ForegroundColor Cyan }
}

Log "INFO" "Iniciando apply_pecuariatech (ALL) - projeto: $ProjectPath"

# ---------------------------
# Validar caminho do projeto
# ---------------------------
if (-not (Test-Path $ProjectPath)) {
    Log "ERROR" "Diretório do projeto não encontrado: $ProjectPath - abortando."
    exit 1
}
Set-Location $ProjectPath

# ---------------------------
# Carregar .env.local (se existir)
# ---------------------------
$envFile = Join-Path $ProjectPath ".env.local"
if (Test-Path $envFile) {
    Log "INFO" "Carregando variáveis de ${envFile}"
    try {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match "^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$") {
                $name = $matches[1]
                $value = $matches[2].Trim('"')
                [System.Environment]::SetEnvironmentVariable($name, $value)
            }
        }
        Log "OK" ".env.local carregado."
    } catch {
        $msg = $_.Exception.Message
        Log "WARN" "Falha ao ler ${envFile}: $msg"
    }
} else {
    Log "WARN" ".env.local não encontrado. Usando variáveis de ambiente já definidas."
}

# ---------------------------
# Ler variáveis essenciais
# ---------------------------
$sbUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$sbAnon = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
$sbSvc  = $env:SUPABASE_SERVICE_ROLE_KEY
$openaiKey = $env:OPENAI_API_KEY
$vercelUrl = $env:NEXT_PUBLIC_VERCEL_URL

function MaskKey($k) {
    if (-not $k) { return "<MISSING>" }
    if ($k.Length -le 10) { return $k }
    return $k.Substring(0,6) + "..." + $k.Substring($k.Length-4)
}

Log "INFO" "NEXT_PUBLIC_SUPABASE_URL = $sbUrl"
Log "INFO" "NEXT_PUBLIC_SUPABASE_ANON_KEY = $(MaskKey $sbAnon)"
Log "INFO" "SUPABASE_SERVICE_ROLE_KEY = $(if ($sbSvc) { MaskKey $sbSvc } else { '<MISSING>' })"
Log "INFO" "NEXT_PUBLIC_VERCEL_URL = $vercelUrl"

if (-not $sbUrl -or -not $sbSvc) {
    Log "ERROR" "Supabase URL ou Service Role Key ausente. Defina no .env.local ou variáveis de ambiente e reexecute."
    exit 1
}

# ---------------------------
# Verificar ferramentas
# ---------------------------
$tools = @("supabase","git","vercel","node","npm")
foreach ($t in $tools) {
    $cmd = Get-Command $t -ErrorAction SilentlyContinue
    if ($cmd) { Log "OK" "Ferramenta encontrada: $t -> $($cmd.Source)" }
    else { Log "WARN" "Ferramenta NÃO encontrada no PATH: $t" }
}

# ---------------------------
# Gerar SQL unificado
# ---------------------------
$sqlPath = Join-Path $ProjectPath "sql\apply_pecuariatech.sql"
if (-not (Test-Path (Split-Path $sqlPath -Parent))) { New-Item -ItemType Directory -Path (Split-Path $sqlPath -Parent) -Force | Out-Null }

$sql = @"
-- apply_pecuariatech.sql
-- Tabelas e funções principais do projeto

CREATE TABLE IF NOT EXISTS public.racas (id bigserial primary key, raca text, clima_ideal text, ganho_peso_dia numeric, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.rebanho (id bigserial primary key, nome text, raca text, peso_kg numeric, data_nascimento date, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.pastagem (id bigserial primary key, nome text, area_ha numeric, tipo_pasto text, qualidade text, latitude numeric, longitude numeric, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.planos (id bigserial primary key, nome text NOT NULL, valor numeric NOT NULL, periodicidade text NOT NULL, ativo boolean default true, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.admin_users (id bigserial primary key, email text unique, password_hash text, is_owner boolean default false, created_at timestamptz default now());

CREATE OR REPLACE FUNCTION public.create_admin_user(p_email text, p_password text, p_is_owner boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql AS \$\$
BEGIN
  INSERT INTO public.admin_users (email, password_hash, is_owner, created_at)
  VALUES (p_email, crypt(p_password, gen_salt('bf')), p_is_owner, now())
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_owner = EXCLUDED.is_owner;
END;
\$\$;
"@

$sql | Out-File -FilePath $sqlPath -Encoding utf8 -Force
Log "OK" "SQL gerado: $sqlPath"

# ---------------------------
# Aplicar SQL
# ---------------------------
try {
    & supabase db query --file $sqlPath 2>&1 | ForEach-Object { $_; $_ | Out-File -FilePath $LogFile -Append -Encoding utf8 }
    if ($LASTEXITCODE -eq 0) { Log "OK" "SQL aplicado com sucesso." }
    else { Log "ERROR" "Falha ao aplicar SQL via supabase CLI. Código: $LASTEXITCODE" }
} catch { Log "ERROR" "Exceção ao aplicar SQL: $($_.Exception.Message)" }

# ---------------------------
# Criar owner automaticamente
# ---------------------------
$ownerEmail = "pecuariatech.br@gmail.com"
$ownerPassword = "UltraPecuaria123!"

try {
    & supabase db query --sql "SELECT public.create_admin_user('$ownerEmail','$ownerPassword', true);" 2>&1 | ForEach-Object { $_; $_ | Out-File -FilePath $LogFile -Append -Encoding utf8 }
    Log "OK" "Owner criado: $ownerEmail / $ownerPassword"
} catch { Log "ERROR" "Falha ao criar owner: $($_.Exception.Message)" }

# ---------------------------
# Final
# ---------------------------
Log "INFO" "apply_pecuariatech: execução concluída."
Write-Host "Owner criado: $ownerEmail / $ownerPassword"
Write-Host "Verifique logs em: $LogFile"
