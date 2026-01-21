// CAMINHO: app/dashboard/assinatura/plano/PlanoClient.tsx
// UI Premium Internacional (SaaS)
// ✅ Equação Y: UI só consome APIs (status, alterar, planilha)
// ✅ Triângulo 360: Auth (SSR cookie + token) + Paywall + Dados

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase-browser";

type PlanoId =
  | "basico"
  | "profissional"
  | "ultra"
  | "empresarial"
  | "premium_dominus";

const PLANOS: Array<{
  id: PlanoId;
  nome: string;
  tag: string;
  destaque: string;
  bullets: string[];
}> = [
  {
    id: "basico",
    nome: "Básico",
    tag: "Essencial",
    destaque: "Controle financeiro simples e rápido",
    bullets: ["Receitas", "Despesas", "Fluxo de caixa"],
  },
  {
    id: "profissional",
    nome: "Profissional",
    tag: "Pro",
    destaque: "Gestão + indicadores e evolução",
    bullets: ["Indicadores", "Categorias avançadas", "Sugestões táticas"],
  },
  {
    id: "ultra",
    nome: "Ultra",
    tag: "Ultra",
    destaque: "Visão completa + automações",
    bullets: ["DRE/EBITDA", "Alertas", "CFO assistido"],
  },
  {
    id: "empresarial",
    nome: "Empresarial",
    tag: "Empresa",
    destaque: "Multi-unidade e governança",
    bullets: ["Multi-fazenda", "Comparativos", "Compliance"],
  },
  {
    id: "premium_dominus",
    nome: "Premium Dominus 360°",
    tag: "Dominus",
    destaque: "SaaS internacional (máximo nível)",
    bullets: ["CFO 360°", "Auditoria", "IA aplicada"],
  },
];

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
  preview?: {
    template?: string;
    sections?: string[];
  };
};

function extrairPlanoFromNext(nextValue: string | null): PlanoId | null {
  if (!nextValue) return null;
  const x = decodeURIComponent(nextValue).toLowerCase();

  // fluxo financeiro por plano
  if (x.includes("/api/financeiro/ultra")) return "ultra";
  if (x.includes("/api/financeiro/profissional")) return "profissional";
  if (x.includes("/api/financeiro/basico")) return "basico";

  // quando vier /api/financeiro/planilha é feature e NÃO plano
  if (x.includes("/api/financeiro/planilha")) return null;

  return null;
}

function badgeNivel(nivel?: PlanilhaPreview["nivel"]) {
  const x = (nivel ?? "basico").toLowerCase();
  if (x === "premium")
    return "bg-purple-100 text-purple-800 border-purple-200";
  if (x === "empresarial")
    return "bg-slate-100 text-slate-800 border-slate-200";
  if (x === "ultra") return "bg-green-100 text-green-800 border-green-200";
  if (x === "profissional")
    return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
}

function normalizePlanoLabel(plano: string | null | undefined) {
  if (!plano) return "-";
  const p = String(plano).toLowerCase();
  if (p.includes("premium")) return "premium_dominus";
  if (p.includes("empres")) return "empresarial";
  if (p.includes("ultra")) return "ultra";
  if (p.includes("prof")) return "profissional";
  return "basico";
}

export default function PlanoClient() {
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<StatusAssinatura | null>(null);
  const [selecionado, setSelecionado] = useState<PlanoId>("basico");
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState<PlanilhaPreview | null>(null);

  // ===============================
  // plano alvo pedido pelo middleware
  // ===============================
  const planoDoNext = useMemo(() => {
    const next = searchParams.get("next");
    return extrairPlanoFromNext(next);
  }, [searchParams]);

  // ===============================
  // carregar status assinatura
  // ===============================
  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch("/api/assinaturas/status", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) throw new Error("status_error");

        const data = (await res.json()) as StatusAssinatura;
        setStatus(data);

        const atual = normalizePlanoLabel(data?.plano) as PlanoId;

        const inicial = (planoDoNext ?? atual ?? "basico") as PlanoId;
        setSelecionado(inicial);
      } catch {
        setMensagem("Não foi possível carregar sua assinatura.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [planoDoNext]);

  // ===============================
  // preview canônico (/api/financeiro/planilha)
  // servidor decide pelo plano real do usuário
  // ===============================
  useEffect(() => {
    async function carregarPreview() {
      if (!selecionado) return;

      // preview premium faz sentido apenas para planos financeiros principais
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
        const res = await fetch("/api/financeiro/planilha", {
          credentials: "include",
          cache: "no-store",
        });

        const json = (await res.json().catch(() => null)) as PlanilhaPreview | null;
        setPreview(json ?? { ok: false, reason: "invalid_response" });
      } catch {
        setPreview({ ok: false, reason: "preview_unavailable" });
      } finally {
        setLoadingPreview(false);
      }
    }

    carregarPreview();
  }, [selecionado]);

  // ===============================
  // confirmar alterar plano
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
  // UI states
  // ===============================
  if (loading) return <p className="p-6">Carregando...</p>;

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

  const planoAtual = normalizePlanoLabel(status.plano);
  const planoSelecionadoMeta = PLANOS.find((p) => p.id === selecionado);

  return (
    <main className="p-6 max-w-3xl space-y-6">
      {/* Header premium */}
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Gerenciar Plano</h1>
        <p className="text-sm text-gray-600">
          Painel SaaS Premium • assinatura, upgrades e preview de recursos
        </p>
      </header>

      {/* Status Card */}
      <section className="bg-white rounded-xl shadow p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p>
            <strong>Plano atual:</strong>{" "}
            <span className="capitalize">{planoAtual}</span>
          </p>

          <span className="text-xs px-2 py-1 rounded-full border bg-green-50 text-green-700">
            Ativo
          </span>
        </div>

        {planoDoNext ? (
          <p className="text-sm text-orange-700">
            <strong>Upgrade necessário:</strong> tentativa de acesso a recurso do{" "}
            plano <strong>{planoDoNext}</strong>.
          </p>
        ) : null}
      </section>

      {/* Seletor Premium */}
      <section className="bg-white rounded-xl shadow p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Escolha seu plano</h2>
          <span className="text-xs text-gray-500">SaaS por Plano • Equação Y</span>
        </div>

        <select
          value={selecionado}
          onChange={(e) => setSelecionado(e.target.value as PlanoId)}
          className="w-full border rounded px-3 py-2"
        >
          {PLANOS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>

        {/* Card do plano selecionado */}
        {planoSelecionadoMeta ? (
          <div className="border rounded-xl p-4 bg-gray-50">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-semibold">
                  {planoSelecionadoMeta.nome} •{" "}
                  <span className="text-gray-600">{planoSelecionadoMeta.tag}</span>
                </p>
                <p className="text-sm text-gray-600">
                  {planoSelecionadoMeta.destaque}
                </p>
              </div>

              <span className="text-xs px-2 py-1 rounded-full border bg-white text-gray-700">
                {selecionado === planoAtual ? "Atual" : "Selecionado"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
              {planoSelecionadoMeta.bullets.map((b) => (
                <div
                  key={b}
                  className="text-sm border rounded-lg bg-white px-3 py-2"
                >
                  {b}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Preview da planilha (Premium) */}
      {(selecionado === "basico" ||
        selecionado === "profissional" ||
        selecionado === "ultra") && (
        <section className="bg-white rounded-xl shadow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Preview da Planilha Financeira</h2>
            <span className="text-xs text-gray-500">
              Preview Real • por assinatura
            </span>
          </div>

          {loadingPreview ? (
            <p className="text-sm text-gray-600">Carregando preview...</p>
          ) : preview?.ok ? (
            <div className="space-y-3">
              <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">
                    {preview.titulo ?? "Planilha Financeira"}
                  </p>

                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${badgeNivel(
                      preview.nivel
                    )}`}
                  >
                    {preview.nivel ?? "basico"}
                  </span>
                </div>

                {preview.descricao ? (
                  <p className="text-sm text-gray-600">{preview.descricao}</p>
                ) : null}

                <p className="text-xs text-gray-600">
                  Template:{" "}
                  <strong>{preview.preview?.template ?? "basico"}</strong>
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

              {/* Mensagem estratégica premium */}
              <div className="rounded-lg border bg-green-50 p-3 text-sm text-green-800">
                <strong>Estratégia SaaS:</strong> o preview reflete seu plano real
                ativo. Upgrades liberam novas seções, indicadores e automações.
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Preview indisponível para este plano (ou requer upgrade).
            </p>
          )}
        </section>
      )}

      {/* Ação principal */}
      <button
        onClick={confirmar}
        className="w-full bg-green-600 text-white py-2 rounded hover:opacity-90"
      >
        Confirmar alteração
      </button>

      {mensagem ? (
        <p className="text-sm text-center text-gray-700">{mensagem}</p>
      ) : null}

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
