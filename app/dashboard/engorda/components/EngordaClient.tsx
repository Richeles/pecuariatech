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
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value ?? 0);
  } catch {
    return `R$ ${(value ?? 0).toFixed(2)}`;
  }
}

export default function EngordaClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<ApiStatusResp | null>(null);
  const [proj, setProj] = useState<ApiProjResp | null>(null);

  const [cenario, setCenario] = useState<string>("RÁPIDO (GMD)");
  const [alerta, setAlerta] = useState<string>("Todos");

  const registros = proj?.total ?? 0;
  const margemMedia = proj?.margem_media_top ?? 0;
  const riscoMedio = proj?.risco_medio_top ?? 0;

  // tabela: TOP items do status base (exibição simples)
  const ranking = useMemo(() => {
    const rows = status?.data ?? [];
    // tenta manter padrão estável (sem depender de campos fixos)
    return rows.slice(0, 30);
  }, [status]);

  async function loadAll() {
    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error(
          "Sessão ausente: faça login novamente para gerar o Bearer token."
        );
      }

      const [statusData, projData] = await Promise.all([
        fetchJson<ApiStatusResp>("/api/engorda/status", token),
        fetchJson<ApiProjResp>("/api/engorda/projecao", token),
      ]);

      setStatus(statusData);
      setProj(projData);
    } catch (e: any) {
      setError(e?.message ?? "Falha ao carregar dados da Engorda.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Filtros / Ações */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Cenário</span>
            <select
              value={cenario}
              onChange={(e) => setCenario(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm"
            >
              <option>ÓTIMO</option>
              <option>SEGURO</option>
              <option>RÁPIDO (GMD)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Alerta</span>
            <select
              value={alerta}
              onChange={(e) => setAlerta(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm"
            >
              <option>Todos</option>
              <option>Crítico</option>
              <option>Atenção</option>
              <option>OK</option>
            </select>
          </div>
        </div>

        <button
          onClick={loadAll}
          className="rounded-md border bg-white px-4 py-2 text-sm hover:bg-slate-50"
        >
          Atualizar
        </button>
      </div>

      {/* Estado */}
      {loading && (
        <div className="rounded-lg border bg-white p-4 text-sm text-slate-600">
          Carregando Engorda ULTRA...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <b>Erro:</b> {error}
        </div>
      )}

      {/* KPIs */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-lg border bg-white p-4">
              <div className="text-xs text-slate-500">Registros</div>
              <div className="mt-1 text-2xl font-semibold">{registros}</div>
              <div className="mt-1 text-xs text-slate-500">
                Retorno da projeção
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <div className="text-xs text-slate-500">Margem média (Top)</div>
              <div className="mt-1 text-2xl font-semibold">
                {moneyBRL(margemMedia)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Top 30 por π-score
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <div className="text-xs text-slate-500">Risco médio</div>
              <div className="mt-1 text-2xl font-semibold">
                {Number(riscoMedio ?? 0).toFixed(2)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                (quanto maior, pior)
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <div className="text-xs text-slate-500">Base (status)</div>
              <div className="mt-1 text-2xl font-semibold">
                {status?.count ?? 0}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                engorda_base_view
              </div>
            </div>
          </div>

          {/* Ranking */}
          <div className="rounded-lg border bg-white">
            <div className="border-b p-4">
              <div className="text-sm font-semibold">
                Ranking Executivo — π-score
              </div>
              <div className="text-xs text-slate-500">
                Fonte: engorda_base_view + engorda_projecao_view (Equação Y).
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
                    <th className="px-4 py-3 text-left">Local</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-5 text-slate-500"
                      >
                        Nenhum dado encontrado.
                      </td>
                    </tr>
                  ) : (
                    ranking.map((r: any, idx: number) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-3">
                          {r.brinco ?? r.brinco_id ?? r.id ?? "-"}
                        </td>
                        <td className="px-4 py-3">{r.raca ?? "-"}</td>
                        <td className="px-4 py-3">{r.sexo ?? "-"}</td>
                        <td className="px-4 py-3">
                          {r.peso_kg_atual ?? r.peso ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          {r.piquete_nome ?? r.movimentacao_local ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          {r.status_rebanho ?? r.status ?? "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* cenários */}
            <div className="border-t p-4">
              <div className="text-xs text-slate-600 font-medium">
                Distribuição por cenário (projeção)
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(proj?.por_cenario ?? {}).map(([k, v]) => (
                  <span
                    key={k}
                    className="rounded-full border bg-slate-50 px-3 py-1 text-xs text-slate-700"
                  >
                    {k}: {v}
                  </span>
                ))}
                {Object.keys(proj?.por_cenario ?? {}).length === 0 && (
                  <span className="text-xs text-slate-500">
                    Sem distribuição disponível.
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
