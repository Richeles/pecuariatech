<#
create-auth-files.ps1 – versão corrigida
Compatível com PowerShell, sem erros de parser.
#>

# -----------------------------
# CONFIG
# -----------------------------
$Root = "C:\Users\Administrador\pecuariatech"
$SrcLib = Join-Path $Root "src\lib"
$AdminPage = Join-Path $Root "app\admin\page.tsx"
$TimeStamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$LogFile = Join-Path $Root "create-auth-files.log"

function Write-Log {
    param([string]$msg)
    $t = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$t - $msg" | Out-File -FilePath $LogFile -Append -Encoding utf8
    Write-Host $msg
}

Write-Log "=== Iniciando create-auth-files.ps1 ==="

# -----------------------------
# Verifica raiz
# -----------------------------
if (-not (Test-Path $Root)) {
    Write-Log "ERRO: pasta raiz não encontrada: $Root"
    throw "Pasta raiz não encontrada: $Root"
}

# -----------------------------
# Cria src\lib se não existir
# -----------------------------
if (-not (Test-Path $SrcLib)) {
    New-Item -ItemType Directory -Path $SrcLib -Force | Out-Null
    Write-Log "Criada pasta: $SrcLib"
} else {
    Write-Log "Pasta src\lib já existe"
}

# -----------------------------
# Backup de arquivos
# -----------------------------
$filesToBackup = @(
    Join-Path $SrcLib "auth-server.ts",
    Join-Path $SrcLib "auth-client.ts",
    $AdminPage
)

foreach ($f in $filesToBackup) {
    if (Test-Path $f) {
        $bak = "$f.bak.$TimeStamp"
        Copy-Item -Path $f -Destination $bak -Force
        Write-Log "Backup criado: $bak"
    }
}

# -----------------------------
# Criar auth-server.ts
# -----------------------------
$authServerContent = @'
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const ADMIN_EMAIL = "admin@pecuariatech.com";

export async function getServerSession() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}
'@

$authServerPath = Join-Path $SrcLib "auth-server.ts"
$authServerContent | Set-Content -Encoding UTF8 $authServerPath
Write-Log "auth-server.ts criado"

# -----------------------------
# Criar auth-client.ts
# -----------------------------
$authClientContent = @'
export function getClientSession() {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("session");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveClientSession(session: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem("session", JSON.stringify(session));
}

export function signOutClient() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("session");
}
'@

$authClientPath = Join-Path $SrcLib "auth-client.ts"
$authClientContent | Set-Content -Encoding UTF8 $authClientPath
Write-Log "auth-client.ts criado"

# -----------------------------
# Atualizar app/admin/page.tsx
# -----------------------------
if (Test-Path $AdminPage) {
    $text = Get-Content $AdminPage -Raw

    # Regex seguro (aspas escapadas)
    $pattern = 'import\s+\{\s*getSession\s*,\s*ADMIN_EMAIL\s*\}\s+from\s+["'']@\\/lib\\/auth["''];?'

    if ($text -match $pattern) {
        $newImport = 'import { getServerSession, ADMIN_EMAIL } from "@/lib/auth-server";'
        $text = [regex]::Replace($text, $pattern, $newImport)
        $text | Set-Content -Encoding UTF8 $AdminPage
        Write-Log "Import atualizado em admin/page.tsx"
    } else {
        Write-Log "Nenhum import antigo encontrado em admin/page.tsx"
    }
} else {
    Write-Log "app/admin/page.tsx não encontrado"
}

# -----------------------------
# Finalização
# -----------------------------
Write-Host ""
Write-Host "✔ Arquivos criados/atualizados com sucesso!" -ForegroundColor Green
Write-Host ""

$ask = Read-Host "Deseja rodar npm run build agora? (S/N)"

if ($ask -match '^[sS]') {
    Push-Location $Root
    npm run build
    Pop-Location
}
