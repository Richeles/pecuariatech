"use client";

// CAMINHO: app/dashboard/DashboardClient.tsx
// Dashboard Base Estável — PecuariaTech
// Sem dependência de API (reset estrutural)
// Next.js 16 + TypeScript strict

export default function DashboardClient() {
  return (
    <div className="space-y-10">

      {/* =============================== */}
      {/* HEADER */}
      {/* =============================== */}
      <header>
        <h1 className="text-2xl font-bold text-white">
          Dashboard PecuariaTech
        </h1>
        <p className="text-sm text-gray-200 mt-1">
          Visão geral da operação
        </p>
      </header>

      {/* =============================== */}
      {/* KPIs VISUAIS (PLACEHOLDER) */}
      {/* =============================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard titulo="Receita Total" valor="—" />
        <KpiCard titulo="Custos Totais" valor="—" />
        <KpiCard titulo="Resultado" valor="—" destaque />
        <KpiCard titulo="Margem" valor="—" />
      </section>

      {/* =============================== */}
      {/* PLANOS PECUARIATECH */}
      {/* =============================== */}
      <section className="mt-12 rounded-xl border bg-white p-6">
        <h2 className="text-xl font-semibold mb-2">
          Qual plano faz sentido para sua realidade?
        </h2>

        <p className="text-sm text-gray-600 mb-6">
          Cada plano foi pensado para um estágio diferente da operação rural.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">

          <Plano
            nome="Básico"
            descricao="Para quem quer sair do caderno e organizar a fazenda."
            itens={[
              "Dashboard simples",
              "Controle básico de rebanho",
              "Pastagem essencial",
              "Relatório mensal",
            ]}
            preco="a partir de R$ 31,75/mês"
          />

          <Plano
            nome="Profissional"
            descricao="Para quem precisa entender melhor os números."
            itens={[
              "Tudo do Básico",
              "Relatórios financeiros",
              "Indicadores operacionais",
            ]}
            preco="a partir de R$ 52,99/mês"
          />

          <Plano
            nome="Ultra"
            destaque
            descricao="Para quem quer decidir com inteligência."
            itens={[
              "Análises avançadas",
              "Alertas de decisão",
              "IA aplicada",
            ]}
            preco="a partir de R$ 106,09/mês"
          />

          <Plano
            nome="Empresarial"
            descricao="Para operações maiores e equipes."
            itens={[
              "Multi-fazendas",
              "Gestão de equipes",
              "Relatórios customizados",
            ]}
            preco="a partir de R$ 159,19/mês"
          />

          <Plano
            nome="Premium Dominus 360°"
            descricao="Para quem pensa como dono ou investidor."
            itens={[
              "CFO Autônomo",
              "EBITDA e valuation",
              "IA completa",
            ]}
            preco="a partir de R$ 318,49/mês"
          />
        </div>

        <div className="mt-6 text-center">
          <a
            href="/planos"
            className="inline-block rounded bg-green-600 px-6 py-2 text-white hover:opacity-90"
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
          ? "border-green-500 bg-green-900/20"
          : "border-white/10 bg-white/5"
      }`}
    >
      <p className="text-sm text-gray-300">{titulo}</p>
      <p className="text-2xl font-semibold text-white mt-2">{valor}</p>
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
      className={`border rounded-lg p-4 space-y-2 ${
        destaque ? "border-yellow-400" : ""
      }`}
    >
      <h3 className="font-semibold">{nome}</h3>
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
