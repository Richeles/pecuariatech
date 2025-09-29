# ======================================================
#  Supabase - Script Único Ultrabiológico Inteligente
#  Autor: Richeles + IA
#  Função: Inserção autônoma em todas as tabelas principais
#  Acesso: TOTAL (Service Role Key, sem restrições)
# ======================================================

Write-Host "`n[INFO] Iniciando Supabase Ultrabiológico..." -ForegroundColor Cyan

# ---------------- CONFIGURAÇÃO ----------------
$SupabaseUrl   = "https://kpzzekflqpoeccnqfkng.supabase.co"

# 🔑 Chave de acesso total (Service Role Key)
$ServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"

$Headers = @{
    "apikey"        = $ServiceRoleKey
    "Authorization" = "Bearer $ServiceRoleKey"
    "Content-Type"  = "application/json"
    "Prefer"        = "return=representation"
}

# ---------------- FUNÇÃO UNIVERSAL ----------------
function Enviar-Supabase {
    param(
        [string]$Table,
        [array]$Dados
    )

    foreach ($item in $Dados) {
        $Json = $item | ConvertTo-Json -Depth 10 -Compress
        try {
            $Resp = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/$Table" `
                -Method Post -Headers $Headers -Body $Json

            # Corrigido: referência de variável segura
            $NomeItem = if ($item.PSObject.Properties['nome']) { $item.nome } `
                        elseif ($item.PSObject.Properties['descricao']) { $item.descricao } `
                        elseif ($item.PSObject.Properties['raca']) { $item.raca } `
                        else { "Item sem nome" }

            Write-Host "[OK] Inserido em $Table: $NomeItem" -ForegroundColor Green
        }
        catch {
            $NomeItem = if ($item.PSObject.Properties['nome']) { $item.nome } `
                        elseif ($item.PSObject.Properties['descricao']) { $item.descricao } `
                        elseif ($item.PSObject.Properties['raca']) { $item.raca } `
                        else { "Item sem nome" }

            Write-Host "[ERRO] Falha ao inserir em $Table: $NomeItem" `
                $_.Exception.Message -ForegroundColor Red
        }
    }
}

# ---------------- DADOS DE TESTE ----------------
$Rebanho = @(
    @{ nome="Boi Exemplo 1"; raca="Nelore"; cruzamento="Nelore x Angus"; clima_ideal="Tropical"; peso_inicial=340; peso_atual=350; data_entrada="2025-09-12"; pastagem_id=$null },
    @{ nome="Boi Exemplo 2"; raca="Angus"; cruzamento="Angus Puro"; clima_ideal="Temperado"; peso_inicial=300; peso_atual=315; data_entrada="2025-09-13"; pastagem_id=$null }
)

$Financeiro = @(
    @{ descricao="Venda de bezerro"; valor=2500; data="2025-09-20"; categoria="Receita" },
    @{ descricao="Compra de ração"; valor=-800; data="2025-09-18"; categoria="Despesa" }
)

$Pastagens = @(
    @{ nome="Pastagem A"; area_ha=12.5; tipo_pasto="Braquiária"; qualidade="Alta"; latitude=-20.1234; longitude=-54.1234 },
    @{ nome="Pastagem B"; area_ha=8.7; tipo_pasto="Tifton"; qualidade="Média"; latitude=-20.5678; longitude=-54.5678 }
)

$Racas = @(
    @{ raca="Nelore"; cruzamento="Nenhum"; clima_ideal="Tropical"; ganho_peso_dia=0.8 },
    @{ raca="Angus"; cruzamento="Nenhum"; clima_ideal="Temperado"; ganho_peso_dia=1.0 }
)

# ---------------- EXECUÇÃO ----------------
Write-Host "`n[INFO] Inserindo em Rebanho..." -ForegroundColor Yellow
Enviar-Supabase -Table "rebanho" -Dados $Rebanho

Write-Host "`n[INFO] Inserindo em Financeiro..." -ForegroundColor Yellow
Enviar-Supabase -Table "financeiro" -Dados $Financeiro

Write-Host "`n[INFO] Inserindo em Pastagem..." -ForegroundColor Yellow
Enviar-Supabase -Table "pastagem" -Dados $Pastagens

Write-Host "`n[INFO] Inserindo em Raças..." -ForegroundColor Yellow
Enviar-Supabase -Table "racas" -Dados $Racas

# ---------------- FINALIZAÇÃO ----------------
Write-Host "`n[INFO] Script Ultrabiológico finalizado com sucesso." -ForegroundColor Cyan
