Write-Host "🔧 UltraFix v2 — Isolando Supabase Functions do build Next.js" -ForegroundColor Cyan

function Backup-File($path) {
    if (Test-Path $path) {
        $bak = "$path.bak.$((Get-Date).ToString('yyyyMMddHHmmss'))"
        Copy-Item -Path $path -Destination $bak -Force
        Write-Host "🔁 Backup criado: $bak"
    }
}

if (!(Test-Path ".\package.json")) {
    Write-Host "❌ Execute este script na raiz do projeto." -ForegroundColor Red
    exit
}

# ----------------------------
# 1) tsconfig.json raiz
# ----------------------------
$rootTs = ".\tsconfig.json"
if (Test-Path $rootTs) {
    Backup-File $rootTs

    try {
        $json = Get-Content $rootTs -Raw | ConvertFrom-Json

        if (-not $json.exclude) {
            $json | Add-Member -MemberType NoteProperty -Name exclude -Value @()
        }

        if ($json.exclude -notcontains "supabase/functions") {
            $json.exclude += "supabase/functions"
            ($json | ConvertTo-Json -Depth 10) | Set-Content $rootTs -Encoding UTF8
            Write-Host "✅ tsconfig.json atualizado (excluindo supabase/functions)"
        }
        else {
            Write-Host "⚠ tsconfig.json já exclui supabase/functions"
        }
    }
    catch {
        Write-Host "⚠ Erro ao converter tsconfig.json (ignorando)" -ForegroundColor Yellow
    }
}

# ----------------------------
# 2) Criar tsconfig isolado para Functions
# ----------------------------
$tsFunctions = ".\supabase\functions\tsconfig.json"
$dir = Split-Path $tsFunctions -Parent
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

@"
{
  "compilerOptions": {
    "skipLibCheck": true,
    "allowJs": true,
    "noEmit": true,
    "isolatedModules": true
  },
  "include": ["./**/*"]
}
"@ | Set-Content $tsFunctions -Encoding UTF8

Write-Host "✅ Criado tsconfig isolado para Supabase Functions"

# ----------------------------
# 3) Criar global.d.ts
# ----------------------------
$globalDts = ".\supabase\functions\global.d.ts"

@"
// Tipos fictícios para impedir erro no build
declare const Deno: any;
declare module 'std/server';
declare module 'std/http';
declare module 'std/fs';
"@ | Set-Content $globalDts -Encoding UTF8

Write-Host "✅ Criado global.d.ts"

# ----------------------------
# 4) Corrigir forecast_clima (sem regex textual)
# ----------------------------
$forecastPath = ".\supabase\functions\forecast_clima\src\index.ts"

if (Test-Path $forecastPath) {
    Backup-File $forecastPath
    $raw = Get-Content $forecastPath -Raw

    # Criar expressões regulares sem strings literais
    $regex1 = [regex]::new("Deno\.env\.get\(\s*'([^']+)'\s*\)")
    $regex2 = [regex]::new('Deno\.env\.get\(\s*"([^"]+)"\s*\)')

    $raw = $regex1.Replace($raw, 'process.env.$1')
    $raw = $regex2.Replace($raw, 'process.env.$1')

    Set-Content $forecastPath -Value $raw -Encoding UTF8
    Write-Host "✅ forecast_clima corrigido"
} else {
    Write-Host "⚠ forecast_clima não encontrado (ok)" -ForegroundColor Yellow
}

# ----------------------------
# 5) Criar .nextignore
# ----------------------------
$nx = ".\supabase\functions\.nextignore"
"/*" | Set-Content $nx -Encoding UTF8
Write-Host "✅ Criado .nextignore"

# ----------------------------
# 6) Limpar e buildar
# ----------------------------
Write-Host "🧹 Limpando .next..."
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "📦 Rodando build..."
npm run build

Write-Host "🔥 UltraFix v2 FINALIZADO!" -ForegroundColor Green
