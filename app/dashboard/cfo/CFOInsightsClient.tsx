"use client";

import React, { useMemo, useState } from "react";

type Eixo360 = "contabil" | "operacional" | "estrategico";

type SinalCFO = {
  eixo: Eixo360;
  tipo: "alerta" | "info";
  codigo: string;
  severidade: "alta" | "media" | "baixa";
  prioridade: 1 | 2 | 3 | 4 | 5;
  mensagem: string;
  acao_sugerida?: string;
};

type CFOResponse = {
  ok: boolean;
  domain: "financeiro";
  ts: string;
  degraded: boolean;
  kpis: {
    receita_total: number;
    custos_totais: number;
    resultado_operacional: number;
    margem_operacional_pct: number;
    saldo_caixa?: number;
    divida_total?: number;
    tendencia_3m?: string;
  };
  sinais: SinalCFO[];
  plano_acao: Array<{
    prioridade: 1 | 2 | 3;
    eixo: Eixo360;
    titulo: string;
    descricao: string;
    impacto_estimado_brl?: number;
  }>;
  resumo_executivo: string;
  error?: string;
};

function brl(v: number) {
  try {
    return (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  } catch {
    return `R$ ${v ?? 0}`;
  }
}

function pct(v: number) {
  const x = Number(v || 0);
  return `${x.toFixed(2)}%`;
}

function eixoLabel(e: Eixo360) {
  if (e === "contabil") return "Contábil";
  if (e === "operacional") return "Operacional";
  return "Estratégico";
}

function severidadeTone(s: SinalCFO["severidade"]) {
  if (s === "alta") return "bg-red-50 border-red-200 text-red-700";
  if (s === "media") return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-emerald-50 border-emerald-200 text-emerald-700";
}

function badgeTone(degraded: boolean, sinais: SinalCFO[]) {
  if (degraded) return "bg-amber-100 text-amber-800 border-amber-200";
  const hasHigh = sinais.some((x) => x.severidade === "alta" && x.tipo === "alerta");
  if (hasHigh) return "bg-red-100 text-red-800 border-red-200";
  const hasMed = sinais.some((x) => x.severidade === "media" && x.tipo === "alerta");
  if (hasMed) return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-emerald-100 text-emerald-800 border-emerald-200";
}

function statusText(degraded: boolean, sinais: SinalCFO[]) {
  if (degraded) return "Modo seguro";
  const hasHigh = sinais.some((x) => x.severidade === "alta" && x.tipo === "alerta");
  if (hasHigh) return "Alerta alto";
  const hasMed = sinais.some((x) => x.severidade === "media" && x.tipo === "alerta");
  if (hasMed) return "Atenção";
  return "Estável";
}

function riskScore(kpis: CFOResponse["kpis"]) {
  // Score 0–100: heurística executiva para leitura rápida
  const receita = Number(kpis.receita_total || 0);
  const custos = Number(kpis.custos_totais || 0);
  const resultado = Number(kpis.resultado_operacional || 0);
  const margem = Number(kpis.margem_operacional_pct || 0);

  let score = 15;
  if (receita === 0 && custos > 0) score += 40;
  if (resultado < 0) score += 30;
  if (margem <= 5 && receita > 0) score += 15;
  if (custos > receita && receita > 0) score += 15;

  score = Math.max(0, Math.min(100, score));
  return score;
}

function scoreTone(score: number) {
  if (score >= 70) return "bg-red-600";
  if (score >= 40) return "bg-amber-500";
  return "bg-emerald-600";
}

async function fetchCFO(): Promise<CFOResponse> {
  const r = await fetch("/api/inteligencia/financeiro?ts=" + Date.now(), {
    method: "GET",
    cache: "no-store",
  });
  if (!r.ok) throw new Error("Falha ao consultar /api/inteligencia/financeiro");
  return r.json();
}

export default function CFOInsightsClient() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CFOResponse | null>(null);
  const [tab, setTab] = useState<"todos" | Eixo360>("todos");
  const [err, setErr] = useState<string | null>(null);

  const kpis = data?.kpis;
  const sinais = data?.sinais ?? [];
  const plano = data?.plano_acao ?? [];
  const degraded = Boolean(data?.degraded);

  const score = useMemo(() => (kpis ? riskScore(kpis) : 0), [kpis]);

  const sinaisFiltrados = useMemo(() => {
    if (tab === "todos") return sinais;
    return sinais.filter((s) => s.eixo === tab);
  }, [sinais, tab]);

  const headerBadgeClass = badgeTone(degraded, sinais);
  const headerBadgeText = statusText(degraded, sinais);

  async function onRefresh() {
    try {
      setErr(null);
      setLoading(true);
      const res = await fetchCFO();
      setData(res);
    } catch (e: any) {
      setErr(e?.message || "Erro ao carregar CFO");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* HERO EXECUTIVO */}
      <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
        <div className="px-7 py-6 border-b bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
                CFO Autônomo • PecuariaTech Autônomo
              </div>
              <h1 className="mt-2 text-2xl font-extrabold text-gray-900">
                Inteligência Financeira Executiva
              </h1>
              <p className="mt-2 text-sm text-gray-600 max-w-2xl">
                Insights gerados por DRE (VIEW canônica) + Triângulo 360 (Contábil/Operacional/Estratégico),
                no padrão Equação Y. Sem alteração de HUB, Router ou Banco — apenas leitura read-only.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${headerBadgeClass}`}>
                {headerBadgeText.toUpperCase()}
                {degraded && <span className="opacity-80">• degraded</span>}
              </span>

              <button
                onClick={onRefresh}
                disabled={loading}
                className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Atualizando..." : "Atualizar"}
              </button>
            </div>
          </div>

          {/* Barra de risco */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">Risco de Caixa (Score)</div>
                <div className="text-xs text-gray-500">0–100</div>
              </div>
              <div className="mt-3 h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-3 ${scoreTone(score)}`} style={{ width: `${score}%` }} />
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Score atual: <span className="font-bold text-gray-900">{score}</span>
                {degraded ? " • (modo seguro)" : " • (heurística executiva)"}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <div className="text-sm font-semibold text-gray-900">Resumo Executivo</div>
              <div className="mt-2 text-sm text-gray-700 leading-relaxed">
                {data?.resumo_executivo || "Carregando resumo..."}
              </div>
              {data?.error && (
                <div className="mt-2 text-xs text-amber-700">
                  Motivo interno: <span className="font-mono">{data.error}</span>
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <div className="text-sm font-semibold text-gray-900">Fonte e Timestamp</div>
              <div className="mt-2 text-xs text-gray-600">
                <div>
                  Fonte: <span className="font-mono">/api/inteligencia/financeiro</span> (read-only)
                </div>
                <div className="mt-1">
                  Atualização:{" "}
                  <span className="font-semibold text-gray-900">
                    {data?.ts ? new Date(data.ts).toLocaleString("pt-BR") : "—"}
                  </span>
                </div>
              </div>
              {err && <div className="mt-3 text-xs text-red-700">{err}</div>}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="px-7 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPI title="Receita total" value={brl(kpis?.receita_total ?? 0)} subtitle="Mês corrente (DRE)" />
            <KPI title="Custos totais" value={brl(kpis?.custos_totais ?? 0)} subtitle="Fixos + variáveis" />
            <KPI
              title="Resultado operacional"
              value={brl(kpis?.resultado_operacional ?? 0)}
              subtitle={`Margem: ${pct(kpis?.margem_operacional_pct ?? 0)}`}
              emphasis={Number(kpis?.resultado_operacional ?? 0) < 0 ? "neg" : "pos"}
            />
            <KPI title="Tendência 3 meses" value={(kpis?.tendencia_3m ?? "misto").toString()} subtitle="Direção do negócio" />
          </div>

          {/* Plano de Ação */}
          <div className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Plano de Ação do CFO (Top 3)</h2>
                <p className="text-sm text-gray-600">
                  Ações priorizadas por severidade + urgência (Triângulo 360).
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
              {plano.length === 0 ? (
                <div className="lg:col-span-3 rounded-2xl border bg-gray-50 p-6 text-sm text-gray-700">
                  Sem plano de ação disponível. {degraded ? "Em modo seguro o motor não recomenda ações." : "Sem ações críticas no momento."}
                </div>
              ) : (
                plano.map((a) => (
                  <div key={`${a.prioridade}-${a.eixo}`} className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Prioridade {a.prioridade}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {eixoLabel(a.eixo)}
                      </span>
                    </div>
                    <div className="mt-3 text-base font-extrabold text-gray-900">{a.titulo}</div>
                    <div className="mt-2 text-sm text-gray-700 leading-relaxed">{a.descricao}</div>
                    {typeof a.impacto_estimado_brl === "number" && (
                      <div className="mt-4 rounded-xl border bg-gray-50 px-4 py-3 text-sm">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Impacto estimado</div>
                        <div className="mt-1 text-lg font-extrabold text-gray-900">{brl(a.impacto_estimado_brl)}</div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sinais */}
          <div className="mt-10">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Sinais CFO (Triângulo 360)</h2>
                <p className="text-sm text-gray-600">
                  Alertas e infos por eixo: Contábil, Operacional e Estratégico.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <TabButton active={tab === "todos"} onClick={() => setTab("todos")}>
                  Todos
                </TabButton>
                <TabButton active={tab === "contabil"} onClick={() => setTab("contabil")}>
                  Contábil
                </TabButton>
                <TabButton active={tab === "operacional"} onClick={() => setTab("operacional")}>
                  Operacional
                </TabButton>
                <TabButton active={tab === "estrategico"} onClick={() => setTab("estrategico")}>
                  Estratégico
                </TabButton>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sinaisFiltrados.length === 0 ? (
                <div className="lg:col-span-2 rounded-2xl border bg-emerald-50 p-6 text-sm text-emerald-900">
                  Nenhum sinal relevante nesse eixo no momento.
                </div>
              ) : (
                sinaisFiltrados.map((s, idx) => (
                  <div
                    key={`${s.codigo}-${idx}`}
                    className={`rounded-2xl border p-5 shadow-sm ${severidadeTone(s.severidade)}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest opacity-80">
                          {eixoLabel(s.eixo)} • {s.tipo === "alerta" ? "ALERTA" : "INFO"}
                        </div>
                        <div className="mt-2 text-base font-extrabold">
                          {s.mensagem}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="rounded-full border bg-white/70 px-3 py-1 text-xs font-bold">
                          Severidade: {s.severidade}
                        </div>
                        <div className="mt-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-bold">
                          Prioridade: {s.prioridade}
                        </div>
                      </div>
                    </div>

                    {s.acao_sugerida && (
                      <div className="mt-4 rounded-xl border bg-white/70 px-4 py-3 text-sm text-gray-900">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-widest">Ação sugerida</div>
                        <div className="mt-1">{s.acao_sugerida}</div>
                      </div>
                    )}

                    <div className="mt-3 text-xs opacity-75 font-mono">{s.codigo}</div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 rounded-2xl border bg-emerald-50 p-6 text-sm text-emerald-900">
              <div className="font-extrabold">CFO isolado e blindado (Equação Y)</div>
              <div className="mt-1">
                Esta página não altera HUB, não altera Router, não altera banco.
                Apenas consome a API read-only: <span className="font-mono">/api/inteligencia/financeiro</span>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({
  title,
  value,
  subtitle,
  emphasis,
}: {
  title: string;
  value: string;
  subtitle?: string;
  emphasis?: "neg" | "pos";
}) {
  const tone =
    emphasis === "neg"
      ? "border-red-200 bg-red-50"
      : emphasis === "pos"
      ? "border-emerald-200 bg-emerald-50"
      : "border-gray-200 bg-white";

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${tone}`}>
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-extrabold text-gray-900">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-gray-600">{subtitle}</div>}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "rounded-xl bg-black px-4 py-2 text-xs font-bold text-white"
          : "rounded-xl border bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
      }
    >
      {children}
    </button>
  );
}
