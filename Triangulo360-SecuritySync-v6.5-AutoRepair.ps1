# 🚀 Triângulo 360° — SecuritySync v6.5 AutoRepair
# PecuariaTech Cloud — Autorreparo de estrutura + RLS + permissões
# Admin: pecuariatech.br@gmail.com

# ========= VARIÁVEIS =========
$SUPABASE_URL = $env:NEXT_PUBLIC_SUPABASE_URL
$SUPABASE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY
$ADMIN_EMAIL  = "pecuariatech.br@gmail.com"

$LOG_DIR  = "C:\Logs\PecuariaTech"
$LOG_FILE = Join-Path $LOG_DIR "securitysync_v65.csv"

if (-not (Test-Path $LOG_DIR)) { New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null }

function Log($etapa, $status, $msg = "") {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  "$ts,$etapa,$status,$msg" | Out-File -FilePath $LOG_FILE -Append -Encoding UTF8
}

function Head($txt) { Write-Host $txt -ForegroundColor Yellow }
function Ok($txt)   { Write-Host $txt -ForegroundColor Green }
function Warn($txt) { Write-Host $txt -ForegroundColor DarkYellow }
function Err($txt)  { Write-Host $txt -ForegroundColor Red }

Clear-Host
Write-Host "`n🚀 Triângulo 360° v6.5 — PecuariaTech SecuritySync AutoRepair" -ForegroundColor Cyan
Write-Host     "----------------------------------------------------------------" -ForegroundColor Cyan

# ========= CHECAGENS BÁSICAS =========
if (-not $SUPABASE_URL -or -not $SUPABASE_KEY) {
  Err "Variáveis de ambiente não configuradas (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."
  Log "Boot" "Falha" "Env vars ausentes"
  exit 1
}

Head "[##############################] Verificando Supabase..."
try {
  # ping simples no REST
  $null = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/" -Headers @{ apikey=$SUPABASE_KEY; Authorization="Bearer $SUPABASE_KEY" } -TimeoutSec 10
  Ok  "✅ Conexão com Supabase ativa!"
  Log "Conexao" "OK"
} catch {
  Err "❌ Erro ao conectar com Supabase: $($_.Exception.Message)"
  Log "Conexao" "Falha" ($_.Exception.Message)
  exit 1
}

# ========= BLOCO SQL (AUTOREPAIR + RLS) =========
# Usamos a SQL API oficial: POST $SUPABASE_URL/sql/v1  { "query": "<SQL>" }
# Precisa do service_role (já estamos usando).
$SQL = @"
-- === AUTOREPAIR: estrutura da tabela de logs ===
create table if not exists public.triangulo_logs (
  id          bigserial primary key,
  modulo      text not null,
  status      text not null,
  tempo_ms    numeric(12,2) default 0,
  data_hora   timestamptz  default now()
);

-- índices auxiliares
create index if not exists idx_triangulo_logs_modulo     on public.triangulo_logs(modulo);
create index if not exists idx_triangulo_logs_data_hora  on public.triangulo_logs(data_hora);

-- === VIEW de monitor v55 (somente leitura) ===
create or replace view public.triangulo_monitor_v55 as
with base as (
  select
    modulo,
    count(*)                                   as total_testes,
    sum(case when status = 'OK' then 1 else 0 end) as total_ok,
    sum(case when status <> 'OK' then 1 else 0 end) as total_falhas,
    coalesce(round(avg(tempo_ms)::numeric, 2), 0)    as tempo_medio_ms,
    max(data_hora)                              as ultima_execucao
  from public.triangulo_logs
  group by modulo
)
select
  modulo,
  total_testes,
  total_ok,
  total_falhas,
  tempo_medio_ms,
  ultima_execucao,
  case
    when total_falhas = 0 then '🟢 Estável'
    when total_ok > 0 and total_falhas > 0 then '🟠 Parcial'
    else '🔴 Falhando'
  end as status_geral
from base
order by modulo;

-- === RLS: habilitar e políticas idempotentes ===
alter table public.triangulo_logs enable row level security;

-- limpa políticas antigas (se existirem)
do $$
begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='triangulo_logs' and policyname='Public select logs') then
    execute 'drop policy "Public select logs" on public.triangulo_logs';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='triangulo_logs' and policyname='Service insert logs') then
    execute 'drop policy "Service insert logs" on public.triangulo_logs';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='triangulo_logs' and policyname='Admin full access') then
    execute 'drop policy "Admin full access" on public.triangulo_logs';
  end if;
end$$;

-- leitura pública (para dashboards públicos / cloudsync leitura)
create policy "Public select logs"
  on public.triangulo_logs
  for select
  using (true);

-- escrita pelo service_role (automação / cloudsync)
create policy "Service insert logs"
  on public.triangulo_logs
  for insert
  to service_role
  with check (true);

-- acesso total para o admin autenticado
create policy "Admin full access"
  on public.triangulo_logs
  for all
  using (auth.jwt() ->> 'email' = '$ADMIN_EMAIL')
  with check (auth.jwt() ->> 'email' = '$ADMIN_EMAIL');

-- === GRANTS e SEQUENCES ===
grant select on public.triangulo_monitor_v55 to anon, authenticated;
grant select on public.triangulo_logs to anon, authenticated;
grant usage, select on sequence public.triangulo_logs_id_seq to service_role, authenticated;

-- confere permissões gerais (garantia)
grant select, insert, update, delete on public.triangulo_logs to service_role;
"@

Head "`n[##############################] Aplicando AutoRepair + RLS..."
try {
  $resp = Invoke-RestMethod `
    -Uri "$SUPABASE_URL/sql/v1" `
    -Method Post `
    -Headers @{ apikey=$SUPABASE_KEY; Authorization="Bearer $SUPABASE_KEY"; "Content-Type"="application/json" } `
    -Body (@{ query = $SQL } | ConvertTo-Json -Depth 5)

  Ok  "✅ Estrutura verificada e políticas sincronizadas!"
  Log "AutoRepair+RLS" "OK"
}
catch {
  Warn "⚠️ Falha ao aplicar SQL (AutoRepair/RLS). Mensagem: $($_.Exception.Message)"
  Log "AutoRepair+RLS" "Aviso" ($_.Exception.Message)
}

# ========= VERIFICAÇÃO PÓS-REPARO =========
Head "`n[##############################] Verificando integridade..."

# 1) Tenta um insert de teste (somente serviço pode; aqui usamos service_role)
$testeOk = $false
try {
  $body = @{ modulo="securitysync"; status="OK"; tempo_ms=0 } | ConvertTo-Json
  $null = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/triangulo_logs" `
    -Method Post `
    -Headers @{ apikey=$SUPABASE_KEY; Authorization="Bearer $SUPABASE_KEY"; "Content-Type"="application/json" } `
    -Body $body
  $testeOk = $true
  Ok "✅ Teste de escrita (service_role) passou."
  Log "TesteInsert" "OK"
}
catch {
  Warn "⚠️ Teste de escrita falhou (ver RLS/Grants)."
  Log "TesteInsert" "Falha" ($_.Exception.Message)
}

# 2) Tenta um select básico na view pública (com service_role só pra validar endpoint)
try {
  $data = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/triangulo_monitor_v55?select=*" `
    -Headers @{ apikey=$SUPABASE_KEY; Authorization="Bearer $SUPABASE_KEY" }
  $count = @($data).Count
  Ok "✅ Leitura da view pública OK — $count registro(s)."
  Log "TesteSelectView" "OK" "count=$count"
}
catch {
  Warn "⚠️ Falha ao ler a view pública triangulo_monitor_v55."
  Log "TesteSelectView" "Falha" ($_.Exception.Message)
}

# ========= RESUMO =========
Head "`n[##############################] Permissões efetivas"
Ok  "👤 Admin: $ADMIN_EMAIL"
Ok  "🟢 service_role: insert/read em triangulo_logs"
Warn "🟡 Público: leitura em triangulo_logs e triangulo_monitor_v55"

Write-Host "`n📜 Log salvo em $LOG_FILE"
Write-Host "🕓 Execução concluída às $(Get-Date -Format 'HH:mm:ss')"
Write-Host "----------------------------------------------------------------"
if ($testeOk) {
  Ok  "🟢 SecuritySync v6.5 — integridade validada!"
} else {
  Warn "🟡 SecuritySync v6.5 — valide RLS/Grants (ver CSV)."
}
Write-Host "----------------------------------------------------------------`n"
