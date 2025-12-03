# UltraFix-Functions-Final.ps1
Write-Host "🔧 UltraFix-Functions-Final — isolando Supabase Functions do build Next.js" -ForegroundColor Cyan

function Backup-File($path) {
    if (Test-Path $path) {
        $bak = "$path.bak.$((Get-Date).ToString('yyyyMMddHHmmss'))"
        Copy-Item -Path $path -Destination $bak -Force
        Write-Host "🔁 Backup criado: $bak"
    }
}

if (!(Test-Path ".\package.json")) {
    Write-Host "❌ package.json não encontrado aqui." -ForegroundColor Red
    exit 1
}

# ----------------------------
# 1) tsconfig.json raiz
# ----------------------------
$rootTs = ".\tsconfig.json"
if (Test-Path $rootTs) {
    Backup-File $rootTs
    try {
        $json = Get-Content $rootTs -Raw | ConvertFrom-Json -ErrorAction Stop

        if (-not $json.exclude) {
            $json | Add-Member -MemberType NoteProperty -Name exclude -Value @()
        }

        if ($json.exclude -notcontains "supabase/functions") {
            $arr = @($json.exclude)
            $arr += "supabase/functions"
            $json.exclude = $arr
            ($json | ConvertTo-Json -Depth 10) | Set-Content $rootTs -Encoding UTF8
            Write-Host "✅ tsconfig.json atualizado"
        } else {
            Write-Host "⚠ tsconfig.json já exclui supabase/functions"
        }
    }
    catch {
        Write-Host "⚠ Falha ao parsear tsconfig.json" -ForegroundColor Yellow
    }
}

# ----------------------------
# 2) tsconfig isolado para functions
# ----------------------------
$tsFunctions = ".\supabase\functions\tsconfig.json"
$tsFunctionsDir = Split-Path $tsFunctions -Parent
if (!(Test-Path $tsFunctionsDir)) { New-Item -ItemType Directory -Path $tsFunctionsDir -Force | Out-Null }

if (-not (Test-Path $tsFunctions)) {
@"
{
  "compilerOptions": {
    "skipLibCheck": true,
    "allowJs": true,
    "noEmit": true,
    "isolatedModules": true,
    "types": []
  },
  "include": ["./**/*"]
}
"@ | Set-Content $tsFunctions -Encoding UTF8

    Write-Host "✅ Criado supabase/functions/tsconfig.json"
} else {
    Backup-File $tsFunctions
    Write-Host "⚠ tsconfig.functions já existe"
}

# ----------------------------
# 3) global.d.ts
# ----------------------------
$globalDts = ".\supabase\functions\global.d.ts"
if (-not (Test-Path $globalDts)) {
@'
// Tipos para evitar erros durante o build do Next.js
declare const Deno: any;
declare module "std/server";
declare module "std/http";
declare module "std/fs";
declare module "std/path";
'@ | Set-Content $globalDts -Encoding UTF8

    Write-Host "✅ Criado global.d.ts"
} else {
    Backup-File $globalDts
}

# ----------------------------
# 4) types.d.ts
# ----------------------------
$typesDts = ".\supabase\functions\types.d.ts"
if (-not (Test-Path $typesDts)) {
@'
declare const Deno: any;
declare module "std/*";
'@ | Set-Content $typesDts -Encoding UTF8

    Write-Host "✅ Criado types.d.ts"
}

# ----------------------------
# 5) Corrigir Deno.env.get no forecast_clima
# ----------------------------
$forecastPath = ".\supabase\functions\forecast_clima\src\index.ts"
if (Test-Path $forecastPath) {
    Backup-File $forecastPath
    $raw = Get-Content $forecastPath -Raw

    # Regex seguros usando single-quoted string
    $pattern1 = 'Deno\.env\.get\(\s*\'([^\']+)\'\s*\)'
    $pattern2 = 'Deno\.env\.get\(\s*"([^"]+)"\s*\)'

    $rawNew = [regex]::Replace($raw, $pattern1, 'process.env.$1')
    $rawNew = [regex]::Replace($rawNew, $pattern2, 'process.env.$1')

    Set-Content $forecastPath -Value $rawNew -Encoding UTF8
    Write-Host "✅ forecast_clima/src/index.ts atualizado"
} else {
    Write-Host "⚠ Não encontrou forecast_clima/src/index.ts"
}

# ----------------------------
# 6) Criar .nextignore (informativo)
# ----------------------------
$nextIgnore = ".\supabase\functions\.nextignore"
if (-not (Test-Path $nextIgnore)) {
"/*" | Set-Content $nextIgnore -Encoding UTF8
    Write-Host "✅ Criado .nextignore"
}

# ----------------------------
# 7) Limpar .next e build
# ----------------------------
Write-Host "🧹 Limpando .next..."
if (Test-Path ".\.next") { Remove-Item ".\.next" -Recurse -Force }

Write-Host "📦 Rodando build..."
npm run build

Write-Host "🔥 UltraFix-Functions-Final concluído!" -ForegroundColor Green
