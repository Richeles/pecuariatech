<#
  apply_pecuariatech_fixed.ps1
  Script automático "ALL" atualizado para aplicar schema, criar owner, planos e APIs do PecuariaTech.
#>

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

Log "INFO" "Iniciando apply_pecuariatech (FIXED) - projeto: $ProjectPath"

if (-not (Test-Path $ProjectPath)) {
    Log "ERROR" "Diretório do projeto não encontrado."
    exit 1
}
Set-Location $ProjectPath

$envFile = Join-Path $ProjectPath ".env.local"
if (Test-Path $envFile) {
    Log "INFO" "Carregando variáveis de $envFile"
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
        Log "WARN" ("Falha ao ler $envFile: " + $_.Exception.Message)
    }
} else { Log "WARN" ".env.local não encontrado." }

$sbUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$sbSvc = $env:SUPABASE_SERVICE_ROLE_KEY
$ownerEmail = "pecuariatech.br@gmail.com"
$ownerPassword = "UltraPecuaria123!"

if (-not $sbUrl -or -not $sbSvc) { Log "ERROR" "Supabase URL ou Service Role Key ausente."; exit 1 }

$sqlDir = Join-Path $ProjectPath "sql"
if (-not (Test-Path $sqlDir)) { New-Item -ItemType Directory -Path $sqlDir -Force | Out-Null }
$sqlPath = Join-Path $sqlDir "apply_pecuariatech.sql"

$sql = @"
-- SQL PecuariaTech (owner + planos + tabelas)
CREATE TABLE IF NOT EXISTS public.chat_messages (id bigserial primary key, role text, text text, meta jsonb, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.racas (id bigserial primary key, raca text, clima_ideal text, ganho_peso_dia numeric, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.rebanho (id bigserial primary key, nome text, raca text, peso_kg numeric, data_nascimento date, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.pastagem (id bigserial primary key, nome text, area_ha numeric, tipo_pasto text, qualidade text, latitude numeric, longitude numeric, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.nutricao (id bigserial primary key, descricao text, energia numeric, proteina numeric, fibra numeric, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.clima_readings (id bigserial primary key, pasture_id bigint, payload jsonb, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.planos (id bigserial primary key, nome text NOT NULL, valor numeric NOT NULL, periodicidade text NOT NULL, ativo boolean default true, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.admin_users (id bigserial primary key, email text unique, password_hash text, is_owner boolean default false, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.owner_settings (id bigserial primary key, key text, value jsonb, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.actions (id bigserial primary key, source text, action jsonb, result jsonb, created_at timestamptz default now());

CREATE OR REPLACE FUNCTION public.create_admin_user(p_email text, p_password text, p_is_owner boolean DEFAULT false) RETURNS void LANGUAGE plpgsql AS \$\$ BEGIN
INSERT INTO public.admin_users (email, password_hash, is_owner, created_at) VALUES (p_email, crypt(p_password, gen_salt('bf')), p_is_owner, now()) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_owner = EXCLUDED.is_owner;
END; \$\$;

-- Inserir owner
SELECT public.create_admin_user('$ownerEmail', '$ownerPassword', true);

-- Inserir planos
INSERT INTO public.planos (nome, valor, periodicidade, ativo, created_at) VALUES
('Mensal', 57.00, 'mensal', true, now()),
('Trimestral', 150.00, 'trimestral', true, now()),
('Anual', 547.20, 'anual', true, now())
ON CONFLICT (nome) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_rebanho_raca ON public.rebanho (raca);
"@

$sql | Out-File -FilePath $sqlPath -Encoding utf8 -Force
Log "OK" "SQL gerado em $sqlPath"

try {
    & supabase db query --file $sqlPath 2>&1 | ForEach-Object { $_; $_ | Out-File -FilePath $LogFile -Append -Encoding utf8 }
    if ($LASTEXITCODE -eq 0) { Log "OK" "SQL aplicado com sucesso" }
    else { Log "ERROR" "Falha ao aplicar SQL. Verifique logs." }
} catch { Log "ERROR" ("Erro ao aplicar SQL: " + $_.Exception.Message) }

# APIs Next.js
$apiPlanosDir = Join-Path $ProjectPath "app\api\planos"
$apiOwnerDir = Join-Path $ProjectPath "app\api\owner"
if (-not (Test-Path $apiPlanosDir)) { New-Item -ItemType Directory -Path $apiPlanosDir -Force | Out-Null }
if (-not (Test-Path $apiOwnerDir))  { New-Item -ItemType Directory -Path $apiOwnerDir -Force | Out-Null }

$planosRoute = @"
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET() {
  const { data, error } = await supabase.from('planos').select('*').eq('ativo', true).order('valor', { ascending: true });
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status:500 });
  return NextResponse.json({ ok:true, planos: data });
}
"@
$planosRoute | Out-File -FilePath (Join-Path $apiPlanosDir "route.ts") -Encoding utf8 -Force
Log "OK" "API /api/planos criada"

$ownerRoute = @"
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function POST(req: Request) {
  const body = await req.json();
  const password = String(body.password || '');
  if (!password) return NextResponse.json({ ok:false, error:'password required' }, { status:400 });
  const { data, error } = await supabase.rpc('owner_unlock', { p_password: password });
  if (error) return NextResponse.json({ ok:false, error:error.message }, { status:403 });
  return NextResponse.json({ ok:true, settings:data });
}
"@
$ownerRoute | Out-File -FilePath (Join-Path $apiOwnerDir "route.ts") -Encoding utf8 -Force
Log "OK" "API /api/owner/unlock criada"

# Git commit + push
try {
    & git add .
    & git commit -m "chore: apply_pecuariatech_fixed - schema, owner, planos, APIs" 2>&1 | ForEach-Object { $_; $_ | Out-File -FilePath $LogFile -Append -Encoding utf8 }
    & git push origin main 2>&1 | ForEach-Object { $_; $_ | Out-File -FilePath $LogFile -Append -Encoding utf8 }
    Log "OK" "Alterações commitadas e enviadas"
} catch { Log "WARN" ("Git commit/push apresentou problema: " + $_.Exception.Message) }

# Deploy Vercel
try {
    if (Get-Command vercel -ErrorAction SilentlyContinue) {
        Log "INFO" "Iniciando deploy Vercel (produção, --force)"
        & vercel --prod --force 2>&1 | ForEach-Object { $_; $_ | Out-File -FilePath $LogFile -Append -Encoding utf8 }
        Log "OK" "Deploy Vercel solicitado"
    } else { Log "WARN" "Vercel CLI não encontrada - pule o deploy." }
} catch { Log "ERROR" ("Erro ao chamar Vercel CLI: " + $_.Exception.Message) }

Log "INFO" "apply_pecuariatech: execução concluída. Verifique logs em $LogFile"
Write-Host ""
Write-Host "Owner criado: $ownerEmail / $ownerPassword"
Write-Host "Rotas criadas: GET /api/planos | POST /api/owner/unlock (body { password:'...' })"
Write-Host ""
