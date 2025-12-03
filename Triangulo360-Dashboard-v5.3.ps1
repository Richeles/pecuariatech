try {
    # Força o nome da tabela na URL sem erro de interpolação
    $Tabela = "triangulo_monitor"
    $url = "$SupabaseUrl/rest/v1/$Tabela?select=*"

    $headers = @{
        apikey = $ApiKey
        Authorization = "Bearer $ApiKey"
    }

    $res = Invoke-RestMethod -Uri $url -Headers $headers -ErrorAction Stop

    if (-not $res) {
        throw "Sem dados retornados da tabela triangulo_monitor."
    }

    Escrever-Linha "`n📊 Resultado atual — $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" "Yellow"
    Escrever-Linha "--------------------------------------------------------------" "DarkGray"
    Escrever-Linha ("{0,-12} {1,-4} {2,8} {3,8} {4,8} {5,10} {6}" -f `
        "Módulo", "Sts", "Testes", "OK", "Falhas", "Média", "Última Execução") "Gray"
    Escrever-Linha "--------------------------------------------------------------" "DarkGray"

    foreach ($m in $res) {
        Mostrar-LinhaTabela $m
    }

    Escrever-Linha "--------------------------------------------------------------" "DarkGray"

    # Salva log local
    $res | Export-Csv -Path $LogFile -NoTypeInformation -Force -Encoding UTF8
    Escrever-Linha "`n📜 Log salvo em $LogFile" "Yellow"

    # Status geral
    $falhas = $res | Where-Object { $_.total_falhas -gt 0 }
    if ($falhas.Count -gt 0) {
        Escrever-Linha "🟠 Sistema com falhas registradas em alguns módulos." "Yellow"
    } else {
        Escrever-Linha "🟢 Sistema estável — Nenhuma falha detectada!" "Green"
    }

} catch {
    Escrever-Linha "❌ Erro ao conectar ao Supabase: $_" "Red"
}
