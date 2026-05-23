```tsx
"use client";

// CAMINHO: app/dashboard/DashboardClient.tsx
// PecuariaTech
// Dashboard Executivo Premium Ultra
// Runtime Cognitivo Estável
// Next.js 16 + TypeScript strict

import CFOAIInsights
from "@/app/components/cfo/CFOAIInsights";

export default function DashboardClient() {

  return (

    <div className="space-y-10">

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[36px]
          border
          border-[#86EFAC]/10
          bg-gradient-to-br
          from-[#214D3D]
          via-[#2A6D4A]
          to-[#1B4332]
          p-8
          xl:p-12
          shadow-[0_0_90px_rgba(16,185,129,0.14)]
        "
      >

        {/* FX */}

        <div
          className="
            absolute
            right-[-140px]
            top-[-140px]
            h-[360px]
            w-[360px]
            rounded-full
            bg-[#BBF7D0]/15
            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-[-140px]
            left-[-140px]
            h-[360px]
            w-[360px]
            rounded-full
            bg-[#86EFAC]/10
            blur-3xl
          "
        />

        {/* CONTENT */}

        <div className="relative z-10">

          {/* STATUS */}

          <div
            className="
              inline-flex
              items-center
              gap-3
              rounded-full
              border
              border-[#BBF7D0]/20
              bg-[#3B8B5E]/40
              px-5
              py-3
              text-xs
              font-black
              uppercase
              tracking-[0.28em]
              text-[#ECFDF5]
              backdrop-blur-xl
            "
          >

            <div
              className="
                h-3
                w-3
                rounded-full
                bg-[#BBF7D0]
                animate-pulse
              "
            />

            Runtime Executivo Online

          </div>

          {/* TITLE */}

          <h1
            className="
              mt-8
              max-w-5xl
              text-4xl
              font-black
              leading-tight
              text-white
              xl:text-7xl
            "
          >
            PecuariaTech
            <br />
            Gestão Inteligente
          </h1>

          {/* SUBTITLE */}

          <p
            className="
              mt-6
              max-w-4xl
              text-base
              leading-8
              text-[#ECFDF5]
              xl:text-lg
            "
          >
            Plataforma operacional cognitiva integrada
            ao financeiro, rebanho, pastagem,
            engorda e inteligência estratégica
            da operação pecuária.
          </p>

        </div>

      </section>

      {/* ================================================= */}
      {/* KPI GRID */}
      {/* ================================================= */}

      <section>

        <div
          className="
            grid
            grid-cols-1
            gap-5
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >

          <KpiCard
            titulo="Receita Estrutural"
            valor="R$ 1.240.000"
            color="emerald"
          />

          <KpiCard
            titulo="Pressão de Caixa"
            valor="R$ 482.000"
            color="amber"
          />

          <KpiCard
            titulo="Conversão Operacional"
            valor="R$ 758.000"
            color="cyan"
          />

          <KpiCard
            titulo="Risco Estrutural"
            valor="BAIXO"
            color="lime"
          />

        </div>

      </section>

      {/* ================================================= */}
      {/* CFO PREMIUM */}
      {/* ================================================= */}

      <section>

        <CFOAIInsights />

      </section>

      {/* ================================================= */}
      {/* PLANOS */}
      {/* ================================================= */}

      <section
        className="
          rounded-[36px]
          border
          border-[#86EFAC]/10
          bg-gradient-to-br
          from-[#1B4332]
          via-[#2A6D4A]
          to-[#214D3D]
          p-8
          xl:p-10
          shadow-[0_0_70px_rgba(16,185,129,0.12)]
        "
      >

        {/* HEADER */}

        <div className="max-w-4xl">

          <h2
            className="
              text-3xl
              font-black
              text-white
              xl:text-4xl
            "
          >
            Ecossistema PecuariaTech
          </h2>

          <p
            className="
              mt-5
              text-base
              leading-8
              text-[#ECFDF5]
              xl:text-lg
            "
          >
            Arquitetura progressiva para produtores,
            gestores, operações empresariais e
            inteligência financeira cognitiva.
          </p>

        </div>

        {/* GRID */}

        <div
          className="
            mt-10
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
            2xl:grid-cols-5
          "
        >

          <Plano
            nome="Básico"
            descricao="Organização operacional inicial."
            preco="R$ 31,75/mês"
            itens={[
              "Dashboard essencial",
              "Controle bovino",
              "Pastagem básica",
              "Relatório mensal",
            ]}
          />

          <Plano
            nome="Profissional"
            descricao="Leitura financeira operacional."
            preco="R$ 52,99/mês"
            itens={[
              "Relatórios financeiros",
              "Indicadores operacionais",
              "Análise evolutiva",
              "Performance estrutural",
            ]}
          />

          <Plano
            nome="Ultra"
            destaque
            descricao="Camada cognitiva avançada."
            preco="R$ 106,09/mês"
            itens={[
              "IA pecuária",
              "Alertas inteligentes",
              "Conversão operacional",
              "Motor analítico",
            ]}
          />

          <Plano
            nome="Empresarial"
            descricao="Gestão multioperações."
            preco="R$ 159,19/mês"
            itens={[
              "Multi-fazendas",
              "Equipes",
              "Governança",
              "Gestão integrada",
            ]}
          />

          <Plano
            nome="Dominus 360°"
            descricao="CFO cognitivo completo."
            preco="R$ 318,49/mês"
            itens={[
              "EBITDA",
              "Valuation",
              "CFO AI",
              "Inteligência financeira",
            ]}
          />

        </div>

        {/* CTA */}

        <div className="mt-12">

          <a
            href="/planos"
            className="
              inline-flex
              items-center
              justify-center
              rounded-2xl
              bg-[#3B8B5E]
              px-8
              py-4
              text-base
              font-black
              text-white
              transition-all
              duration-300
              hover:bg-[#4FA36F]
              hover:scale-[1.02]
            "
          >
            Ver detalhes dos planos
          </a>

        </div>

      </section>

    </div>
  );
}

/* ===================================================== */
/* KPI CARD */
/* ===================================================== */

function KpiCard({
  titulo,
  valor,
  color,
}: {
  titulo: string;
  valor: string;
  color:
    | "emerald"
    | "amber"
    | "cyan"
    | "lime";
}) {

  const colors = {
    emerald: "text-[#BBF7D0]",
    amber: "text-amber-200",
    cyan: "text-cyan-200",
    lime: "text-lime-200",
  };

  return (

    <div
      className="
        rounded-[28px]
        border
        border-[#86EFAC]/10
        bg-gradient-to-br
        from-[#214D3D]
        via-[#2A6D4A]
        to-[#1B4332]
        p-6
        shadow-[0_0_35px_rgba(16,185,129,0.10)]
      "
    >

      <div
        className="
          text-xs
          uppercase
          tracking-[0.24em]
          text-[#D1FAE5]
        "
      >
        {titulo}
      </div>

      <div
        className={`
          mt-5
          break-words
          text-3xl
          font-black
          leading-tight
          xl:text-4xl
          ${colors[color]}
        `}
      >
        {valor}
      </div>

    </div>
  );
}

/* ===================================================== */
/* PLANO */
/* ===================================================== */

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
      className={`
        rounded-[28px]
        border
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        ${
          destaque
            ? `
              border-[#BBF7D0]/30
              bg-[#3B8B5E]/25
            `
            : `
              border-[#86EFAC]/10
              bg-[#214D3D]/70
            `
        }
      `}
    >

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <h3
          className="
            text-2xl
            font-black
            text-white
          "
        >
          {nome}
        </h3>

        {destaque && (

          <span
            className="
              rounded-full
              bg-[#BBF7D0]/20
              px-3
              py-1
              text-xs
              font-black
              uppercase
              tracking-[0.20em]
              text-[#ECFDF5]
            "
          >
            Ultra
          </span>

        )}

      </div>

      <p
        className="
          mt-4
          text-sm
          leading-7
          text-[#ECFDF5]
        "
      >
        {descricao}
      </p>

      <ul
        className="
          mt-6
          space-y-3
          text-sm
          text-zinc-100
        "
      >

        {itens.map((item) => (

          <li
            key={item}
            className="
              flex
              items-start
              gap-3
            "
          >

            <span className="text-[#BBF7D0]">
              ✓
            </span>

            {item}

          </li>

        ))}

      </ul>

      <div
        className="
          mt-8
          text-2xl
          font-black
          text-[#BBF7D0]
        "
      >
        {preco}
      </div>

    </div>
  );
}
```
