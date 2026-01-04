// CAMINHO: app/dashboard/assinatura/plano/page.tsx
// UI de Plano / Upgrade / Downgrade
// Next.js 16 + App Router
// Fonte única: /api/assinaturas/status (Equação Y)

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PLANOS = [
  { id: "basico", nome: "Básico" },
  { id: "profissional", nome: "Profissional" },
  { id: "ultra", nome: "Ultra" },
  { id: "empresarial", nome: "Empresarial" },
  { id: "premium_dominus", nome: "Premium Dominus 360°" },
];

type StatusAssinatura = {
  plano: string | null;
  ativo: boolean;
};

export default function PlanoAssinaturaPage() {
  const [status, setStatus] =
    useState<StatusAssinatura | null>(null);
  const [selecionado, setSelecionado] =
    useState<string>("");
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] =
    useState<string | null>(null);

  // ===============================
  // CARREGAR STATUS REAL
  // ===============================
  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(
          "/api/assinaturas/status",
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Erro ao consultar status");
        }

        const data = await res.json();
        setStatus(data);

        if (data?.plano) {
          setSelecionado(data.plano);
        }
      } catch {
        setMensagem(
          "Não foi possível carregar sua assinatura."
        );
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  // ===============================
  // CONFIRMAR ALTERAÇÃO (FUTURO)
  // ===============================
  async function confirmar() {
    if (!selecionado) return;

    setMensagem(
      "Alteração de plano será habilitada em breve."
    );
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
        <h1 className="text-2xl font-bold">
          Nenhuma assinatura ativa
        </h1>

        <p>
          Você ainda não possui um plano ativo no
          PecuariaTech.
        </p>

        <Link
          href="/planos"
          className="inline-block rounded bg-green-600 px-4 py-2 text-white"
        >
          Ver planos disponíveis
        </Link>
      </main>
    );
  }

  // ===============================
  // TELA COM ASSINATURA ATIVA
  // ===============================
  return (
    <main className="p-6 max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">
        Gerenciar Plano
      </h1>

      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <p>
          <strong>Plano atual:</strong>{" "}
          {status.plano}
        </p>
        <p>
          <strong>Status:</strong> Ativo
        </p>
      </div>

      <div className="space-y-2">
        <label className="block font-medium">
          Escolha o novo plano
        </label>

        <select
          value={selecionado}
          onChange={(e) =>
            setSelecionado(e.target.value)
          }
          className="w-full border rounded px-3 py-2"
        >
          {PLANOS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={confirmar}
        className="w-full bg-green-600 text-white py-2 rounded hover:opacity-90"
      >
        Confirmar alteração
      </button>

      {mensagem && (
        <p className="text-sm text-center text-gray-700">
          {mensagem}
        </p>
      )}

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
