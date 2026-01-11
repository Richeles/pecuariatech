"use client";

import React, { useEffect, useMemo, useState } from "react";

type Alerta = {
  tipo: "critico" | "atencao" | "info";
  titulo: string;
  detalhe: string;
};

type Piquete = {
  piquete_id: string;
  nome: string;
  area_ha: number | null;
  tipo_pasto: string | null;
  capacidade_ua: number | null;
  status: string | null;
  ultima_movimentacao: string | null;
};

type ApiResp = {
  ok: boolean;
  fonte?: string;
  error?: string;
  kpis?: {
    total_piquetes: number;
    disponiveis: number;
    ocupados: number;
    area_total_ha: number;
    capacidade_total_ua: number;
    taxa_ocupacao: number;
  };
  alertas?: Alerta[];
  piquetes?: Piquete[];
};

function badge(tipo: Alerta["tipo"]) {
  if (tipo === "critico") return "bg-red-100 text-red-700 border-red-200";
  if (tipo === "atencao") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function climaLabelMock() {
  // placeholder (depois integraremos GPS/Weather real)
  // aqui já simula "alerta climático executivo"
  const now = new Date();
  const month = now.getMonth() + 1;

  if ([6, 7, 8, 9].includes(month)) {
    return {
      status: "SECA / TRANSIÇÃO",
      alerta: "Risco de queda de oferta de forragem. Antecipar suplementação e ajustar lotação.",
    };
  }
  return {
    status: "ÁGUAS",
    alerta: "Boa janela de produção. Otimizar rotação e ganho de peso (GMD).",
  };
}

function recomendacaoRegionalMock() {
  // Placeholder inteligente por região/bioma (vamos tornar real depois com GPS)
  return [
    {
      titulo: "Recomendação por Região (mock inteligente)",
      detalhe:
        "Defina seu bioma (Cerrado, Amazônia, Mata Atlântica, Caatinga, Pantanal, Pampa). O sistema vai sugerir: gramíneas, raça, suplementação e risco climático.",
    },
    {
      titulo: "Raças (padrão executivo)",
      detalhe:
        "Calor/umidade: Nelore e cruzamentos. Frio: Angus/Hereford (ou cruzamento industrial). Pasto pobre: zebuínos/compostos adaptados.",
    },
    {
      titulo: "Suplementação estratégica",
      detalhe:
        "Águas: mineral adequado. Transição: proteinado. Seca: proteico-energético conforme objetivo (recria/engorda).",
    },
  ];
}

export default function PastagemClient() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [data, setData] = useState<ApiResp | null>(null);

  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/pastagem/status", { cache: "no-store" });

      const text = await res.text();

      // proteção total: se vier HTML, detecta e mostra erro claro
      if (text.trim().startsWith("<!DOCTYPE html") || text.trim().startsWith("<html")) {
        throw new Error(
          "Pastagem: resposta inválida (HTML). Endpoint /api/pastagem/status está sendo bloqueado/redirect ou inexistente."
        );
      }

      const json = JSON.parse(text) as ApiResp;
      if (!json.ok) throw new Error(json.error || "Falha ao carregar Pastagem.");

      setData(json);
    } catch (e: any) {
      setErro(e?.message ?? "Erro inesperado ao carregar Pastagem.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const clima = useMemo(() => climaLabelMock(), []);
  const recomendacoes = useMemo(() => recomendacaoRegionalMock(), []);

  const piquetesFiltrados = useMemo(() => {
    const rows = data?.piquetes ?? [];
    const q = busca.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) => {
      const s = `${p.nome ?? ""} ${p.status ?? ""} ${p.tipo_pasto ?? ""}`.toLowerCase();
      return s.includes(q);
    });
  }, [data, busca]);

  const k = data?.kpis;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Pastagem (Real)</h1>
        <p className="text-sm text-gray-600">
          Monitoramento executivo do uso de piquetes + alertas operacionais (Pecuária Executiva).
        </p>
      </div>

      {erro && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="font-semibold text-red-700">Erro ao carregar Pastagem</div>
          <div className="text-sm text-red-700 mt-1">{erro}</div>
          <button
            onClick={carregar}
            className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-white text-sm hover:opacity-90"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <div className="rounded-xl border bg-white shadow-sm p-4">
          <div className="text-xs text-gray-500">Piquetes</div>
          <div className="text-2xl font-semibold">{k?.total_piquetes ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-white shadow-sm p-4">
          <div className="text-xs text-gray-500">Disponíveis</div>
          <div className="text-2xl font-semibold">{k?.disponiveis ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-white shadow-sm p-4">
          <div className="text-xs text-gray-500">Ocupados</div>
          <div className="text-2xl font-semibold">{k?.ocupados ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-white shadow-sm p-4">
          <div className="text-xs text-gray-500">Área total (ha)</div>
          <div className="text-2xl font-semibold">{k?.area_total_ha ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-white shadow-sm p-4">
          <div className="text-xs text-gray-500">Capacidade (UA)</div>
          <div className="text-2xl font-semibold">{k?.capacidade_total_ua ?? 0}</div>
        </div>
      </div>

      {/* Clima executivo */}
      <div className="mb-6 rounded-xl border bg-white shadow-sm p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500">Clima (Executivo)</div>
            <div className="text-lg font-semibold">{clima.status}</div>
            <div className="text-sm text-gray-600 mt-1">{clima.alerta}</div>
          </div>
          <div className="text-xs text-gray-500 text-right">
            <div className="font-semibold">Próxima evolução</div>
            <div>GPS/bioma + Weather API</div>
          </div>
        </div>
      </div>

      {/* Layout: Alertas + Tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Alertas</h2>
                <p className="text-xs text-gray-500">Operacional (campo real)</p>
              </div>
              <span className="text-xs rounded-full bg-gray-100 px-2 py-1">
                {(data?.alertas?.length ?? 0).toString()}
              </span>
            </div>

            <div className="p-4 space-y-3">
              {loading && <div className="text-sm text-gray-500">Carregando alertas...</div>}

              {!loading && (data?.alertas?.length ?? 0) === 0 && (
                <div className="text-sm text-gray-500">Nenhum alerta no momento.</div>
              )}

              {(data?.alertas ?? []).map((a, idx) => (
                <div key={idx} className={`rounded-lg border p-3 ${badge(a.tipo)}`}>
                  <div className="font-semibold text-sm">{a.titulo}</div>
                  <div className="text-xs mt-1">{a.detalhe}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recomendação executiva */}
          <div className="mt-4 rounded-xl border bg-white shadow-sm p-4">
            <h3 className="font-semibold mb-1">Recomendação Executiva</h3>
            <p className="text-sm text-gray-600">
              Se aproximar da seca e houver queda de disponibilidade, iniciar suplementação antecipada
              (proteinado → proteico-energético) e ajustar lotação antes da perda de GMD.
            </p>

            <div className="mt-4 space-y-3">
              {recomendacoes.map((r, idx) => (
                <div key={idx} className="rounded-lg border bg-gray-50 p-3">
                  <div className="text-sm font-semibold">{r.titulo}</div>
                  <div className="text-xs text-gray-600 mt-1">{r.detalhe}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="p-4 border-b flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">Piquetes</h2>
                <p className="text-xs text-gray-500">
                  Fonte: <code className="text-gray-700">{data?.fonte ?? "piquete_status_view"}</code>
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-[420px]">
                <input
                  placeholder="Buscar: nome, status..."
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
                <button
                  onClick={carregar}
                  className="rounded-lg bg-black px-3 py-2 text-white text-sm hover:opacity-90"
                >
                  Atualizar
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3">Nome</th>
                    <th className="text-left px-4 py-3">Área (ha)</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Capacidade (UA)</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td className="px-4 py-4 text-gray-500" colSpan={4}>
                        Carregando pastagem...
                      </td>
                    </tr>
                  )}

                  {!loading && piquetesFiltrados.length === 0 && (
                    <tr>
                      <td className="px-4 py-4 text-gray-500" colSpan={4}>
                        Nenhum piquete encontrado.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    piquetesFiltrados.map((p) => (
                      <tr key={p.piquete_id} className="border-t">
                        <td className="px-4 py-3 font-medium">{p.nome}</td>
                        <td className="px-4 py-3">{Number(p.area_ha ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-3">{p.status ?? "-"}</td>
                        <td className="px-4 py-3">{Number(p.capacidade_ua ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t text-xs text-gray-500">
              Decisão de campo: manter rotação, evitar superpastejo e antecipar suplementação na transição
              águas → seca.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
