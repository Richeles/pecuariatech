$ErrorActionPreference = "Stop"
$SupabaseUrl = "https://github.com/supabase/cli/releases/download/v2.39.2/supabase_windows_amd64.tar.gz"
$InstallPath = "C:\SupabaseCLI"
$TempFile = "$env:TEMP\supabase_windows_amd64.tar.gz"

Write-Host "[INFO] Criando pasta de instalação..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null

Write-Host "[INFO] Baixando Supabase CLI..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $SupabaseUrl -OutFile $TempFile

Write-Host "[INFO] Extraindo arquivos..." -ForegroundColor Cyan
tar -xzf $TempFile -C $env:TEMP

$SupabaseExe = Get-ChildItem -Path $env:TEMP -Recurse -Filter "supabase.exe" | Select-Object -First 1
if (-not $SupabaseExe) { Write-Host "[ERRO] supabase.exe não encontrado."; exit 1 }

Copy-Item $SupabaseExe.FullName -Destination $InstallPath -Force

$UserPath = [System.Environment]::GetEnvironmentVariable("Path","User")
if ($UserPath -notlike "*$InstallPath*") {
    [System.Environment]::SetEnvironmentVariable("Path", "$UserPath;$InstallPath", "User")
    Write-Host "[INFO] PATH do usuário atualizado." -ForegroundColor Yellow
}

$env:Path += ";$InstallPath"

Write-Host "[INFO] Testando Supabase CLI..." -ForegroundColor Cyan
supabase --version

Write-Host "[INFO] Configurando login automático com token..." -ForegroundColor Cyan
supabase logout -f
supabase login --service-role $SupabaseToken
Write-Host "[INFO] Supabase CLI totalmente configurado e autenticado!"
