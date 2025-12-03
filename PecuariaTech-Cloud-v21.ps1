# ==============================================================================
# PECUARIATECH CLOUD v21
# Fix Total: libs / layout / APIs / painel / cron / build / deploy
# Dominio: https://www.pecuariatech.com
# ==============================================================================

$BasePath   = "C:\Users\Administrador\pecuariatech"
$DomainUrl  = "https://www.pecuariatech.com"
$LogFile    = Join-Path $BasePath "v21_cloud_log.txt"
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

Log "=== INICIANDO PECUARIATECH CLOUD v21 ==="

# ------------------------------------------------------------------------------
# 1. Checagem básica
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
# 2. Backup simples (sem restore automatico depois)
# ------------------------------------------------------------------------------

Ensure-Folder $BackupsDir
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$zipPath = Join-Path $BackupsDir "backup_$timestamp.zip"

Log "Criando backup em $zipPath ..."
Compress-Archive -Path $BasePath -DestinationPath $zipPath -Force
Log "Backup criado."

# ------------------------------------------------------------------------------
# 3. Auto-Heal simples (aspas, useState quebrado)
# ------------------------------------------------------------------------------

Log "Executando Auto-Heal basico..."

$tsFiles = Get-ChildItem -Recurse -Path $BasePath -Include *.tsx, *.ts -ErrorAction SilentlyContinue
foreach ($file in $tsFiles) {
    $content = Get-Content $file.FullName -Raw

    # Corrigir aspas duplicadas
    $content = $content -replace '""', '"'

    # Corrigir padrao especifico de useState<string>(");
    $content = $content -replace 'useState<string>\("?\);','useState<string>("");'

    Set-Content $file.FullName $content
}

Log "Auto-Heal basico concluido."

# ------------------------------------------------------------------------------
# 4. Recriar libs: supabase-browser, auth, supabase-server
# ------------------------------------------------------------------------------

Log "Instalando libs em /lib..."

Ensure-Folder (Join-Path $BasePath "lib")

# lib/supabase-browser.ts
Set-Content (Join-Path $BasePath "lib\supabase-browser.ts") @'
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
'@

# lib/auth.ts
Set-Content (Join-Path $BasePath "lib\auth.ts") @'
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

# lib/supabase-server.ts
Set-Content (Join-Path $BasePath "lib\supabase-server.ts") @'
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
'@

Log "Libs recriadas."

# ------------------------------------------------------------------------------
# 5. Substituir layout.tsx por versao segura (sem use client)
# ------------------------------------------------------------------------------

Log "Sobrescrevendo app/layout.tsx com versao segura..."

$layoutPath = Join-Path $BasePath "app\layout.tsx"
Ensure-Folder (Join-Path $BasePath "app")

Set-Content $layoutPath @'
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PecuariaTech Cloud",
  description: "PecuariaTech - Gestao inteligente de pecuaria"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
'@

Log "layout.tsx substituido."

# ------------------------------------------------------------------------------
# 6. Reinstalar APIs /api/ultra/* e painel /cloud/status
# ------------------------------------------------------------------------------

Log "Instalando APIs /api/ultra/* e painel /cloud/status..."

# Pastas API
Ensure-Folder (Join-Path $BasePath "app\api\ultra")
Ensure-Folder (Join-Path $BasePath "app\api\ultra\ping")
Ensure-Folder (Join-Path $BasePath "app\api\ultra\health")
Ensure-Folder (Join-Path $BasePath "app\api\ultra\status")

# /api/ultra/ping
Set-Content (Join-Path $BasePath "app\api\ultra\ping\route.ts") @'
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: "v21-cloud",
    timestamp: new Date().toISOString(),
  });
}
'@

# /api/ultra/health
Set-Content (Join-Path $BasePath "app\api\ultra\health\route.ts") @'
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.pecuariatech.com";

export async function GET() {
  const start = Date.now();
  const checks: any = {};

  try {
    const { error } = await supabaseServer.from("pastagem").select("id").limit(1);
    checks.supabase = error ? { ok: false, error: error.message } : { ok: true };
  } catch (e) {
    checks.supabase = { ok: false, error: String(e) };
  }

  let domainOk = false;
  try {
    const r = await fetch(SITE_URL + "/api/ultra/ping", { cache: "no-store" });
    domainOk = r.ok;
    checks.domain = { ok: r.ok, status: r.status };
  } catch (e) {
    checks.domain = { ok: false, error: String(e) };
  }

  const payload = {
    ok: (checks.supabase.ok === true && domainOk === true),
    version: "v21-cloud",
    siteUrl: SITE_URL,
    tookMs: Date.now() - start,
    checks,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(payload, {
    status: payload.ok ? 200 : 503,
  });
}
'@

# /api/ultra/status
Set-Content (Join-Path $BasePath "app\api\ultra\status\route.ts") @'
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const now = new Date();

  const pasto = await supabaseServer.from("pastagem").select("id", { count: "exact", head: true });
  const rebanho = await supabaseServer.from("rebanho").select("id", { count: "exact", head: true });
  const financeiro = await supabaseServer.from("financeiro").select("id", { count: "exact", head: true });

  return NextResponse.json({
    ok: true,
    version: "v21-cloud",
    timestamp: now.toISOString(),
    metrics: {
      pastagem: pasto.count ?? 0,
      rebanho: rebanho.count ?? 0,
      financeiro: financeiro.count ?? 0
    },
    errors: {
      pastagem: pasto.error?.message ?? null,
      rebanho: rebanho.error?.message ?? null,
      financeiro: financeiro.error?.message ?? null
    }
  });
}
'@

# Painel /cloud/status
Ensure-Folder (Join-Path $BasePath "app\cloud")
Ensure-Folder (Join-Path $BasePath "app\cloud\status")

Set-Content (Join-Path $BasePath "app\cloud\status\page.tsx") @'
"use client";
import { useState, useEffect } from "react";

async function fetchJSON(url: string) {
  try {
    const r = await fetch(url, { cache: "no-store" });
    return await r.json();
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export default function CloudStatus() {
  const [ping, setPing] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);

  async function load() {
    setPing(await fetchJSON("/api/ultra/ping"));
    setHealth(await fetchJSON("/api/ultra/health"));
    setStatus(await fetchJSON("/api/ultra/status"));
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>PecuariaTech Cloud v21</h1>
      <p>Status em tempo real do ambiente em producao</p>
      <hr />

      <h2>Ping</h2>
      <pre>{JSON.stringify(ping, null, 2)}</pre>

      <h2>Health</h2>
      <pre>{JSON.stringify(health, null, 2)}</pre>

      <h2>Metrics</h2>
      <pre>{JSON.stringify(status, null, 2)}</pre>

      <p>Atualizacao automatica a cada 10 segundos.</p>
    </div>
  );
}
'@

Log "APIs e painel reinstalados."

# ------------------------------------------------------------------------------
# 7. vercel.json com cron de health
# ------------------------------------------------------------------------------

Log "Instalando vercel.json com cron..."

Set-Content (Join-Path $BasePath "vercel.json") @'
{
  "crons": [
    {
      "path": "/api/ultra/health",
      "schedule": "*/5 * * * *"
    }
  ]
}
'@

# ------------------------------------------------------------------------------
# 8. npm install, build, deploy
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
    Log "Verifique o log acima e os arquivos do projeto."
    exit 1
}

Log "Enviando deploy para Vercel..."
vercel --prod --yes
if ($LASTEXITCODE -ne 0) {
    Log "Deploy falhou com codigo $LASTEXITCODE"
    exit 1
}

# ------------------------------------------------------------------------------
# 9. Health final do dominio
# ------------------------------------------------------------------------------

Log "Testando dominio final..."

try {
    $resp = Invoke-WebRequest $DomainUrl -TimeoutSec 10
    Log "Dominio respondeu com status $($resp.StatusCode)"
} catch {
    Log "Dominio nao respondeu apos deploy."
}

Log "=== PECUARIATECH CLOUD v21 CONCLUIDO ==="
Write-Host "PecuariaTech Cloud v21 concluido."
Write-Host "Acesse:"
Write-Host "$DomainUrl/cloud/status"
Write-Host "$DomainUrl/api/ultra/health"
Write-Host "$DomainUrl/api/ultra/status"
