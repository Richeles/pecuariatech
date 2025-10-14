# ultrachat-ultrabiologico-planos-v5.ps1
# UltraChat + UltraBiológico - Planos Interativo (v5)
# UTF-8 - PowerShell 7
# Admin password default: 36@Artropodes  (mude abaixo se desejar)

# -------- CONFIGURAÇÃO --------
$AdminPassword = "36@Artropodes"
$EnvFile = ".env.local"
$SqlDir = "sql"
$SqlCreateFile = Join-Path $SqlDir "create_planos.sql"
$LogDir = "logs"
$LogFile = Join-Path $LogDir ("ultrachat-planos-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".log")

# ensure directories
if (-not (Test-Path $SqlDir)) { New-Item -ItemType Directory -Path $SqlDir | Out-Null }
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

# -------- Logging helpers --------
function Write-Log([string]$level, [string]$msg) {
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [$level] $msg"
    $line | Out-File -FilePath $LogFile -Append -Encoding utf8
}
function Info($m){ Write-Host $m -ForegroundColor Cyan; Write-Log "INFO" $m }
function Good($m){ Write-Host $m -ForegroundColor Green; Write-Log "OK" $m }
function Warn($m){ Write-Host $m -ForegroundColor Yellow; Write-Log "WARN" $m }
function Err($m){ Write-Host $m -ForegroundColor Red; Write-Log "ERROR" $m }

# -------- Carregar .env.local (se existir) --------
Info "Iniciando UltraChat + UltraBiológico - Planos (v5)"
if (Test-Path $EnvFile) {
    try {
        Get-Content $EnvFile | ForEach-Object {
            if ($_ -match '^\s*([^#\s=]+)\s*=\s*(.*)\s*$') {
                $k = $matches[1]; $v = $matches[2]
                # remove possible quotes
                if ($v.StartsWith("'") -and $v.EndsWith("'")) { $v = $v.Trim("'") }
                if ($v.StartsWith('"') -and $v.EndsWith('"')) { $v = $v.Trim('"') }
                [System.Environment]::SetEnvironmentVariable($k, $v, "Process")
            }
        }
        Good "Variáveis de ambiente carregadas de $EnvFile"
    } catch {
        Warn "Falha ao ler $EnvFile: $_"
    }
} else { Warn "$EnvFile não encontrado no diretório atual. Verifique suas variáveis." }

# -------- Ler variáveis principais --------
$SupabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$SupabaseAnon = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
$SupabaseKey = $env:SUPABASE_SERVICE_ROLE_KEY
$VercelUrl = $env:NEXT_PUBLIC_VERCEL_URL

# base REST endpoint
if ($SupabaseUrl) {
    $PlanosUrl = ($SupabaseUrl.TrimEnd('/') + "/rest/v1/planos")
} else {
    $PlanosUrl = $null
}

# -------- Validar mínima presença de variáveis --------
if (-not $PlanosUrl -or -not $SupabaseKey) {
    Warn "Supabase URL ou SUPABASE_SERVICE_ROLE_KEY ausente. Algumas ações administrativas precisarão da service role."
    Warn "Planos read-only ficará indisponível se não houver chave."
} else {
    Good "Supabase detectado (admin mode disponível)."
}

# -------- Supabase helper (REST) --------
function Invoke-Supabase {
    param(
        [ValidateSet("GET","POST","PATCH","DELETE")][string]$Method,
        [string]$Url,
        [object]$Body = $null
    )
    if (-not $Url) { throw "URL inválida para Invoke-Supabase" }
    $headers = @{
        "apikey" = $SupabaseKey
        "Authorization" = "Bearer $SupabaseKey"
        "Content-Type" = "application/json"
        "Accept" = "application/json"
    }
    try {
        if ($Body -ne $null) {
            $json = $Body | ConvertTo-Json -Depth 10
            return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers -Body $json -ErrorAction Stop
        } else {
            return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers -ErrorAction Stop
        }
    } catch {
        # bubble up message but log
        Write-Log "ERROR" ("Invoke-Supabase failed: " + $_.Exception.Message)
        throw $_
    }
}

# -------- Check table existence (safe check) --------
function Test-PlanosTable {
    if (-not $PlanosUrl) { return $false }
    try {
        # simple select one
        Invoke-Supabase -Method GET -Url ($PlanosUrl + "?select=id&limit=1") | Out-Null
        return $true
    } catch {
        return $false
    }
}

# If table missing, create SQL file to run in Supabase SQL Editor
if (-not (Test-PlanosTable)) {
    Warn "Tabela 'planos' não encontrada no Supabase (ou sem permissão). Vou gerar um arquivo SQL em $SqlCreateFile para você rodar manualmente no Supabase SQL Editor."
    $sql = @"
-- create_planos.sql
create table if not exists public.planos (
  id bigserial primary key,
  nome text not null,
  valor numeric not null,
  periodicidade text not null,
  ativo boolean default true,
  created_at timestamptz default now()
);
"@
    $sql | Out-File -FilePath $SqlCreateFile -Encoding utf8 -Force
    Good "Arquivo SQL gravado em $SqlCreateFile — por favor execute no Supabase > SQL Editor (usando a sua conta) e depois reexecute este script."
} else {
    Good "Tabela 'planos' verificada."
}

# -------- Default plans (user preference) --------
$defaultPlans = @(
    @{ nome = "Mensal"; valor = 57.00; periodicidade = "mensal"; ativo = $true },
    @{ nome = "Trimestral"; valor = 150.00; periodicidade = "trimestral"; ativo = $true },
    @{ nome = "Anual"; valor = 547.20; periodicidade = "anual"; ativo = $true }
)

# Insert defaults only when table exists
if (Test-PlanosTable) {
    foreach ($p in $defaultPlans) {
        try {
            $q = "$($PlanosUrl)?nome=eq." + [Uri]::EscapeDataString($p.nome) + "&select=id"
            $exists = Invoke-Supabase -Method GET -Url $q
            if (-not $exists -or $exists.Count -eq 0) {
                Invoke-Supabase -Method POST -Url $PlanosUrl -Body $p | Out-Null
                Good "Plano '$($p.nome)' inserido."
            } else { Info "Plano '$($p.nome)' já existe." }
        } catch {
            Warn "Não foi possível garantir plano '$($p.nome)': $($_.Exception.Message)"
        }
    }
} else {
    Warn "Pulo inserção de planos padrão porque tabela 'planos' não existe (execute SQL e reexecute script)."
}

# -------- Admin login (local) --------
function Prompt-Admin {
    $pwd = Read-Host -AsSecureString "Digite a senha de administrador (ou ENTER para usuário comum)"
    if ($pwd.Length -eq 0) { return $false }
    $plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pwd))
    if ($plain -eq $AdminPassword) { return $true } else { return $false }
}

$IsAdmin = Prompt-Admin
if ($IsAdmin) { Good "🔐 Acesso administrativo concedido." } else { Info "👤 Acesso usuário comum." }

# -------- Utility: display planos table nicely --------
function Show-Planos {
    param([switch]$OnlyActive)
    if (-not (Test-PlanosTable)) { Err "Tabela 'planos' não disponível."; return }
    try {
        $q = $PlanosUrl + "?select=id,nome,valor,periodicidade,ativo,created_at"
        if ($OnlyActive) { $q += "&ativo=eq.true" }
        $res = Invoke-Supabase -Method GET -Url $q
        if ($null -eq $res -or $res.Count -eq 0) {
            Info "Nenhum plano encontrado."
            return
        }
        $table = $res | Select-Object id, nome, @{Name='valor';Expression={[string]("{0:N2}" -f $_.valor)}}, periodicidade, ativo, created_at
        $table | Format-Table -AutoSize
    } catch {
        Err "Erro ao listar planos: $($_.Exception.Message)"
    }
}

# -------- Menu principal (interativo) --------
do {
    Write-Host ""
    Write-Host "==========================" -ForegroundColor Cyan
    Write-Host " UltraChat + UltraBiológico" -ForegroundColor Cyan
    Write-Host " Planos & Administração (v5)" -ForegroundColor Cyan
    Write-Host "=========================="
    Write-Host "1) Planos - Listar (público)"
    Write-Host "2) Planos - Criar (Admin)"
    Write-Host "3) Planos - Alterar (Admin)"
    Write-Host "4) Planos - Ativar/Desativar (Admin)"
    Write-Host "5) Menu UltraChat / UltraBiológico (exemplos)"
    Write-Host "6) Administrativo (ver variáveis, logs) (Admin)"
    Write-Host "0) Sair"
    $opt = Read-Host "Escolha uma opção (0-6)"

    switch ($opt) {
        '1' {
            Info "Listando planos públicos (ativos):"
            Show-Planos -OnlyActive
        }
        '2' {
            if (-not $IsAdmin) { Err "Ação restrita a administradores."; continue }
            $nome = Read-Host "Nome do plano"
            $valor = Read-Host "Valor (ex: 57.00)"
            $periodicidade = Read-Host "Periodicidade (mensal|trimestral|anual)"
            $ativo = $true
            if (-not (Test-PlanosTable)) { Err "Tabela 'planos' não existe. Rode o SQL em $SqlCreateFile e reexecute."; continue }
            try {
                $body = @{ nome = $nome; valor = [decimal]$valor; periodicidade = $periodicidade; ativo = $ativo }
                Invoke-Supabase -Method POST -Url $PlanosUrl -Body $body | Out-Null
                Good "Plano '$nome' criado."
            } catch {
                Err "Falha ao criar plano: $($_.Exception.Message)"
            }
        }
        '3' {
            if (-not $IsAdmin) { Err "Ação restrita a administradores."; continue }
            $id = Read-Host "ID do plano a alterar (use listar para ver IDs)"
            $nome = Read-Host "Novo nome (enter para manter)"
            $valor = Read-Host "Novo valor (ex: 150.00) (enter para manter)"
            $periodicidade = Read-Host "Nova periodicidade (enter para manter)"
            if (-not (Test-PlanosTable)) { Err "Tabela 'planos' não existe."; continue }
            $bodyHash = @{}
            if ($nome -ne "") { $bodyHash.nome = $nome }
            if ($valor -ne "") { $bodyHash.valor = [decimal]$valor }
            if ($periodicidade -ne "") { $bodyHash.periodicidade = $periodicidade }
            if ($bodyHash.Count -eq 0) { Info "Nada para alterar."; continue }
            try {
                $q = "$PlanosUrl?id=eq.$id"
                Invoke-Supabase -Method PATCH -Url $q -Body $bodyHash | Out-Null
                Good "Plano $id atualizado."
            } catch {
                Err "Erro ao atualizar plano: $($_.Exception.Message)"
            }
        }
        '4' {
            if (-not $IsAdmin) { Err "Ação restrita a administradores."; continue }
            $id = Read-Host "ID do plano a ativar/desativar"
            # fetch current
            try {
                $res = Invoke-Supabase -Method GET -Url "$PlanosUrl?id=eq.$id&select=ativo" 
                if ($null -eq $res -or $res.Count -eq 0) { Err "Plano $id não encontrado."; continue }
                $current = $res[0].ativo
                $new = -not $current
                Invoke-Supabase -Method PATCH -Url "$PlanosUrl?id=eq.$id" -Body @{ ativo = $new } | Out-Null
                if ($new) { Good "Plano $id ativado." } else { Good "Plano $id desativado." }
            } catch {
                Err "Erro ao alternar plano: $($_.Exception.Message)"
            }
        }
        '5' {
            Write-Host ""
            Write-Host ">>> Menu UltraChat / UltraBiológico (exemplo de ações)" -ForegroundColor Cyan
            Write-Host "a) Abrir UltraChat (exemplo)"
            Write-Host "b) Abrir UltraBiológico (exemplo)"
            Write-Host "c) Voltar"
            $sub = Read-Host "Escolha (a-c)"
            switch ($sub) {
                'a' { Info "Exemplo: acesse /ultrachat no seu site ou abra localmente http://localhost:3000/ultrachat" }
                'b' { Info "Exemplo: acesse /ultrabiologico ou /ultrahub no seu site" }
                default { Info "Retornando..." }
            }
        }
        '6' {
            if (-not $IsAdmin) { Err "Somente admin."; continue }
            Write-Host ""
            Write-Host ">>> Administrativo" -ForegroundColor Cyan
            Write-Host "1) Ver variáveis de ambiente carregadas"
            Write-Host "2) Ver último log"
            Write-Host "3) Abrir SQL de criação de tabelas (caminho local)"
            Write-Host "4) Atualizar preço rápido (ex: alterar preços padrão automaticamente)"
            Write-Host "0) Voltar"
            $adm = Read-Host "Escolha (0-4)"
            switch ($adm) {
                '1' {
                    Write-Host "Variáveis detectadas:"
                    Write-Host "NEXT_PUBLIC_SUPABASE_URL = $SupabaseUrl"
                    Write-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY = (hidden)"
                    Write-Host "SUPABASE_SERVICE_ROLE_KEY = (hidden)"
                    Write-Host "NEXT_PUBLIC_VERCEL_URL = $VercelUrl"
                }
                '2' {
                    if (Test-Path $LogFile) {
                        Write-Host "Últimas 200 linhas do log: $LogFile"
                        Get-Content $LogFile -Tail 200
                    } else { Info "Nenhum log encontrado." }
                }
                '3' {
                    if (Test-Path $SqlCreateFile) {
                        Write-Host "Arquivo SQL para criar a tabela: $SqlCreateFile"
                        Write-Host "Abra o SQL Editor do Supabase e cole/execute este arquivo."
                    } else { Info "Arquivo SQL não existe (já existia tabela?)." }
                }
                '4' {
                    # quick bulk update: set standardized prices
                    $m = Read-Host "Inserir novos valores (mensal, trimestral, anual) separados por vírgula (ex: 57,150,547.2)"
                    if ($m -match '^\s*([0-9]+(?:\.[0-9]+)?)\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*$') {
                        $m1 = [decimal]$matches[1]; $m2 = [decimal]$matches[2]; $m3 = [decimal]$matches[3]
                        if (-not (Test-PlanosTable)) { Err "Tabela 'planos' não existe."; continue }
                        try {
                            # update by name
                            Invoke-Supabase -Method PATCH -Url "$PlanosUrl?nome=eq.Mensal" -Body @{ valor = $m1 } | Out-Null
                            Invoke-Supabase -Method PATCH -Url "$PlanosUrl?nome=eq.Trimestral" -Body @{ valor = $m2 } | Out-Null
                            Invoke-Supabase -Method PATCH -Url "$PlanosUrl?nome=eq.Anual" -Body @{ valor = $m3 } | Out-Null
                            Good "Preços atualizados: Mensal=$m1 Trimestral=$m2 Anual=$m3"
                        } catch {
                            Err "Erro ao atualizar preços: $($_.Exception.Message)"
                        }
                    } else { Warn "Formato inválido." }
                }
                default { Info "Voltando..." }
            }
        }
        '0' {
            Info "Saindo..."; break
        }
        default { Warn "Opção inválida." }
    }
} while ($true)

Info "Fim do script. Logs gravados em $LogFile"
