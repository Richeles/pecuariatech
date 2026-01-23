// CAMINHO: app/dashboard/assinatura/plano/PlanoClient.tsx
// Patch FINAL Premium Internacional (Local vs Produção)
// ✅ Equação Y: UI consome APIs canônicas (/api/assinaturas/status e /api/financeiro/planilha)
// ✅ Triângulo 360: Auth (cookie SSR) + Paywall + Dados (preview)
// ✅ Diagnóstico Premium: resolve diferença LOCAL vs PRODUÇÃO com evidência na UI

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase-browser";

const PLANOS = [
  { id: "basico", nome: "Básico" },
  { id: "profissional", nome: "Profissional" },
  { id: "ultra", nome: "Ultra" },
  { id: "empresarial", nome: "Empresarial" },
  { id: "premium_dominus", nome: "Premium Dominus 360°" },
] as const;

type StatusAssinatura = {
  plano: string | null;
  ativo: boolean;
  beneficios?: Record<string, any> | null;
};

type PlanilhaPreview = {
  ok: boolean;
  reason?: string;
  plano?: string;
  nivel?: "basico" | "profissional" | "ultra" | "empresarial" | "premium";
  titulo?: string;
  descricao?: string;
  preview?: { template?: string; sections?: string[] };
};

type Diagnostico = {
  env: "LOCAL" | "PRODUCAO";
  origin: string;
  ts: string;
  buildTag: string;
  statusHttp?: number;
  statusOk?: boolean;
  assinaturaAtiva?: boolean;
  assinaturaPlano?: string | null;
  planilhaHttp?: number;
  planilhaOk?: boolean;
  planilhaReason?: string;
};

function extrairPlanoFromNext(nextValue: string | null) {
  if (!nextValue) return null;

  const x = decodeURIComponent(nextValue).toLowerCase();

  // Padrões do fluxo financeiro
  if (x.includes("/api/financeiro/ultra")) return "ultra";
  if (x.includes("/api/financeiro/profissional")) return "profissional";
  if (x.includes("/api/financeiro/basico")) return "basico";

  // /api/financeiro/planilha é FEATURE e não plano
  if (x.includes("/api/financeiro/planilha")) return null;

  return null;
}

function getBuildTag() {
  // ✅ Estratégia robusta: se existir env de build, usa. Senão, fallback.
  // Opcional: você pode setar NEXT_PUBLIC_BUILD_TAG na Vercel depois.
  const tag =
    (process.env.NEXT_PUBLIC_BUILD_TAG as string | undefined) ||
    (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA as string | undefined) ||
    "dev";
  return tag.slice(0, 10);
}

export default function PlanoClient() {
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<StatusAssinatura | null>(null);
  const [selecionado, setSelecionado] = useState<string>("basico");
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState<PlanilhaPreview | null>(null);

  // ✅ Diagnóstico determinístico para “matar” a diferença local vs produção
  const [diag, setDiag] = useState<Diagnostico | null>(null);

  const planoDoNext = useMemo(() => {
    const next = searchParams.get("next");
    return extrairPlanoFromNext(next);
  }, [searchParams]);

  const origin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  const env: "LOCAL" | "PRODUCAO" = useMemo(() => {
    if (!origin) return "LOCAL";
    return origin.includes("127.0.0.1") || origin.includes("localhost")
      ? "LOCAL"
      : "PRODUCAO";
  }, [origin]);

  // ===============================
  // CARREGAR STATUS REAL (canônico)
  // ===============================
  useEffect(() => {
    async function carregarStatus() {
      const buildTag = getBuildTag();
      const ts = new Date().toISOString();

      try {
        // ✅ sempre com cookie (SSR cookie-first no backend)
        const res = await fetch(`/api/assinaturas/status?ts=${Date.now()}`, {
          credentials: "include",
          cache: "no-store",
        });

        const statusHttp = res.status;
        const data = await res.json().catch(() => null);

        if (!res.ok || !data) {
          setMensagem("Não foi possível carregar sua assinatura.");
          setDiag({
            env,
            origin,
            ts,
            buildTag,
            statusHttp,
            statusOk: false,
          });
          setLoading(false);
          return;
        }

        setStatus(data);

        // 1) plano pedido pelo middleware
        // 2) plano atual
        // 3) default basico
        const inicial =
          planoDoNext ?? (data?.plano ? String(data.plano) : null) ?? "basico";

        setSelecionado(inicial);

        setDiag({
          env,
          origin,
          ts,
          buildTag,
          statusHttp,
          statusOk: true,
          assinaturaAtiva: Boolean(data?.ativo),
          assinaturaPlano: data?.plano ?? null,
        });
      } catch {
        setMensagem("Não foi possível carregar sua assinatura.");
        setDiag({
          env,
          origin,
          ts,
          buildTag,
          statusOk: false,
        });
      } finally {
        setLoading(false);
      }
    }

    carregarStatus();
  }, [env, origin, planoDoNext]);

  // ===============================
  // PREVIEW PLANILHA (Equação Y)
  // ✅ Backend decide pelo plano real (não querystring)
  // ===============================
  useEffect(() => {
    async function carregarPreview() {
      if (!selecionado) return;

      if (
        selecionado !== "basico" &&
        selecionado !== "profissional" &&
        selecionado !== "ultra"
      ) {
        setPreview(null);
        return;
      }

      setLoadingPreview(true);
      try {
        const res = await fetch(`/api/financeiro/planilha?ts=${Date.now()}`, {
          credentials: "include",
          cache: "no-store",
        });

        const planilhaHttp = res.status;
        const json = (await res.json().catch(() => null)) as PlanilhaPreview | null;

        setPreview(json ?? { ok: false, reason: "invalid_response" });

        // atualiza diag (sem perder campos anteriores)
        setDiag((prev) => ({
          ...(prev ?? {
            env,
            origin,
            ts: new Date().toISOString(),
            buildTag: getBuildTag(),
          }),
          planilhaHttp,
          planilhaOk: Boolean(json?.ok),
          planilhaReason: json?.reason,
        }));
      } catch {
        setPreview({ ok: false, reason: "preview_unavailable" });
        setDiag((prev) => ({
          ...(prev ?? {
            env,
            origin,
            ts: new Date().toISOString(),
            buildTag: getBuildTag(),
          }),
          planilhaOk: false,
          planilhaReason: "preview_unavailable",
        }));
      } finally {
        setLoadingPreview(false);
      }
    }

    carregarPreview();
  }, [selecionado, env, origin]);

  // ===============================
  // CONFIRMAR ALTERAÇÃO (NÃO mexer)
  // ===============================
  async function confirmar() {
    if (!selecionado) return;

    setMensagem(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setMensagem("Sessão inválida. Faça login novamente.");
      return;
    }

    const res = await fetch("/api/assinaturas/alterar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ novo_plano: selecionado }),
    });

    const json = await res.json().catch(() => null);

    if (json?.sucesso) {
      if (json.tipo === "upgrade") setMensagem("Upgrade realizado com sucesso.");
      else if (json.tipo === "downgrade_agendado")
        setMensagem("Downgrade agendado para o próximo ciclo.");
      else setMensagem("Plano atualizado.");
    } else {
      setMensagem(json?.erro || "Erro ao alterar plano.");
    }
  }

  // ===============================
  // ESTADOS DE TELA
  // ===============================
  if (loading) {
    return <p className="p-6">Carregando...</p>;
  }

  if (!status || !status.ativo) {
    return (
      <main className="p-6 max-w-xl space-y-4">
        <h1 className="text-2xl font-bold">Nenhuma assinatura ativa</h1>
        <p>Você ainda não possui um plano ativo no PecuariaTech.</p>
        <Link
          href="/planos"
          className="inline-block rounded bg-green-600 px-4 py-2 text-white"
        >
          Ver planos disponíveis
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Gerenciar Plano</h1>
        <p className="text-sm text-gray-600">
          Painel SaaS Premium • assinatura, upgrades e preview de recursos
        </p>
      </div>

      {/* ✅ DIAGNÓSTICO PREMIUM (mata diferença local vs produção) */}
      {diag && (
        <section className="border rounded-xl bg-white shadow-sm p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Diagnóstico do Ambiente</p>
            <span
              className={`text-xs px-2 py-1 rounded-full border ${
                diag.env === "PRODUCAO"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-orange-50 text-orange-700 border-orange-200"
              }`}
            >
              {diag.env}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="border rounded-lg p-3">
              <p className="text-gray-500">Origin</p>
              <p className="font-medium break-all">{diag.origin}</p>
            </div>

            <div className="border rounded-lg p-3">
              <p className="text-gray-500">Build Tag</p>
              <p className="font-medium">{diag.buildTag}</p>
            </div>

            <div className="border rounded-lg p-3">
              <p className="text-gray-500">Assinatura API</p>
              <p className="font-medium">
                HTTP {diag.statusHttp ?? "-"} •{" "}
                {diag.statusOk ? "OK" : "FALHA"}
              </p>
              <p className="text-gray-600">
                ativo: <strong>{String(diag.assinaturaAtiva ?? "-")}</strong> • plano:{" "}
                <strong>{diag.assinaturaPlano ?? "-"}</strong>
              </p>
            </div>

            <div className="border rounded-lg p-3">
              <p className="text-gray-500">Planilha API</p>
              <p className="font-medium">
                HTTP {diag.planilhaHttp ?? "-"} •{" "}
                {diag.planilhaOk ? "OK" : "FALHA"}
              </p>
              <p className="text-gray-600">
                reason: <strong>{diag.planilhaReason ?? "-"}</strong>
              </p>
            </div>

            <div className="border rounded-lg p-3 md:col-span-2">
              <p className="text-gray-500">Timestamp</p>
              <p className="font-medium">{diag.ts}</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Esse painel prova, com evidência técnica, qual ambiente está rodando (LOCAL/PRODUÇÃO),
            qual build foi servido e quais APIs responderam.
          </p>
        </section>
      )}

      {/* Status + Plano atual */}
      <div className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
        <div className="space-y-1">
          <p>
            <strong>Plano atual:</strong> {status.plano ?? "-"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Status:</strong> Ativo
          </p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full border bg-green-50 text-green-700 border-green-200">
          Ativo
        </span>
      </div>

      {/* Aviso de upgrade quando veio do middleware */}
      {planoDoNext && (
        <div className="border rounded-xl bg-orange-50 p-4 text-sm text-orange-800">
          <strong>Upgrade necessário:</strong> você tentou acessar um recurso do plano{" "}
          <strong>{planoDoNext}</strong>.
        </div>
      )}

      {/* Select de plano */}
      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <div className="flex items-center justify-between">
          <label className="block font-medium">Escolha seu plano</label>
          <span className="text-xs text-gray-500">SaaS por Plano • Equação Y</span>
        </div>

        <select
          value={selecionado}
          onChange={(e) => setSelecionado(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          {PLANOS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Preview Premium */}
      {(selecionado === "basico" ||
        selecionado === "profissional" ||
        selecionado === "ultra") && (
        <section className="bg-white rounded-xl shadow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Preview da Planilha Financeira</h2>
            <span className="text-xs text-gray-500">SaaS por Plano • Equação Y</span>
          </div>

          {loadingPreview ? (
            <p className="text-sm text-gray-600">Carregando preview...</p>
          ) : preview?.ok ? (
            <div className="space-y-3">
              <div className="border rounded-lg p-3 space-y-1">
                <p className="font-medium">{preview.titulo ?? "Planilha Financeira"}</p>
                {preview.descricao ? (
                  <p className="text-sm text-gray-600">{preview.descricao}</p>
                ) : null}

                <p className="text-sm text-gray-700">
                  <strong>Nível:</strong> {preview.nivel ?? "basico"} •{" "}
                  <strong>Template:</strong> {preview.preview?.template ?? "basico"}
                </p>
              </div>

              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium mb-2">Seções disponíveis</p>

                {preview.preview?.sections?.length ? (
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {preview.preview.sections.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">
                    Nenhuma seção disponível para este plano.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Preview indisponível para este plano (ou requer upgrade).
            </p>
          )}
        </section>
      )}

      <button
        onClick={confirmar}
        className="w-full bg-green-600 text-white py-2 rounded hover:opacity-90"
      >
        Confirmar alteração
      </button>

      {mensagem && <p className="text-sm text-center text-gray-700">{mensagem}</p>}

      <div className="pt-2 text-center">
        <Link
          href="/dashboard/assinatura"
          className="text-sm text-green-700 hover:underline"
        >
          Voltar para minha assinatura
        </Link>
      </div>
    </main>
  );
}
