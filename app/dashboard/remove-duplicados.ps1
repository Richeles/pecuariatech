Write-Host "🔎 Scanner PecuariaTech — Removendo duplicados..." -ForegroundColor Cyan

$root = "C:\Users\Administrador\pecuariatech"

# arquivos que devem existir somente em /app
$targets = @("globals.css", "layout.tsx")

foreach ($file in $targets) {
    $paths = Get-ChildItem -Path $root -Recurse -Filter $file | Select-Object -ExpandProperty FullName

    if ($paths.Count -gt 1) {
        Write-Host "`n⚠️ Encontrado duplicado: $file" -ForegroundColor Yellow

        foreach ($path in $paths) {
            if ($path -notmatch "\\app\\") {
                Write-Host "❌ Removendo cópia fora da pasta correta: $path" -ForegroundColor Red
                Remove-Item -Force $path
            } else {
                Write-Host "✔ Mantendo versão correta dentro da pasta app: $path" -ForegroundColor Green
            }
        }
    }
}

Write-Host "`n✨ Limpeza concluída — Agora só existe 1 versão válida por arquivo." -ForegroundColor Cyan
