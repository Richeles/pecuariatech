<#
.SYNOPSIS
  UltraChat + UltraBiológico - Planos Interativo (v3)
.DESCRIPTION
  Script PowerShell para gerenciar planos (Supabase REST).
  - Autenticação admin: 36@Artropodes
  - Salve em: C:\Users\Administrador\pecuariatech\ultrachat-ultrabiologico-planos-v3.ps1
  - Execute: Set-ExecutionPolicy Bypass -Scope Process -Force ; powershell -ExecutionPolicy Bypass -File .\ultrachat-ultrabiologico-planos-v3.ps1
#>

Write-Host "🚀 Iniciando UltraChat + UltraBiológico — Planos Interativo (v3)..." -ForegroundColor Cyan

# ---------------------------
# Helpers
# ---------------------------
function Write-Ok($m){ Write-Host "✅ $m" -ForegroundColor Green }
function Write-Info($m){ Write-Host "ℹ️  $m" -ForegroundColor Cyan }
function Write-Warn($m){ Write-Host "⚠️  $m" -ForegroundColor Yellow }
function Write-Err($m){ Write-Host "❌ $m" -ForegroundColor Red }

# ---------------------------
# Carregar .env.local (se existir)
# ---------------------------
$envFile = Join-Path (Get-Location) ".env.local"
if (Test-Path $envFile) {
    try {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match "^\s*([^#\s=]+)\s*=\s*(.+?)\s*$") {
                $key = $matches[1]; $val = $matches[2]
                # Remove quotes ao redor se houver
                if ($val.StartsWith('"') -and $val.EndsWith('"')) { $val = $val.Trim('"') }
                [System.Environment]::SetEnvironmentVariable($key, $val)
            }
        }
        Write-Ok "Variáveis de ambiente carregadas de $envFile"
    } catch {
        Write-Warn "Falha ao ler $envFile: $_"
    }
} else {
    Write-Warn "$envFile não encontrado. O script usará variáveis de ambiente já definidas."
}

# ---------------------------
# Ler variáveis
# ---------------------------
$SupabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$SupabaseAnon = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
$SupabaseServiceKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $SupabaseUrl) { Write-Err "NEXT_PUBLIC_SUPABASE_URL ausente. Defina no .env.local ou nas variáveis de ambiente."; }
if (-not $SupabaseServiceKey) { Write-Warn "SUPABASE_SERVICE_ROLE_KEY ausente. Operações de criação/alteração requerem service role."; }

# normalizar URL (remover barra final)
if ($SupabaseUrl) { $SupabaseUrl = $SupabaseUrl.TrimEnd('/') }

$baseUrl = if ($SupabaseUrl) { "$SupabaseUrl/rest/v1/planos" } else { $null }

# ---------------------------
# Função de requisição ao Supabase (tratamento de erros)
# ---------------------------
function Invoke-SupabaseRest {
    param(
        [Parameter(Mandatory=$true)][ValidateSet("GET","POST","PATCH","DELETE")] [string]$Method,
        [Parameter(Mandatory=$true)][string]$Url,
        [Object]$Body = $null
    )
    if (-not $SupabaseServiceKey) {
        throw "SUPABASE_SERVICE_ROLE_KEY não definido. Não posso executar chamadas protegidas."
    }

    $headers = @{
        "apikey" = $SupabaseServiceKey
        "Authorization" = "Bearer $SupabaseServiceKey"
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
        # Formatar mensagem legível
        $err = $_
        if ($err.Exception -and $err.Exception.Response -and $err.Exception.Response.StatusCode) {
            $status = [int]$err.Exception.Response.StatusCode.Value__
            $msg = $err.Exception.Response.StatusDescription
            throw "HTTP $status - $msg : $($_.Exception.Message)"
        } else {
            throw $_.Exception.Message
        }
    }
}

# ---------------------------
# Teste de conexão simples (GET 1)
# ---------------------------
if (-not $baseUrl) {
    Write-Err "URL base Supabase indefinida. Abortando."
    exit 1
}

try {
    Write-Info "Testando conexão com Supabase..."
    # tentar selecionar 1 registro (não falha se tabela não existir, mas podemos capturar erro)
    $test = Invoke-SupabaseRest -Method GET -Url "$baseUrl?select=id&limit=1"
    Write-Ok "Conexão ao Supabase OK (chave válida para REST)."
} catch {
    $m = $_
    Write-Err "Falha ao conectar ao Supabase REST: $m"
    Write-Warn "Verifique SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL no .env.local / Vercel."
    # Não abortamos ainda; vamos permitir que o usuário veja instruções
}

# ---------------------------
# SQL para criar tabela 'planos' (se precisar executar manualmente)
# ---------------------------
$createTableSQL = @"
CREATE TABLE IF NOT EXISTS public.planos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  periodicidade TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at timestamptz DEFAULT now()
);
"@

# ---------------------------
# Função: checar se a tabela existe (tentativa via GET)
# ---------------------------
function Table-Exists {
    param([string]$tableName)
    try {
        # tenta pegar 1 row — se tabela não existir, o Supabase retorna 404/4xx
        Invoke-SupabaseRest -Method GET -Url "$SupabaseUrl/rest/v1/$tableName?select=id&limit=1" | Out-Null
        return $true
    } catch {
        return $false
    }
}

# ---------------------------
# Inicializar tabela 'planos' (se não existir)
# ---------------------------
function Ensure-Planos {
    if (Table-Exists -tableName "planos") {
        Write-Ok "Tabela 'planos' encontrada."
        return $true
    } else {
        Write-Warn "Tabela 'planos' não encontrada no Supabase."
        Write-Host ""
        Write-Host "→ SQL para criar a tabela (execute no Supabase SQL Editor):" -ForegroundColor Yellow
        Write-Host $createTableSQL -ForegroundColor White
        Write-Host ""
        Write-Warn "Se quiser que o script tente criar automaticamente a tabela, defina SUPABASE_SERVICE_ROLE_KEY corretamente e rode novamente."
        return $false
    }
}

$planTableReady = Ensure-Planos

# ---------------------------
# Pre-cadastrar planos padrão (apenas se tabela existir)
# ---------------------------
$defaultPlans = @(
    @{ nome = "Mensal"; valor = 57.00; periodicidade = "mensal"; ativo = $true },
    @{ nome = "Trimestral"; valor = 150.00; periodicidade = "trimestral"; ativo = $true },
    @{ nome = "Anual"; valor = 547.20; periodicidade = "anual"; ativo = $true }
)

function Seed-DefaultPlans {
    if (-not $planTableReady) {
        Write-Warn "Não foi possível inserir planos automáticos porque a tabela 'planos' não existe."
        return
    }
    foreach ($p in $defaultPlans) {
        try {
            # checar existência por nome
            $q = "$baseUrl?nome=eq.$($p.nome)&select=id"
            $exist = Invoke-SupabaseRest -Method GET -Url $q
            if (-not $exist -or $exist.Count -eq 0) {
                Invoke-SupabaseRest -Method POST -Url $baseUrl -Body $p | Out-Null
                Write-Ok "Plano '$($p.nome)' criado."
            } else {
                Write-Info "Plano '$($p.nome)' já existe."
            }
        } catch {
            Write-Warn "Falha ao criar plano '$($p.nome)': $_"
        }
    }
}

Seed-DefaultPlans

# ---------------------------
# Auth admin (senha fixa)
# ---------------------------
$adminPassword = "36@Artropodes"

# Ler senha com Read-Host (mas sem eco se admin)
$inputPwd = Read-Host "Digite a senha de administrador (deixe em branco para usuário comum)"

# Normalizar (evitar espaços acidentais)
if ($inputPwd) { $inputPwd = $inputPwd.Trim() }

$isAdmin = $false
try {
    # comparar bytes UTF8 para evitar problema de encoding
    $bytesInput = [System.Text.Encoding]::UTF8.GetBytes($inputPwd)
    $bytesAdmin = [System.Text.Encoding]::UTF8.GetBytes($adminPassword)
    if ($bytesInput.Length -eq $bytesAdmin.Length) {
        $eq = $true
        for ($i=0; $i -lt $bytesAdmin.Length; $i++) {
            if ($bytesAdmin[$i] -ne $bytesInput[$i]) { $eq = $false; break }
        }
        if ($eq) { $isAdmin = $true; Write-Ok "🔐 Acesso de administrador concedido." }
        else { Write-Warn "❌ Senha incorreta — acesso de usuário comum." }
    } else {
        if (-not $inputPwd) { Write-Info "👤 Você entrou como usuário comum (sem senha)." }
        else { Write-Warn "❌ Senha incorreta — acesso de usuário comum." }
    }
} catch {
    Write-Warn "Erro na verificação de senha — entrando como usuário comum."
}

# ---------------------------
# Menu interativo
# ---------------------------
function Show-Menu {
    Write-Host ""
    Write-Host "=== Menu de Planos ==="
    Write-Host "1 - Listar planos (todos os usuários)"
    if ($isAdmin) {
        Write-Host "2 - Criar novo plano (Admin)"
        Write-Host "3 - Alterar plano existente (Admin)"
        Write-Host "4 - Desativar plano (Admin)"
    }
    Write-Host "0 - Sair"
}

do {
    Show-Menu
    $option = Read-Host "Escolha uma opção"
    switch ($option) {
        "1" {
            if (-not $planTableReady) { Write-Warn "Tabela 'planos' não pronta. Rode o SQL no Supabase e tente novamente."; break }
            try {
                $rows = Invoke-SupabaseRest -Method GET -Url "$baseUrl?select=id,nome,valor,periodicidade,ativo,created_at"
                if ($rows -and $rows.Count -gt 0) {
                    $rows | Sort-Object -Property periodicidade, nome | Format-Table id, nome, valor, periodicidade, ativo, created_at -AutoSize
                } else {
                    Write-Info "Nenhum plano encontrado."
                }
            } catch {
                Write-Err "Erro ao listar planos: $_"
            }
        }
        "2" {
            if (-not $isAdmin) { Write-Warn "Somente admin pode criar planos."; break }
            if (-not $planTableReady) { Write-Warn "Tabela 'planos' não pronta. Rode o SQL no Supabase e tente novamente."; break }
            $nome = Read-Host "Nome do plano"
            $valor = Read-Host "Valor (ex: 57.00)"
            $periodicidade = Read-Host "Periodicidade (mensal, trimestral, anual)"
            if (-not $nome -or -not $valor -or -not $periodicidade) { Write-Warn "Campos obrigatórios faltando."; break }
            $body = @{ nome = $nome; valor = [decimal]$valor; periodicidade = $periodicidade; ativo = $true }
            try {
                Invoke-SupabaseRest -Method POST -Url $baseUrl -Body $body | Out-Null
                Write-Ok "Plano '$nome' criado."
            } catch {
                Write-Err "Falha ao criar plano: $_"
            }
        }
        "3" {
            if (-not $isAdmin) { Write-Warn "Somente admin pode alterar planos."; break }
            if (-not $planTableReady) { Write-Warn "Tabela 'planos' não pronta. Rode o SQL no Supabase e tente novamente."; break }
            $id = Read-Host "ID do plano (ver listar para obter ID)"
            $nome = Read-Host "Novo nome (deixe vazio para não alterar)"
            $valor = Read-Host "Novo valor (deixe vazio para não alterar)"
            $periodicidade = Read-Host "Nova periodicidade (deixe vazio para não alterar)"
            $patch = @{}
            if ($nome) { $patch.nome = $nome }
            if ($valor) { $patch.valor = [decimal]$valor }
            if ($periodicidade) { $patch.periodicidade = $periodicidade }
            if ($patch.Keys.Count -eq 0) { Write-Warn "Nada para alterar."; break }
            try {
                Invoke-SupabaseRest -Method PATCH -Url "$baseUrl?id=eq.$id" -Body $patch | Out-Null
                Write-Ok "Plano $id atualizado."
            } catch {
                Write-Err "Falha ao alterar plano: $_"
            }
        }
        "4" {
            if (-not $isAdmin) { Write-Warn "Somente admin pode desativar planos."; break }
            if (-not $planTableReady) { Write-Warn "Tabela 'planos' não pronta. Rode o SQL no Supabase e tente novamente."; break }
            $id = Read-Host "ID do plano a desativar"
            try {
                Invoke-SupabaseRest -Method PATCH -Url "$baseUrl?id=eq.$id" -Body @{ ativo = $false } | Out-Null
                Write-Ok "Plano $id desativado."
            } catch {
                Write-Err "Falha ao desativar plano: $_"
            }
        }
        "0" {
            Write-Host "🏁 Saindo..." -ForegroundColor Cyan
        }
        default {
            Write-Warn "Opção inválida."
        }
    }
} while ($option -ne "0")

# ---------------------------
# Final
# ---------------------------
Write-Ok "Script finalizado. Confira o Supabase e o painel do PecuariaTech."
Write-Host ""
Write-Info "Se a tabela 'planos' não existia, rode o SQL acima no Supabase SQL Editor e então reexecute este script."
