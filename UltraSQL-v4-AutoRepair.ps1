# ==========================================================
# UltraSQL v4 — AutoRepair RLS & Policy Fix
# PecuariaTech Cloud — Desenvolvido para aricheles
# ==========================================================

$SUPABASE_URL = $env:SUPABASE_URL
$SERVICE_ROLE = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $SUPABASE_URL -or -not $SERVICE_ROLE) {
    Write-Host "❌ Variáveis de ambiente ausentes (URL / SERVICE ROLE)." -ForegroundColor Red
    exit
}

Write-Host "`n🔵 UltraSQL v4 — AutoRepair iniciado..." -ForegroundColor Cyan

$headers = @{
    apikey = $SERVICE_ROLE
    Authorization = "Bearer $SERVICE_ROLE"
}

# tabelas que precisam ser reparadas
$tabelas = @("pastagem","rebanho","financeiro","racas")

function Fix-Policies {
    param($t)

    Write-Host "`n🛠 Corrigindo políticas da tabela: $t" -ForegroundColor Yellow

    $policies = @(
        @{
            name = "service_role_full_$t"
            definition = "FOR ALL TO service_role USING (true) WITH CHECK (true)"
        },
        @{
            name = "anon_select_$t"
            definition = "FOR SELECT TO anon USING (true)"
        }
    )

    foreach ($p in $policies) {
        $payload = @{
            "definition" = $p.definition
        } | ConvertTo-Json

        try {
            Invoke-RestMethod `
                -Uri "$SUPABASE_URL/rest/v1/$t?policy=$($p.name)" `
                -Headers $headers `
                -Method Post `
                -Body $payload

            Write-Host "   ✔ Política aplicada: $($p.name)" -ForegroundColor Green
        }
        catch {
            Write-Host "   ⚠ Não foi possível aplicar política: $($p.name)" -ForegroundColor Yellow
        }
    }
}

function Test-ServiceRole {
    param($t)

    Write-Host "`n🔍 Testando Service Role em: $t"

    try {
        Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/$t?limit=1" -Headers $headers -Method Get
        Write-Host "   ✔ OK — SERVICE ROLE agora consegue ler $t" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "   ❌ ERRO — Ainda não consegue ler $t" -ForegroundColor Red
        return $false
    }
}

foreach ($t in $tabelas) {

    Write-Host "`n===================================="
    Write-Host "Tabela: $t"
    Write-Host "===================================="

    Fix-Policies $t

    Start-Sleep -Seconds 1

    $ok = Test-ServiceRole $t

    if (-not $ok) {
        Write-Host "⚠ Segunda tentativa de correção..." -ForegroundColor Yellow
        Fix-Policies $t
        Start-Sleep -Seconds 1
        Test-ServiceRole $t
    }
}

Write-Host "`n===================================="
Write-Host "🎉 UltraSQL v4 — AutoRepair FINALIZADO"
Write-Host "====================================" -ForegroundColor Green
