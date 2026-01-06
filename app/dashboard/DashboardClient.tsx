"use client";

// CAMINHO: app/dashboard/DashboardClient.tsx
// Dashboard Visual Estável — PecuariaTech
// UI definitiva (sem backend / sem financeiro)
// Next.js 16 + TypeScript strict

export default function DashboardClient() {
  return (
    <div className="space-y-12">

      {/* =============================== */}
      {/* HEADER */}
      {/* =============================== */}
      <header className="border-b pb-4">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Visão Geral da Fazenda
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Indicadores principais da operação pecuária bovina
        </p>
      </header>

      {/* =============================== */}
      {/* KPIs — ALINHADOS À ESQUERDA */}
      {/* =============================== */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard titulo="Receita Total" valor="—" />
          <KpiCard titulo="Custos Totais" valor="—" />
          <KpiCard titulo="Resultado" valor="—" destaque />
          <KpiCard titulo="Margem" valor="—" />
        </div>
      </section>

      {/* =============================== */}
      {/* PLANOS PECUARIATECH (INFORMATIVO) */}
      {/* =============================== */}
      <section className="rounded-xl border bg-white p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Qual plano faz sentido para sua realidade?
        </h2>

        <p className="text-sm text-gray-600 mb-8 max-w-3xl">
          Cada plano foi desenvolvido de acordo com o nível de maturidade da
          fazenda, respeitando a realidade do produtor e a evolução natural da
          gestão pecuária.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

          <Plano
            nome="Básico"
            descricao="Para quem quer sair do caderno e organizar a fazenda."
            itens={[
              "Dashboard simples",
              "Controle básico de rebanho bovino",
              "Gestão essencial de pastagem",
              "Relatório mensal automático",
            ]}
            preco="a partir de R$ 31,75/mês"
          />

          <Plano
            nome="Profissional"
            descricao="Para quem já produz e precisa entender melhor os números."
            itens={[
              "Tudo do plano Básico",
              "Relatórios financeiros",
              "Indicadores operacionais",
            ]}
            preco="a partir de R$ 52,99/mês"
          />

          <Plano
            nome="Ultra"
            destaque
            descricao="Para quem quer parar de reagir e começar a decidir."
            itens={[
              "Análises avançadas",
              "Alertas inteligentes",
              "IA aplicada à pecuária",
            ]}
            preco="a partir de R$ 106,09/mês"
          />

          <Plano
            nome="Empresarial"
            descricao="Para operações maiores, com equipe e múltiplas fazendas."
            itens={[
              "Multi-fazendas",
              "Gestão de equipes",
              "Relatórios personalizados",
            ]}
            preco="a partir de R$ 159,19/mês"
          />

          <Plano
            nome="Premium Dominus 360°"
            descricao="Para quem pensa como gestor, investidor ou dono."
            itens={[
              "CFO Autônomo",
              "EBITDA e valuation",
              "IA financeira completa",
            ]}
            preco="a partir de R$ 318,49/mês"
          />
        </div>

        <div className="mt-10">
          <a
            href="/planos"
            className="inline-block rounded-lg bg-green-600 px-8 py-3 text-white font-semibold hover:bg-green-500 transition"
          >
            Ver detalhes dos planos
          </a>
        </div>
      </section>
    </div>
  );
}

/* =============================== */
/* COMPONENTES AUXILIARES */
/* =============================== */

function KpiCard({
  titulo,
  valor,
  destaque,
}: {
  titulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 border ${
        destaque
          ? "border-green-500 bg-green-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <p className="text-sm text-gray-600">{titulo}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-2">
        {valor}
      </p>
    </div>
  );
}

function Plano({
  nome,
  descricao,
  itens,
  preco,
  destaque,
}: {
  nome: string;
  descricao: string;
  itens: string[];
  preco: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-5 space-y-3 ${
        destaque
          ? "border-yellow-400 bg-yellow-50/40"
          : "border-gray-200 bg-white"
      }`}
    >
      <h3 className="font-semibold text-gray-900">{nome}</h3>
      <p className="text-sm italic text-gray-700">{descricao}</p>

      <ul className="text-sm text-gray-600 space-y-1">
        {itens.map((item) => (
          <li key={item}>✓ {item}</li>
        ))}
      </ul>

      <p className="font-bold text-green-600">{preco}</p>
    </div>
  );
}
