Write-Host "🔧 UltraFix 360º — Corrigindo todos os erros de cookies, Supabase e rotas..." -ForegroundColor Cyan

# ============================
# 1) CORRIGIR auth-server.ts
# ============================
$auth = "src/lib/auth-server.ts"
if (Test-Path $auth) {
    Write-Host "📝 Atualizando auth-server.ts..."
    $fixAuth = @'
import { cookies } from "next/headers";

export async function createServerClient() {
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
    Set-Content -Path $auth -Value $fixAuth -Encoding UTF8
    Write-Host "✅ auth-server.ts corrigido!"
} else {
    Write-Host "⚠ auth-server.ts não encontrado, pulando..."
}

# ============================
# 2) CORRIGIR supabase-server.ts
# ============================
$supabase = "src/lib/supabase-server.ts"
if (Test-Path $supabase) {
    Write-Host "📝 Atualizando supabase-server.ts..."
    $fixSupabase = @'
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
    Set-Content -Path $supabase -Value $fixSupabase -Encoding UTF8
    Write-Host "✅ supabase-server.ts corrigido!"
} else {
    Write-Host "⚠ supabase-server.ts não encontrado, pulando..."
}

# ============================
# 3) CORRIGIR /api/ultra/health/route.ts
# ============================
$health = "app/api/ultra/health/route.ts"
if (Test-Path $health) {
    Write-Host "📝 Atualizando route.ts da rota HEALTH..."

    $fixRoute = @'
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabase();

  return Response.json({
    ok: true,
    supabase: !!supabase,
    cookies: {
      session: supabase.cookies.get("session") ?? null,
    },
  });
}
'@

    Set-Content -Path $health -Value $fixRoute -Encoding UTF8
    Write-Host "✅ route.ts corrigido!"
} else {
    Write-Host "⚠ route.ts não encontrado em app/api/ultra/health/route.ts"
}

# ============================
# 4) LIMPAR CACHE
# ============================
Write-Host "🧹 Limpando cache .next..."
if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }

# ============================
# 5) BUILD FINAL
# ============================
Write-Host "📦 Rodando build final..."
npm run build
