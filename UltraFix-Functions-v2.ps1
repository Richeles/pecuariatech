Write-Host "🔧 UltraFix v2 — Isolamento TOTAL das Supabase Functions..." -ForegroundColor Cyan

# ====================================================
# 1) ALTERAR tsconfig RAIZ para ignorar supabase/functions
# ====================================================
$rootTsconfig = "tsconfig.json"

if (Test-Path $rootTsconfig) {
    Write-Host "📝 Atualizando tsconfig.json raiz para excluir supabase/functions..."

    $rootContent = Get-Content $rootTsconfig -Raw

    # Adiciona exclude se não existir
    if ($rootContent -notmatch "supabase/functions") {
        $newRootConfig = $rootContent -replace "{", "{`n  \"exclude\": [\"supabase/functions\"],"
        Set-Content $rootTsconfig -Value $newRootConfig -Encoding UTF8
        Write-Host "✅ Pasta supabase/functions excluída do TypeScript raiz!"
    } else {
        Write-Host "⚠ tsconfig raiz já estava excluindo supabase/functions"
    }
}

# ====================================================
# 2) Criar declaração global de Deno para evitar erros
# ====================================================
$globalDts = "supabase/functions/global.d.ts"

$globalContent = @'
// Evita erro "Cannot find name Deno"
declare const Deno: any;

// Evita erro de módulos do Deno
declare module "std/server";
declare module "std/http";
declare module "std/fs";
'@

Write-Host "📝 Criando global.d.ts para ignorar erros do Deno..."
Set-Content $globalDts -Value $globalContent -Encoding UTF8
Write-Host "✅ global.d.ts criado!"

# ====================================================
# 3) Criar tsconfig isolado dentro de supabase/functions
# ====================================================
$tsconfigPath = "supabase/functions/tsconfig.json"

$tsconfigContent = @'
{
  "compilerOptions": {
    "skipLibCheck": true,
    "allowJs": true,
    "noEmit": true,
    "isolatedModules": true
  },
  "include": ["./**/*"],
  "exclude": []
}
'@

Write-Host "📝 Criando tsconfig interno isolado..."
Set-Content -Path $tsconfigPath -Value $tsconfigContent -Encoding UTF8
Write-Host "✅ tsconfig interno criado!"

# ====================================================
# 4) Limpar cache e build
# ====================================================
Write-Host "🧹 Limpando .next..."
if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }

Write-Host "📦 Rodando build final..."
npm run build
