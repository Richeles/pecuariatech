# ============================================
# UltraPro Setup v3 — Sem Token WhatsApp
# PecuariaTech — Criado para Richeles
# ============================================

Write-Host "🚀 Iniciando UltraPro Setup v3..." -ForegroundColor Green

# 1) Pergunta o diretório do projeto
$destino = Read-Host "📁 Digite o caminho onde deseja criar o projeto (ex: C:\Users\Administrador)"
if (-Not (Test-Path $destino)) {
    Write-Host "❌ Caminho inválido! Abortando." -ForegroundColor Red
    exit
}

# 2) Define pasta final
$projectPath = Join-Path $destino "pecuariatech"

# Se a pasta já existir, não recria
if (-Not (Test-Path $projectPath)) {
    New-Item -ItemType Directory -Path $projectPath | Out-Null
}

Write-Host "📦 Criando projeto em: $projectPath"

cd $projectPath

# 3) Instala Next.js
Write-Host "⚙️ Instalando Next.js..." -ForegroundColor Yellow
npx create-next-app@latest . --ts --eslint --tailwind --no-app --import-alias "@/*" --yes

# 4) Instala dependências extras
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm install recharts lucide-react @supabase/supabase-js

# 5) Cria estrutura UltraPro
Write-Host "📁 Criando pastas UltraPro..."
New-Item -ItemType Directory -Path "$projectPath/app/dashboard" | Out-Null
New-Item -ItemType Directory -Path "$projectPath/app/admin" | Out-Null
New-Item -ItemType Directory -Path "$projectPath/app/admin/usuarios" | Out-Null
New-Item -ItemType Directory -Path "$projectPath/app/admin/ultrabiologica" | Out-Null
New-Item -ItemType Directory -Path "$projectPath/app/admin/config" | Out-Null

# 6) Criar menu lateral + layout global
Write-Host "🧱 Criando layout UltraPro..."

@"
import Link from "next/link";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-green-900 text-white p-6 space-y-6">
        <h1 className="text-2xl font-bold">PecuariaTech UltraPro</h1>
        <nav className="space-y-3">
          <Link href="/dashboard" className="block hover:text-yellow-300">Dashboard</Link>
          <Link href="/admin/usuarios" className="block hover:text-yellow-300">Usuários</Link>
          <Link href="/admin/ultrabiologica" className="block hover:text-yellow-300">UltraBiológica</Link>
          <Link href="/admin/config" className="block hover:text-yellow-300">Configurações</Link>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}
"@ | Set-Content "$projectPath/app/layout.tsx"

# 7) Criar página Dashboard
Write-Host "📊 Criando Dashboard UltraPro..."

@"
export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard UltraPro</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-xl font-semibold">Rebanho Total</h2>
          <p className="text-4xl font-bold mt-2 text-green-700">128</p>
        </div>

        <div className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-xl font-semibold">Área da Fazenda</h2>
          <p className="text-4xl font-bold mt-2 text-blue-700">240 ha</p>
        </div>

        <div className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-xl font-semibold">Financeiro</h2>
          <p className="text-4xl font-bold mt-2 text-yellow-700">R$ 52.800</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10">Gráfico Financeiro</h2>
      <p className="text-gray-600">Gráfico dinâmico será integrado em breve.</p>
    </div>
  );
}
"@ | Set-Content "$projectPath/app/dashboard/page.tsx"

# 8) Criar alertas simulados
Write-Host "🔔 Criando alertas simulados..."

@"
export async function sendAlert(message: string) {
  console.log("⚠️ ALERTA (modo simulado):", message);
}
"@ | Set-Content "$projectPath/utils/alerts.ts"

# 9) Finalização
Write-Host "✅ UltraPro instalado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Entre no projeto:"
Write-Host "cd $projectPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "▶️ Rodar local:"
Write-Host "npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌎 Deploy produção (Vercel):"
Write-Host "vercel --prod" -ForegroundColor Magenta
