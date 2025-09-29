# ======================================================
#  Supabase - Ultrabiológico Inteligente Total
#  Autor: Richeles + IA
#  Função: Testa acesso, descobre estrutura e insere dados
# ======================================================

Write-Host "`n[INFO] Iniciando Ultrabiológico Inteligente Total..." -ForegroundColor Cyan

# ---------------- CONFIGURAÇÃO ----------------
$SupabaseUrl = "https://kpzzekflqpoeccnqfkng.supabase.co"
$ServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"

$Headers = @{
    "apikey"        = $ServiceRoleKey
    "Authorization" = "Bearer $ServiceRoleKey"
    "Content-Type"  = "application/json"
    "Prefer"        = "return=minimal"
}

# ---------------- FUNÇÃO: Verificar Acesso ----------------
function Testar-Acesso {
    param([string]$Tabela)

    try {
        $Response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/$Tabela?limit=1" -Method GET -Headers $Headers
        Write-Host "[OK] Acesso permitido à tabela $Tabela" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "[BLOQUEADO] Acesso negado à tabela $Tabela - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# ---------------- FUNÇÃO: Inserir Dados Inteligentes ----------------
function Inserir-Dados {
    param([string]$Tabela, [array]$Dados)

    Write-Host "`n[INFO] Inserindo dados na tabela $Tabela..." -ForegroundColor Yellow

    $Acesso = Testar-Acesso -Tabela $Tabela
    if (-not $Acesso) {
        Write-Host "[AVISO] Pulando $Tabela - sem acesso" -ForegroundColor Yellow
        return
    }

    foreach ($item in $Dados) {
        try {
            $Json = $item | ConvertTo-Json -Depth 10 -Compress
            $NomeItem = if ($item.nome) { $item.nome } elseif ($item.descricao) { $item.descricao } else { "Item" }

            $Response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/$Tabela" -Method POST -Headers $Headers -Body $Json
            Write-Host "[SUCESSO] Inserido em $Tabela: $NomeItem" -ForegroundColor Green
        }
        catch {
            Write-Host "[ERRO] Falha ao inserir em $Tabela: $NomeItem" -ForegroundColor Red
            Write-Host "       Detalhes: $($_.Exception.Message)" -ForegroundColor Red
        }
        Start-Sleep -Milliseconds 300
    }
}

# ---------------- DADOS DE TESTE ----------------
$Rebanho = @(@{nome="Boi Teste 1"; raca="Nelore"}, @{nome="Boi Teste 2"; raca="Angus"})
$Financeiro = @(@{descricao="Venda Teste"; valor=1000}, @{descricao="Compra Teste"; valor=-500})
$Pastagem = @(@{nome="Pastagem Teste A"}, @{nome="Pastagem Teste B"})
$Racas = @(@{nome="Nelore Teste"}, @{nome="Angus Teste"})

# ---------------- EXECUÇÃO ----------------
$Tabelas = @(
    @{Nome="rebanho"; Dados=$Rebanho},
    @{Nome="financeiro"; Dados=$Financeiro},
    @{Nome="pastagem"; Dados=$Pastagem},
    @{Nome="racas"; Dados=$Racas}
)

foreach ($Tabela in $Tabelas) {
    Inserir-Dados -Tabela $Tabela.Nome -Dados $Tabela.Dados
}

Write-Host "`n[INFO] Ultrabiológico Inteligente Total finalizado!" -ForegroundColor Cyan
