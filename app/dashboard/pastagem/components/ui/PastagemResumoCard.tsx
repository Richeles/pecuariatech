"use client";

type Props = { resumo: any };

function safe(v: any) {
  if (v === null || v === undefined || v === "") return "-";
  if (typeof v === "object") {
    const exec = v?.executivo;
    const op = v?.operacional;
    if (exec || op) return [exec, op].filter(Boolean).join(" • ");
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
  if (!Number.isFinite(n)) return safe(v);
  return n.toLocaleString("pt-BR");
}

export default function PastagemResumoCard({ resumo }: Props) {
  if (!resumo) return null;

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-base font-semibold">Resumo Operacional</div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="Piquetes" value={fmtNum(resumo.qtd_piquetes)} />
        <KPI label="Área ativa (ha)" value={fmtNum(resumo.area_ativa_ha)} />
        <KPI label="UA total" value={fmtNum(resumo.ua_total)} />
        <KPI label="UA/ha atual" value={fmtNum(resumo.ua_por_ha_atual)} />
        <KPI label="UA/ha suportada" value={fmtNum(resumo.ua_por_ha_suportada)} />
        <KPI label="Pressão score" value={fmtNum(resumo.pressao_pastagem_score)} />
        <KPI label="Risco" value={safe(resumo.risco_pastagem)} />
        <KPI label="Últ. movimentação" value={safe(resumo.ultima_movimentacao_em)} />
      </div>

      {resumo.decisao_recomendada ? (
        <div className="mt-4 rounded-xl border bg-gray-50 p-4 text-sm">
          <div className="text-xs font-semibold text-gray-600">
            Decisão recomendada
          </div>
          <div className="mt-1 text-gray-900">{safe(resumo.decisao_recomendada)}</div>
        </div>
      ) : null}
    </section>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="text-xs font-semibold text-gray-600">{label}</div>
      <div className="mt-1 text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}
