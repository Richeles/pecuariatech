# ============================================================
# PECUARIATECH CLOUD UNI v24.2
# Script único: AutoFix + Build + Deploy + Health + Triângulo360
# ============================================================

param(
    [string]$SupabaseUrl = "https://YOUR-PROJECT.supabase.co",
    [string]$SupabaseKey = "SERVICE_ROLE_KEY_AQUI",
    [string]$WhatsappToken = "",
    [string]$WhatsappNumber = "",
    [switch]$Loop
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$logFile = Join-Path $root "pecuariatech-cloud-uni-v24.2.log"

function Log($msg) {
    $t = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $linha = "[$t] $msg"
    Add-Content -Path $logFile -Value $linha
    Write-Host $linha
}

function NotifyWPP($txt) {
    if (-not $WhatsappToken -or -not $WhatsappNumber) { return }
    try {
        $urlTxt = [uri]::EscapeDataString($txt)
        $url = "https://api.callmebot.com/whatsapp.php?phone=$WhatsappNumber&text=$urlTxt&apikey=$WhatsappToken"
        Invoke-RestMethod -Uri $url -Method Get | Out-Null
        Log "📲 WhatsApp enviado."
    } catch {
        Log "⚠️ Falha ao enviar WhatsApp: $($_.Exception.Message)"
    }
}

function Check-GPSDevice {
    try {
        $gps = Get-WmiObject Win32_PnPEntity | Where-Object { $_.Name -match "GPS" }
        if ($gps) { Log "📡 GPS detectado: $($gps.Name)"; return $true }
        else { Log "⚠️ Nenhum GPS detectado"; return $false }
    } catch {
        Log "⚠️ Erro ao verificar GPS: $($_.Exception.Message)"
        return $false
    }
}

function Test-Supabase {
    if (-not $SupabaseUrl -or -not $SupabaseKey) {
        Log "⚠️ SupabaseUrl ou SupabaseKey não configurados."; return $false
    }
    Log "🌐 Testando Supabase..."
    try {
        $r = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/" -Headers @{ apikey = $SupabaseKey } -TimeoutSec 10
        Log "✅ Supabase respondeu."
        return $true
    } catch {
        Log "❌ Supabase não respondeu: $($_.Exception.Message)"
        return $false
    }
}

function AutoFix-Encoding {
    Log "🔧 AutoFix de encoding leve..."
    $files = Get-ChildItem -Path $root -Recurse -Include *.js, *.ts, *.tsx, *.json -ErrorAction SilentlyContinue
    foreach ($f in $files) {
        try {
            $txt = Get-Content $f.FullName -Raw
            if ($txt -match "Ã|Â") {
                Set-Content -Path $f.FullName -Value $txt -Encoding UTF8
                Log "✔️ Encoding regravado: $($f.FullName)"
            }
        } catch {
            Log "⚠️ Falha encoding: $($_.Exception.Message)"
        }
    }
}

function AutoFix-NextStructure {
    Log "🧩 AutoFix estrutura Next.js..."

    $libFolder = Join-Path $root "lib"
    if (!(Test-Path $libFolder)) { New-Item -ItemType Directory -Path $libFolder | Out-Null }

    # supabase-browser.ts
    $sb = @(
        'import { createBrowserClient } from "@supabase/ssr";'
        ''
        'export const supabase = createBrowserClient('
        '  process.env.NEXT_PUBLIC_SUPABASE_URL!,'
        '  process.env.NEXT_PUBLIC_SUPABASE_ANON!'
        ');'
    )
    Set-Content -Path (Join-Path $libFolder "supabase-browser.ts") -Value $sb -Encoding UTF8

    # supabase-server.ts
    $ss = @(
        'import { createServerClient } from "@supabase/ssr";'
        'import { cookies } from "next/headers";'
        ''
        'export function supabaseServer() {'
        '  return createServerClient('
        '    process.env.NEXT_PUBLIC_SUPABASE_URL!,'
        '    process.env.SUPABASE_SERVICE_ROLE_KEY!,'
        '    { cookies }'
        '  );'
        '}'
    )
    Set-Content -Path (Join-Path $libFolder "supabase-server.ts") -Value $ss -Encoding UTF8

    # auth.ts
    $auth = @(
        'export const ADMIN_EMAIL = "admin@pecuariatech.com";'
        ''
        'export function getSession() {'
        '  if (typeof window === "undefined") return null;'
        '  return localStorage.getItem("session");'
        '}'
        ''
        'export function signOut() {'
        '  if (typeof window === "undefined") return;'
        '  localStorage.removeItem("session");'
        '}'
    )
    Set-Content -Path (Join-Path $libFolder "auth.ts") -Value $auth -Encoding UTF8

    # login/admin folders
    $loginDir = Join-Path $root "app\login"
    $adminDir = Join-Path $root "app\admin"

    if (!(Test-Path $loginDir)) { New-Item -ItemType Directory -Path $loginDir | Out-Null }
    if (!(Test-Path $adminDir)) { New-Item -ItemType Directory -Path $adminDir | Out-Null }

    # login page
    $loginPage = @(
        '"use client";'
        ''
        'import { useState } from "react";'
        'import { useRouter } from "next/navigation";'
        'import { supabase } from "@/lib/supabase-browser";'
        ''
        'export default function LoginPage() {'
        '  const [email, setEmail] = useState("");'
        '  const [senha, setSenha] = useState("");'
        '  const [msg, setMsg] = useState<string | null>(null);'
        '  const router = useRouter();'
        ''
        '  async function handleLogin() {'
        '    const { data, error } = await supabase.auth.signInWithPassword({'
        '      email,'
        '      password: senha,'
        '    });'
        ''
        '    if (error) { setMsg(error.message); return }'
        '    router.push("/admin");'
        '  }'
        ''
        '  return ('
        '    <div style={{ padding: 30 }}>'
        '      <h1>Login - PecuariaTech</h1>'
        '      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />'
        '      <br />'
        '      <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />'
        '      <br />'
        '      <button onClick={handleLogin}>Entrar</button>'
        '      {msg && <p>{msg}</p>}'
        '    </div>'
        '  );'
        '}'
    )
    Set-Content -Path (Join-Path $loginDir "page.tsx") -Value $loginPage -Encoding UTF8

    # admin page
    $adminPage = @(
        '"use client";'
        ''
        'import { useEffect, useState } from "react";'
        'import { supabase } from "@/lib/supabase-browser";'
        ''
        'interface UserInfo { email: string }'
        ''
        'export default function AdminPage() {'
        '  const [user, setUser] = useState<UserInfo | null>(null);'
        ''
        '  useEffect(() => {'
        '    supabase.auth.getUser().then(({ data, error }) => {'
        '      if (!error && data?.user) { setUser({ email: data.user.email ?? "" }) }'
        '    });'
        '  }, []);'
        ''
        '  if (!user) return <p>Carregando...</p>;'
        ''
        '  return ('
        '    <div style={{ padding: 30 }}>'
        '      <h1>Área Administrativa PecuariaTech</h1>'
        '      <p>Bem-vindo, {user.email}</p>'
        '    </div>'
        '  );'
        '}'
    )
    Set-Content -Path (Join-Path $adminDir "page.tsx") -Value $adminPage -Encoding UTF8

    # layout
    $layout = @(
        'import React from "react";'
        ''
        'export const metadata = {'
        '  title: "PecuariaTech Cloud",'
        '  description: "Triangulo 360 CloudSync + IA",'
        '};'
        ''
        'export default function RootLayout({ children }) {'
        '  return ('
        '    <html lang="pt-br">'
        '      <body>{children}</body>'
        '    </html>'
        '  );'
        '}'
    )
    Set-Content -Path (Join-Path $root "app\layout.tsx") -Value $layout -Encoding UTF8
}

function Run-BuildAndDeploy {
    Log "📦 npm install..."
    cd $root
    npm install
    if ($LASTEXITCODE -ne 0) { Log "❌ Erro npm install"; return $false }

    Log "🏗️ npm run build..."
    npm run build
    if ($LASTEXITCODE -ne 0) { Log "❌ Build falhou"; return $false }

    Log "🚀 Deploy Vercel..."
    vercel --prod --yes
    if ($LASTEXITCODE -ne 0) { Log "⚠️ Deploy falhou"; return $false }

    Log "✅ Deploy concluído."
    return $true
}

function Health-Check {
    Log "🩺 Testando https://www.pecuariatech.com ..."
    try {
        $r = Invoke-WebRequest -Uri "https://www.pecuariatech.com" -TimeoutSec 10
        Log "💚 Dominio OK: $($r.StatusCode)"
    } catch {
        Log "❌ Dominio falhou: $($_.Exception.Message)"
    }

    try {
        $r2 = Invoke-RestMethod -Uri "https://www.pecuariatech.com/api/ultra/stats" -TimeoutSec 10
        Log "💚 /api/ultra/stats OK"
    } catch {
        Log "⚠️ API falhou: $($_.Exception.Message)"
    }
}

Log "🚀 Iniciando PecuariaTech Cloud UNI v24.2"
NotifyWPP "PecuariaTech Cloud UNI v24.2 iniciou o deploy automático."

Check-GPSDevice | Out-Null
Test-Supabase | Out-Null
AutoFix-Encoding
AutoFix-NextStructure

$ok = Run-BuildAndDeploy
if ($ok) {
    Health-Check
    NotifyWPP "Deploy PecuariaTech Cloud UNI v24.2 concluído com sucesso."
    Log "🏁 Processo concluído com sucesso."
} else {
    NotifyWPP "Deploy PecuariaTech Cloud UNI v24.2 FALHOU."
    Log "🏁 Processo finalizado com falhas."
}

if ($Loop) {
    Log "🔁 Loop ativado..."
    while ($true) {
        Start-Sleep -Seconds 300
        Test-Supabase | Out-Null
        Health-Check
    }
}
