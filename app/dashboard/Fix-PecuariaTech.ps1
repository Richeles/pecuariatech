Write-Host "🔧 PecuariaTech Ultra-Fix — Limpando estrutura..." -ForegroundColor Cyan

$root = "C:\Users\Administrador\pecuariatech"
$appFolder = "$root\app"

# Criar pasta app se não existir
if (!(Test-Path $appFolder)) {
    Write-Host "⚠️ Pasta /app não encontrada — criando..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $appFolder
}

# Arquivos essenciais
$targets = @("globals.css", "layout.tsx")

foreach ($file in $targets) {
    $filesFound = Get-ChildItem -Path $root -Recurse -Filter $file | Select-Object -ExpandProperty FullName

    foreach ($path in $filesFound) {
        if ($path -notmatch "\\app\\") {
            Write-Host "➡️ Movendo $file para /app pois estava fora do local correto: $path" -ForegroundColor Yellow
            Move-Item -Force $path -Destination "$appFolder\$file"
        } else {
            Write-Host "✔ Encontrado arquivo correto no app: $path" -ForegroundColor Green
        }
    }
}

# Garantir linha de import correta no layout.tsx
$layoutFile = "$appFolder\layout.tsx"

if (Test-Path $layoutFile) {
    $content = Get-Content $layoutFile

    if ($content[0] -notmatch "import `"./globals.css`";") {
        Write-Host "🛠 Corrigindo import no layout.tsx..." -ForegroundColor Yellow
        @("import `"./globals.css`";") + "" + $content | Set-Content $layoutFile
    } else {
        Write-Host "✔ Import correto já existe no layout.tsx" -ForegroundColor Green
    }
}

Write-Host "`n✨ Estrutura corrigida com sucesso!" -ForegroundColor Cyan
