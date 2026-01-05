// CAMINHO: app/dashboard/assinatura/page.tsx
// Painel de Assinatura do Usuário
// Next.js 16 + App Router

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase-browser";

type Assinatura = {
  possui_assinatura: boolean;
  plano?: string;
  periodo?: string;
  status?: string;
  origem?: string;
  inicio?: string;
  fim?: string;
};

export default function AssinaturaPage() {
  const [dados, setDados] = useState<Assinatura | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/assinaturas/me", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const json = await res.json();
      setDados(json);
      setLoading(false);
    }

    carregar();
  }, []);

  if (loading) {
    return <p className="p-6">Carregando assinatura...</p>;
  }

  if (!dados?.possui_assinatura) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">
          Nenhuma assinatura ativa
        </h1>
        <p className="text-gray-600 mt-2">
          Escolha um plano para desbloquear os recursos.
        </p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">
        Minha Assinatura
      </h1>

      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <p>
          <strong>Plano:</strong>{" "}
          {dados.plano}
        </p>
        <p>
          <strong>Período:</strong>{" "}
          {dados.periodo}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          {dados.status}
        </p>
        <p>
          <strong>Origem:</strong>{" "}
          {dados.origem}
        </p>
        <p>
          <strong>Início:</strong>{" "}
          {new Date(dados.inicio!).toLocaleDateString()}
        </p>
        <p>
          <strong>Vencimento:</strong>{" "}
          {new Date(dados.fim!).toLocaleDateString()}
        </p>
      </div>
    </main>
  );
}
