Write-Host "🔱 ULTRAFIX MASTER 360 v1 — PecuariaTech" -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

# =============================
# 1. CORRIGIR TSCONFIG PRINCIPAL
# =============================
Write-Host "📌 Corrigindo tsconfig.json..." -ForegroundColor Yellow
$tsconfig = "tsconfig.json"

if (Test-Path $tsconfig) {
    Copy-Item $tsconfig "$tsconfig.bak.$timestamp"

    $json = Get-Content $tsconfig -Raw | ConvertFrom-Json
    if (-not $json.compilerOptions) { $json | Add-Member -MemberType NoteProperty -Name compilerOptions -Value @{} }
    if (-not $json.exclude)       { $json | Add-Member -MemberType NoteProperty -Name exclude -Value @() }

    # Excluir Supabase Functions do build Next.js
    if ($json.exclude -notcontains "supabase/functions") {
        $json.exclude += "supabase/functions"
    }

    $json | ConvertTo-Json -Depth 10 | Set-Content $tsconfig -Encoding UTF8
    Write-Host "✅ tsconfig.json atualizado."
}

# ==========================================
# 2. CRIAR TSCONFIG DEDICADO DAS FUNCTIONS
# ==========================================
Write-Host "📌 Criando tsconfig.functions.json..." -ForegroundColor Yellow
@"
{
  "compilerOptions": {
    "module": "CommonJS",
    "target": "ES2020",
    "rootDir": "./supabase/functions",
    "outDir": "./supabase/functions/dist"
  },
  "include": ["supabase/functions"]
}
"@ | Set-Content "tsconfig.functions.json"

Write-Host "✅ tsconfig.functions.json criado."

# ===============================
# 3. GLOBAL DECLARATIONS (leve)
# ===============================
Write-Host "📌 Criando global.d.ts..." -ForegroundColor Yellow
@"
declare interface Window {
  pecuariaTech?: any;
}
"@ | Set-Content "global.d.ts"

Write-Host "✅ global.d.ts criado."

# ==========================================
# 4. CORRIGIR SUPABASE FUNCTIONS (ERROS COMUNS)
# ==========================================
Write-Host "📌 Corrigindo Supabase Functions..." -ForegroundColor Yellow
$functions = Get-ChildItem "supabase/functions" -Recurse -Filter "index.ts"

foreach ($fn in $functions) {
    Copy-Item $fn.FullName "$($fn.FullName).bak.$timestamp"
    $content = Get-Content $fn.FullName -Raw

    # Correção para fetch e Response fora do Edge Runtime
    $content = $content.Replace("from 'node-fetch'", "")
    $content = $content.Replace("Deno.", "")

    Set-Content $fn.FullName $content -Encoding UTF8
    Write-Host "   ✔ Corrigido: $($fn.FullName)"
}

Write-Host "✅ Supabase Functions ajustadas."

# ================================
# 5. CORRIGIR PÁGINA /mapa
# ================================
Write-Host "📌 Corrigindo página /mapa..." -ForegroundColor Yellow
$mapFile = "app\mapa\page.tsx"

if (Test-Path $mapFile) {
    Copy-Item $mapFile "$mapFile.bak.$timestamp"
    $content = Get-Content $mapFile -Raw

    if ($content -notmatch '"use client"') {
        $content = '"use client"' + "`n`n" + $content
    }

    if ($content -match "window\.") {
        $content = @"
"use client";

if (typeof window === "undefined") {
   export default function Mapa() { return null; }
} 

$content
"@
    }

    Set-Content $mapFile $content -Encoding UTF8
    Write-Host "   ✔ /mapa corrigido."
} else {
    Write-Host "⚠ /mapa não existe."
}

# ===============================
# 6. CORRIGIR AUTENTICAÇÃO
# ===============================
Write-Host "📌 Corrigindo auth-server.ts..." -ForegroundColor Yellow
$authFile = "lib\auth-server.ts"

if (Test-Path $authFile) {
    Copy-Item $authFile "$authFile.bak.$timestamp"
    $content = Get-Content $authFile -Raw

    $content = $content.Replace("cookies()", "import { cookies } from 'next/headers';")

    Set-Content $authFile $content -Encoding UTF8
    Write-Host "   ✔ auth-server.ts corrigido."
}

# ===============================
# 7. REMOVER PASTAS QUE PESAM NO DEPLOY
# ===============================
Write-Host "🧹 Limpando peso morto para Vercel..." -ForegroundColor Yellow

$removeList = @(
    "supabase\.temp",
    "node_modules\.cache",
    ".turbo",
    ".vercel/output",
    "supabase/functions/dist"
)

foreach ($dir in $removeList) {
    Get-ChildItem -Recurse -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -match $dir } |
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "   ✔ Pastas pesadas removidas."

# ===============================
# 8. LIMPAR .next
# ===============================
Write-Host "🧹 Limpando .next..." -ForegroundColor Magenta
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "   ✔ .next limpo."

# ===============================
# 9. RODAR BUILD
# ===============================
Write-Host "📦 Rodando build limpo..." -ForegroundColor Cyan
npm run build

Write-Host "🎉 ULTRAFIX MASTER 360 — FINALIZADO!" -ForegroundColor Green
