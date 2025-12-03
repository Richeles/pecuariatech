# deploy-ultradashboard-v5.ps1
# Script único para UltraDashboard v5 com dados reais do Supabase

# --- CONFIGURAÇÕES ---
$projectPath = "C:\Users\Administrador\pecuariatech"
$gitBranch = "main"
$vercelCmd = "vercel"

# --- Variáveis de ambiente Supabase ---
$env:NEXT_PUBLIC_SUPABASE_URL = "https://kpzzekflqpoeccnqfkng.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDcxNTIsImV4cCI6MjA2NjM4MzE1Mn0.0QL2lRFVTXTr_2DFV0dywfElLzXirgFvx0qZRWPZUSQ"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"

# --- Páginas a criar ---
$pages = @("dashboard","rebanho","pastagem","ultrabiologica/status")
$routes = @("/dashboard","/rebanho","/pastagem","/ultrabiologica/status")

# --- FUNÇÃO: Criar layout + globals.css ---
function Create-RootLayout {
    $layoutFile = Join-Path $projectPath "app\layout.tsx"
    $globalsFile = Join-Path $projectPath "app\globals.css"

    if (-not (Test-Path $layoutFile)) {
        New-Item -ItemType File -Path $layoutFile -Force
        @"
import './globals.css';
export const metadata = { title: 'PecuariaTech' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='pt-BR'>
      <body className='bg-gray-50 text-gray-800'>
        <div className='flex min-h-screen'>
          <aside className='w-56 bg-emerald-700 text-white p-4 space-y-2'>
            <h2 className='text-xl font-bold mb-4'>🌿 PecuariaTech</h2>
            <a href='/dashboard' className='block'>📊 Dashboard</a>
            <a href='/rebanho' className='block'>🐄 Rebanho</a>
            <a href='/pastagem' className='block'>🌱 Pastagem</a>
            <a href='/ultrabiologica/status' className='block'>🧪 UltraBiológica</a>
          </aside>
          <main className='flex-1 p-6'>{children}</main>
        </div>
      </body>
    </html>
  );
}
"@ | Out-File $layoutFile -Encoding UTF8
        Write-Host "[OK] layout.tsx criado."
    } else { Write-Host "[INFO] layout.tsx já existe." }

    if (-not (Test-Path $globalsFile)) {
        @"
@tailwind base;
@tailwind components;
@tailwind utilities;
body { font-family: sans-serif; }
"@ | Out-File $globalsFile -Encoding UTF8
        Write-Host "[OK] globals.css criado."
    } else { Write-Host "[INFO] globals.css já existe." }
}

# --- FUNÇÃO: Criar páginas ---
function Create-Pages {
    foreach ($page in $pages) {
        $path = Join-Path $projectPath ("app\" + $page.Replace("/","\"))
        if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path -Force }
        $filePath = Join-Path $path "page.tsx"

        if ($page -eq "dashboard") {
            @"
'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Dashboard() {
  const { data, error } = useSWR('/api/ultra/stats', fetcher);

  if (error) return <div>Erro ao carregar dados.</div>;
  if (!data) return <div>Carregando...</div>;

  const k = data.kpis;
  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>📊 Dashboard PecuariaTech</h1>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <Kpi title='Área total (ha)' value={k.area_total_ha} emoji='🌾' />
        <Kpi title='Cabeças de gado' value={k.total_heads} emoji='🐄' />
        <Kpi title='Saldo (R$)' value={k.finance_sum?.toFixed(2)} emoji='💰' />
        <Kpi title='Raças' value={k.racas_count} emoji='🧬' />
      </div>
      <div className='bg-white shadow rounded p-4 mb-6'>
        <h2 className='text-lg font-semibold mb-2'>Gráfico Financeiro</h2>
        <div className='h-64 bg-gray-100 flex items-center justify-center'>📈 em construção</div>
      </div>
      <div className='bg-white shadow rounded p-4'>
        <h2 className='text-lg font-semibold mb-2'>Tabela de Rebanho</h2>
        <div className='h-48 bg-gray-100 flex items-center justify-center'>📋 em construção</div>
      </div>
    </div>
  );
}

function Kpi({ title, value, emoji }: { title: string, value: any, emoji: string }) {
  return (
    <div className='bg-white p-4 rounded shadow text-center'>
      <div className='text-3xl mb-2'>{emoji}</div>
      <div className='text-sm text-gray-500'>{title}</div>
      <div className='text-xl font-bold text-emerald-600'>{value ?? '-'}</div>
    </div>
  );
}
"@ | Out-File $filePath -Encoding UTF8
        } else {
            @"
export default function $($page.Replace('/',''))() { return <h1>Página $page - Placeholder</h1>; }
"@ | Out-File $filePath -Encoding UTF8
        }
        Write-Host "[OK] Página $page criada."
    }
}

# --- FUNÇÃO: Criar API Supabase ---
function Create-Api {
    $apiPath = Join-Path $projectPath "app\api\ultra\stats\route.ts"
    $apiDir = Split-Path $apiPath
    if (-not (Test-Path $apiDir)) { New-Item -ItemType Directory -Path $apiDir -Force }

    @"
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const [rebanho, racas, pastagem, financeiro] = await Promise.all([
      supabase.from('rebanho').select('id'),
      supabase.from('racas').select('id'),
      supabase.from('pastagem').select('area_ha'),
      supabase.from('financeiro').select('valor')
    ]);

    const total_heads = rebanho.data?.length ?? 0;
    const racas_count = racas.data?.length ?? 0;
    const area_total_ha = pastagem.data?.reduce((sum, p) => sum + (p.area_ha || 0),0) ?? 0;
    const finance_sum = financeiro.data?.reduce((sum, f) => sum + (f.valor || 0),0) ?? 0;

    return new Response(JSON.stringify({ kpis: { total_heads, racas_count, area_total_ha, finance_sum } }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
"@ | Out-File $apiPath -Encoding UTF8
    Write-Host "[OK] API /api/ultra/stats criada."
}

# --- FUNÇÃO: Git commit + push ---
function Git-CommitPush {
    Set-Location $projectPath
    git add .
    git commit -m "✨ UltraDashboard v5: layout + páginas + API Supabase"
    git push origin $gitBranch
    Write-Host "[OK] Commit e push concluídos."
}

# --- FUNÇÃO: Deploy Vercel ---
function Deploy-Vercel {
    Set-Location $projectPath
    & $vercelCmd --prod
    Write-Host "[OK] Deploy Vercel concluído."
}

# --- FUNÇÃO: Testar rotas ---
function Test-Routes {
    foreach ($route in $routes) {
        $url = "https://www.pecuariatech.com$route"
        try {
            $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
            if ($resp.StatusCode -eq 200) { Write-Host "[OK] $url online." }
            else { Write-Host "[WARN] $url retornou $($resp.StatusCode)." }
        } catch { Write-Host "[ERROR] $url inacessível." }
    }
}

# --- EXECUÇÃO ---
Write-Host "=== Iniciando UltraDashboard v5 ===" -ForegroundColor Green
Create-RootLayout
Create-Pages
Create-Api
Git-CommitPush
Deploy-Vercel
Test-Routes
Write-Host "=== UltraDashboard v5 concluído com sucesso! ===" -ForegroundColor Green
