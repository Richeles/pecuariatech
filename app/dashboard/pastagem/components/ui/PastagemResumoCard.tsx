"use client";

type Props = { resumo: any };

function safe(v: any) {
  if (v === null || v === undefined || v === "") return "-";

  if (typeof v === "object") {
    const exec = v?.executivo;
    const op = v?.operacional;

    if (exec || op) {
      return [exec, op]
        .filter(Boolean)
        .join(" • ");
    }

    try {
      return JSON.stringify(v);
    } catch {
      return "[objeto]";
    }
  }

  return String(v);
}

function fmtNum(v: any) {
  const n = Number(v);

  if (!Number.isFinite(n)) {
    return safe(v);
  }

  return n.toLocaleString("pt-BR");
}

export default function PastagemResumoCard({
  resumo,
}: Props) {

  if (!resumo) return null;

  return (

    <section
      className="
        rounded-2xl
        border
        border-emerald-500/20
        bg-zinc-950/95
        p-5
        shadow-[0_0_30px_rgba(16,185,129,0.06)]
        backdrop-blur-sm
      "
    >

      <div
        className="
          text-base
          font-bold
          tracking-tight
          text-emerald-300
        "
      >
        Resumo Operacional
      </div>

      <div
        className="
          mt-4
          grid
          grid-cols-2
          gap-3
          md:grid-cols-4
        "
      >

        <KPI
          label="Piquetes"
          value={fmtNum(resumo.qtd_piquetes)}
        />

        <KPI
          label="Área ativa (ha)"
          value={fmtNum(resumo.area_ativa_ha)}
        />

        <KPI
          label="UA total"
          value={fmtNum(resumo.ua_total)}
        />

        <KPI
          label="UA/ha atual"
          value={fmtNum(resumo.ua_por_ha_atual)}
        />

        <KPI
          label="UA/ha suportada"
          value={fmtNum(resumo.ua_por_ha_suportada)}
        />

        <KPI
          label="Pressão score"
          value={fmtNum(resumo.pressao_pastagem_score)}
        />

        <KPI
          label="Risco"
          value={safe(resumo.risco_pastagem)}
        />

        <KPI
          label="Últ. movimentação"
          value={safe(resumo.ultima_movimentacao_em)}
        />

      </div>

      {resumo.decisao_recomendada ? (

        <div
          className="
            mt-4
            rounded-2xl
            border
            border-emerald-500/10
            bg-zinc-900/80
            p-4
          "
        >

          <div
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.12em]
              text-emerald-400
            "
          >
            Decisão recomendada
          </div>

          <div
            className="
              mt-2
              text-sm
              leading-relaxed
              text-zinc-300
            "
          >
            {safe(resumo.decisao_recomendada)}
          </div>

        </div>

      ) : null}

    </section>
  );
}

function KPI({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (

    <div
      className="
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900/70
        p-3
        transition-all
        duration-200
        hover:border-emerald-500/30
        hover:bg-zinc-900
      "
    >

      <div
        className="
          text-[11px]
          font-semibold
          uppercase
          tracking-[0.08em]
          text-zinc-500
        "
      >
        {label}
      </div>

      <div
        className="
          mt-2
          text-sm
          font-bold
          text-zinc-100
        "
      >
        {value}
      </div>

    </div>
  );
}