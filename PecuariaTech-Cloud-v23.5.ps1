# ============================================================
# PECUARIATECH CLOUD v23.5 — FIX CRÍTICO TRIÂNGULO 360°
# CORRIGE CHAVES, VALIDAR ARQUIVO E IMPEDE EXECUÇÃO CORROMPIDA
# ============================================================

$base = "C:\Users\Administrador\pecuariatech"
$backupRoot = "$base\backups"

# ------------------------------------------------------------
# 1) GARANTIR PASTA BACKUPS
# ------------------------------------------------------------
if (!(Test-Path $backupRoot)) {
    New-Item -ItemType Directory -Path $backupRoot | Out-Null
}

# ------------------------------------------------------------
# 2) CRIAR BACKUP SEGURO
# ------------------------------------------------------------
$stamp = (Get-Date -Format "yyyy-MM-dd_HH-mm-ss")
$backupZip = "$backupRoot\backup_v23_5_$stamp.zip"

Write-Host "Criando backup seguro..."
Compress-Archive -Path "$base\*" -DestinationPath $backupZip -Force
Write-Host "Backup criado: $backupZip"
Write-Host ""

# ------------------------------------------------------------
# 3) VALIDAÇÃO ANTES DO SCRIPT RODAR (Tri360)
# ------------------------------------------------------------
Write-Host "Validando integridade do script (Triangulo 360º)..."

$scriptPath = $MyInvocation.MyCommand.Source
$scriptLines = Get-Content $scriptPath

$openBr = ($scriptLines | Select-String "{").Count
$closeBr = ($scriptLines | Select-String "}").Count

if ($openBr -ne $closeBr) {
    Write-Host "❌ ERRO: O script salvo está corrompido."
    Write-Host "   A contagem de chaves não bate:"
    Write-Host "   Abertas:   $openBr"
    Write-Host "   Fechadas:  $closeBr"
    Write-Host ""
    Write-Host "➡ O arquivo NÃO FOI EXECUTADO por segurança."
    Write-Host "➡ Abra o arquivo e cole novamente o código COMPLETO."
    exit
}

Write-Host "✔ Passou na validação de integridade."
Write-Host ""

# ------------------------------------------------------------
# 4) RECRIAR LIBS COMPLETAS
# ------------------------------------------------------------

$libFolder = "$base\lib"

if (!(Test-Path $libFolder)) { 
    New-Item -ItemType Directory -Path $libFolder | Out-Null 
} else {
    Remove-Item "$libFolder\*" -Force -Recurse
}

# supabase-browser
Set-Content "$libFolder/supabase-browser.ts" @'
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON!
);
'@

# supabase-server
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

# auth
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

Write-Host "✔ Libs recriadas."
Write-Host ""

# ------------------------------------------------------------
# 5) RECRIAR login/page.tsx
# ------------------------------------------------------------

$loginPage = "$base\app\login\page.tsx"

if (!(Test-Path "$base\app\login")) {
    New-Item -ItemType Directory -Path "$base\app\login" | Out-Null
}

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
      password: senha
    });

    if (error) return alert("Erro: " + error.message);

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

# ------------------------------------------------------------
# 6) RECRIAR admin/page.tsx
# ------------------------------------------------------------

$adminPage = "$base\app\admin\page.tsx"

if (!(Test-Path "$base\app\admin")) {
    New-Item -ItemType Directory -Path "$base\app\admin" | Out-Null
}

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

# ------------------------------------------------------------
# 7) RECRIAR layout.tsx
# ------------------------------------------------------------

$layout = "$base\app\layout.tsx"

Set-Content $layout @'
export const metadata = {
  title: "PecuariaTech Cloud",
  description: "Triâ
