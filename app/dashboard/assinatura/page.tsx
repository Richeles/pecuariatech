"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase-browser";

const supabase = createClient();

export default function AssinaturaPage() {
  const [loading, setLoading] =
    useState(true);

  const [dados, setDados] =
    useState<any>(null);

  async function carregar() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const res = await fetch(
        "/api/assinaturas/me",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const json = await res.json();

      setDados(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        Carregando assinatura...
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">
        Assinatura
      </h1>

      <pre className="mt-6 rounded-xl bg-zinc-100 p-4 text-sm">
        {JSON.stringify(dados, null, 2)}
      </pre>
    </div>
  );
}