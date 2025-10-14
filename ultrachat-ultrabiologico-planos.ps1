# Caminho sugerido: C:\Users\Administrador\pecuariatech\ultrachat-ultrabiologico-planos.ps1

Write-Host "🚀 Iniciando UltraChat + UltraBiológico Planos Interativo..." -ForegroundColor Cyan
Start-Sleep -Seconds 1

# --- Validação do .env.local ---
if (-not (Test-Path '.env.local')) {
    Write-Host "⚠️ Arquivo .env.local não encontrado!" -ForegroundColor Yellow
} else {
    Write-Host "✅ Variáveis de ambiente detectadas (.env.local)" -ForegroundColor Green
}

# --- Criação de pastas básicas ---
$pastas = @(
    "app\ultrachat",
    "app\ultrabiologico2",
    "app\ultrahub",
    "app\components",
    "app\api\chat",
    "app\api\ultrabiologico",
    "app\api\clima",
    "app\api\autonomo",
    "app\api\sensor",
    "sql"
)

foreach ($pasta in $pastas) {
    if (-not (Test-Path $pasta)) {
        New-Item -ItemType Directory -Path $pasta -Force | Out-Null
        Write-Host "📁 Pasta criada: $pasta" -ForegroundColor Green
    }
}

# --- Função de acesso administrativo ---
function Get-AdminAccess {
    param (
        [string]$Senha
    )
    $senhaCorreta = "36@Artropodes" # altere para sua senha segura
    if ($Senha -eq $senhaCorreta) {
        Write-Host "🔐 Acesso de administrador concedido." -ForegroundColor Cyan
        return $true
    } else {
        Write-Host "❌ Senha incorreta!" -ForegroundColor Red
        return $false
    }
}

# --- Função de gestão de planos ---
function GerirPlanos {
    param (
        [switch]$AdminMode
    )

    while ($true) {
        Write-Host "`n=== Menu de Planos ==="
        Write-Host "1 - Listar planos (todos os usuários)"
        Write-Host "2 - Criar novo plano (Admin)"
        Write-Host "3 - Alterar plano existente (Admin)"
        Write-Host "4 - Desativar plano (Admin)"
        Write-Host "0 - Sair"

        $opcao = Read-Host "Escolha uma opção"

        switch ($opcao) {
            "1" {
                Write-Host "📄 Listando planos disponíveis..." -ForegroundColor Green
                # Consulta supabase (exemplo de comando)
                supabase db query "SELECT * FROM planos;"
            }
            "2" {
                if ($AdminMode) {
                    $nomePlano = Read-Host "Nome do plano"
                    $valorPlano = Read-Host "Valor do plano"
                    $periodo = Read-Host "Periodicidade (mensal, trimestral, anual)"
                    supabase db query "INSERT INTO planos (nome, valor, periodo) VALUES ('$nomePlano', '$valorPlano', '$periodo');"
                    Write-Host "✅ Plano criado com sucesso!"
                } else { Write-Host "❌ Apenas administrador pode criar planos." -ForegroundColor Red }
            }
            "3" {
                if ($AdminMode) {
                    $idPlano = Read-Host "ID do plano a alterar"
                    $novoValor = Read-Host "Novo valor"
                    $novoPeriodo = Read-Host "Nova periodicidade"
                    supabase db query "UPDATE planos SET valor='$novoValor', periodo='$novoPeriodo' WHERE id=$idPlano;"
                    Write-Host "✅ Plano atualizado!"
                } else { Write-Host "❌ Apenas administrador pode alterar planos." -ForegroundColor Red }
            }
            "4" {
                if ($AdminMode) {
                    $idPlano = Read-Host "ID do plano a desativar"
                    supabase db query "UPDATE planos SET ativo=false WHERE id=$idPlano;"
                    Write-Host "✅ Plano desativado!"
                } else { Write-Host "❌ Apenas administrador pode desativar planos." -ForegroundColor Red }
            }
            "0" { break }
            default { Write-Host "⚠️ Opção inválida!" -ForegroundColor Yellow }
        }
    }
}

# --- Execução principal ---
$senha = Read-Host "Digite a senha de administrador (deixe em branco para usuário comum)"
$adminMode = $false
if ($senha) { $adminMode = Get-AdminAccess -Senha $senha }

GerirPlanos -AdminMode:$adminMode

Write-Host "🏁 Script finalizado." -ForegroundColor Cyan
