"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase-browser";

type ProjecaoRow = {
  animal_id: string;
  brinco: string;
  raca: string | null;
  sexo: string | null;

  sistema_engorda: string | null;
  cenario: "OTIMO" | "SEGURO" | "RAPIDO";

  peso_kg_atual: number | null;
  peso_alvo_kg: number | null;

  gmd_kg_dia: number | null;
  custo_rs_dia: number | null;
  risco_operacional: number | null;

  dias_ate_alvo: number | null;

  margem_proj_rs: number | null;
  pi_score: number | null;

  alerta_status: string | null;

  movimentacao_local?: string | null;
  piquete_nome?: string | null;
  tipo_pasto?: string | null;
  capacidade_ua?: number | null;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatBRL(v: number | null | undefined) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatNum(v: number | null | undefined, decimals = 2) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(v);
}

function badgeColor(alerta?: string | null) {
  const a = (alerta || "").toUpperCase();
  if (a.includes("OK")) return "bg-green-600/15 text-green-700 border-green-600/20";
  if (a.includes("JANELA")) return "bg-blue-600/15 text-blue-700 border-blue-600/20";
  if (a.includes("RISCO")) return "bg-yellow-600/15 text-yellow-800 border-yellow-600/20";
  if (a.includes("CUSTO") || a.includes("GMD")) return "bg-red-600/15 text-red-700 border-red-600/20";
  return "bg-muted text-muted-foreground border-border";
}

/**
 * ✅ Fetch autenticado: injeta Bearer token automaticamente.
 * - Se token não existir: orienta login.
 * - Se token expirar: tenta refresh e repete 1 vez.
 */
async function fetchJsonAuthed(url: string) {
  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  };

  let token = await getToken();
  if (!token) throw new Error("Sessão não encontrada. Faça login para carregar a Engorda.");

  const doFetch = async (bearer: string) => {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${bearer}` },
    });

    // se backend respondeu 401, pode ser token expirado
    if (res.status === 401) return { res, bodyText: await res.text().catch(() => "") };
    if (!res.ok) throw new Error((await res.text().catch(() => "")) || `HTTP ${res.status}`);
    return { res, json: await res.json() };
  };

  // 1ª tentativa
  const first = await doFetch(token);
  if ((first.res as Response).ok) return (first as any).json;

  // Se 401 → tenta refresh e repete 1 vez
  await supabase.auth.refreshSession();
  token = await getToken();
  if (!token) throw new Error("Sessão expirou. Faça login novamente para carregar a Engorda.");

  const second = await doFetch(token);
  if ((second.res as Response).ok) return (second as any).json;

  throw new Error(
    (second as any).bodyText || "Não autorizado. Faça login novamente (token inválido)."
  );
}

export default function EngordaClient() {
  const [cenario, setCenario] = useState<"OTIMO" | "SEGURO" | "RAPIDO">("RAPIDO");
  const [alerta, setAlerta] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProjecaoRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const kpis = useMemo(() => {
    const valid = rows.filter((r) => (r.pi_score ?? 0) > 0);
    const top = valid.slice(0, 30);

    const margemTotal = top.reduce((acc, r) => acc + (r.margem_proj_rs ?? 0), 0);
    const margemMedia = top.length ? margemTotal / top.length : 0;

    const riscoMedio = top.length
      ? top.reduce((acc, r) => acc + (r.risco_operacional ?? 0), 0) / top.length
      : 0;

    const diasMedio = top.length
      ? top.reduce((acc, r) => acc + (r.dias_ate_alvo ?? 0), 0) / top.length
      : 0;

    return {
      total: rows.length,
      topCount: top.length,
      margemMedia,
      riscoMedio,
      diasMedio,
    };
  }, [rows]);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("limit", "60");
      params.set("cenario", cenario);
      if (alerta.trim()) params.set("alerta", alerta.trim());

      const json = await fetchJsonAuthed(`/api/engorda/projecao?${params.toString()}`);
      const data = (json?.data ?? []) as ProjecaoRow[];
      setRows(data);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao carregar dados da Engorda.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cenario, alerta]);

  return (
    <div className="space-y-6">
      {/* CONTROLES */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-muted-foreground">Cenário</label>
          <select
            value={cenario}
            onChange={(e) => setCenario(e.target.value as any)}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="OTIMO">ÓTIMO (margem)</option>
            <option value="SEGURO">SEGURO (risco)</option>
            <option value="RAPIDO">RÁPIDO (GMD)</option>
          </select>

          <label className="ml-0 md:ml-4 text-sm text-muted-foreground">Alerta</label>
          <select
            value={alerta}
            onChange={(e) => setAlerta(e.target.value)}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Todos</option>
            <option value="OK">OK</option>
            <option value="JANELA_VENDA_IDEAL">JANELA_VENDA_IDEAL</option>
            <option value="RISCO_OPERACIONAL_ALTO">RISCO_OPERACIONAL_ALTO</option>
            <option value="RISCO_PASTO">RISCO_PASTO</option>
            <option value="CUSTO_ALTO">CUSTO_ALTO</option>
            <option value="GMD_BAIXO">GMD_BAIXO</option>
          </select>
        </div>

        <button
          onClick={load}
          className="h-9 rounded-md border bg-background px-4 text-sm hover:bg-accent"
        >
          Atualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <KpiCard title="Registros" value={loading ? "…" : String(kpis.total)} subtitle="Retorno da projeção" />
        <KpiCard title="Margem média (Top)" value={loading ? "…" : formatBRL(kpis.margemMedia)} subtitle="Top 30 por π-score" />
        <KpiCard title="Risco médio" value={loading ? "…" : formatNum(kpis.riscoMedio, 2)} subtitle="0..1 (quanto maior, pior)" />
        <KpiCard title="Dias até alvo (médio)" value={loading ? "…" : formatNum(kpis.diasMedio, 0)} subtitle="Atingir peso alvo" />
      </div>

      {/* ERRO */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-700">
          {error}
          {error.toLowerCase().includes("sessão") && (
            <div className="mt-2 text-xs text-red-700/80">
              Abra: <span className="font-mono">/login</span> → faça login → volte para Engorda.
            </div>
          )}
        </div>
      )}

      {/* TABELA */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b px-4 py-3 text-sm font-medium">Ranking Executivo — π-score</div>

        <div className="overflow-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-2">Brinco</th>
                <th className="px-4 py-2">Local</th>
                <th className="px-4 py-2">Sistema</th>
                <th className="px-4 py-2">Peso</th>
                <th className="px-4 py-2">Dias alvo</th>
                <th className="px-4 py-2">Risco</th>
                <th className="px-4 py-2">Margem</th>
                <th className="px-4 py-2">π-score</th>
                <th className="px-4 py-2">Alerta</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={9}>
                    Carregando dados…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={9}>
                    Nenhum dado encontrado.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={`${r.animal_id}-${r.cenario}`} className="border-t">
                    <td className="px-4 py-2 font-medium">{r.brinco}</td>
                    <td className="px-4 py-2">{r.movimentacao_local ?? "—"}</td>
                    <td className="px-4 py-2">{r.sistema_engorda ?? "—"}</td>
                    <td className="px-4 py-2">{formatNum(r.peso_kg_atual, 0)} kg</td>
                    <td className="px-4 py-2">{r.dias_ate_alvo ?? "—"}</td>
                    <td className="px-4 py-2">{formatNum(r.risco_operacional, 2)}</td>
                    <td className="px-4 py-2">{formatBRL(r.margem_proj_rs)}</td>
                    <td className="px-4 py-2 font-semibold">{formatNum(r.pi_score, 4)}</td>
                    <td className="px-4 py-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-1 text-xs",
                          badgeColor(r.alerta_status)
                        )}
                      >
                        {r.alerta_status ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          Fonte: <span className="font-mono">engorda_projecao_view</span> (Equação Y).
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
    </div>
  );
}
