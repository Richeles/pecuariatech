# ==============================================================================
# PECUARIATECH CLOUD v20
# Enterprise: Auto-Heal | Backup Rotativo | Auto-Deploy | Health Cloud | Painel
# Dominio: https://www.pecuariatech.com
# ==============================================================================

$BasePath   = "C:\Users\Administrador\pecuariatech"
$DomainUrl  = "https://www.pecuariatech.com"
$LogFile    = Join-Path $BasePath "v20_cloud_log.txt"
$BackupsDir = Join-Path $BasePath "backups"
$KeepBackups = 5   # quantidade de backups para manter

# ==============================================================================
# Helpers de log e pasta
# ==============================================================================

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

Log "=== INICIANDO PECUARIATECH CLOUD v20 ==="

# ==============================================================================
# 1. Validação básica do projeto
# ==============================================================================

if (-not (Test-Path $BasePath)) {
    Log "ERRO: BasePath nao existe: $BasePath"
    exit 1
}

if (-not (Test-Path (Join-Path $BasePath "package.json"))) {
    Log "ERRO: package.json nao encontrado em $BasePath"
    exit 1
}

# ==============================================================================
# 2. Validação de variaveis de ambiente criticas
# ==============================================================================

$envMissing = @()

if (-not $env:NEXT_PUBLIC_SUPABASE_URL)     { $envMissing += "NEXT_PUBLIC_SUPABASE_URL" }
if (-not $env:NEXT_PUBLIC_SUPABASE_ANON_KEY){ $envMissing += "NEXT_PUBLIC_SUPABASE_ANON_KEY" }
if (-not $env:SUPABASE_SERVICE_ROLE_KEY)   { $envMissing += "SUPABASE_SERVICE_ROLE_KEY" }

if ($envMissing.Count -gt 0) {
    Log "ERRO: Variaveis de ambiente ausentes: $($envMissing -join ', ')"
    Log "Configure essas variaveis na Vercel e/ou no ambiente local antes de continuar."
    exit 1
}

# ==============================================================================
# 3. Backup rotativo
# ==============================================================================

function Criar-Backup {
    Ensure-Folder $BackupsDir
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $zipPath = Join-Path $BackupsDir "backup_$timestamp.zip"

    Log "Criando backup em $zipPath ..."
    Compress-Archive -Path $BasePath -DestinationPath $zipPath -Force
    Log "Backup criado."

    # Rotacao de backups
    $all = Get-ChildItem $BackupsDir -Filter "backup_*.zip" | Sort-Object LastWriteTime -Descending
    if ($all.Count -gt $KeepBackups) {
        $toDelete = $all | Select-Object -Skip $KeepBackups
        foreach ($f in $toDelete) {
            Log "Removendo backup antigo: $($f.FullName)"
            Remove-Item $f.FullName -Force
        }
    }

    return $zipPath
}

function Restaurar-Backup {
    Ensure-Folder $BackupsDir
    $last = Get-ChildItem $BackupsDir -Filter "backup_*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($null -eq $last) {
        Log "Nenhum backup encontrado para restaurar."
        return
    }
    Log "Restaurando backup: $($last.FullName)"
    Expand-Archive -Path $last.FullName -DestinationPath $BasePath -Force
}

# ==============================================================================
# 4. Auto-Heal de codigo (Next.js / TSX)
# ==============================================================================

function Auto-Heal {
    Log "Executando Auto-Heal de arquivos TS/TSX..."

    $files = Get-ChildItem -Recurse -Path $BasePath -Include *.tsx, *.ts -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw

        # Corrigir aspas duplicadas gerais
        $content = $content -replace '""', '"'

        # Corrigir padrao especifico de useState<string>(");
        $content = $content -replace 'useState<string>\("?\);','useState<string>("");'

        Set-Content $file.FullName $content
    }

    Log "Auto-Heal finalizado."
}

# ==============================================================================
# 5. Instalar / Reinstalar libs e APIs Cloud
# ==============================================================================

function Install-Libs {
    Log "Instalando lib/supabase-server.ts ..."
    Ensure-Folder (Join-Path $BasePath "lib")

    Set-Content (Join-Path $BasePath "lib\supabase-server.ts") @'
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
'@
}

function Install-APIs {
    Log "Instalando APIs /api/ultra/* ..."
    Ensure-Folder (Join-Path $BasePath "app\api\ultra")
    Ensure-Folder (Join-Path $BasePath "app\api\ultra\ping")
    Ensure-Folder (Join-Path $BasePath "app\api\ultra\health")
    Ensure-Folder (Join-Path $BasePath "app\api\ultra\status")

    # /ping
    Set-Content (Join-Path $BasePath "app\api\ultra\ping\route.ts") @'
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: "v20-cloud",
    timestamp: new Date().toISOString(),
  });
}
'@

    # /health
    Set-Content (Join-Path $BasePath "app\api\ultra\health\route.ts") @'
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.pecuariatech.com";

export async function GET() {
  const start = Date.now();
  const checks: Record<string, any> = {};

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
    version: "v20-cloud",
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

    # /status
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
    version: "v20-cloud",
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
}

function Install-Panel {
    Log "Instalando painel /cloud/status ..."
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
      <h1>PecuariaTech Cloud v20</h1>
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
}

function Install-VercelCron {
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
}

# ==============================================================================
# 6. Triangulo 360 "Cloud" (rede + DNS basico)
# ==============================================================================

function Triangulo360Cloud {
    Log "Executando Triangulo 360 Cloud..."

    try {
        if (-not (Test-Connection 8.8.8.8 -Count 2 -Quiet)) {
            Log "Falha no teste de rede (8.8.8.8)."
            return $false
        }
    } catch {
        Log "Erro no teste de rede."
        return $false
    }

    try { Resolve-DnsName "supabase.com" | Out-Null } catch { Log "Falha DNS supabase.com"; return $false }
    try { Resolve-DnsName "vercel.com"   | Out-Null } catch { Log "Falha DNS vercel.com";   return $false }
    try { Resolve-DnsName "pecuariatech.com" | Out-Null } catch { Log "Falha DNS pecuariatech.com"; return $false }

    Log "Triangulo 360 Cloud OK."
    return $true
}

# ==============================================================================
# 7. Execução principal
# ==============================================================================

Criar-Backup
Auto-Heal
Install-Libs
Install-APIs
Install-Panel
Install-VercelCron

if (-not (Triangulo360Cloud)) {
    Log "Triangulo 360 falhou. Abortando antes do build."
    exit 1
}

Set-Location $BasePath

Log "Rodando npm install..."
npm install
if ($LASTEXITCODE -ne 0) {
    Log "npm install falhou com codigo $LASTEXITCODE"
    Restaurar-Backup
    exit 1
}

Log "Rodando npm run build..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Log "Build falhou com codigo $LASTEXITCODE. Restaurando backup..."
    Restaurar-Backup
    exit 1
}

Log "Enviando deploy para Vercel..."
vercel --prod --yes
if ($LASTEXITCODE -ne 0) {
    Log "Deploy falhou com codigo $LASTEXITCODE"
    exit 1
}

# Health final
Log "Testando dominio final..."
try {
    $resp = Invoke-WebRequest $DomainUrl -TimeoutSec 10
    Log "Dominio respondeu com status $($resp.StatusCode)"
} catch {
    Log "Dominio nao respondeu apos deploy."
}

Log "v20 concluido. Painel em /cloud/status e APIs em /api/ultra/*"
Write-Host "PecuariaTech Cloud v20 concluido. Acesse:"
Write-Host "$DomainUrl/cloud/status"
