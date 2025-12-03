# =====================================================================
# PECUARIATECH CLOUD v23 (FIXED) — ASCII ONLY
# =====================================================================

$ROOT = "C:\Users\Administrador\pecuariatech"
cd $ROOT

Write-Host "=== INICIANDO PECUARIATECH CLOUD v23 (FIX) ==="

# ------------------------------------------------------------
# 1. Backup
# ------------------------------------------------------------
$bk = "$ROOT\backups\backup_v23_fix_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').zip"
Write-Host "Criando backup: $bk"
Compress-Archive -Path "$ROOT\*" -DestinationPath $bk -Force
Write-Host "Backup criado."

# ------------------------------------------------------------
# Helper function (MUST BE BEFORE USE)
# ------------------------------------------------------------
function Ensure-Dir($p) { 
    if (!(Test-Path $p)) { 
        New-Item -ItemType Directory $p | Out-Null 
    }
}

# ------------------------------------------------------------
# 2. Criar libs corretas
# ------------------------------------------------------------
Write-Host "Recriando estrutura src/lib..."

Ensure-Dir "$ROOT\src"
Ensure-Dir "$ROOT\src\lib"

# supabase-browser.ts
Set-Content "$ROOT\src\lib\supabase-browser.ts" @'
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON!
);
'@

# supabase-server.ts
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

# auth.ts
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

Write-Host "Libs OK."

# ------------------------------------------------------------
# 3. tsconfig.json
# ------------------------------------------------------------
Write-Host "Recriando tsconfig.json..."

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

Write-Host "tsconfig OK."

# ------------------------------------------------------------
# 4. Login
# ------------------------------------------------------------
Write-Host "Recriando login/page.tsx..."

Ensure-Dir "$ROOT\app\login"

Set-Content "$ROOT\app\login\page.tsx" @'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState(null);
  const router = useRouter();

  function handleLogin() {
    if (email === "admin@pecuariatech.com" && senha === "123") {
      localStorage.setItem("session", "ok");
      router.push("/admin");
    } else {
      setMsg("Credenciais invalidas.");
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Login PecuariaTech</h1>

      <input placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      /><br />

      <input type="password" placeholder="Senha"
        value={senha}
        onChange={e => setSenha(e.target.value)}
      /><br />

      <button onClick={handleLogin}>Entrar</button>

      {msg && <p>{msg}</p>}
    </div>
  );
}
'@

Write-Host "Login OK."

# ------------------------------------------------------------
# 5. APIs Ultra
# ------------------------------------------------------------

Write-Host "Recriando APIs ultra..."

Ensure-Dir "$ROOT\app\api"
Ensure-Dir "$ROOT\app\api\ultra"
Ensure-Dir "$ROOT\app\api\ultra\ping"
Ensure-Dir "$ROOT\app\api\ultra\health"
Ensure-Dir "$ROOT\app\api\ultra\status"

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
    uptime: 12345,
    time: Date.now()
  });
}
'@

Write-Host "APIs OK."

# ------------------------------------------------------------
# 6. Build + Deploy
# ------------------------------------------------------------
Write-Host "Rodando npm install..."
npm install

Write-Host "Rodando npm run build..."
npm run build
$exit = $LASTEXITCODE

if ($exit -eq 0) {
    Write-Host "BUILD OK. Enviando para Vercel..."
    vercel --prod --yes
} else {
    Write-Host "ERRO NO BUILD. Verifique os erros acima."
}
