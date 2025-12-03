# ============================================================
# Deploy-GPS-Supabase-Log.ps1
# Versão estável com LOG + Interlocutor Assimetria de Convergência
# Compatível com PowerShell 5.1 e 7+
# ============================================================

$ProjectPath = "C:\Users\Administrador\pecuariatech"
$LogPath = "$ProjectPath\logs"
$TimeStamp = (Get-Date).ToString("yyyy-MM-dd_HH-mm-ss")
$LogFile = "$LogPath\deploy_$TimeStamp.log"

# Criar pasta de logs
if (-not (Test-Path $LogPath)) {
    New-Item -Path $LogPath -ItemType Directory | Out-Null
}

function Log {
    param([string]$Message, [string]$Color = "White")
    $msg = "$(Get-Date -Format 'HH:mm:ss') | $Message"
    Write-Host $msg -ForegroundColor $Color
    Add-Content -Path $LogFile -Value $msg
}

# Cabeçalho
Log "Iniciando Deploy GPS + Supabase..." "Cyan"

# Etapa 1 - Variáveis de ambiente
Log "Verificando variáveis de ambiente..."
$vars = @("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY")
foreach ($v in $vars) {
    if (-not ${env:$v}) {
        Log "Variável ausente: $v" "Yellow"
    } else {
        Log "$v detectada." "Green"
    }
}

# Etapa 2 - Dependências
$deps = @(
    "leaflet",
    "react-leaflet",
    "@supabase/supabase-js",
    "@types/leaflet",
    "tailwindcss",
    "postcss",
    "autoprefixer",
    "@tailwindcss/postcss"
)

Log "Verificando dependências..."
foreach ($d in $deps) {
    if (-not (Test-Path "$ProjectPath\node_modules\$d")) {
        Log "Instalando dependência: $d"
        npm install $d | Out-Null
    } else {
        Log "$d já instalado." "Green"
    }
}

# Etapa 3 - Limpeza
Log "Limpando cache anterior..."
rimraf "$ProjectPath\.next" 2>$null

# Etapa 4 - Build
$BuildStart = Get-Date
Log "Iniciando build..."
$buildOutput = npm run build 2>&1
$BuildEnd = Get-Date
$BuildDuration = [Math]::Round(($BuildEnd - $BuildStart).TotalSeconds, 2)
Add-Content -Path $LogFile -Value $buildOutput

if ($buildOutput -match "Failed to compile" -or $buildOutput -match "Error:") {
    Log "Erro detectado durante o build!" "Red"
    Log "Interlocutor Assimetria: divergência entre camadas de compilação e convergência operacional." "Red"
    exit 1
}

# Etapa 5 - Deploy
Log "Iniciando deploy para Vercel..."
$deployOutput = vercel --prod 2>&1
Add-Content -Path $LogFile -Value $deployOutput

if ($deployOutput -match "Error" -or $deployOutput -match "failed") {
    Log "Falha no deploy! Verificar autenticação Vercel ou chaves Supabase." "Red"
    exit 1
} else {
    Log "Deploy concluído com sucesso." "Green"
    Log "Sistema GPS + Supabase ativo e monitorado." "Green"
}

# Etapa 6 - Resumo
Log "Tempo total de build: $BuildDuration segundos." "Cyan"
Log "Log completo salvo em: $LogFile" "Cyan"
