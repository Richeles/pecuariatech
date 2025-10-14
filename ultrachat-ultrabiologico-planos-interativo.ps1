Write-Host '🚀 UltraChat + UltraBiológico - Gestão de Planos Interativa' -ForegroundColor Cyan
Start-Sleep -Seconds 1

# Função para atualizar planos no Supabase
function Update-PlanosSupabase {
    param (
        [string],
        [string],
        [string] = '',
        [string] = ''
    )

    switch () {
        'create' {
            supabase db query "INSERT INTO planos (nome, valor, periodo, ativo) VALUES ('','','', TRUE);"
        }
        'update' {
            supabase db query "UPDATE planos SET valor='', periodo='' WHERE nome='';"
        }
        'deactivate' {
            supabase db query "UPDATE planos SET ativo=FALSE WHERE nome='';"
        }
    }
}

# Função para mostrar planos ativos
function Show-PlanosCliente {
     = supabase db query "SELECT id, nome, valor, periodo FROM planos WHERE ativo=TRUE;" | ConvertFrom-Json
    Write-Host "
📄 Planos ativos disponíveis:" -ForegroundColor Cyan

     = 1
    foreach ( in ) {
        Write-Host " - Nome:  | Valor:  | Período: " -ForegroundColor Green
        ++
    }

     = Read-Host "
Digite o número do plano que deseja escolher ou Enter para sair"
    if ( -match '^\d+$' -and  -le .Count) {
         = [ - 1]
        Write-Host "✅ Você selecionou o plano:  - Valor:  - Período: " -ForegroundColor Yellow
    } else {
        Write-Host "Saindo da visualização de planos..." -ForegroundColor Cyan
    }
}

# Solicita senha de administrador
 = Read-Host 'Digite a senha de administrador'
 = 'SENHA_SUPER_ADMIN'  # Substitua pela sua senha real

if ( -eq ) {
    Write-Host '✅ Acesso total concedido!' -ForegroundColor Green

    while (True) {
        Write-Host "
📋 Menu Administrador:"
        Write-Host "1 - Criar plano"
        Write-Host "2 - Alterar plano"
        Write-Host "3 - Desativar plano"
        Write-Host "4 - Listar todos os planos"
        Write-Host "5 - Mostrar planos interativos para cliente"
        Write-Host "6 - Sair"
         = Read-Host 'Escolha uma opção'

        switch () {
            '1' {
                 = Read-Host 'Nome do plano'
                 = Read-Host 'Valor do plano'
                 = Read-Host 'Mensal, Trimestral ou Anual'
                Update-PlanosSupabase -Action 'create' -NomePlano  -ValorPlano  -Periodo 
            }
            '2' {
                 = Read-Host 'Nome do plano que deseja alterar'
                 = Read-Host 'Novo valor'
                 = Read-Host 'Novo período'
                Update-PlanosSupabase -Action 'update' -NomePlano  -ValorPlano  -Periodo 
            }
            '3' {
                 = Read-Host 'Nome do plano que deseja desativar'
                Update-PlanosSupabase -Action 'deactivate' -NomePlano 
            }
            '4' {
                Write-Host '📄 Lista completa de planos:'
                supabase db query "SELECT * FROM planos;"
            }
            '5' {
                Show-PlanosCliente
            }
            '6' {
                Write-Host 'Saindo...' -ForegroundColor Cyan
                break
            }
            default {
                Write-Host '❌ Opção inválida' -ForegroundColor Red
            }
        }
    }

} else {
    Write-Host '🔒 Acesso de cliente - visualizando planos ativos apenas:' -ForegroundColor Yellow
    Show-PlanosCliente
}
