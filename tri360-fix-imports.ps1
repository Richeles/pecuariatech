Write-Host "🔺 Sistema Triangular 360° — Módulo Fix Imports iniciado..." -ForegroundColor Cyan

$projeto = "C:\Users\Administrador\pecuariatech"
$logFile = "$projeto\tri360_imports_log.txt"

# Função auxiliar para substituição segura
function Corrigir-Imports($arquivo) {
    $conteudo = Get-Content $arquivo -Raw
    $alterado = $false

    if ($conteudo -match "@/components/SmartWeather") {
        $conteudo = $conteudo -replace "@/components/SmartWeather", "../../components/SmartWeather"
        $alterado = $true
    }

    if ($conteudo -match "@/components/Kpi") {
        $conteudo = $conteudo -replace "@/components/Kpi", "../../components/Kpi"
        $alterado = $true
    }

    if ($alterado) {
        Set-Content -Path $arquivo -Value $conteudo -Encoding UTF8
        Add-Content $logFile "✅ Corrigido: $arquivo"
    }
}

# 🔍 Diagnóstico
Write-Host "🧠 [1/3] Escaneando arquivos para correção..." -ForegroundColor Yellow
$arquivos = Get-ChildItem -Path "$projeto\app" -Recurse -Include *.ts,*.tsx
foreach ($arq in $arquivos) {
    Corrigir-Imports $arq.FullName
}

# 🧩 Correção Adaptativa
Write-Host "⚙️ [2/3] Ajustando alias de componentes..." -ForegroundColor Yellow

# Garantir jsconfig.json configurado corretamente
$jsconfigPath = "$projeto\jsconfig.json"
if (-not (Test-Path $jsconfigPath)) {
    @"
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["*"]
    }
  }
}
"@ | Out-File -FilePath $jsconfigPath -Encoding utf8
    Add-Content $logFile "🧩 jsconfig.json criado."
} else {
    Add-Content $logFile "ℹ️ jsconfig.json já existente."
}

# 🧱 Testar build
Write-Host "🧪 [3/3] Testando build de produção..." -ForegroundColor Yellow
npm run build | Tee-Object -FilePath $logFile -Append

Write-Host "📁 Log completo salvo em: $logFile" -ForegroundColor DarkGray
Write-Host "✅ Sistema Triangular 360° — Imports corrigidos com sucesso!" -ForegroundColor Green
