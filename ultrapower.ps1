Write-Host "==== ULTRAPOWER X-RESET INICIADO ====" -ForegroundColor Cyan

$SUPABASE_URL  = "https://kpzzekflqpoeccnqfkng.supabase.co"
$SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDcxNTIsImV4cCI6MjA2NjM4MzE1Mn0.0QL2lRFVTXTr_2DFV0dywfElLzXirgFvx0qZRWPZUSQ"

Write-Host "[CHECK] Triangulo360..." -ForegroundColor Yellow

if (Test-Connection -Quiet -Count 1 8.8.8.8) {
    Write-Host "[Rede] OK"
} else {
    Write-Host "[Rede] Falhou"
}

try {
    [System.Net.Dns]::GetHostEntry("google.com") | Out-Null
    Write-Host "[DNS] OK"
} catch {
    Write-Host "[DNS] Falhou"
}

try {
    Invoke-WebRequest -Uri "https://api.supabase.com" -TimeoutSec 5 | Out-Null
    Write-Host "[REST] OK"
} catch {
    Write-Host "[REST] Falhou"
}

Write-Host "[Triangulo360] Concluido."

Write-Host ""
Write-Host "[SUPABASE] Testando acesso..." -ForegroundColor Yellow

try {
    $u = "$SUPABASE_URL/rest/v1/?apikey=$SUPABASE_ANON"
    $r = Invoke-RestMethod -Method Get -Uri $u -Headers @{apikey=$SUPABASE_ANON}
    Write-Host "[Supabase] OK"
} catch {
    Write-Host "[Supabase] ERRO:"
    Write-Host $_.ErrorDetails.Message
}

Write-Host ""
Write-Host "[UTF8] Varredura... (sem Unicode, sem StartsWith)" -ForegroundColor Yellow

$ext = "*.ts","*.tsx","*.js","*.jsx"

$arquivos = Get-ChildItem -Recurse -Include $ext -ErrorAction SilentlyContinue |
    Where-Object {
        $_.FullName -notmatch "node_modules"
    }

foreach ($a in $arquivos) {
    try {
        $bytes = [System.IO.File]::ReadAllBytes($a.FullName)

        if ($bytes.Length -ge 3 -and $bytes[0] -eq 239 -and $bytes[1] -eq 187 -and $bytes[2] -eq 191) {
            Write-Host "[UTF8] Removendo BOM: $($a.FullName)"
            $content = [System.Text.Encoding]::UTF8.GetString($bytes,3,$bytes.Length-3)
            Set-Content -Encoding UTF8 -Path $a.FullName -Value $content
        }
    } catch {
        Write-Host "[WARN] Falha lendo: $($a.FullName)"
    }
}

Write-Host ""
Write-Host "==== ULTRAPOWER X-RESET FINALIZADO ====" -ForegroundColor Cyan
