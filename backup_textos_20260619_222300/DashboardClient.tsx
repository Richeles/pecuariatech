"use client";

// CAMINHO: app/dashboard/DashboardClient.tsx
// PecuariaTech
// Dashboard Executivo Agro Premium Biológico
// Verde Fazenda Tecnológica
// Next.js 16 + TypeScript strict

import CFOAIInsights from "@/app/components/cfo/CFOAIInsights";
import { DashboardProvider, useDashboard } from "./DashboardContext";

export default function DashboardClient() {
  // TEMPORÁRIO: userId fixo para testes
  // DEPOIS: substituir pelo ID do usuário logado
  const userId = "96a1a441-c0f6-43b2-9cb7-4fadc17fd261";

  return (
    <DashboardProvider userId={userId}>
      <DashboardContent />
    </DashboardProvider>
  );
}

// ============================================================
// COMPONENTE INTERNO QUE USA OS DADOS
// ============================================================
function DashboardContent() {
  const { data, loading } = useDashboard();

  // Enquanto carrega, mantém os valores mockados (fallback)
  const roi = data?.roi ?? 0;
  const margem = data?.margem ?? 0;
  const ebitda = data?.ebitda ?? 0;
  const risco = data?.risco_estrutural ?? "BAIXO";

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
          border-[#D8F3DC]/10
          bg-gradient-to-br
          from-[#3B7D57]
          via-[#4D9A6D]
          to-[#2F6B4B]
          p-8
          xl:p-12
          shadow-[0_0_90px_rgba(34,197,94,0.16)]
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
            bg-[#DCFCE7]/20
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
            bg-[#86EFAC]/15
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
              border-[#DCFCE7]/20
              bg-[#74C69D]/25
              px-5
              py-3
              text-xs
              font-black
              uppercase
              tracking-[0.28em]
              text-[#F0FFF4]
              backdrop-blur-xl
            "
          >
            <div
              className="
                h-3
                w-3
                rounded-full
                bg-[#DCFCE7]
                animate-pulse
              "
            />
            {loading ? "Carregando..." : "Runtime Executivo Online"}
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
              text-[#F0FFF4]
              xl:text-lg
            "
          >
            Plataforma operacional cognitiva integrada
            ao financeiro, rebanho, pastagem,
            engorda e inteligência estratégica
            da operação pecuária.
          </p>

          {/* SCORE π DESTAQUE */}
          <div
            className="
              mt-8
              inline-flex
              items-center
              gap-8
              rounded-2xl
              border
              border-[#DCFCE7]/20
              bg-[#74C69D]/15
              px-6
              py-4
              backdrop-blur-sm
            "
          >
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#DCFCE7]/60">
                Score π
              </div>
              <div className="text-3xl font-black text-white">
                {loading ? "..." : data?.score_pi ?? 0}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#DCFCE7]/60">
                Capital Score
              </div>
              <div className="text-3xl font-black text-white">
                {loading ? "..." : data?.capital_score ?? 0}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#DCFCE7]/60">
                GMD (kg/dia)
              </div>
              <div className="text-3xl font-black text-white">
                {loading ? "..." : data?.gmd ?? 0}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* KPI GRID – COM DADOS REAIS DO DTO */}
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
            titulo="ROI"
            valor={loading ? "R$ 0" : `${roi}%`}
            color="emerald"
          />
          <KpiCard
            titulo="Margem"
            valor={loading ? "R$ 0" : `${margem}%`}
            color="amber"
          />
          <KpiCard
            titulo="EBITDA"
            valor={loading ? "R$ 0" : `R$ ${ebitda.toLocaleString()}`}
            color="cyan"
          />
          <KpiCard
            titulo="Risco Estrutural"
            valor={loading ? "..." : risco}
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
          border-[#D8F3DC]/10
          bg-gradient-to-br
          from-[#2F6B4B]
          via-[#4D9A6D]
          to-[#3B7D57]
          p-8
          xl:p-10
          shadow-[0_0_70px_rgba(34,197,94,0.14)]
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
              text-[#F0FFF4]
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
              bg-[#5FB981]
              px-8
              py-4
              text-base
              font-black
              text-white
              transition-all
              duration-300
              hover:bg-[#74C69D]
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
  color: "emerald" | "amber" | "cyan" | "lime";
}) {
  const colors = {
    emerald: "text-[#DCFCE7]",
    amber: "text-amber-100",
    cyan: "text-cyan-100",
    lime: "text-lime-100",
  };

  return (
    <div
      className="
        rounded-[28px]
        border
        border-[#D8F3DC]/10
        bg-gradient-to-br
        from-[#4D9A6D]
        via-[#5FB981]
        to-[#3B7D57]
        p-6
        shadow-[0_0_35px_rgba(34,197,94,0.12)]
      "
    >
      <div
        className="
          text-xs
          uppercase
          tracking-[0.24em]
          text-[#ECFDF5]
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
              border-[#DCFCE7]/30
              bg-[#74C69D]/25
            `
            : `
              border-[#D8F3DC]/10
              bg-[#3B7D57]/70
            `
        }
      `}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-white">{nome}</h3>
        {destaque && (
          <span
            className="
              rounded-full
              bg-[#DCFCE7]/20
              px-3
              py-1
              text-xs
              font-black
              uppercase
              tracking-[0.20em]
              text-[#F0FFF4]
            "
          >
            Ultra
          </span>
        )}
      </div>
      <p className="mt-4 text-sm leading-7 text-[#F0FFF4]">{descricao}</p>
      <ul className="mt-6 space-y-3 text-sm text-white">
        {itens.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="text-[#DCFCE7]">✓</span>
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-8 text-2xl font-black text-[#DCFCE7]">{preco}</div>
    </div>
  );
}