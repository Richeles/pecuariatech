# ======================================================================
# PECUARIATECH CLOUD v23.2 — CORREÇÃO DEFINITIVA DE IMPORTS
# ======================================================================

$base = "C:\Users\Administrador\pecuariatech"
$backupRoot = "$base\backups"

if (!(Test-Path $backupRoot)) { New-Item -ItemType Directory -Path $backupRoot | Out-Null }

$stamp = (Get-Date -Format "yyyy-MM-dd_HH-mm-ss")
$backupZip = "$backupRoot\backup_v23_2_$stamp.zip"

Write-Host "Criando backup seguro antes das correções..."
Compress-Archive -Path "$base\*" -DestinationPath $backupZip -Force
Write-Host "Backup criado em: $backupZip"
Write-Host ""

# ======================================================================
# REMOVER src/lib SE EXISTIR
# ======================================================================

$srcLib = "$base\src\lib"
if (Test-Path $srcLib) {
    Write-Host "Removendo src/lib (causa de duplicacao de imports)..."
    Remove-Item -Recurse -Force $srcLib
}

# ======================================================================
# RECRIAR lib/ SEM ERROS
# ======================================================================

$libFolder = "$base\lib"
if (!(Test-Path $libFolder)) {
    New-Item -ItemType Directory -Path $libFolder | Out-Null
    Write-Host "Criando lib/ do zero..."
} else {
    Write-Host "Limpando lib/ existente..."
    Remove-Item "$libFolder\*" -Force -Recurse
}

# -----------------------------
# lib/supabase-browser.ts
# -----------------------------
Set-Content "$libFolder/supabase-browser.ts" @'
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON!
);
'@

# -----------------------------
# lib/supabase-server.ts
# -----------------------------
Set-Content "$libFolder/supabase-server.ts" @'
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function supabaseServer() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies }
  );
}
'@

# -----------------------------
# lib/auth.ts
# -----------------------------
Set-Content "$libFolder/auth.ts" @'
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

Write-Host "Libs recriadas com sucesso."
Write-Host ""

# ======================================================================
# CORRIGIR login/page.tsx
# ======================================================================

$loginPage = "$base\app\login\page.tsx"

Set-Content $loginPage @'
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  async function login() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert("Erro: " + error.message);
      return;
    }

    router.push("/admin");
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Login — PecuariaTech</h1>
      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
      <input placeholder="Senha" type="password" onChange={(e)=>setSenha(e.target.value)} />
      <button onClick={login}>Entrar</button>
    </div>
  );
}
'@

Write-Host "Arquivo login/page.tsx corrigido."
Write-Host ""

# ======================================================================
# CORRIGIR admin/page.tsx
# ======================================================================

$adminPage = "$base\app\admin\page.tsx"

Set-Content $adminPage @'
"use client";
import { supabase } from "@/lib/supabase-browser";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });
  }, []);

  if (!user) return <p>Carregando...</p>;

  return (
    <div style={{ padding: 30 }}>
      <h1>Área Administrativa</h1>
      <p>Bem-vindo, {user.email}</p>
    </div>
  );
}
'@

Write-Host "Arquivo admin/page.tsx corrigido."
Write-Host ""

# ======================================================================
# CORRIGIR layout.tsx
# ======================================================================

$layout = "$base\app\layout.tsx"

Set-Content $layout @'
export const metadata = {
  title: "PecuariaTech Cloud",
  description: "Triângulo 360 — CloudSync + IA"
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
'@

Write-Host "layout.tsx corrigido."
Write-Host ""

# ======================================================================
# RODAR BUILD
# ======================================================================

Write-Host "Rodando npm install..."
npm install

Write-Host "Rodando npm run build..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO NO BUILD — restaurando backup!"
    Expand-Archive -LiteralPath $backupZip -DestinationPath $base -Force
    exit
}

Write-Host ""
Write-Host "=== BUILD OK — ENVIANDO PARA VERCEL ==="
vercel --prod --yes

Write-Host "=== PECUARIATECH CLOUD v23.2 FINALIZADO ==="
