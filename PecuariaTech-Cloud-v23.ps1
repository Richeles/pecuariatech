# =====================================================================
# PECUARIATECH CLOUD v23 — FIX ABSOLUTO DOS IMPORTS
# Corrige lib, src/lib, tsconfig paths, jsconfig, recria APIs e login
# =====================================================================

$ROOT = "C:\Users\Administrador\pecuariatech"
cd $ROOT

Write-Host "=== INICIANDO PECUARIATECH CLOUD v23 ==="

# ------------------------------------------------------------
# 1. Criar backup completo
# ------------------------------------------------------------
$bk = "$ROOT\backups\backup_v23_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').zip"
Write-Host "Criando backup: $bk"
Compress-Archive -Path "$ROOT\*" -DestinationPath $bk -Force
Write-Host "Backup criado."

# ------------------------------------------------------------
# 2. Estruturar caminho correto das libs
# Diretório correto para Next.js 15 App Router = src/lib
# ------------------------------------------------------------
Write-Host "Recriando estrutura src/lib..."
if (!(Test-Path "$ROOT\src")) { New-Item -ItemType Directory "$ROOT\src" | Out-Null }
if (!(Test-Path "$ROOT\src\lib")) { New-Item -ItemType Directory "$ROOT\src\lib" | Out-Null }

# CRIAR supabase-browser.ts
Set-Content "$ROOT\src\lib\supabase-browser.ts" @'
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON!
);
'@

# CRIAR supabase-server.ts
Set-Content "$ROOT\src\lib\supabase-server.ts" @'
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function supabaseServer() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON!,
    { cookies }
  );
}
'@

# CRIAR auth.ts
Set-Content "$ROOT\src\lib\auth.ts" @'
export const ADMIN_EMAIL = "admin@pecuariatech.com";

export function getSession() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("session");
}

export function signOut() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("session");
}
'@

Write-Host "Libs reescritas em src/lib OK."

# ------------------------------------------------------------
# 3. Corrigir tsconfig.json para garantir alias correto
# ------------------------------------------------------------
Write-Host "Reescrevendo tsconfig.json..."

Set-Content "$ROOT\tsconfig.json" @'
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    },
    "baseUrl": ".",
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "target": "esnext",
    "strict": false
  },
  "exclude": ["node_modules"]
}
'@

Write-Host "tsconfig corrigido."

# ------------------------------------------------------------
# 4. Recriar login sem erros
# ------------------------------------------------------------
Write-Host "Recriando login/page.tsx..."

if (!(Test-Path "$ROOT\app\login")) { New-Item -ItemType Directory "$ROOT\app\login" | Out-Null }

Set-Content "$ROOT\app\login\page.tsx" @'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  function handleLogin() {
    if (email === "admin@pecuariatech.com" && senha === "123") {
      localStorage.setItem("session", "ok");
      router.push("/admin");
    } else {
      setMsg("Credenciais inválidas.");
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Login PecuariaTech</h1>
      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      /><br />

      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={e => setSenha(e.target.value)}
      /><br />

      <button onClick={handleLogin}>Entrar</button>

      {msg && <p>{msg}</p>}
    </div>
  );
}
'@

Write-Host "login/page.tsx OK."

# ------------------------------------------------------------
# 5. Criar APIs ultra
# ------------------------------------------------------------
Write-Host "Recriando APIs ultra..."

Ensure-Dir("$ROOT\app\api\ultra")
Ensure-Dir("$ROOT\app\api\ultra\ping")
Ensure-Dir("$ROOT\app\api\ultra\health")
Ensure-Dir("$ROOT\app\api\ultra\status")

function Ensure-Dir($p) { if (!(Test-Path $p)) { New-Item -ItemType Directory $p | Out-Null } }

Set-Content "$ROOT\app\api\ultra\ping\route.ts" @'
export async function GET() {
  return Response.json({ ok: true, ts: Date.now(), service: "ping" });
}
'@

Set-Content "$ROOT\app\api\ultra\health\route.ts" @'
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const sup = supabaseServer();
  const { data, error } = await sup.from("pastagem").select("id").limit(1);
  return Response.json({ ok: !error, error });
}
'@

Set-Content "$ROOT\app\api\ultra\status\route.ts" @'
export async function GET() {
  return Response.json({
    ok: true,
    version: "v23",
    uptime: process.uptime(),
    time: Date.now()
  });
}
'@

Write-Host "APIs criadas."

# ------------------------------------------------------------
# 6. Rodar build
# ------------------------------------------------------------
npm install
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "BUILD OK! Rodando deploy..."
    vercel --prod --yes
} else {
    Write-Host "ERRO NO BUILD — verificar acima."
}
