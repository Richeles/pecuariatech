# list_tables_supabase.ps1
# Autor: Richeles + GPT-5
# Objetivo: listar tabelas do banco remoto Supabase (sem usar operadores incompatíveis no PowerShell)

# Função de log simples
function Log($level, $message) {
    $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$time] [$level] $message"
}

Log "INFO" "Iniciando listagem de tabelas do banco Supabase remoto..."

try {
    # Verifica se projeto está vinculado
    $linkedProject = supabase link status 2>$null
    if (-not $linkedProject) {
        Log "ERRO" "Nenhum projeto vinculado. Execute: supabase link --project-ref kpzzekflqpoeccnqfkng"
        exit 1
    }

    # Cria comando SQL temporário
    $sqlFile = ".\list_tables_temp.sql"
    "\dt" | Out-File -Encoding utf8 $sqlFile

    Log "INFO" "Executando comando no banco remoto..."

    # Executa via CLI (sem <)
    $output = & supabase db remote psql --linked --file $sqlFile 2>&1

    # Salva resultado
    $output | Out-File -Encoding utf8 "tabelas_supabase.txt"

    # Limpa arquivo temporário
    Remove-Item $sqlFile -ErrorAction SilentlyContinue

    Log "OK" "Listagem concluída. Verifique o arquivo: tabelas_supabase.txt"
}
catch {
    Log "ERRO" "Falha ao listar tabelas: $($_.Exception.Message)"
}
