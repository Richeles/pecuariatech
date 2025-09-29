# Supabase Ultrabiológico Autônomo
$ErrorActionPreference = "Stop"

# Configurações
$SupabaseToken = "sbp_001953aecd5ebd0916bd14efe4e1d8393272af15"
$ProjectRef   = "kpzzekflqpoeccnqfkng"
$InstallPath  = "C:\SupabaseCLI"
$TempFile     = "$env:TEMP\supabase_windows_amd64.tar.gz"
$SupabaseUrl  = "https://github.com/supabase/cli/releases/download/v2.39.2/supabase_windows_amd64.tar.gz"

# Criar pasta de instalação
If (-Not (Test-Path $InstallPath)) { New-Item -ItemType Directory -Path $InstallPath | Out-Null }

# Baixar Supabase CLI se não existir
$SupabaseExePath = Join-Path $InstallPath "supabase.exe"
If (-Not (Test-Path $SupabaseExePath)) {
    Write-Host "[INFO] Baixando Supabase CLI..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $SupabaseUrl -OutFile $TempFile
    Write-Host "[INFO] Extraindo Supabase CLI..." -ForegroundColor Cyan
    tar -xzf $TempFile -C $env:TEMP
    $ExeFound = Get-ChildItem -Path $env:TEMP -Recurse -Filter "supabase.exe" | Select-Object -First 1
    Copy-Item $ExeFound.FullName -Destination $InstallPath -Force
}

# Adicionar ao PATH
$env:Path += ";$InstallPath"

# Testar CLI
Write-Host "[INFO] Testando Supabase CLI..." -ForegroundColor Cyan
supabase --version

# Login automático
Write-Host "[INFO] Fazendo login automático..." -ForegroundColor Cyan
supabase login --token $SupabaseToken

# Linkar projeto automaticamente
Write-Host "[INFO] Linkando projeto '$ProjectRef'..." -ForegroundColor Cyan
supabase link --project-ref $ProjectRef --yes

# Sincronizar banco de dados
Write-Host "[INFO] Sincronizando banco de dados (db push)..." -ForegroundColor Cyan
supabase db push --yes

Write-Host "[SUCESSO] Supabase pronto e sincronizado 🚀" -ForegroundColor Green
