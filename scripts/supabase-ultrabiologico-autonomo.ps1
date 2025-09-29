# ======================================================
#  Supabase - Ultrabiológico Inteligente Autônomo
#  Autor: Richeles + IA
#  Função: Detecta colunas acessíveis e insere dados compatíveis
#  Observação: usa Service Role Key (acesso total). Mantenha a chave segura.
# ======================================================

Write-Host "`n[INFO] Iniciando Ultrabiológico Inteligente Autônomo..." -ForegroundColor Cyan

# ---------------- CONFIGURAÇÃO ----------------
$SupabaseUrl     = "https://kpzzekflqpoeccnqfkng.supabase.co"
$ServiceRoleKey  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"

$Headers = @{
    "apikey"        = $ServiceRoleKey
    "Authorization" = "Bearer $ServiceRoleKey"
    "Content-Type"  = "application/json"
    "Prefer"        = "return=minimal"
}

# ---------------- FUNÇÕES AUXILIARES ----------------

function Read-ErrorBody($ex) {
    try {
        if ($ex.Exception.Response) {
            $sr = New-Object System.IO.StreamReader($ex.Exception.Response.GetResponseStream())
            $sr.BaseStream.Position = 0
            $sr.DiscardBufferedData()
            return $sr.ReadToEnd()
        }
    } catch {
        return ""
    }
    return ""
}

function Prober-Tabela {
    param([string]$Tabela)
    # Tenta GET ?limit=1 para descobrir colunas (retorna um objeto com propriedades)
    try {
        $uri = "$SupabaseUrl/rest/v1/$Tabela?limit=1"
        $resp = Invoke-RestMethod -Uri $uri -Method GET -Headers $Headers -ErrorAction Stop
        if ($null -ne $resp -and $resp.Count -ge 1) {
            $cols = $resp[0].PSObject.Properties.Name
            Write-Host "[OK] Colunas detectadas em ${Tabela}: $($cols -join ', ')" -ForegroundColor Green
            return ,$cols
        } elseif ($null -ne $resp -and $resp.Count -eq 0) {
            # resposta 200 mas sem registros -> tentar HEAD usando limit=0 para propriedades (algumas vezes retorna array vazio)
            Write-Host "[INFO] ${Tabela} acessível mas sem registros (retornou array vazio)." -ForegroundColor Yellow
            return ,@()
        } else {
            Write-Host "[INFO] ${Tabela} acessível porém não retornou colunas." -ForegroundColor Yellow
            return ,@()
        }
    }
    catch {
        $err = $_.Exception.Message
        $body = Read-ErrorBody $_
        Write-Host "[BLOQUEADO] Não foi possível ler ${Tabela}: $err" -ForegroundColor Red
        if ($body) { Write-Host "   Resposta: $body" -ForegroundColor Red }
        return $null
    }
}

function Filtrar-DadosPorColunas {
    param([hashtable]$Dados, [array]$Colunas)

    $out = @{}
    foreach ($k in $Dados.Keys) {
        if ($Colunas -contains $k) {
            $out[$k] = $Dados[$k]
        } else {
            # tenta mapas alternativos (ex.: nome_raca -> raca)
            if ($k -eq "nome_raca" -and ($Colunas -contains "raca")) { $out["raca"] = $Dados[$k] }
            elseif ($k -eq "raca" -and ($Colunas -contains "nome_raca")) { $out["nome_raca"] = $Dados[$k] }
            # adicionar regras de mapeamento simples aqui conforme necessário
        }
    }
    return $out
}

function Inserir-NaTabela {
    param([string]$Tabela, [hashtable]$Dados, [array]$Colunas)
    if ($Colunas -eq $null) {
        Write-Host "[AVISO] Pulando ${Tabela} - sem permissão/sem metadados." -ForegroundColor Yellow
        return
    }

    $filtrado = Filtrar-DadosPorColunas -Dados $Dados -Colunas $Colunas
    if ($filtrado.Keys.Count -eq 0) {
        Write-Host "[AVISO] Nenhuma coluna compatível para inserir em ${Tabela} (dados ignorados)." -ForegroundColor Yellow
        return
    }

    $json = $filtrado | ConvertTo-Json -Depth 10 -Compress
    try {
        Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/$Tabela" -Method POST -Headers $Headers -Body $json -ErrorAction Stop
        $nome = if ($filtrado.nome) { $filtrado.nome } elseif ($filtrado.descricao) { $filtrado.descricao } elseif ($filtrado.raca) { $filtrado.raca } else { "Item" }
        Write-Host "[SUCESSO] Inserido em ${Tabela}: ${nome}" -ForegroundColor Green
    }
    catch {
        $err = $_.Exception.Message
        $body = Read-ErrorBody $_
        Write-Host "[ERRO] Falha ao inserir em ${Tabela}: $err" -ForegroundColor Red
        if ($body) { Write-Host "   Resposta: $body" -ForegroundColor Red }
    }
}

# ---------------- DADOS SUGERIDOS (GENÉRICOS) ----------------
# Cada hashtable é um conjunto de campos possíveis — o script filtra por colunas reais antes de enviar.
$SampleData = @{
    rebanho = @(
        @{ nome="Boi Autônomo 1"; raca="Nelore"; peso_atual=350; data_entrada="2025-09-12"; pastagem_id=$null },
        @{ nome="Boi Autônomo 2"; raca="Angus"; peso_atual=320; data_entrada="2025-09-13"; pastagem_id=$null }
    )
    financeiro = @(
        @{ descricao="Venda Autônoma"; valor=1200; data="2025-09-20" },
        @{ descricao="Despesa Autônoma"; valor=-600; data="2025-09-18" }
    )
    pastagem = @(
        @{ nome="Pastagem Autônoma A"; area_ha=10.5; tipo_pasto="Braquiaria" },
        @{ nome="Pastagem Autônoma B"; area_ha=6.2; tipo_pasto="Tifton" }
    )
    racas = @(
        @{ nome_raca="Nelore"; ganho_peso_dia=0.8 },
        @{ nome_raca="Angus"; ganho_peso_dia=1.0 }
    )
}

# ---------------- EXECUÇÃO INTELIGENTE ----------------
Write-Host "`n[INFO] Fazendo sondagem de tabelas e colunas (isso pode exibir bloqueios de RLS)..." -ForegroundColor Cyan

$ColunasPorTabela = @{}

foreach ($tbl in $SampleData.Keys) {
    $cols = Prober-Tabela -Tabela $tbl
    if ($cols -ne $null) {
        # se retornou array vazio, manter array vazio (acessível mas sem registros)
        $ColunasPorTabela[$tbl] = $cols
    } else {
        $ColunasPorTabela[$tbl] = $null
    }
}

# Se pastagem_id for necessário em rebanho e pastagem foi inserida, tentamos criar pastagens primeiro se possível
# Inserir pastagens se possível (para obter ids) - aqui tentamos inserir apenas campos compatíveis
if ($ColunasPorTabela["pastagem"] -ne $null -and $SampleData["pastagem"].Count -gt 0) {
    Write-Host "`n[INFO] Tentando inserir pastagens (para obter IDs)..." -ForegroundColor Yellow
    foreach ($p in $SampleData["pastagem"]) {
        Inserir-NaTabela -Tabela "pastagem" -Dados $p -Colunas $ColunasPorTabela["pastagem"]
        Start-Sleep -Milliseconds 250
    }
}

# Atualiza colunas (reprobe) caso inserção tenha modificado estado
foreach ($tbl in $SampleData.Keys) {
    if ($ColunasPorTabela[$tbl] -eq $null) {
        # tentar novamente
        $ColunasPorTabela[$tbl] = Prober-Tabela -Tabela $tbl
    }
}

# Inserir demais dados (rebanho, financeiro, racas) usando colunas detectadas
foreach ($tbl in $SampleData.Keys) {
    Write-Host "`n[INFO] Processando tabela: ${tbl}" -ForegroundColor Cyan
    $cols = $ColunasPorTabela[$tbl]
    if ($cols -eq $null) { Write-Host "[AVISO] Sem acesso a ${tbl}, pulando..." -ForegroundColor Yellow; continue }

    foreach ($item in $SampleData[$tbl]) {
        Inserir-NaTabela -Tabela $tbl -Dados $item -Colunas $cols
        Start-Sleep -Milliseconds 300
    }
}

Write-Host "`n[INFO] Processo Ultrabiológico Autônomo concluído." -ForegroundColor Cyan
