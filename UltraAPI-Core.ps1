Write-Host "🔵 [NÚCLEO API] Criando núcleo de dados..."

New-Item -ItemType Directory -Force -Path "src/app/api/ultra/stats" | Out-Null

@"
import { getCoreKPIs } from '@/lib/kpis/core';

export async function GET() {
  const kpis = await getCoreKPIs();
  return Response.json(kpis);
}
"@ | Set-Content "src/app/api/ultra/stats/route.ts"

Write-Host "🔵 [NÚCLEO API] Pronto."
