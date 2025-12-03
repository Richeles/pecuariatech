# ======================================================
#  Supabase - Script Ultrabiológico Final Inteligente
#  Autor: Richeles + IA
#  Função: Descobre a estrutura e insere dados automaticamente
#  Acesso: TOTAL (Service Role Key)
# ======================================================

Write-Host "`n[INFO] Iniciando Supabase Ultrabiológico Final..." -ForegroundColor Cyan

# ---------------- CONFIGURAÇÃO ----------------
$SupabaseUrl = "https://kpzzekflqpoeccnqfkng.supabase.co"
$ServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"

$Headers = @{
    "apikey"        = $ServiceRoleKey
    "Authorization" = "Bearer $ServiceRoleKey"
    "Content-Type"  = "application/json"
    "Prefer"        = "return=minimal"
}

# ---------------- FUNÇÃO PARA VER ESTRUTURA ----------------
function Verificar-EstruturaTabela {
    param([string]$TableName)
    try {
        Write-Host "`n[INFO] Verificando estrutura da tabela: $TableName" -ForegroundColor Yellow
        $Response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/$TableName?limit=1" -Method GET -Headers $Headers
        if ($Response) {
            Write-Host "[OK] Estrutura encontrada para $TableName" -ForegroundColor Green
            $Response[0].PSObject.Properties | ForEach-Object {
                Write-Host "   - $($_.Name): $($_.Value)" -ForegroundColor Gray
            }
            return $Response[0]
        }
    } catch {
        Write-Host "[AVISO] Não foi possível verificar $TableName" -ForegroundColor Yellow
        Write-Host "        Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
    return $null
}

# ---------------- FUNÇÃO DE INSERÇÃO INTELIGENTE ----------------
function Inserir-DadosCompatíveis {
    param([string]$Table, [array]$Dados)
    $Estrutura = Verificar-EstruturaTabela -TableName $Table
    if (-not $Estrutura) { Write-Host "[AVISO] Pulando $Table - sem estrutura" -ForegroundColor Yellow; return }

    foreach ($item in $Dados) {
        try {
            # Filtra apenas campos que existem
            $DadosFiltrados = @{ }
            $item.GetEnumerator() | ForEach-Object {
                if ($Estrutura.PSObject.Properties.Name -contains $_.Key) { $DadosFiltrados[$_.Key] = $_.Value }
            }
            if ($DadosFiltrados.Count -eq 0) { Write-Host "[AVISO] Nenhuma coluna compatível em $Table" -ForegroundColor Yellow; return }

            $Json = $DadosFiltrados | ConvertTo-Json -Depth 10 -Compress
            $NomeItem = if ($item.nome) { $item.nome } elseif ($item.descricao) { $item.descricao } else { "Item" }

            Write-Host "[INSERINDO] $Table : $NomeItem" -ForegroundColor Yellow
            Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/$Table" -Method POST -Headers $Headers -Body $Json
            Write-Host "[SUCESSO] Inserido em $Table : $NomeItem" -ForegroundColor Green
        } catch {
            Write-Host "[ERRO] Falha em $Table : $NomeItem" -ForegroundColor Red
            Write-Host "       Detalhes: $($_.Exception.Message)" -ForegroundColor Red
        }
        Start-Sleep -Milliseconds 300
    }
}

# ---------------- DADOS GENÉRICOS ----------------
$Rebanho = @(@{nome="Boi Teste 1"; raca="Nelore"}, @{nome="Boi Teste 2"; raca="Angus"})
$Financeiro = @(@{descricao="Venda teste"; valor=1000}, @{descricao="Compra teste"; valor=-500})
$Pastagens = @(@{nome="Pastagem Teste A"}, @{nome="Pastagem Teste B"})
$Racas = @(@{nome="Nelore Teste"}, @{nome="Angus Teste"})

# ---------------- EXECUÇÃO ----------------
$Tabelas = @("rebanho","financeiro","pastagem","racas")
foreach ($Tabela in $Tabelas) { Verificar-EstruturaTabela -TableName $Tabela }

Inserir-DadosCompatíveis -Table "rebanho" -Dados $Rebanho
Inserir-DadosCompatíveis -Table "financeiro" -Dados $Financeiro
Inserir-DadosCompatíveis -Table "pastagem" -Dados $Pastagens
Inserir-DadosCompatíveis -Table "racas" -Dados $Racas

Write-Host "`n[INFO] Processo Ultrabiológico concluído!" -ForegroundColor Cyan
