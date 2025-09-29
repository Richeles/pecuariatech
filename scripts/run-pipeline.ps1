Write-Host "`n🚀 Iniciando pipeline PecuariaTech..." -ForegroundColor Cyan

# 0. Criar pasta ts se não existir
if (!(Test-Path .\ts)) {
    mkdir .\ts | Out-Null
    @'
const msg: string = "Olá PecuariaTech 🚜";
console.log(msg);
'@ | Out-File .\ts\hello.ts -Encoding UTF8
    Write-Host "📂 Pasta 'ts' criada com exemplo hello.ts" -ForegroundColor Yellow
}

# 1. Criar pasta dist se não existir
if (!(Test-Path .\dist)) { mkdir .\dist | Out-Null }

# 2. Compilar todos os .ts para .js usando tsconfig.json
Write-Host "🛠️ Compilando TypeScript usando tsconfig.json..." -ForegroundColor Yellow
try {
    npx tsc
    Write-Host "✅ Compilação concluída" -ForegroundColor Green
}
catch {
    Write-Warning ("⚠ Erro na compilação: {0}" -f $_.Exception.Message)
}

# 3. Executar o pipeline ultrabiologico.js
$ultraJs = ".\dist\ultrabiologico.js"
if (Test-Path $ultraJs) {
    Write-Host "▶ Rodando ultrabiologico.js..." -ForegroundColor Cyan
    try {
        node $ultraJs
        Write-Host "✔ ultrabiologico.js concluído" -ForegroundColor Green
    }
    catch {
        Write-Warning ("⚠ Erro ao rodar ultrabiologico.js: {0}" -f $_.Exception.Message)
    }
}
else {
    Write-Warning "⚠ ultrabiologico.js não encontrado. Certifique-se de que ultrabiologico.ts está em ts\"
}

Write-Host "`n🏁 Pipeline finalizado com segurança!" -Foregro
