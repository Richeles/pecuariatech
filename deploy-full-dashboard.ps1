# deploy-full-dashboard.ps1
# PowerShell único para criar Dashboard PecuariaTech + deploy + teste de rotas

# --- CONFIGURAÇÕES ---
$projectPath = "C:\Users\Administrador\pecuariatech"  # caminho do projeto
$vercelCmd = "vercel"  # comando Vercel CLI
$gitBranch = "main"  # branch para commit/push
$routes = @(
    "/dashboard",
    "/rebanho",
    "/pastagem",
    "/ultrabiologica/status"
)

# --- FUNÇÃO: Criar página com menu lateral e placeholders ---
function Create-DashboardPage {
    $dashboardPath = Join-Path $projectPath "app\dashboard"
    if (-Not (Test-Path $dashboardPath)) {
        New-Item -ItemType Directory -Path $dashboardPath -Force
    }

    $pageFile = Join-Path $dashboardPath "page.tsx"
    if (-Not (Test-Path $pageFile)) {
        $content = @"
import React from 'react';

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <nav style={{ width: '200px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2>PecuariaTech</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><a href='/dashboard' style={{ color: 'white' }}>Dashboard</a></li>
          <li><a href='/rebanho' style={{ color: 'white' }}>Rebanho</a></li>
          <li><a href='/pastagem' style={{ color: 'white' }}>Pastagem</a></li>
          <li><a href='/ultrabiologica/status' style={{ color: 'white' }}>UltraBiológica</a></li>
        </ul>
      </nav>
      <main style={{ flexGrow: 1, padding: '20px' }}>
        <h1>Dashboard PecuariaTech</h1>
        <section>
          <h3>Indicadores</h3>
          <p>Total de animais, média de ganho de peso, área de pastagem...</p>
        </section>
        <section>
          <h3>Gráficos</h3>
          <p>[Placeholder para gráficos de peso, pastagem e financeiro]</p>
        </section>
        <section>
          <h3>Tabela do Rebanho</h3>
          <p>[Placeholder para tabela de animais]</p>
        </section>
      </main>
    </div>
  );
}
"@

        Set-Content -Path $pageFile -Value $content -Encoding UTF8
        Write-Host "[OK] Página /dashboard criada com sucesso!"
    } else {
        Write-Host "[INFO] Página /dashboard já existe."
    }
}

# --- FUNÇÃO: Git commit + push ---
function Git-CommitPush {
    Set-Location $projectPath
    git add .
    git commit -m "Criar/atualizar Dashboard PecuariaTech"
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
            $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -Method Head -TimeoutSec 10
            if ($resp.StatusCode -eq 200) {
                Write-Host "[OK] Rota $route está online (200)."
            } else {
                Write-Host "[WARN] Rota $route retornou status $($resp.StatusCode)."
            }
        } catch {
            Write-Host "[ERROR] Rota $route não encontrada (404 ou erro)."
        }
    }
}

# --- EXECUÇÃO ---
Write-Host "=== Iniciando deploy completo do Dashboard PecuariaTech ==="
Create-DashboardPage
Git-CommitPush
Deploy-Vercel
Test-Routes
Write-Host "=== Processo concluído! ==="
