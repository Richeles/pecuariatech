# =============================================================
# UltraSQL – Tri360 Hybrid v5.3 (Revisão Especial)
# Compatível com Tri360 MAX, Supabase Cloud e SaaS Profissional
# Ajustado conforme instrução do aricheles
# =============================================================

$SUPABASE_URL = $env:SUPABASE_URL
$SERVICE_ROLE = $env:SUPABASE_SERVICE_ROLE_KEY
$ANON_KEY     = $env:SUPABASE_ANON_KEY

if (-not $SUPABASE_URL -or -not $SERVICE_ROLE -or -not $ANON_KEY) {
    Write-Host "❌ Variáveis ausentes. Configure SUPABASE_URL / SERVICE_ROLE / ANON_KEY." -ForegroundColor Red
    exit
}

# Função RPC oficial
$SQL_FUNC = "$SUPABASE_URL/rest/v1/rpc/admin_execute_sql"
$REST     = "$SUPABASE_URL/rest/v1"

function Exec-SQL($sql) {
    $body = @{ sql = $sql } | ConvertTo-Json

    try {
        $resp = Invoke-RestMethod `
            -Method Post `
            -Uri $SQL_FUNC `
            -Headers @{
                "apikey" = $SERVICE_ROLE
                "Authorization" = "Bearer $SERVICE_ROLE"
            } `
            -ContentType "application/json" `
            -Body $body

        if ($resp.status -eq "ok") {
            Write-Host "✔ SQL OK:" -ForegroundColor Green
        } else {
            Write-Host "⚠ SQL com alerta:" -ForegroundColor Yellow
        }

        Write-Host $sql -ForegroundColor White
    }
    catch {
        Write-Host "❌ Erro SQL:" -ForegroundColor Red
        Write-Host $sql -ForegroundColor Yellow
        Write-Host $_.Exception.Message
    }
}

# =================================================================
# Tabelas reais do PecuariaTech
# =================================================================

$tables = @(
    "pastagem",
    "rebanho",
    "financeiro",
    "racas"
)

# =================================================================
# 1) Criar USER_ID conforme modelo SaaS Ultra-360
# =================================================================

foreach ($t in $tables) {
    Exec-SQL "ALTER TABLE public.$t ADD COLUMN IF NOT EXISTS user_id uuid;"
    Exec-SQL "UPDATE public.$t SET user_id = gen_random_uuid() WHERE user_id IS NULL;"
}

# =================================================================
# 2) RLS obrigatório
# =================================================================

foreach ($t in $tables) {
    Exec-SQL "ALTER TABLE public.$t ENABLE ROW LEVEL SECURITY;"
}

# =================================================================
# 3) Políticas Ultra-360 (Ajustadas conforme sua sugestão)
# =================================================================

foreach ($t in $tables) {

    # ANON = somente SELECT
    Exec-SQL "
        CREATE POLICY ${t}_anon_select
        ON public.$t
        FOR SELECT
        TO anon
        USING (true);
    "

    # SERVICE_ROLE = poder total (Tri360, integradores, automações)
    Exec-SQL "
        CREATE POLICY ${t}_service_full
        ON public.$t
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    "

    # AUTH INSERT
    Exec-SQL "
        CREATE POLICY ${t}_auth_insert
        ON public.$t
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    "

    # AUTH UPDATE
    Exec-SQL "
        CREATE POLICY ${t}_auth_update
        ON public.$t
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    "

    # AUTH DELETE
    Exec-SQL "
        CREATE POLICY ${t}_auth_delete
        ON public.$t
        FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);
    "
}

# =================================================================
# 4) Auditoria Universal Tri360
# =================================================================

Exec-SQL "
CREATE TABLE IF NOT EXISTS tri360_audit_sql (
    id uuid default gen_random_uuid() primary key,
    created_at timestamptz default now(),
    sql_executado text,
    usuario text default 'tri360',
    origem text default 'UltraSQL',
    status text
);
"

# =================================================================
# 5) Teste ANON + SERVICE ROLE + status Tri360
# =================================================================

function Test-Tabela($t) {
    Write-Host "`n🔎 Testando tabela: $t" -ForegroundColor Cyan

    # ANON
    try {
        Invoke-RestMethod -Method Get -Uri "$REST/$t" -Headers @{
            apikey = $ANON_KEY
            Authorization = "Bearer $ANON_KEY"
        }
        Write-Host "✔ ANON SELECT OK" -ForegroundColor Green
    }
    catch { Write-Host "⚠ ANON bloqueado (RLS ativo)" -ForegroundColor Yellow }

    # SERVICE ROLE
    try {
        Invoke-RestMethod -Method Get -Uri "$REST/$t" -Headers @{
            apikey = $SERVICE_ROLE
            Authorization = "Bearer $SERVICE_ROLE"
        }
        Write-Host "✔ SERVICE ROLE OK" -ForegroundColor Green
    }
    catch { Write-Host "❌ ERRO SERVICE ROLE" -ForegroundColor Red }
}

foreach ($t in $tables) {
    Test-Tabela $t
}

Write-Host "`n=========================================="
Write-Host "🎉 UltraSQL – Tri360 Hybrid v5.3 FINALIZADO"
Write-Host "==========================================" -ForegroundColor Green
