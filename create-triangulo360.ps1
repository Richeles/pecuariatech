# create-triangulo360.ps1 — Cria a rota /triangulo360 com o componente Triangulo360 no PecuariaTech

$base = "C:\Users\Administrador\pecuariatech"

# 1. Cria as pastas
$dirs = @(
  "$base\app\triangulo360",
  "$base\components\ultracore"
)
foreach ($d in $dirs) {
  if (-Not (Test-Path $d)) {
    New-Item -ItemType Directory -Path $d | Out-Null
    Write-Host "📁 Criada a pasta: $d"
  }
}

# 2. Cria page.tsx dentro de app/triangulo360
$pagePath = "$base\app\triangulo360\page.tsx"
$pageCode = @"
import Triangulo360 from \"@/components/ultracore/Triangulo360\";

export default function Page() {
  return <Triangulo360 />;
}
"@
Set-Content -Path $pagePath -Value $pageCode -Encoding UTF8
Write-Host "📄 Criado: $pagePath"

# 3. Cria Triangulo360.tsx dentro de components/ultracore
$compPath = "$base\components\ultracore\Triangulo360.tsx"
$compCode = @"
\"use client\";
import { useState, useEffect } from \"react\";
import { Card, CardContent } from \"@/components/ui/card\";
import { Activity, Wifi, Database, Cpu } from \"lucide-react\";

export default function Triangulo360() {
  const [data, setData] = useState<any>(null);

  async function load() {
    try {
      const res = await fetch(\"/api/ultra/stats\");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const kpi = (label: string, value: any, Icon?: any) => (
    <Card className=\"p-4 bg-white/5 border-white/10 text-white rounded-2xl shadow-md\">
      <CardContent className=\"flex items-center gap-4\">
        { Icon && <Icon className=\"w-8 h-8 text-green-400\" /> }
        <div>
          <p className=\"text-sm opacity-70\">{label}</p>
          <p className=\"text-xl font-bold\">{value ?? \"--\"}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className=\"p-10 min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700\">
      <h1 className=\"text-4xl font-bold text-white mb-8\">Triângulo 360º — Status Completo</h1>

      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">
        {kpi(\"Alpha (Sistema)\", data?.alpha, Activity)}
        {kpi(\"Beta (Rede)\", data?.beta, Wifi)}
        {kpi(\"Gamma (Conexões externas)\", data?.gamma, Database)}
        {kpi(\"Omega (Saúde Final)\", data?.omega, Cpu)}
      </div>

      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6\">
        {kpi(\"Threshold\", data?.threshold)}
        {kpi(\"Cycle\", data?.cycle)}
        {kpi(\"Última Atualização\", data?.last_update)}
      </div>

      <div className=\"mt-10 bg-black/20 backdrop-blur-xl p-6 rounded-2xl text-white shadow-xl border border-white/10">
        <h2 className=\"text-2xl font-semibold mb-4\">Histórico</h2>
        <div className=\"h-64 overflow-auto bg-black/30 p-4 rounded-xl text-sm\">
          {data?.history
            ? data.history.map((v: any, i: number) => (
                <pre key={i} className=\"text-green-300\">{v}</pre>
              ))
            : \"Sem histórico ainda...\"}
        </div>
      </div>
    </div>
  );
}
"@
Set-Content -Path $compPath -Value $compCode -Encoding UTF8
Write-Host "📄 Criado: $compPath"

Write-Host "✅ Script concluído. Agora rode npm run build ou npm run dev para compilar o Next.js."
