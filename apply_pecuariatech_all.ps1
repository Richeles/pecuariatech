<#
  apply_pecuariatech_all.ps1
  ALL-in-one: cria migrations, aplica via supabase db push, cria owner & planos, gera APIs, git push e deploy Vercel.
  Local esperado: C:\Users\Administrador\pecuariatech
#>

# ---------------------------
# CONFIGURAÇÃO INICIAL
# ---------------------------
$ProjectPath = "C:\Users\Administrador\pecuariatech"
$LogDir     = Join-Path $ProjectPath "scripts\logs"
$Timestamp  = (Get-Date).ToString("yyyyMMdd_HHmmss")
$LogFile    = Join-Path $LogDir ("apply_pecuariatech_" + $Timestamp + ".log")

if (-not (Test-Path $ProjectPath)) {
    Write-Host "ERRO: Diretório do projeto não encontrado: $ProjectPath" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

function Log($level, $message) {
    $time = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $line = "[$time] [$level] $message"
    Add-Content -Path $LogFile -Value $line -Encoding utf8
    if ($level -eq "ERROR") { Write-Host $line -ForegroundColor Red }
    elseif ($level -eq "WARN") { Write-Host $line -ForegroundColor Yellow }
    else { Write-Host $line -ForegroundColor Cyan }
}

function MaskKey($k) {
    if (-not $k) { return "<MISSING>" }
    if ($k.Length -le 10) { return $k }
    return $k.Substring(0,6) + "..." + $k.Substring($k.Length-4)
}

Set-Location $ProjectPath
Log "INFO" "Iniciando apply_pecuariatech_all - projeto: $ProjectPath"

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
                $value = $matches[2].Trim()
                if ($value.StartsWith('"') -and $value.EndsWith('"')) { $value = $value.Substring(1,$value.Length-2) }
                elseif ($value.StartsWith("'") -and $value.EndsWith("'")) { $value = $value.Substring(1,$value.Length-2) }
                [System.Environment]::SetEnvironmentVariable($name, $value)
            }
        }
        Log "OK" ".env.local carregado."
    } catch {
        $msg = $_.Exception.Message
        Log "WARN" "Falha ao ler ${envFile}: $msg"
    }
} else {
    Log "WARN" ".env.local não encontrado. Usando variáveis de ambiente do sistema."
}

# ---------------------------
# Ler variáveis essenciais (da .env.local carregada ou do ambiente)
# ---------------------------
$sbUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$sbAnon = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
$sbSvc  = $env:SUPABASE_SERVICE_ROLE_KEY
$vercelUrl = $env:NEXT_PUBLIC_VERCEL_URL

Log "INFO" "NEXT_PUBLIC_SUPABASE_URL = $sbUrl"
Log "INFO" "NEXT_PUBLIC_SUPABASE_ANON_KEY = $(MaskKey $sbAnon)"
Log "INFO" "SUPABASE_SERVICE_ROLE_KEY = $(if ($sbSvc) { MaskKey $sbSvc } else { '<MISSING>' })"
Log "INFO" "NEXT_PUBLIC_VERCEL_URL = $vercelUrl"

if (-not $sbUrl -or -not $sbSvc) {
    Log "ERROR" "Supabase URL ou Service Role Key ausente. Defina no .env.local ou variáveis de ambiente."
    exit 1
}

# ---------------------------
# Verificar ferramentas no PATH
# ---------------------------
$tools = @("supabase","git","vercel","node","npm")
foreach ($t in $tools) {
    $cmd = Get-Command $t -ErrorAction SilentlyContinue
    if ($cmd) { Log "OK" "Ferramenta encontrada: $t -> $($cmd.Source)" }
    else { Log "WARN" "Ferramenta NÃO encontrada no PATH: $t" }
}

# ---------------------------
# Preparar migrations + SQL inicial (owner + planos incluídos)
# ---------------------------
$migrationsDir = Join-Path $ProjectPath "supabase_migrations"
if (-not (Test-Path $migrationsDir)) { New-Item -ItemType Directory -Path $migrationsDir -Force | Out-Null }

# owner credentials (padrão; você pode alterar no .env.local se preferir)
$ownerEmailDefault = "pecuariatech.br@gmail.com"
$ownerPassDefault  = "UltraPecuaria123!"

# Carrega overrides do .env.local (se definidos)
if ($env:OWNER_EMAIL) { $ownerEmail = $env:OWNER_EMAIL } else { $ownerEmail = $ownerEmailDefault }
if ($env:OWNER_PASS)  { $ownerPassword = $env:OWNER_PASS } else { $ownerPassword = $ownerPassDefault }

Log "INFO" "Owner will be created: $ownerEmail (senha mascarada: $(MaskKey $ownerPassword))"

# SQL template como here-string sem expansão (usar placeholders)
$sqlTemplate = @'
-- 0001_init.sql - schema + owner + planos
CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS public.admin_users (
  id bigserial primary key,
  email text UNIQUE,
  password_hash text,
  is_owner boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.owner_settings (
  id bigserial primary key,
  key text,
  value jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.planos (
  id bigserial primary key,
  nome text NOT NULL,
  valor numeric NOT NULL,
  periodicidade text NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.create_admin_user(p_email text, p_password text, p_is_owner boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.admin_users (email, password_hash, is_owner, created_at)
  VALUES (p_email, crypt(p_password, gen_salt('bf')), p_is_owner, now())
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_owner = EXCLUDED.is_owner;
END;
$$;

-- Create owner via function call (will be idempotent)
SELECT public.create_admin_user('__OWNER_EMAIL__', '__OWNER_PASS__', true);

-- Insert default planos (idempotent)
INSERT INTO public.planos (nome, valor, periodicidade, ativo, created_at) VALUES
  ('Mensal', 57.00, 'mensal', true, now()),
  ('Trimestral', 150.00, 'trimestral', true, now()),
  ('Anual', 547.20, 'anual', true, now())
ON CONFLICT (nome) DO NOTHING;

-- End of migration
'@

# substitute placeholders safely
$sqlContent = $sqlTemplate -replace "__OWNER_EMAIL__", ($ownerEmail -replace "'","''") -replace "__OWNER_PASS__", ($ownerPassword -replace "'","''")

$migFile = Join-Path $migrationsDir "0001_init.sql"
$sqlContent | Out-File -FilePath $migFile -Encoding utf8 -Force
Log "OK" "Migration gerada: $migFile"

# ---------------------------
# Aplicar migrations: supabase db push
# ---------------------------
try {
    Log "INFO" "Executando: supabase db push --yes"
    $pushOutput = & supabase db push --yes 2>&1
    $pushOutput | ForEach-Object { $_; $_ | Out-File -FilePath $LogFile -Append -Encoding utf8 }
    if ($LASTEXITCODE -eq 0) { Log "OK" "supabase db push finalizado (migrations aplicadas ou já atualizadas)." }
    else { Log "WARN" "supabase db push terminou com código $LASTEXITCODE. Veja $LogFile" }
} catch {
    $msg = $_.Exception.Message
    Log "ERROR" "Falha ao executar supabase db push: $msg"
}

# ---------------------------
# Criar APIs Next.js (server-side) - app directory (Next 13+)
# ---------------------------
$apiPlanosDir = Join-Path $ProjectPath "app\api\planos"
$apiOwnerDir  = Join-Path $ProjectPath "app\api\owner"
if (-not (Test-Path $apiPlanosDir)) { New-Item -ItemType Directory -Path $apiPlanosDir -Force | Out-Null }
if (-not (Test-Path $apiOwnerDir))  { New-Item -ItemType Directory -Path $apiOwnerDir -Force  | Out-Null }

$planosRoute = @"
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  try {
    const { data, error } = await supabase.from('planos').select('*').eq('ativo', true).order('valor', { ascending: true });
    if (error) return NextResponse.json({ ok:false, error: error.message }, { status:500 });
    return NextResponse.json({ ok:true, planos: data });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status:500 });
  }
}
"@
$planosRoutePath = Join-Path $apiPlanosDir "route.ts"
$planosRoute | Out-File -FilePath $planosRoutePath -Encoding utf8 -Force
Log "OK" "Criada API: app/api/planos/route.ts"

$ownerRoute = @"
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = String(body.password || '');
    if (!password) return NextResponse.json({ ok:false, error: 'password required' }, { status:400 });

    const { data, error } = await supabase.rpc('owner_unlock', { p_password: password });
    if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 403 });
    return NextResponse.json({ ok:true, settings: data });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status:500 });
  }
}
"@
$ownerRoutePath = Join-Path $apiOwnerDir "route.ts"
$ownerRoute | Out-File -FilePath $ownerRoutePath -Encoding utf8 -Force
Log "OK" "Criada API: app/api/owner/route.ts"

# ---------------------------
# Git commit + push
# ---------------------------
try {
    & git add .
    $commitOut = & git commit -m "chore: apply_pecuariatech_all - schema, owner, planos, APIs" 2>&1 | Out-String
    $commitOut | Out-File -FilePath $LogFile -Append -Encoding utf8
    if ($commitOut -match "nothing to commit") {
        Log "INFO" "Nada para commitar."
    } else {
        & git push origin main 2>&1 | ForEach-Object { $_; $_ | Out-File -FilePath $LogFile -Append -Encoding utf8 }
        Log "OK" "Alterações commitadas e enviadas ao origin/main"
    }
} catch {
    $msg = $_.Exception.Message
    Log "WARN" "Git commit/push apresentou problema: $msg"
}

# ---------------------------
# Deploy Vercel (forçar prod)
# ---------------------------
try {
    if (Get-Command vercel -ErrorAction SilentlyContinue) {
        Log "INFO" "Iniciando deploy Vercel (produção, --force)"
        & vercel --prod --force 2>&1 | ForEach-Object { $_; $_ | Out-File -FilePath $LogFile -Append -Encoding utf8 }
        Log "OK" "Deploy Vercel solicitado"
    } else {
        Log "WARN" "Vercel CLI não encontrada - pule o deploy."
    }
} catch {
    $msg = $_.Exception.Message
    Log "WARN" "Falha ao chamar Vercel CLI: $msg"
}

# ---------------------------
# Final
# ---------------------------
Log "INFO" "apply_pecuariatech_all: execução finalizada. Verifique logs em: $LogFile"
Write-Host ""
Write-Host "Resumo final:"
Write-Host " - Migration aplicada: $migFile"
Write-Host " - Owner criado (email) : $ownerEmail (senha mascarada no log)."
Write-Host " - APIs criadas: /api/planos , /api/owner"
Write-Host " - Logs em: $LogFile"
Write-Host ""
