# PecuariaTech-Service v9.5.4 (SAFE MODE)

$basePath = "C:\Users\Administrador\pecuariatech"
$outputHistory = Join-Path $basePath "HISTORICO_DEV_PECUARIATECH.txt"
$outputLog = Join-Path $basePath "PecuariaTech_Triangulo360_Log.txt"

Write-Host "Iniciando PecuariaTech-Service v9.5.4..."

# ============================================
# TRIANGULO 360
# ============================================

"===============================" | Out-File $outputLog
"TRIANGULO 360 CHECK" | Out-File $outputLog -Append
"===============================" | Out-File $outputLog -Append
"Data: $(Get-Date)" | Out-File $outputLog -Append
"" | Out-File $outputLog -Append

Write-Host "Teste 1 - Rede..."

try {
    $rede = Test-Connection -ComputerName "8.8.8.8" -Count 2 -Quiet
    if ($rede -eq $true) {
        Write-Host "Rede OK"
        "Rede OK" | Out-File $outputLog -Append
    } else {
        Write-Host "Rede falhou"
        "Rede FALHOU" | Out-File $outputLog -Append
        exit
    }
}
catch {
    Write-Host "Erro no teste de rede"
    "Erro no teste de rede" | Out-File $outputLog -Append
    exit
}

Write-Host "Teste 2 - DNS..."

try {
    Resolve-DnsName "supabase.com" -ErrorAction Stop
    Write-Host "DNS OK"
    "DNS OK" | Out-File $outputLog -Append
}
catch {
    Write-Host "DNS falhou"
    "DNS FALHOU" | Out-File $outputLog -Append
    exit
}

Write-Host "Teste 3 - REST..."

try {
    $response = Invoke-WebRequest -Uri "https://supabase.com" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
        Write-Host "REST OK"
        "REST OK" | Out-File $outputLog -Append
    } else {
        Write-Host "REST falhou"
        "REST FALHOU" | Out-File $outputLog -Append
        exit
    }
}
catch {
    Write-Host "REST falhou"
    "REST FALHOU" | Out-File $outputLog -Append
    exit
}

"" | Out-File $outputLog -Append
"Triangulo 360 OK" | Out-File $outputLog -Append
"" | Out-File $outputLog -Append

Write-Host "Triangulo aprovado"

# ============================================
# HISTORICO DO DEV
# ============================================

Write-Host "Gerando historico do projeto..."

Get-ChildItem -Path "$basePath\*" -Recurse |
Where-Object { $_.Extension -in @(".ts", ".tsx", ".ps1", ".sql", ".json") } |
Select-Object FullName, Length, LastWriteTime |
Sort-Object LastWriteTime -Descending |
Out-File -FilePath $outputHistory -Encoding ASCII

Write-Host "Historico gerado em:"
Write-Host $outputHistory

"" | Out-File $outputLog -Append
"Historico DEV atualizado" | Out-File $outputLog -Append

Write-Host "Script finalizado"
Write-Host "Log salvo em:"
Write-Host $outputLog
