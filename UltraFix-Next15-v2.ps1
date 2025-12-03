Write-Host "🔧 UltraFix 360º v2 — Correções completas Next.js 15..." -ForegroundColor Cyan

# ============================
# 1) Corrigir auth-server.ts
# ============================
$auth = "src/lib/auth-server.ts"
if (Test-Path $auth) {
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
    Set-Content $auth -Value $fixAuth -Encoding UTF8
    Write-Host "✅ auth-server.ts corrigido!"
}

# ============================
# 2) Corrigir supabase-server.ts
# ============================
$supabase = "src/lib/supabase-server.ts"
if (Test-Path $supabase) {
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
    Set-Content $supabase -Value $fixSupabase -Encoding UTF8
    Write-Host "✅ supabase-server.ts corrigido!"
}

# ============================
# 3) Corrigir health/route.ts
# ============================
$health = "app/api/ultra/health/route.ts"
if (Test-Path $health) {
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
    Set-Content $health -Value $fixRoute -Encoding UTF8
    Write-Host "✅ route.ts corrigido!"
}

# ============================
# 4) Corrigir src/pastagem/page.tsx
# ============================
$pastagem = "src/pastagem/page.tsx"
if (Test-Path $pastagem) {
    Write-Host "📝 Corrigindo página de Pastagem..."

    $fixPastagem = @'
"use client";

import { useState } from "react";

export default function PastagemPage() {
  const [nome, setNome] = useState("");
  const [area, setArea] = useState("");
  const [capim, setCapim] = useState("");
  const [ultimaRotacao, setUltimaRotacao] = useState("");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cadastro de Pastagem</h1>

      <div className="space-y-3">
        <input
          className="text-black p-2 rounded"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          className="text-black p-2 rounded"
          placeholder="Área (hectares)"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />

        <input
          className="text-black p-2 rounded"
          placeholder="Tipo de capim"
          value={capim}
          onChange={(e) => setCapim(e.target.value)}
        />

        <input
          className="text-black p-2 rounded"
          placeholder="Última rotação"
          value={ultimaRotacao}
          onChange={(e) => setUltimaRotacao(e.target.value)}
        />
      </div>
    </div>
  );
}
'@

    Set-Content $pastagem -Value $fixPastagem -Encoding UTF8
    Write-Host "✅ page.tsx da Pastagem corrigido!"
}

# ============================
# 5) Limpar cache e build
# ============================
Write-Host "🧹 Limpando .next..."
if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }

Write-Host "📦 Rodando build final..."
npm run build
