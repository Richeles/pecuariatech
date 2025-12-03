# ============================================
# UltraPro Setup v4 — 100% automático
# PecuariaTech — Richeles
# ============================================

Write-Host "🚀 Iniciando UltraPro Setup v4..." -ForegroundColor Green

# 1) Diretório do projeto (já fixo na pasta atual)
$projectPath = "C:\Users\Administrador\pecuariatech"
Write-Host "📦 Criando projeto diretamente em: $projectPath"

# 2) Criar pasta utils se não existir
if (-Not (Test-Path "$projectPath/utils")) {
    New-Item -ItemType Directory -Path "$projectPath/utils" | Out-Null
}

# 3) Criar pastas essenciais do UltraPro
$folders = @(
    "$projectPath/app/dashboard",
    "$projectPath/app/admin",
    "$projectPath/app/admin/usuarios",
    "$projectPath/app/admin/ultrabiologica",
    "$projectPath/app/admin/config"
)

foreach ($f in $folders) {
    if (-Not (Test-Path $f)) {
        New-Item -ItemType Directory -Path $f | Out-Null
        Write-Host "📁 Criada pasta: $f"
    } else {
        Write-Host "⚠️ Pasta já existe: $f"
    }
}

# 4) Instalar Next.js + dependências (automaticamente)
Write-Host "⚙️ Instalando Next.js e dependências..." -ForegroundColor Yellow
cd $projectPath
npx create-next-app@latest . --ts --eslint --tailwind --no-app --import-alias "@/*" --yes

npm install recharts lucide-react @supabase/supabase-js

# 5) Criar layout global com menu lateral
Write-Host "🧱 Criando layout UltraPro..."
@"
import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className='flex min-h-screen bg-gray-100'>
      <aside className='w-64 bg-green-900 text-white p-6 space-y-6'>
        <h1 className='text-2xl font-bold'>PecuariaTech UltraPro</h1>
        <nav className='space-y-3'>
          <Link href='/dashboard' className='block hover:text-yellow-300'>Dashboard</Link>
          <Link href='/admin/usuarios' className='block hover:text-yellow-300'>Usuários</Link>
          <Link href='/admin/ultrabiologica' className='block hover:text-yellow-300'>UltraBiológica</Link>
          <Link href='/admin/config' className='block hover:text-yellow-300'>Configurações</Link>
        </nav>
      </aside>

      <main className='flex-1 p-10'>
        {children}
      </main>
    </div>
  );
}
"@ | Set-Content "$projectPath/app/layout.tsx"

# 6) Criar página Dashboard
Write-Host "📊 Criando Dashboard UltraPro..."
@"
export default function Dashboard() {
  return (
    <div>
      <h1 className='text-3xl font-bold mb-6'>Dashboard UltraPro</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white p-6 shadow rounded-xl'>
          <h2 className='text-xl font-semibold'>Rebanho Total</h2>
          <p className='text-4xl font-bold mt-2 text-green-700'>128</p>
        </div>
        <div className='bg-white p-6 shadow rounded-xl'>
          <h2 className='text-xl font-semibold'>Área da Fazenda</h2>
          <p className='text-4xl font-bold mt-2 text-blue-700'>240 ha</p>
        </div>
        <div className='bg-white p-6 shadow rounded-xl'>
          <h2 className='text-xl font-semibold'>Financeiro</h2>
          <p className='text-4xl font-bold mt-2 text-yellow-700'>R$ 52.800</p>
        </div>
      </div>

      <h2 className='text-2xl font-bold mt-10'>Gráfico Financeiro</h2>
      <p className='text-gray-600'>Gráfico dinâmico será integrado em breve.</p>
    </div>
  );
}
"@ | Set-Content "$projectPath/app/dashboard/page.tsx"

# 7) Criar alertas simulados
Write-Host "🔔 Criando alertas simulados..."
@"
export async function sendAlert(message: string) {
  console.log('⚠️ ALERTA (modo simulado):', message);
}
"@ | Set-Content "$projectPath/utils/alerts.ts"

# 8) Finalização
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
