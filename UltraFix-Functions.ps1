Write-Host "🔧 UltraFix — Isolando Supabase Functions do build Next.js..." -ForegroundColor Cyan

# Criar pasta tsconfig dentro de supabase/functions
$tsconfigPath = "supabase/functions/tsconfig.json"

$tsconfigContent = @'
{
  "compilerOptions": {
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "allowJs": true
  },
  "include": ["./**/*"],
  "exclude": ["../../src", "../../app", "../../components"]
}
'@

Write-Host "📝 Criando tsconfig.json isolado para Supabase Functions..."
Set-Content -Path $tsconfigPath -Value $tsconfigContent -Encoding UTF8

# Criar arquivo de definição vazio para enganar TypeScript
$typesPath = "supabase/functions/types.d.ts"
$typesContent = @'
// Ignora módulos especiais do Supabase Functions para evitar erro no build Next.js
declare module "std/server";
declare module "std/http";
'@

Set-Content -Path $typesPath -Value $typesContent -Encoding UTF8

Write-Host "✅ Supabase Functions isoladas com sucesso!"

# Remover cache
Write-Host "🧹 Limpando .next..."
if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }

Write-Host "📦 Rodando build final..."
npm run build
