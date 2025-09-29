# ======================================================
#  Supabase - Script Ultrabiológico Inteligente
#  Autor: Richeles + IA
#  Função: Inserção autônoma inteligente em todas as tabelas principais
#  Acesso: TOTAL (Service Role Key)
# ======================================================

Write-Host "`n[INFO] Iniciando Supabase Ultrabiológico Inteligente..." -ForegroundColor Cyan

# ---------------- CONFIGURAÇÃO ----------------
$SupabaseUrl = "https://kpzzekflqpoeccnqfkng.supabase.co"
$ServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"

$Headers = @{
    "apikey"        = $ServiceRoleKey
    "Authorization" = "Bearer $ServiceRoleKey"
    "Content-Type"  = "application/json"
    "Prefer"        = "return=representation"
}

# ---------------- FUNÇÃO UNIVERSAL INTELIGENTE ----------------
function Enviar-Supabase {
    param(
        [string]$Table,
        [array]$Dados
    )

    foreach ($item in $Dados) {
        try {
            $Json = $item | ConvertTo-Json -Depth 10 -Compress
            $NomeItem = if ($item.nome) { $item.nome } elseif ($item.descricao) { $item.descricao } else { $item.raca }
            Write-Host "[TENTANDO] Inserindo em ${Table}: ${NomeItem}" -ForegroundColor Yellow

            $Response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/$Table" `
                -Method POST `
                -Headers $Headers `
                -Body $Json `
                -ErrorAction Stop

            Write-Host "[OK] Inserido em ${Table}: ${NomeItem}" -ForegroundColor Green
        }
        catch {
            $ErrorMessage = $_.Exception.Message
            Write-Host "[ERRO] Falha ao inserir em ${Table}: ${NomeItem}" -ForegroundColor Red
            Write-Host "       Detalhes: $ErrorMessage" -ForegroundColor Red

            if ($_.Exception.Response) {
                $Reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $Reader.BaseStream.Position = 0
                $Reader.DiscardBufferedData()
                $ErrorResponse = $Reader.ReadToEnd()
                Write-Host "       Resposta do servidor: $ErrorResponse" -ForegroundColor Red
            }
        }
        Start-Sleep -Milliseconds 200
    }
}

# ---------------- DADOS DE TESTE ----------------
$Rebanho = @(
    @{ nome="Boi Exemplo 1"; raca="Nelore"; cruzamento="Nelore x Angus"; clima_ideal="Tropical"; peso_inicial=340; peso_atual=350; data_entrada="2025-09-12"; status="Ativo" },
    @{ nome="Boi Exemplo 2"; raca="Angus"; cruzamento="Angus Puro"; clima_ideal="Temperado"; peso_inicial=300; peso_atual=315; data_entrada="2025-09-13"; status="Ativo" }
)

$Financeiro = @(
    @{ descricao="Venda de bezerro"; valor=2500; data="2025-09-20"; categoria="Receita"; tipo="Entrada" },
    @{ descricao="Compra de racao"; valor=-800; data="2025-09-18"; categoria="Despesa"; tipo="Saida" }
)

$Pastagens = @(
    @{ nome="Pastagem A"; area_ha=12.5; tipo_pasto="Braquiaria"; qualidade="Alta"; status="Ativa" },
    @{ nome="Pastagem B"; area_ha=8.7; tipo_pasto="Tifton"; qualidade="Media"; status="Ativa" }
)

$Racas = @(
    @{ nome_raca="Nelore"; cruzamento="Nenhum"; clima_ideal="Tropical"; ganho_peso_dia=0.8; descricao="Raca adaptada ao clima tropical" },
    @{ nome_raca="Angus"; cruzamento="Nenhum"; clima_ideal="Temperado"; ganho_peso_dia=1.0; descricao="Raca de clima temperado" }
)

# ---------------- TESTE DE CONEXÃO ----------------
Write-Host "`n[INFO] Testando conexão com Supabase..." -ForegroundColor Yellow
try {
    $TestResponse = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/" -Method GET -Headers $Headers
    Write-Host "[OK] Conexão estabelecida" -ForegroundColor Green
}
catch {
    Write-Host "[ERRO CRÍTICO] Falha na conexão: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# ---------------- EXECUÇÃO ----------------
Write-Host "`n[INFO] Inserindo em Rebanho..." -ForegroundColor Yellow
Enviar-Supabase -Table "rebanho" -Dados $Rebanho

Write-Host "`n[INFO] Inserindo em Financeiro..." -ForegroundColor Yellow
Enviar-Supabase -Table "financeiro" -Dados $Financeiro

Write-Host "`n[INFO] Inserindo em Pastagem..." -ForegroundColor Yellow
Enviar-Supabase -Table "pastagem" -Dados $Pastagens

Write-Host "`n[INFO] Inserindo em Racas..." -ForegroundColor Yellow
Enviar-Supabase -Table "racas" -Dados $Racas

# ---------------- FINALIZAÇÃO ----------------
Write-Host "`n[INFO] Script Ultrabiológico Inteligente finalizado." -ForegroundColor Cyan
