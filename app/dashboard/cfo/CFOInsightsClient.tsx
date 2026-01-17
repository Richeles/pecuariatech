"use client";

// app/dashboard/cfo/CFOInsightsClient.tsx
// CFO AUTÔNOMO — Client Component (hooks ficam aqui)
// Equação Y: consumir somente /api/inteligencia/financeiro (read-only)
// Triângulo 360: sinais devem vir com eixo (contabil/operacional/estrategico)

import { useEffect, useMemo, useState } from "react";

type CFOApiResponse = {
  ok: boolean;
  domain: string;
  ts?: string;
  degraded?: boolean;

  kpis?: {
    receita_total?: number;
    custos_totais?: number;
    resultado_operacional?: number;
    margem_operacional_pct?: number;

    // opcionais (se a API já enviar)
    saldo_caixa?: number;
    divida_total?: number;
    tendencia_3m?: string;
  };

  sinais?: Array<{
    eixo?: "contabil" | "operacional" | "estrategico" | string;
    tipo: "alerta" | "info" | string;
    codigo?: string;
    mensagem?: string;
    severidade?: "alta" | "media" | "baixa" | string;
    acao_sugerida?: string;
  }>;

  resumo_executivo?: string;
  error?: string;
};

function brl(v?: number) {
  const n = typeof v === "number" ? v : 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pct(v?: number) {
  const n = typeof v === "number" ? v : 0;
  return `${n.toFixed(2)}%`;
}

export default function CFOInsightsClient() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CFOApiResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      // Importante: rota protegida por cookie SSR/session
      const res = await fetch("/api/inteligencia/financeiro", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      // Blindagem: sessão expirada
      if (res.status === 401) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      // Blindagem: middleware pode redirecionar para /login (HTML)
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        // UX correta: manda para login
        window.location.href = "/login";
        return;
      }

      const json = (await res.json()) as CFOApiResponse;

      if (!json?.ok) {
        throw new Error(json?.error || "Falha ao consultar inteligência.");
      }

      setData(json);
    } catch (e: any) {
      setErr(e?.message || "Erro inesperado no CFO.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const severity = useMemo(() => {
    const first = data?.sinais?.[0]?.severidade?.toLowerCase();
    if (!first) return "baixa";
    if (first.includes("alta")) return "alta";
    if (first.includes("media")) return "media";
    return "baixa";
  }, [data]);

  const badge = useMemo(() => {
    if (data?.degraded)
      return {
        text: "MODO SEGURO",
        cls: "bg-yellow-100 text-yellow-800 border-yellow-200",
      };

    if (severity === "alta")
      return { text: "ALERTA ALTO", cls: "bg-red-100 text-red-800 border-red-200" };

    if (severity === "media")
      return {
        text: "ALERTA MÉDIO",
        cls: "bg-orange-100 text-orange-800 border-orange-200",
      };

    return { text: "ESTÁVEL", cls: "bg-green-100 text-green-800 border-green-200" };
  }, [data?.degraded, severity]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-72 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-50 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-gray-50 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="h-24 bg-gray-50 rounded-xl animate-pulse" />
          <div className="h-24 bg-gray-50 rounded-xl animate-pulse" />
          <div className="h-24 bg-gray-50 rounded-xl animate-pulse" />
          <div className="h-24 bg-gray-50 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-xs font-bold rounded-full border bg-red-50 text-red-700 border-red-200">
            FALHA NO CFO
          </span>
        </div>

        <p className="text-sm text-red-700">{err}</p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={load}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
          >
            Recarregar CFO
          </button>

          <a
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-semibold hover:bg-gray-50 transition"
          >
            Ir para Login
          </a>
        </div>

        <p className="text-xs text-gray-500">
          Fonte esperada:{" "}
          <code className="px-1 py-0.5 bg-gray-100 rounded">/api/inteligencia/financeiro</code>.
        </p>
      </div>
    );
  }

  const k = data?.kpis || {};
  const sinais = data?.sinais || [];

  return (
    <div className="space-y-6">
      {/* TOPO */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">CFO Autônomo — Insights</h2>
          <p className="text-sm text-gray-600">
            KPIs (DRE) + sinais (Triângulo 360), gerados na API.
          </p>
        </div>

        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${badge.cls}`}>
          {badge.text}
        </span>
      </div>

      {/* RESUMO */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
        <p className="text-sm text-gray-700 font-semibold">Resumo Executivo</p>
        <p className="text-gray-900 mt-2">{data?.resumo_executivo || "Sem resumo disponível."}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-xs text-gray-500">Receita total</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{brl(k.receita_total)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-xs text-gray-500">Custos totais</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{brl(k.custos_totais)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-xs text-gray-500">Resultado operacional</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{brl(k.resultado_operacional)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Margem: <span className="font-semibold">{pct(k.margem_operacional_pct)}</span>
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-xs text-gray-500">Tendência 3 meses</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {(k.tendencia_3m || "—").toString()}
          </p>
        </div>
      </div>

      {/* SINAIS (Triângulo 360) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Sinais CFO (Triângulo 360)</h3>
          <button
            onClick={load}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
          >
            Atualizar
          </button>
        </div>

        {sinais.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <p className="text-green-800 font-semibold">Nenhum alerta crítico no momento.</p>
            <p className="text-green-700 text-sm mt-1">CFO indica estabilidade financeira.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sinais.map((s, idx) => (
              <div
                key={`${s.codigo || "sinal"}-${idx}`}
                className="bg-white border border-gray-200 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-gray-900">
                    {(s.tipo || "sinal").toUpperCase()}{" "}
                    <span className="text-xs font-semibold text-gray-500">
                      {s.eixo ? `• eixo: ${s.eixo}` : ""}
                    </span>
                  </p>
                  <span className="text-xs px-3 py-1 rounded-full border bg-gray-50 text-gray-700 border-gray-200">
                    Severidade: {s.severidade || "—"}
                  </span>
                </div>

                <p className="text-gray-700 mt-2">{s.mensagem || "Sem mensagem."}</p>

                {s.acao_sugerida ? (
                  <div className="mt-3 text-sm bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <p className="text-gray-600 font-semibold">Ação sugerida</p>
                    <p className="text-gray-900 mt-1">{s.acao_sugerida}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RODAPÉ */}
      <div className="text-xs text-gray-500">
        Fonte:{" "}
        <code className="px-1 py-0.5 bg-gray-100 rounded">/api/inteligencia/financeiro</code>{" "}
        (read-only).
      </div>
    </div>
  );
}
