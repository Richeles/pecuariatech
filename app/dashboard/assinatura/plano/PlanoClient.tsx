// CAMINHO: app/dashboard/assinatura/plano/PlanoClient.tsx
// Client Component (Next.js 16)
// ✅ Equação Y: UI só consome APIs (status, alterar, planilha preview)
// ✅ Triângulo 360: Auth cookie SSR + token, Paywall por benefícios, Dados por plano

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

type PlanoId = (typeof PLANOS)[number]["id"];

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

  if (x.includes("/api/financeiro/ultra")) return "ultra";
  if (x.includes("/api/financeiro/profissional")) return "profissional";
  if (x.includes("/api/financeiro/basico")) return "basico";

  // Quando middleware manda para /api/financeiro/planilha: feature, não plano
  if (x.includes("/api/financeiro/planilha")) return null;

  return null;
}

// 🧠 helper: título premium por plano (fallback UX)
function tituloPlano(plano: PlanoId) {
  switch (plano) {
    case "basico":
      return "Planilha Financeira Essencial (Básico)";
    case "profissional":
      return "Planilha Financeira Profissional (DRE + KPIs)";
    case "ultra":
      return "Planilha Ultra (CFO 360 + Simulações)";
    case "empresarial":
      return "Planilha Empresarial (Gestão + Governança)";
    case "premium_dominus":
      return "Dominus 360° (Premium) — Inteligência Total";
  }
}

function secoesFallback(plano: PlanoId): string[] {
  if (plano === "basico") return ["Receitas", "Despesas", "Fluxo de Caixa"];
  if (plano === "profissional") return ["DRE", "Fluxo de Caixa", "Custos por Centro", "Indicadores"];
  if (plano === "ultra") return ["CFO 360", "DRE", "EBITDA", "Alertas", "Cenários Ótimo/Seguro/Rápido"];
  if (plano === "empresarial") return ["Multi-unidade", "Orçamento", "Metas", "Governança"];
  return ["IA CFO", "Cenários", "Risco", "Governança", "Auditoria Inteligente"];
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
  // Plano alvo solicitado pelo middleware (upgrade flow)
  // ===============================
  const planoDoNext = useMemo(() => {
    const next = searchParams.get("next");
    return extrairPlanoFromNext(next);
  }, [searchParams]);

  // ===============================
  // 1) Carregar status real (API canônica)
  // ===============================
  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch("/api/assinaturas/status", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) throw new Error("status_failed");

        const data = (await res.json().catch(() => null)) as StatusAssinatura | null;
        if (!data) throw new Error("invalid_json");

        setStatus(data);

        // prioridade SaaS:
        // (1) plano solicitado pelo middleware (next)
        // (2) plano atual real (data.plano)
        // (3) fallback
        const inicial =
          (planoDoNext as PlanoId | null) ??
          ((data?.plano as PlanoId | null) || null) ??
          "basico";

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
  // 2) Preview de Planilha (premium)
  // ✅ cada plano mostra uma planilha evoluída
  // ✅ PREVIEW pode usar query ?plano= (simulação)
  // ✅ mas o servidor segue soberano p/ acesso real
  // ===============================
  useEffect(() => {
    async function carregarPreview() {
      if (!selecionado) return;

      setLoadingPreview(true);
      setPreview(null);

      try {
        // ✅ Preview premium por plano (simulação)
        const url = `/api/financeiro/planilha?plano=${encodeURIComponent(selecionado)}`;

        const res = await fetch(url, {
          credentials: "include",
          cache: "no-store",
        });

        const json = (await res.json().catch(() => null)) as PlanilhaPreview | null;

        if (!res.ok) {
          // blindagem: não quebra UI (paywall / erro técnico)
          setPreview(
            json ?? {
              ok: false,
              reason: "preview_unavailable",
            }
          );
          return;
        }

        setPreview(
          json ?? {
            ok: true,
            plano: selecionado,
            nivel:
              selecionado === "premium_dominus"
                ? "premium"
                : (selecionado as any),
            titulo: tituloPlano(selecionado),
            descricao: "Preview premium do módulo financeiro conforme o plano selecionado.",
            preview: {
              template: selecionado,
              sections: secoesFallback(selecionado),
            },
          }
        );
      } catch {
        setPreview({
          ok: true,
          plano: selecionado,
          nivel:
            selecionado === "premium_dominus"
              ? "premium"
              : (selecionado as any),
          titulo: tituloPlano(selecionado),
          descricao: "Preview em modo fallback (offline-safe).",
          preview: {
            template: selecionado,
            sections: secoesFallback(selecionado),
          },
        });
      } finally {
        setLoadingPreview(false);
      }
    }

    carregarPreview();
  }, [selecionado]);

  // ===============================
  // Confirmar alteração (mantido)
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
      body: JSON.stringify({
        novo_plano: selecionado,
      }),
    });

    const json = await res.json().catch(() => null);

    if (json?.sucesso) {
      if (json.tipo === "upgrade") {
        setMensagem("Upgrade realizado com sucesso.");
      } else if (json.tipo === "downgrade_agendado") {
        setMensagem("Downgrade agendado para o próximo ciclo.");
      } else {
        setMensagem("Plano atualizado.");
      }
    } else {
      setMensagem(json?.erro || "Erro ao alterar plano.");
    }
  }

  // ===============================
  // Estados de tela
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

  return (
    <main className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Gerenciar Plano</h1>

      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <p>
          <strong>Plano atual:</strong> {status.plano ?? "-"}
        </p>
        <p>
          <strong>Status:</strong> Ativo
        </p>

        {planoDoNext && (
          <p className="text-sm text-orange-700">
            <strong>Upgrade necessário:</strong> tentativa de acesso a recurso do plano{" "}
            <strong>{planoDoNext}</strong>.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Escolha o novo plano</label>

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
      </div>

      {/* ✅ Preview Premium: TODOS os planos têm “planilha” evoluída */}
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
              <p className="font-medium">{preview.titulo ?? tituloPlano(selecionado)}</p>
              {preview.descricao ? (
                <p className="text-sm text-gray-600">{preview.descricao}</p>
              ) : null}

              <p className="text-sm text-gray-700">
                <strong>Nível:</strong> {preview.nivel ?? (selecionado === "premium_dominus" ? "premium" : selecionado)} •{" "}
                <strong>Template:</strong> {preview.preview?.template ?? selecionado}
              </p>
            </div>

            <div className="border rounded-lg p-3">
              <p className="text-sm font-medium mb-2">Seções disponíveis</p>

              {(preview.preview?.sections?.length ?? 0) > 0 ? (
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {preview.preview!.sections!.map((s, idx) => (
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
            Preview indisponível no momento ({preview?.reason ?? "unknown"}).
          </p>
        )}
      </section>

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
