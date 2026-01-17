"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase-browser";

/**
 * ============================================================
 * PECUARIATECH AUTÔNOMO — ENGORDA ULTRA
 * Equação Y: Views (Supabase) → APIs read-only → UI
 * Triângulo 360: Contábil/Econômico • Operacional/Zootecnia • Estratégico/Risco/ESG
 * ============================================================
 */

type ApiStatusResp = {
  ok: boolean;
  source: "engorda_base_view" | string;
  count: number;
  data: any[];
  error?: string;
};

type ApiProjResp = {
  ok: boolean;
  source: "engorda_projecao_view" | string;
  total: number;
  top_count: number;
  margem_media_top: number;
  risco_medio_top: number;
  por_cenario: Record<string, number>;
  error?: string;
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
  cenarios: {
    OTIMO: any[];
    SEGURO: any[];
    RAPIDO: any[];
  };
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

async function fetchJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} em ${url}: ${text}`);
  }

  return (await res.json()) as T;
}

function moneyBRL(value: number) {
  const v = Number.isFinite(Number(value)) ? Number(value) : 0;
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v);
  } catch {
    return `R$ ${v.toFixed(2)}`;
  }
}

function badgeTone(label: string) {
  const s = (label || "").toLowerCase();
  if (s.includes("critico") || s.includes("vermelho")) {
    return "bg-red-50 text-red-700 border-red-200";
  }
  if (s.includes("atencao") || s.includes("amarelo")) {
    return "bg-yellow-50 text-yellow-800 border-yellow-200";
  }
  return "bg-green-50 text-green-700 border-green-200";
}

function axisLabel(eixo: string) {
  if (eixo === "contabil") return "CFO / Econômico";
  if (eixo === "operacional") return "Zootecnia / Operação";
  return "Estratégico / Risco";
}

function safeArray<T>(x: any): T[] {
  return Array.isArray(x) ? (x as T[]) : [];
}

function safeRecord(x: any): Record<string, number> {
  return x && typeof x === "object" ? (x as Record<string, number>) : {};
}

export default function EngordaClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<ApiStatusResp | null>(null);
  const [proj, setProj] = useState<ApiProjResp | null>(null);
  const [ultra, setUltra] = useState<UltraResp | null>(null);

  const [cenario, setCenario] = useState<"OTIMO" | "SEGURO" | "RAPIDO">("RAPIDO");
  const [eixo, setEixo] = useState<"todos" | "contabil" | "operacional" | "estrategico">("todos");

  // ============
  // KPIs BLINDADOS
  // ============
  const kpis = ultra?.kpis ?? {
    total: 0,
    margem_media_top: 0,
    risco_medio_top: 0,
    pi_medio_top: 0,
    risk_label: "ATENCAO",
  };

  const registros = proj?.total ?? 0;

  // ============
  // BASE OPERACIONAL (Equação Y: engorda_base_view)
  // ============
  const rankingBase = useMemo(() => {
    const rows = safeArray<any>(status?.data);
    return rows.slice(0, 30);
  }, [status]);

  // ============
  // CENÁRIOS ULTRA (Equação Y: ultra define, UI exibe)
  // ============
  const cenarios = ultra?.cenarios ?? { OTIMO: [], SEGURO: [], RAPIDO: [] };

  const topScenario = useMemo(() => {
    if (cenario === "OTIMO") return safeArray<any>(cenarios.OTIMO);
    if (cenario === "SEGURO") return safeArray<any>(cenarios.SEGURO);
    return safeArray<any>(cenarios.RAPIDO);
  }, [cenario, cenarios]);

  // ============
  // SINAIS (Triângulo 360 por eixo)
  // ============
  const sinaisFiltrados = useMemo(() => {
    const s = safeArray<UltraResp["sinais"][number]>(ultra?.sinais);
    if (eixo === "todos") return s;
    return s.filter((x) => x.eixo === eixo);
  }, [ultra, eixo]);

  // ============
  // LOAD: única rotina, read-only, token-first
  // ============
  async function loadAll() {
    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Sessão ausente: faça login novamente para gerar o Bearer token.");
      }

      const [statusData, projData, ultraData] = await Promise.all([
        fetchJson<ApiStatusResp>("/api/engorda/status", token),
        fetchJson<ApiProjResp>("/api/engorda/projecao", token),
        fetchJson<UltraResp>("/api/engorda/ultra", token),
      ]);

      // blindagem: se API devolveu error, não quebra UI
      if ((statusData as any)?.error) throw new Error((statusData as any).error);
      if ((projData as any)?.error) throw new Error((projData as any).error);
      if ((ultraData as any)?.error) throw new Error((ultraData as any).error);

      setStatus(statusData);
      setProj(projData);
      setUltra(ultraData);
    } catch (e: any) {
      setError(e?.message ?? "Falha ao carregar dados da Engorda.");
      setStatus(null);
      setProj(null);
      setUltra(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============
  // DISTRIBUIÇÃO (fallback: do /projecao)
  // ============
  const distCenario = useMemo(() => {
    return safeRecord(proj?.por_cenario);
  }, [proj]);

  return (
    <div className="space-y-6">
      {/* HEADER EXECUTIVO */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Engorda ULTRA</h2>

            <span
              className={`px-3 py-1 text-xs font-bold rounded-full border ${badgeTone(
                ultra?.degraded ? "ATENCAO" : kpis.risk_label
              )}`}
            >
              {ultra?.degraded ? "MODO SEGURO" : kpis.risk_label}
            </span>

            <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-slate-50 text-slate-700 border-slate-200">
              Motor {ultra?.motor_pi?.formula || "π"}
            </span>
          </div>

          <p className="text-sm text-slate-600">
            Painel técnico executivo (Zootecnista + CFO + Risco/ESG) — Equação Y.
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <select
            value={cenario}
            onChange={(e) => setCenario(e.target.value as any)}
            className="rounded-xl border px-3 py-2 text-sm bg-white"
          >
            <option value="OTIMO">ÓTIMO</option>
            <option value="SEGURO">SEGURO</option>
            <option value="RAPIDO">RÁPIDO</option>
          </select>

          <button
            onClick={loadAll}
            className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800"
          >
            Atualizar
          </button>
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
          {/* KPIs EXECUTIVOS */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border bg-white p-5">
              <div className="text-xs text-slate-500">Registros (projeção)</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{registros}</div>
              <div className="mt-1 text-xs text-slate-500">engorda_projecao_view</div>
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <div className="text-xs text-slate-500">π-score médio (Top)</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {Number(kpis.pi_medio_top ?? 0).toFixed(2)}
              </div>
              <div className="mt-1 text-xs text-slate-500">Decisão integrada (B×E×R)/K</div>
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <div className="text-xs text-slate-500">Margem média (Top)</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {moneyBRL(kpis.margem_media_top ?? 0)}
              </div>
              <div className="mt-1 text-xs text-slate-500">Eixo CFO / Econômico</div>
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <div className="text-xs text-slate-500">Risco médio (Top)</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {Number(kpis.risco_medio_top ?? 0).toFixed(2)}
              </div>
              <div className="mt-1 text-xs text-slate-500">(quanto maior, pior)</div>
            </div>
          </div>

          {/* ESG / SELO VERDE */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">Selo Verde / ESG</div>
                <div className="text-xs text-slate-500">
                  Gestão de conformidade ambiental (não auditoria) — acoplado ao risco (R).
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full border ${badgeTone(
                    ultra?.esg?.selo_verde_status || "AMARELO"
                  )}`}
                >
                  {ultra?.esg?.selo_verde_status || "AMARELO"}
                </span>

                <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-slate-50 text-slate-700 border-slate-200">
                  Risco Ambiental: {Number(ultra?.esg?.risco_ambiental_score ?? 0).toFixed(0)}/100
                </span>
              </div>
            </div>

            {ultra?.esg?.message && (
              <div className="mt-3 text-xs text-slate-600">{ultra.esg.message}</div>
            )}
          </div>

          {/* PLANO DE AÇÃO TOP 3 */}
          <div className="rounded-2xl border bg-white">
            <div className="border-b p-5">
              <div className="text-sm font-bold text-slate-900">Plano de Ação (Top 3)</div>
              <div className="text-xs text-slate-500">Triângulo 360 aplicado para executar decisão.</div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              {safeArray<any>(ultra?.plano_acao).map((a, idx) => (
                <div key={idx} className="rounded-2xl border bg-slate-50 p-4">
                  <div className="text-xs font-bold text-slate-700">Prioridade {a.prioridade}</div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{a.titulo}</div>
                  <div className="mt-2 text-sm text-slate-700">{a.descricao}</div>
                </div>
              ))}
              {safeArray<any>(ultra?.plano_acao).length === 0 && (
                <div className="text-sm text-slate-500">Sem plano de ação disponível (modo seguro).</div>
              )}
            </div>
          </div>

          {/* CENÁRIOS */}
          <div className="rounded-2xl border bg-white">
            <div className="border-b p-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">Cenários do Motor π</div>
                <div className="text-xs text-slate-500">
                  ÓTIMO maximiza retorno, SEGURO minimiza risco, RÁPIDO maximiza giro.
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
                <thead className="bg-slate-50 text-slate-600">
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
                        Sem dados no cenário atual.
                      </td>
                    </tr>
                  ) : (
                    topScenario.map((r: any, idx: number) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {r.brinco ?? r.brinco_id ?? r.id ?? "-"}
                        </td>
                        <td className="px-4 py-3">{r.raca ?? "-"}</td>
                        <td className="px-4 py-3">{r.sexo ?? "-"}</td>
                        <td className="px-4 py-3">{r.peso ?? r.peso_kg_atual ?? "-"}</td>
                        <td className="px-4 py-3 font-bold">{Number(r.PI ?? r.pi ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-3">{Number(r.B ?? r.b ?? 0).toFixed(0)}</td>
                        <td className="px-4 py-3">{moneyBRL(Number(r.margem ?? r.margem_brl ?? 0))}</td>
                        <td className="px-4 py-3">{Number(r.risco ?? r.risco_score ?? 0).toFixed(0)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Distribuição */}
            <div className="border-t p-4">
              <div className="text-xs text-slate-600 font-medium">Distribuição por cenário (projeção)</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(distCenario).map(([k, v]) => (
                  <span
                    key={k}
                    className="rounded-full border bg-slate-50 px-3 py-1 text-xs text-slate-700"
                  >
                    {k}: {v}
                  </span>
                ))}
                {Object.keys(distCenario).length === 0 && (
                  <span className="text-xs text-slate-500">Sem distribuição disponível.</span>
                )}
              </div>
            </div>
          </div>

          {/* SINAIS TRIÂNGULO 360 */}
          <div className="rounded-2xl border bg-white">
            <div className="border-b p-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">Sinais — Triângulo 360</div>
                <div className="text-xs text-slate-500">Contábil / Operacional / Estratégico</div>
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
                      <div className="text-sm font-bold text-slate-900">{axisLabel(s.eixo)}</div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${badgeTone(s.severidade)}`}>
                        {String(s.tipo || "info").toUpperCase()} · {String(s.severidade || "media").toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-700">{s.mensagem}</div>
                    <div className="mt-2 text-xs text-slate-600">
                      <b>Ação sugerida:</b> {s.acao_sugerida}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t px-5 py-3 text-xs text-slate-500">
              Fonte:{" "}
              <code className="px-1 py-0.5 bg-slate-100 rounded">/api/engorda/status</code>,{" "}
              <code className="px-1 py-0.5 bg-slate-100 rounded">/api/engorda/projecao</code>,{" "}
              <code className="px-1 py-0.5 bg-slate-100 rounded">/api/engorda/ultra</code> (read-only).
            </div>
          </div>

          {/* BASE OPERACIONAL */}
          <div className="rounded-2xl border bg-white">
            <div className="border-b p-5">
              <div className="text-sm font-bold text-slate-900">Base Operacional — Status</div>
              <div className="text-xs text-slate-500">Fonte: engorda_base_view (Equação Y).</div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
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
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-3">{r.brinco ?? r.brinco_id ?? r.id ?? "-"}</td>
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
