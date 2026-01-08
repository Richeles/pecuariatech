// app/dashboard/financeiro/dre/page.tsx
// DRE — Demonstrativo de Resultado do Exercício
// Submódulo do Financeiro | PecuariaTech
// Server Component — Next.js 16 App Router

export default function DrePage() {
  return (
    <main className="space-y-8">
      {/* CABEÇALHO */}
      <header>
        <h1 className="text-2xl font-bold text-gray-800">
          DRE · Demonstrativo de Resultado
        </h1>
        <p className="text-gray-600">
          Resultado econômico real da fazenda, consolidado automaticamente.
        </p>
      </header>

      {/* RECEITAS */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-2">
          Receita Bruta
        </h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>Venda de animais</li>
          <li>Venda de leite</li>
          <li>Outras receitas</li>
        </ul>
        <p className="font-semibold mt-3">
          Receita Total —
        </p>
      </section>

      {/* CUSTOS */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-2">
          Custos Operacionais
        </h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>Alimentação</li>
          <li>Sanidade / Veterinário</li>
          <li>Mão de obra</li>
          <li>Pastagem / Insumos</li>
          <li>Energia / Combustível</li>
        </ul>
        <p className="font-semibold mt-3">
          Custos Totais —
        </p>
      </section>

      {/* RESULTADO */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-2">
          Resultado do Período
        </h2>
        <p className="text-green-700 font-semibold">
          Lucro / Prejuízo —
        </p>
      </section>

      {/* CFO AUTÔNOMO */}
      <section className="border border-green-300 bg-green-50 rounded-xl p-6">
        <h3 className="font-semibold text-green-800">
          Análise Inteligente do CFO
        </h3>
        <p className="text-sm text-green-700 mt-2">
          Este demonstrativo é analisado automaticamente pelo PecuariaTech
          para gerar alertas de custos, margens e comparações anônimas
          com produtores de destaque.
        </p>
      </section>
    </main>
  );
}
