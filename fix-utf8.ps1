# =========================================
# fix-utf8.ps1 - Corrige UTF-8 e charset no Next.js
# =========================================

param(
    [switch]$Backup,          # Se passado, cria backup dos arquivos
    [switch]$AutoGitPush       # Se passado, faz commit + push automático
)

# --- 1️⃣ Diretório do projeto ---
$projectDir = (Get-Location).Path
Write-Host "🔍 Iniciando verificação no diretório: $projectDir"

# --- 2️⃣ Padrões de arquivos ---
$files = Get-ChildItem -Path $projectDir -Recurse -Include *.ts, *.tsx, *.css, *.js

foreach ($file in $files) {
    Write-Host "📝 Processando: $($file.FullName)"

    if ($Backup) {
        Copy-Item $file.FullName "$($file.FullName).bak"
    }

    # Ler conteúdo do arquivo
    $content = Get-Content $file.FullName -Raw

    # Reescrever em UTF-8 sem BOM
    Set-Content -Path $file.FullName -Value $content -Encoding utf8
}

# --- 3️⃣ Garantir meta charset no layout ---
$layoutPaths = @(
    "$projectDir\app\layout.tsx",
    "$projectDir\pages\_document.tsx"
)

foreach ($layout in $layoutPaths) {
    if (Test-Path $layout) {
        $content = Get-Content $layout -Raw

        if ($content -notmatch 'meta\s+charSet="UTF-8"') {
            Write-Host "✨ Adicionando <meta charset='UTF-8'> em $layout"

            $content = $content -replace '(?<=<head>)', "`n    <meta charSet='UTF-8' />`n"
            Set-Content -Path $layout -Value $content -Encoding utf8
        }
    }
}

# --- 4️⃣ Commit e push Git (opcional) ---
if ($AutoGitPush) {
    Write-Host "🚀 Commitando e enviando alterações para o repositório Git..."
    git add .
    git commit -m "fix: corrigir UTF-8 e charset"
    git push
}

Write-Host "✅ Concluído! Todos os arquivos estão em UTF-8 e charset garantido."
