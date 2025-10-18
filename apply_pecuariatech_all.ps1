# =====================================================================
# SCRIPT: apply_pecuariatech_all.ps1
# AUTOR: Richeles + GPT-5
# OBJETIVO: Pipeline automatizado PecuariaTech Cloud
# =====================================================================

function Log {
    param([string]$msg, [string]$type = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$type] $msg"
}

# === 1️⃣ Início ===
Log "Iniciando pipeline PecuariaTech Cloud..." "INFO"
Set-Location "C:\Users\Administrador\pecuariatech"

# === 2️⃣ Verificação do ambiente ===
if (-not (Get-Command "supabase" -ErrorAction SilentlyContinue)) {
    Log "❌ Supabase CLI não encontrada. Instale e tente novamente." "ERRO"
    exit 1
}
if (-not (Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Log "❌ Vercel CLI não encontrada. Instale e tente novamente." "ERRO"
    exit 1
}
Log "✅ Ambiente verificado com sucesso (Supabase + Vercel disponíveis)." "OK"

# === 3️⃣ Garantir pasta components ===
$componentsPath = "C:\Users\Administrador\pecuariatech\components"
if (-not (Test-Path $componentsPath)) {
    Log "⚙️ Criando pasta 'components'..." "WARN"
    New-Item -Path $componentsPath -ItemType Directory -Force | Out-Null
    Start-Sleep -Seconds 1
}
if (-not (Test-Path $componentsPath)) {
    Log "❌ Falha ao criar pasta components. Verifique permissões." "ERRO"
    exit 1
}
Log "📁 Pasta 'components' pronta." "OK"

# === 4️⃣ Criar componentes UltraChat e UltraBiologico2 ===
$chatFile = Join-Path $componentsPath "UltraChat.tsx"
$bioFile = Join-Path $componentsPath "UltraBiologico2.tsx"

try {
    if (-not (Test-Path $chatFile)) {
        Log "🧠 Criando UltraChat.tsx..." "INFO"
        @"
export default function UltraChat() {
  return (
    <div style={{ padding: '20px', border: '2px solid #4ade80', borderRadius: '10px', background: '#ecfdf5' }}>
      <h2>🤖 UltraChat Placeholder</h2>
      <p>Componente ainda em desenvolvimento...</p>
    </div>
  );
}
"@ | Out-File -FilePath $chatFile -Encoding utf8 -Force
    }

    if (-not (Test-Path $bioFile)) {
        Log "🌿 Criando UltraBiologico2.tsx..." "INFO"
        @"
export default function UltraBiologico2() {
  return (
    <div style={{ padding: '20px', border: '2px solid #60a5fa', borderRadius: '10px', background: '#eff6ff' }}>
      <h2>🧬 UltraBiológico 2 Placeholder</h2>
      <p>Componente ainda em desenvolvimento...</p>
    </div>
  );
}
"@ | Out-File -FilePath $bioFile -Encoding utf8 -Force
    }
}
catch {
    Log "❌ Erro ao criar componentes: $($_.Exception.Message)" "ERRO"
    exit 1
}
Log "✅ Componentes criados/verificados com sucesso." "OK"

# === 5️⃣ Build local Next.js ===
Log "🚀 Iniciando build local..." "INFO"
npm run build | Tee-Object -FilePath "build_log.txt"
if ($LASTEXITCODE -ne 0) {
    Log "❌ Erro no build local. Veja build_log.txt para detalhes." "ERRO"
    exit 1
}
Log "✅ Build local concluído." "OK"

# === 6️⃣ Deploy no Vercel ===
Log "☁️ Iniciando deploy no Vercel..." "INFO"
vercel --prod | Tee-Object -FilePath "vercel_deploy_log.txt"
if ($LASTEXITCODE -ne 0) {
    Log "❌ Erro no deploy. Veja vercel_deploy_log.txt." "ERRO"
    exit 1
}
Log "✅ Deploy finalizado com sucesso!" "OK"
Log "🎯 Pipeline PecuariaTech Cloud concluído com êxito ✅" "OK"
