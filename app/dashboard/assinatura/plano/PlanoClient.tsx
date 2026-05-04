"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/app/lib/supabase-browser";

const supabase = createClient();

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

  if (x.includes("/api/financeiro/ultra")) return "ultra";
  if (x.includes("/api/financeiro/profissional")) return "profissional";
  if (x.includes("/api/financeiro/basico")) return "basico";

  if (x.includes("/api/financeiro/planilha")) return null;

  return null;
}

function getBuildTag() {
  const tag =
    process.env.NEXT_PUBLIC_BUILD_TAG ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
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

  const [diag, setDiag] = useState<Diagnostico | null>(null);

  const planoDoNext = useMemo(() => {
    const next = searchParams.get("next");
    return extrairPlanoFromNext(next);
  }, [searchParams]);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  const env: "LOCAL" | "PRODUCAO" =
    origin.includes("127.0.0.1") || origin.includes("localhost")
      ? "LOCAL"
      : "PRODUCAO";

  useEffect(() => {
    async function carregarStatus() {
      const buildTag = getBuildTag();
      const ts = new Date().toISOString();

      try {
        const res = await fetch(`/api/assinaturas/status?ts=${Date.now()}`, {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || !data) {
          setMensagem("Não foi possível carregar sua assinatura.");
          setLoading(false);
          return;
        }

        setStatus(data);

        const inicial =
          planoDoNext ?? data?.plano ?? "basico";

        setSelecionado(inicial);

        setDiag({
          env,
          origin,
          ts,
          buildTag,
          statusHttp: res.status,
          statusOk: true,
          assinaturaAtiva: data?.ativo,
          assinaturaPlano: data?.plano,
        });
      } catch {
        setMensagem("Erro ao carregar assinatura.");
      } finally {
        setLoading(false);
      }
    }

    carregarStatus();
  }, [planoDoNext]);

  async function confirmar() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setMensagem("Sessão inválida.");
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

    const json = await res.json();

    if (json?.sucesso) {
      setMensagem("Plano atualizado com sucesso.");
    } else {
      setMensagem("Erro ao alterar plano.");
    }
  }

  if (loading) return <p className="p-6">Carregando...</p>;

  if (!status?.ativo) {
    return <p className="p-6">Sem assinatura ativa</p>;
  }

  return (
    <main className="p-6 max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Gerenciar Plano</h1>

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

      <button
        onClick={confirmar}
        className="w-full bg-green-600 text-white py-2 rounded"
      >
        Confirmar
      </button>

      {mensagem && <p>{mensagem}</p>}

      <Link href="/dashboard/assinatura">Voltar</Link>
    </main>
  );
}