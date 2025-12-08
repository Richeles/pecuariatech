Write-Host "📊 [NÚCLEO DASHBOARD] Iniciando núcleo isolado..."

# Garante estrutura
New-Item -ItemType Directory -Force -Path "src/app/dashboard" | Out-Null
New-Item -ItemType Directory -Force -Path "src/lib/kpis" | Out-Null

# KPIs base
@"
export async function getCoreKPIs() {
  return {
    rebanhoTotal: 0,
    pastagemDisponivel: 0,
    fluxoCaixa: 0,
    analisesBiologicas: 0
  };
}
"@ | Set-Content "src/lib/kpis/core.ts"

# Página
@"
export default function DashboardPage() {
  return <div>Dashboard Ultra360 ativo</div>;
}
"@ | Set-Content "src/app/dashboard/page.tsx"

Write-Host "📊 [NÚCLEO DASHBOARD] Pronto."
