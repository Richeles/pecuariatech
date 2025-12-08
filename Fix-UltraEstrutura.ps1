Write-Host "Iniciando UltraFix PecuariaTech..."

$root = "C:\Users\Administrador\pecuariatech"
$appFolder = "$root\app"

# Criar pasta app se não existir
if (!(Test-Path $appFolder)) {
    Write-Host "Pasta /app nao encontrada — criando..."
    New-Item -ItemType Directory -Path $appFolder | Out-Null
}

# Arquivos essenciais
$targets = @("globals.css", "layout.tsx")

foreach ($file in $targets) {
    Write-Host "Verificando $file..."

    $foundFiles = Get-ChildItem -Path $root -Recurse -Filter $file | Select-Object -ExpandProperty FullName

    foreach ($path in $foundFiles) {
        if ($path -notmatch "\\app\\") {
            Write-Host "Removendo copia fora da pasta correta: $path"
            Remove-Item -Force $path
        } else {
            Write-Host "Mantendo arquivo correto dentro de app: $path"
        }
    }

    # Garantir arquivo na pasta correta
    if (!(Test-Path "$appFolder\$file")) {
        Write-Host "Criando arquivo faltante: $file"
        New-Item -ItemType File -Path "$appFolder\$file" | Out-Null
    }
}

# Garantir import no layout.tsx
$layoutPath = "$appFolder\layout.tsx"

if (Test-Path $layoutPath) {
    $content = Get-Content $layoutPath

    if ($content[0] -notmatch "import `"./globals.css`";") {
        Write-Host "Adicionando import correto ao layout.tsx..."
        @('import "./globals.css";', '') + $content | Set-Content $layoutPath
    } else {
        Write-Host "Import ja existe no layout.tsx"
    }
}

Write-Host "UltraFix concluido com sucesso."
