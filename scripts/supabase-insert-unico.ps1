# ------------------------------
# Supabase Insert Script Único - Rebanho Ultrabiológico
# ------------------------------

Write-Host "[INFO] Iniciando script de inserção no Supabase..." -ForegroundColor Cyan

# ---------- CONFIGURAÇÃO ----------
# URL do Supabase (substitua pelo seu projeto)
$SupabaseUrl = "https://kpzzekflqpoeccnqfkng.supabase.co"
$Table = "rebanho"

# Headers com Service Role Key
$Headers = @{
    "apikey"        = $env:SUPABASE_SERVICE_ROLE_KEY
    "Authorization" = "Bearer $env:SUPABASE_SERVICE_ROLE_KEY"
    "Content-Type"  = "application/json"
    "Prefer"        = "return=representation"
}

# Lista de bovinos para inserir
$Bovinos = @(
    @{
        nome         = "Boi Exemplo 1"
        raca         = "Nelore"
        cruzamento   = "Nelore x Angus"
        clima_ideal  = "Tropical"
        peso_inicial = 340
        peso_atual   = 350
        data_entrada = "2025-09-12"
        pastagem_id  = "00000000-0000-0000-0000-000000000000" # substitua pelo ID real
    },
    @{
        nome         = "Boi Exemplo 2"
        raca         = "Angus"
        cruzamento   = "Angus Puro"
        clima_ideal  = "Temperado"
        peso_inicial = 300
        peso_atual   = 315
        data_entrada = "2025-09-13"
        pastagem_id  = "00000000-0000-0000-0000-000000000001" # substitua pelo ID real
    }
)

# ---------- FUNÇÃO DE ENVIO ----------
function Enviar-Bovino {
    param(
        [hashtable]$Bovino
    )

    $Json = $Bovino | ConvertTo-Json -Depth 10 -Compress

    try {
        $Response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/$Table" `
            -Method Post `
            -Headers $Headers `
            -Body $Json

        Write-Host "[SUCESSO] Registro inserido: $($Bovino.nome)" -ForegroundColor Green
        return $Response
    }
    catch {
        Write-Host "[ERRO] Falha ao inserir: $($Bovino.nome) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ---------- EXECUÇÃO ----------
foreach ($B in $Bovinos) {
    Enviar-Bovino -Bovino $B
}

Write-Host "[INFO] Script finalizado." -ForegroundColor Cyan
