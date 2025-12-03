param(
    [string]$JsonFolder = "C:\Users\Administrador\pecuariatech\out",
    [string]$BaseUrl = "https://www.pecuariatech.com",
    [string]$Endpoint = "/api/tri360/logs",
    [switch]$Verbose,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

$TOKEN = $env:TRI360_WEBHOOK_TOKEN
$DEVICE = $env:TRI360_DEVICE_ID; if (-not $DEVICE) { $DEVICE = "UBI-TRI360-DEFAULT" }

if (-not $TOKEN) { throw "Defina a variável de ambiente TRI360_WEBHOOK_TOKEN" }

$fullUrl = "$BaseUrl$Endpoint"
$headers = @{ "Authorization" = "Bearer $TOKEN"; "Content-Type" = "application/json" }

Write-Host "`n🔹 1) Testando métodos aceitos (OPTIONS)..." -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Method Options $fullUrl -Headers $headers
    Write-Host "StatusCode: $($r.StatusCode)" -ForegroundColor Green
    Write-Host "Allow: $($r.Headers['Allow'] ?? 'n/a')" -ForegroundColor Yellow
} catch {
    Write-Host "Falha no OPTIONS: $_" -ForegroundColor Red
}

Write-Host "`n🔹 2) Teste POST de payload mínimo..." -ForegroundColor Cyan
$payloadTest = @{
    device_id='UBI-TRI360-TEST'; tri_alpha=0.1; tri_beta=0.2; tri_gamma=0.3;
    tri_omega=0.4; tri_threshold=0.75; tri_cycle=1; at=(Get-Date).ToString('o')
} | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Method POST -Uri $fullUrl -Headers $headers -Body $payloadTest
    Write-Host "POST de teste OK: $(ConvertTo-Json $resp)" -ForegroundColor Green
} catch {
    $code = 0; try { $code = [int]$_.Exception.Response.StatusCode } catch {}
    $allow = $null; try { $allow = $_.Exception.Response.Headers['Allow'] } catch {}
    Write-Host "Falha no POST: HTTP $code — Allow: $($allow ?? 'n/a')" -ForegroundColor Red
    Write-Host "⚠️ Corrija o backend ou proxy antes de enviar os JSONs." -ForegroundColor Yellow
    exit 1
}

# Se chegar aqui, o POST funcionou
Write-Host "`n🔹 3) Enviando arquivos JSON da pasta '$JsonFolder'..." -ForegroundColor Cyan

if (-not (Test-Path $JsonFolder)) { throw "Pasta JSON não encontrada: $JsonFolder" }

$files = Get-ChildItem -Path $JsonFolder -Filter "*.json"
if ($files.Count -eq 0) { Write-Host "Nenhum arquivo JSON encontrado."; exit 0 }

foreach ($f in $files) {
    try {
        $jsonContent = Get-Content $f.FullName -Raw
        if ($DryRun) {
            Write-Host "DRYRUN → $($f.Name)" -ForegroundColor DarkCyan
        } else {
            $resp = Invoke-RestMethod -Method POST -Uri $fullUrl -Headers $headers -Body $jsonContent
            Write-Host "✅ Enviado: $($f.Name) | id=$(($resp.id ?? '—')) | risco=$(($resp.risco ?? '—'))" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Falha ao enviar: $($f.Name) :: $_" -ForegroundColor Red
    }
}

Write-Host "`n✅ Processo concluído." -ForegroundColor Cyan
