Write-Host "🔧 UltraFix — Corrigindo supabase-server.ts (async cookies Next.js 15)..." -ForegroundColor Cyan

$target = "src/lib/supabase-server.ts"

if (!(Test-Path $target)) {
    Write-Host "❌ ERRO: Arquivo não encontrado: $target" -ForegroundColor Red
    exit
}

Write-Host "📝 Atualizando supabase-server.ts..."

$fix = @'
import { cookies } from "next/headers";

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value ?? null;
      },
    },
  };
}
'@

Set-Content -Path $target -Value $fix -Encoding UTF8

Write-Host "✅ supabase-server.ts corrigido com sucesso!"

# Limpar cache
Write-Host "🧹 Limpando cache Next.js..."
if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }

# Build final
Write-Host "📦 Rodando build final..."
npm run build
