# ==============================================================================
# PECUARIATECH CLOUD v22
# Fix libs em src/lib + recria login/page.tsx + build + deploy
# Dominio: https://www.pecuariatech.com
# ==============================================================================

$BasePath  = "C:\Users\Administrador\pecuariatech"
$DomainUrl = "https://www.pecuariatech.com"
$LogFile   = Join-Path $BasePath "v22_cloud_log.txt"
$BackupsDir = Join-Path $BasePath "backups"

function Log {
    param([string]$Message)
    $line = "[" + (Get-Date -Format "yyyy-MM-dd HH:mm:ss") + "] " + $Message
    $line | Out-File $LogFile -Append
    Write-Host $Message
}

function Ensure-Folder {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}

Log "=== INICIANDO PECUARIATECH CLOUD v22 ==="

# ------------------------------------------------------------------------------
# 1. Checagem de base
# ------------------------------------------------------------------------------
if (-not (Test-Path $BasePath)) {
    Log "ERRO: BasePath nao existe: $BasePath"
    exit 1
}

if (-not (Test-Path (Join-Path $BasePath "package.json"))) {
    Log "ERRO: package.json nao encontrado em $BasePath"
    exit 1
}

# ------------------------------------------------------------------------------
# 2. Backup rapido
# ------------------------------------------------------------------------------
Ensure-Folder $BackupsDir
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$zipPath = Join-Path $BackupsDir "backup_v22_$timestamp.zip"

Log "Criando backup em $zipPath ..."
Compress-Archive -Path $BasePath -DestinationPath $zipPath -Force
Log "Backup criado."

# ------------------------------------------------------------------------------
# 3. Criar libs em src/lib (e tambem em lib para compatibilidade)
# ------------------------------------------------------------------------------

Log "Criando libs em src/lib e lib ..."

$SrcLibPath = Join-Path $BasePath "src\lib"
$RootLibPath = Join-Path $BasePath "lib"

Ensure-Folder $SrcLibPath
Ensure-Folder $RootLibPath

# Conteudo shared das libs
$SupabaseBrowserContent = @'
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
'@

$AuthContent = @'
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

$SupabaseServerContent = @'
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
'@

# Escrever em src/lib
Set-Content (Join-Path $SrcLibPath "supabase-browser.ts") $SupabaseBrowserContent
Set-Content (Join-Path $SrcLibPath "auth.ts")              $AuthContent
Set-Content (Join-Path $SrcLibPath "supabase-server.ts")   $SupabaseServerContent

# Escrever tambem em lib (caso algum import direto use lib/)
Set-Content (Join-Path $RootLibPath "supabase-browser.ts") $SupabaseBrowserContent
Set-Content (Join-Path $RootLibPath "auth.ts")              $AuthContent
Set-Content (Join-Path $RootLibPath "supabase-server.ts")   $SupabaseServerContent

Log "Libs criadas em src/lib e lib."

# ------------------------------------------------------------------------------
# 4. Recriar app/login/page.tsx
# ------------------------------------------------------------------------------

Log "Recriando app/login/page.tsx ..."

$LoginDir = Join-Path $BasePath "app\login"
Ensure-Folder $LoginDir

Set-Content (Join-Path $LoginDir "page.tsx") @'
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        setMsg("Falha ao entrar: " + error.message);
      } else {
        setMsg("Login realizado com sucesso.");
        router.push("/dashboard");
      }
    } catch (err: any) {
      setMsg("Erro inesperado: " + String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", fontFamily: "Arial" }}>
      <h1>PecuariaTech - Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
            required
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
            required
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      {msg && <p style={{ marginTop: 15 }}>{msg}</p>}
    </div>
  );
}
'@

Log "login/page.tsx recriado."

# ------------------------------------------------------------------------------
# 5. npm install, build, deploy
# ------------------------------------------------------------------------------

Set-Location $BasePath

Log "Rodando npm install..."
npm install
if ($LASTEXITCODE -ne 0) {
    Log "npm install falhou com codigo $LASTEXITCODE"
    exit 1
}

Log "Rodando npm run build..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Log "Build falhou com codigo $LASTEXITCODE"
    Log "Confira os erros de compilacao acima."
    exit 1
}

Log "Enviando deploy para Vercel..."
vercel --prod --yes
if ($LASTEXITCODE -ne 0) {
    Log "Deploy falhou com codigo $LASTEXITCODE"
    exit 1
}

# ------------------------------------------------------------------------------
# 6. Teste final do dominio
# ------------------------------------------------------------------------------

Log "Testando dominio final..."

try {
    $resp = Invoke-WebRequest $DomainUrl -TimeoutSec 10
    Log "Dominio respondeu com status $($resp.StatusCode)"
} catch {
    Log "Dominio nao respondeu apos deploy."
}

Log "=== PECUARIATECH CLOUD v22 CONCLUIDO ==="
Write-Host "PecuariaTech Cloud v22 concluido."
Write-Host "Acesse:"
Write-Host "$DomainUrl/cloud/status"
Write-Host "$DomainUrl/api/ultra/health"
Write-Host "$DomainUrl/api/ultra/status"
