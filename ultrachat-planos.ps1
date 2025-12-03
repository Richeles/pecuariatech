Write-Host '🚀 Gerenciamento de Planos UltraChat - PecuariaTech' -ForegroundColor Cyan
Start-Sleep -Seconds 1

# Verifica se Supabase CLI está instalado
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host '⚠️ Supabase CLI não encontrado. Instalando...' -ForegroundColor Yellow
    npm install -g supabase
}

function Update-PlanosSupabase {
    param (
        [string],
        [string],
        [string] = '',
        [string] = ''
    )

    # Variáveis de ambiente do Supabase
     = (Get-Content '.env.local' | Select-String 'NEXT_PUBLIC_SUPABASE_URL' | ForEach-Object {.Line.Split('=')[1].Trim()})
     = (Get-Content '.env.local' | Select-String 'SUPABASE_SERVICE_ROLE_KEY' | ForEach-Object {.Line.Split('=')[1].Trim()})

    switch () {
        'create' {
            Write-Host "Criando plano '' no Supabase..."
            supabase db query "INSERT INTO planos (nome, valor, periodo, ativo) VALUES ('','','', TRUE);"
        }
        'update' {
            Write-Host "Alterando plano '' no Supabase..."
            supabase db query "UPDATE planos SET valor='', periodo='' WHERE nome='';"
        }
        'deactivate' {
            Write-Host "Desativando plano '' no Supabase..."
            supabase db query "UPDATE planos SET ativo=FALSE WHERE nome='';"
        }
    }
}

# Solicita senha de administrador
 = Read-Host 'Digite a senha de administrador para acesso total'
 = 'SENHA_SUPER_ADMIN'  # Substitua pela sua senha segura

if ( -eq ) {
    Write-Host '✅ Acesso total concedido ao administrador!' -ForegroundColor Green

    while (True) {
        Write-Host "
📋 Menu de Planos:"
        Write-Host "1 - Criar plano"
        Write-Host "2 - Alterar plano"
        Write-Host "3 - Desativar plano"
        Write-Host "4 - Listar planos"
        Write-Host "5 - Sair"
         = Read-Host 'Escolha uma opção'

        switch () {
            '1' {
                 = Read-Host 'Nome do plano'
                 = Read-Host 'Valor do plano'
                 = Read-Host 'Mensal, Trimestral ou Anual'
                Update-PlanosSupabase -action 'create' -nomePlano  -valorPlano  -periodo 
            }
            '2' {
                 = Read-Host 'Nome do plano que deseja alterar'
                 = Read-Host 'Novo valor'
                 = Read-Host 'Novo periodo'
                Update-PlanosSupabase -action 'update' -nomePlano  -valorPlano  -periodo 
            }
            '3' {
                 = Read-Host 'Nome do plano que deseja desativar'
                Update-PlanosSupabase -action 'deactivate' -nomePlano 
            }
            '4' {
                Write-Host '📄 Lista de planos no Supabase:'
                supabase db query "SELECT * FROM planos;"
            }
            '5' {
                Write-Host 'Saindo...' -ForegroundColor Cyan
                break
            }
            default {
                Write-Host '❌ Opção inválida' -ForegroundColor Red
            }
        }
    }

} else {
    Write-Host '❌ Senha incorreta! Acesso negado.' -ForegroundColor Red
}
