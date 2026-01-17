"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase-browser";

type ApiStatusResp = {
  ok: boolean;
  source: "engorda_base_view" | string;
  count: number;
  data: any[];
};

type ApiProjResp = {
  ok: boolean;
  source: "engorda_projecao_view" | string;
  total: number;
  top_count: number;
  margem_media_top: number;
  risco_medio_top: number;
  por_cenario: Record<string, number>;
};

type UltraResp = {
  ok: boolean;
  domain: "engorda";
  ts: string;
  degraded: boolean;
  source: string[];
  kpis: {
    total: number;
    margem_media_top: number;
    risco_medio_top: number;
    pi_medio_top: number;
    risk_label: "OK" | "ATENCAO" | "CRITICO" | string;
  };
  motor_pi: { formula: string; note?: string };
  cenarios: { OTIMO: any[]; SEGURO: any[]; RAPIDO: any[] };
  esg: {
    enabled: boolean;
    selo_verde_status: "VERDE" | "AMARELO" | "VERMELHO" | string;
    risco_ambiental_score: number;
    message?: string;
  };
  sinais: Array<{
    eixo: "contabil" | "operacional" | "estrategico";
    tipo: "alerta" | "info";
    codigo: string;
    severidade: "alta" | "media" | "baixa";
    prioridade: number;
    mensagem: string;
    acao_sugerida: string;
  }>;
  plano_acao: Array<{
    prioridade: 1 | 2 | 3;
    eixo: "contabil" | "operacional" | "estrategico";
    titulo: string;
    descricao: string;
  }>;
  error?: string;
};

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

function clipText(text: string, max = 240) {
  const t = (text || "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + "…";
}

async function fetchJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    // ✅ anti-HTML gigante
    const text = await res.text().catch(() => "");
    const safe = clipText(text.replace(/\s+/g, " "), 280);
    throw new Error(`HTTP ${res.status} em ${url}: ${safe}`);
  }

  return (await res.json()) as T;
}

function moneyBRL(value: number) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value ?? 0);
  } catch {
    return `R$ ${(value ?? 0).toFixed(2)}`;
  }
}

function toneRisk(label: string) {
  const s = (label || "").toLowerCase();
  if (s.includes("crit")) return "bg-red-50 text-red-700 border-red-200";
  if (s.includes("aten")) return "bg-yellow-50 text-yellow-900 border-yellow-200";
  return "bg-green-50 text-green-800 border-green-200";
}

function toneESG(label: string) {
  const s = (label || "").toLowerCase();
  if (s.includes("vermelho")) return "bg-red-50 text-red-700 border-red-200";
  if (s.includes("amarelo")) return "bg-yellow-50 text-yellow-900 border-yellow-200";
  return "bg-green-50 text-green-800 border-green-200";
}

function eixoLabel(eixo: string) {
  if (eixo === "contabil") return "CFO / Econômico";
  if (eixo === "operacional") return "Zootecnia / Operação";
  return "Estratégico / Risco";
}

function eixoBadge(eixo: string) {
  if (eixo === "contabil") return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (eixo === "operacional") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

export default function EngordaClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<ApiStatusResp | null>(null);
  const [proj, setProj] = useState<ApiProjResp | null>(null);
  const [ultra, setUltra] = useState<UltraResp | null>(null);

  const [cenario, setCenario] = useState<"OTIMO" | "SEGURO" | "RAPIDO">("RAPIDO");
  const [eixo, setEixo] = useState<"todos" | "contabil" | "operacional" | "estrategico">("todos");

  async function loadAll() {
    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Sessão ausente: refaça login para gerar Bearer token.");

      const [statusData, projData, ultraData] = await Promise.all([
        fetchJson<ApiStatusResp>("/api/engorda/status", token),
        fetchJson<ApiProjResp>("/api/engorda/projecao", token),
        fetchJson<UltraResp>("/api/engorda/ultra", token),
      ]);

      setStatus(statusData);
      setProj(projData);
      setUltra(ultraData);
    } catch (e: any) {
      setError(e?.message ?? "Falha ao carregar Engorda.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kpis = ultra?.kpis ?? {
    total: 0,
    margem_media_top: 0,
    risco_medio_top: 0,
    pi_medio_top: 0,
    risk_label: "ATENCAO",
  };

  const registros = proj?.total ?? 0;

  const rankingBase = useMemo(() => {
    const rows = status?.data ?? [];
    return rows.slice(0, 30);
  }, [status]);

  const cenarios = ultra?.cenarios ?? { OTIMO: [], SEGURO: [], RAPIDO: [] };

  const topScenario = useMemo(() => {
    if (cenario === "OTIMO") return cenarios.OTIMO;
    if (cenario === "SEGURO") return cenarios.SEGURO;
    return cenarios.RAPIDO;
  }, [cenario, cenarios]);

  const sinaisFiltrados = useMemo(() => {
    const s = ultra?.sinais ?? [];
    if (eixo === "todos") return s;
    return s.filter((x) => x.eixo === eixo);
  }, [ultra, eixo]);

  return (
    <div className="space-y-6">
      {/* =========================================
          HEADER EXECUTIVO (nível CFO)
         ========================================= */}
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                Engorda ULTRA
              </h2>

              <span
                className={`px-3 py-1 text-xs font-bold rounded-full border ${toneRisk(
                  kpis.risk_label
                )}`}
                title="Risco executivo consolidado (R)"
              >
                {ultra?.degraded ? "MODO SEGURO" : kpis.risk_label}
              </span>

              <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-slate-50 text-slate-700 border-slate-200">
                Motor {ultra?.motor_pi?.formula || "π"}
              </span>

              <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-white text-slate-700 border-slate-200">
                Equação Y (Views → API → HUB)
              </span>
            </div>

            <p className="text-sm text-slate-600">
              Painel executivo técnico para decisão de engorda, combinando{" "}
              <b>Zootecnia</b> + <b>CFO</b> + <b>Risco/ESG</b> (Triângulo 360).
            </p>

            <div className="text-xs text-slate-500">
              Fonte canônica:{" "}
              <code className="px-1 py-0.5 bg-slate-100 rounded">
                engorda_base_view
              </code>{" "}
              +{" "}
              <code className="px-1 py-0.5 bg-slate-100 rounded">
                engorda_projecao_view
              </code>
              . Atualizado em: {ultra?.ts ? new Date(ultra.ts).toLocaleString("pt-BR") : "—"}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <select
              value={cenario}
              onChange={(e) => setCenario(e.target.value as any)}
              className="rounded-xl border px-3 py-2 text-sm bg-white"
              title="Seleciona o tipo de decisão (π)"
            >
              <option value="OTIMO">ÓTIMO (max retorno)</option>
              <option value="SEGURO">SEGURO (min risco)</option>
              <option value="RAPIDO">RÁPIDO (max giro)</option>
            </select>

            <button
              onClick={loadAll}
              className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800"
            >
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* STATUS */}
      {loading && (
        <div className="rounded-2xl border bg-white p-5 text-sm text-slate-600">
          Carregando Engorda ULTRA...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <b>Erro:</b> {error}
        </div>
      )}

      {/* CONTEÚDO */}
      {!loading && !error && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border bg-white p-5">
              <div className="text-xs text-slate-500">Registros (projeção)</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">
                {registros}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Total de simulações no motor
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <div className="text-xs text-slate-500">π-score médio (Top)</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">
                {Number(kpis.pi_medio_top ?? 0).toFixed(2)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Decisão integrada (B×E×R)/K
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <div className="text-xs text-slate-500">Margem média (Top)</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">
                {moneyBRL(kpis.margem_media_top ?? 0)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Eixo CFO / Econômico
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <div className="text-xs text-slate-500">Risco médio (Top)</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">
                {Number(kpis.risco_medio_top ?? 0).toFixed(2)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                (quanto maior, pior)
              </div>
            </div>
          </div>

          {/* ESG / SELO VERDE */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <div className="text-sm font-extrabold text-slate-900">
                  Selo Verde / ESG
                </div>
                <div className="text-xs text-slate-500">
                  Compliance e gestão de risco ambiental (não auditoria) — acoplado ao eixo <b>R</b>.
                </div>
                {ultra?.esg?.message && (
                  <div className="text-xs text-slate-600">{ultra.esg.message}</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full border ${toneESG(
                    ultra?.esg?.selo_verde_status || "AMARELO"
                  )}`}
                >
                  {ultra?.esg?.selo_verde_status || "AMARELO"}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-slate-50 text-slate-700 border-slate-200">
                  Risco Ambiental:{" "}
                  {Number(ultra?.esg?.risco_ambiental_score ?? 0).toFixed(0)}/100
                </span>
              </div>
            </div>
          </div>

          {/* PLANO DE AÇÃO TOP 3 */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="border-b p-5">
              <div className="text-sm font-extrabold text-slate-900">
                Plano de Ação (Top 3)
              </div>
              <div className="text-xs text-slate-500">
                Execução direta orientada pelo Triângulo 360.
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              {(ultra?.plano_acao ?? []).map((a, idx) => (
                <div key={idx} className="rounded-2xl border bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-bold text-slate-700">
                      Prioridade {a.prioridade}
                    </div>
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${eixoBadge(a.eixo)}`}>
                      {eixoLabel(a.eixo)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-extrabold text-slate-900">
                    {a.titulo}
                  </div>
                  <div className="mt-2 text-sm text-slate-700">
                    {a.descricao}
                  </div>
                </div>
              ))}

              {(ultra?.plano_acao ?? []).length === 0 && (
                <div className="text-sm text-slate-500">
                  Sem plano de ação disponível (modo seguro).
                </div>
              )}
            </div>
          </div>

          {/* CENÁRIOS DO MOTOR π */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="border-b p-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-extrabold text-slate-900">
                  Cenários do Motor π
                </div>
                <div className="text-xs text-slate-500">
                  ÓTIMO maximiza retorno; SEGURO reduz risco; RÁPIDO maximiza giro (biológico).
                </div>
              </div>

              <div className="flex gap-2">
                {(["OTIMO", "SEGURO", "RAPIDO"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCenario(c)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold border ${
                      cenario === c
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {c === "OTIMO" ? "ÓTIMO" : c === "SEGURO" ? "SEGURO" : "RÁPIDO"}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Brinco</th>
                    <th className="px-4 py-3 text-left">Raça</th>
                    <th className="px-4 py-3 text-left">Sexo</th>
                    <th className="px-4 py-3 text-left">Peso</th>
                    <th className="px-4 py-3 text-left">π</th>
                    <th className="px-4 py-3 text-left">B</th>
                    <th className="px-4 py-3 text-left">E (margem)</th>
                    <th className="px-4 py-3 text-left">R (risco)</th>
                  </tr>
                </thead>

                <tbody>
                  {topScenario.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-5 text-slate-500">
                        Sem dados no cenário selecionado.
                      </td>
                    </tr>
                  ) : (
                    topScenario.map((r: any, idx: number) => (
                      <tr key={idx} className="border-t hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {r.brinco ?? "-"}
                        </td>
                        <td className="px-4 py-3">{r.raca ?? "-"}</td>
                        <td className="px-4 py-3">{r.sexo ?? "-"}</td>
                        <td className="px-4 py-3">{r.peso ?? "-"}</td>
                        <td className="px-4 py-3 font-extrabold">
                          {Number(r.PI ?? 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">{Number(r.B ?? 0).toFixed(0)}</td>
                        <td className="px-4 py-3">{moneyBRL(Number(r.margem ?? 0))}</td>
                        <td className="px-4 py-3">{Number(r.risco ?? 0).toFixed(0)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t px-5 py-4 text-xs text-slate-500">
              Microcopy executivo: use ÓTIMO para maximizar retorno, SEGURO para reduzir risco e RÁPIDO para reduzir ciclo.
            </div>
          </div>

          {/* SINAIS TRIÂNGULO 360 */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="border-b p-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-extrabold text-slate-900">
                  Sinais — Triângulo 360
                </div>
                <div className="text-xs text-slate-500">
                  CFO / Zootecnia / Risco-ESG
                </div>
              </div>

              <select
                value={eixo}
                onChange={(e) => setEixo(e.target.value as any)}
                className="rounded-xl border px-3 py-2 text-sm bg-white"
              >
                <option value="todos">Todos</option>
                <option value="contabil">CFO / Econômico</option>
                <option value="operacional">Zootecnia / Operação</option>
                <option value="estrategico">Estratégico / Risco</option>
              </select>
            </div>

            <div className="p-5 space-y-3">
              {sinaisFiltrados.length === 0 ? (
                <div className="text-sm text-slate-500">Sem sinais disponíveis.</div>
              ) : (
                sinaisFiltrados.map((s, idx) => (
                  <div key={idx} className="rounded-2xl border bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${eixoBadge(s.eixo)}`}>
                          {eixoLabel(s.eixo)}
                        </span>
                        <span className="text-xs text-slate-500">
                          Código: <b>{s.codigo}</b>
                        </span>
                      </div>

                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full border ${toneRisk(
                          s.severidade
                        )}`}
                      >
                        {s.tipo.toUpperCase()} · {s.severidade.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-3 text-sm font-semibold text-slate-900">
                      {s.mensagem}
                    </div>

                    <div className="mt-2 text-xs text-slate-600">
                      <b>Ação sugerida:</b> {s.acao_sugerida}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t px-5 py-3 text-xs text-slate-500">
              Endpoints read-only:{" "}
              <code className="px-1 py-0.5 bg-slate-100 rounded">/api/engorda/status</code>{" "}
              <code className="px-1 py-0.5 bg-slate-100 rounded">/api/engorda/projecao</code>{" "}
              <code className="px-1 py-0.5 bg-slate-100 rounded">/api/engorda/ultra</code>
            </div>
          </div>

          {/* BASE OPERACIONAL */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="border-b p-5">
              <div className="text-sm font-extrabold text-slate-900">
                Base Operacional — Status
              </div>
              <div className="text-xs text-slate-500">
                Visão de campo (engorda_base_view). Mantido como camada operacional.
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Brinco</th>
                    <th className="px-4 py-3 text-left">Raça</th>
                    <th className="px-4 py-3 text-left">Sexo</th>
                    <th className="px-4 py-3 text-left">Peso</th>
                    <th className="px-4 py-3 text-left">Local</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {rankingBase.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-5 text-slate-500">
                        Nenhum dado encontrado.
                      </td>
                    </tr>
                  ) : (
                    rankingBase.map((r: any, idx: number) => (
                      <tr key={idx} className="border-t hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          {r.brinco ?? r.brinco_id ?? r.id ?? "-"}
                        </td>
                        <td className="px-4 py-3">{r.raca ?? "-"}</td>
                        <td className="px-4 py-3">{r.sexo ?? "-"}</td>
                        <td className="px-4 py-3">{r.peso_kg_atual ?? r.peso ?? "-"}</td>
                        <td className="px-4 py-3">{r.piquete_nome ?? r.movimentacao_local ?? "-"}</td>
                        <td className="px-4 py-3">{r.status_rebanho ?? r.status ?? "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
