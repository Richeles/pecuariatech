<# 
 Ultra FixChain v6.0 — PecuariaTech Cloud
 Autor: Richeles Alves dos Santos
 Função: Remoção total de BOM + Rebuild + Deploy + Verificação UTF-8
#>

$ErrorActionPreference = "Stop"
$Root = "C:\Users\Administrador\pecuariatech"
$LogDir = Join-Path $Root "logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$LogFile = Join-Path $LogDir "ultra-fixchain-$Date.log"
$Url = "https://www.pecuariatech.com/dashboard"

Write-Host "🚀 Iniciando Ultra FixChain do PecuariaTech Cloud v6.0..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

# 1️⃣ - REMOÇÃO DE BOM GLOBAL
Write-Host "`n🧹 Removendo BOM e caracteres invisíveis..." -ForegroundColor Yellow
$exts = "*.ts","*.tsx","*.js","*.jsx","*.json","*.html","*.css"
$Count = 0

Get-ChildItem -Path $Root -Include $exts -Recurse -File | ForEach-Object {
    try {
        $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            $clean = $bytes[3..($bytes.Length - 1)]
            [System.IO.File]::WriteAllBytes($_.FullName, $clean)
            Write-Host "✔️ BOM removido: $($_.FullName)" -ForegroundColor Green
            "Removido BOM -> $($_.FullName)" | Out-File -FilePath $LogFile -Append -Encoding UTF8
            $Count++
        }
    } catch {
        Write-Host "⚠️ Erro ao processar $($_.FullName): $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host "🧩 Total de arquivos corrigidos: $Count" -ForegroundColor Green

# 2️⃣ - REGRAVAÇÃO UTF-8 PURA
Write-Host "`n🧠 Regravando arquivos críticos em UTF-8 puro..." -ForegroundColor Yellow
$Critical = @(
    "app\api\autonomo\route.ts",
    "app\api\chat\route.ts",
    "app\components\UltraChat.tsx",
    "app\dashboard\page.tsx",
    "app\layout.tsx"
)
foreach ($f in $Critical) {
    $p = Join-Path $Root $f
    if (Test-Path $p) {
        $t = Get-Content -Raw -Encoding UTF8 $p
        $t = $t -replace '^\uFEFF', ''
        Set-Content -Path $p -Value $t -Encoding UTF8
        Write-Host "✅ Regravado: $f" -ForegroundColor Green
    }
}

# 3️⃣ - LIMPEZA DE BUILD
Write-Host "`n🧼 Limpando caches..." -ForegroundColor Yellow
@(".next", ".vercel", ".turbo") | ForEach-Object {
    if (Test-Path $_) { Remove-Item $_ -Recurse -Force -ErrorAction SilentlyContinue }
}
npm cache clean --force | Out-Null

# 4️⃣ - INSTALAÇÃO DE DEPENDÊNCIAS
Write-Host "`n📦 Instalando dependências..." -ForegroundColor Yellow
npm install | Tee-Object -FilePath $LogFile -Append

# 5️⃣ - BUILD NEXT.JS
Write-Host "`n⚙️ Compilando projeto..." -ForegroundColor Yellow
npm run build | Tee-Object -FilePath $LogFile -Append

# 6️⃣ - DEPLOY GITHUB + VERCEL
Write-Host "`n☁️ Commit e Push para GitHub..." -ForegroundColor Yellow
git add -A
git commit --allow-empty -m "auto: UTF-8 fixchain v6.0 ($Date)" | Out-Null
git push origin main | Tee-Object -FilePath $LogFile -Append

# 7️⃣ - TESTE UTF-8 ONLINE
Write-Host "`n🌍 Verificando charset no site..." -ForegroundColor Yellow
try {
    Add-Type -AssemblyName System.Net.Http
    $client = [System.Net.Http.HttpClient]::new()
    $r = $client.GetAsync($Url).Result
    $html = $r.Content.ReadAsStringAsync().Result
    $ct = $r.Content.Headers.ContentType.ToString()
    $cs = if ($ct -match "charset\s*=\s*([^\s;]+)") { $Matches[1] } else { "desconhecido" }

    if ($cs -match "utf-8") {
        Write-Host "✅ UTF-8 detectado corretamente!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Charset incorreto: $cs" -ForegroundColor Red
    }

    $html.Substring(0,[Math]::Min($html.Length,400)) | Out-File -FilePath $LogFile -Encoding UTF8
}
catch {
    Write-Host "❌ Falha na verificação: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✨ FixChain concluído com sucesso!" -ForegroundColor Green
Write-Host "🌐 Acesse: $Url" -ForegroundColor Cyan
Write-Host "📄 Log completo salvo em: $LogFile" -ForegroundColor Yellow
