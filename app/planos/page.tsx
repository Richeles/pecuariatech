"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Periodo = "mensal" | "trimestral" | "anual";

interface Plano {
  codigo: string;
  nome_exibicao: string;
  nivel_ordem: number;
  mensal: number;
  trimestral: number;
  anual: number;
}

export default function PlanosPage() {
  const [periodo, setPeriodo] = useState<Periodo>("mensal");
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarPlanos() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Variáveis do Supabase não configuradas");
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await supabase
          .from("planos_precos_view")
          .select("*")
          .order("nivel_ordem", { ascending: true });

        if (error) throw error;

        setPlanos(data as Plano[]);
      } catch (err: any) {
        console.error("Erro ao carregar planos:", err);
        setErro("Não foi possível carregar os planos no momento.");
      } finally {
        setLoading(false);
      }
    }

    carregarPlanos();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-white text-lg">
        Carregando planos...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-10 text-red-300">
        {erro}
      </div>
    );
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">
        Planos PecuariaTech
      </h1>

      {/* CONTROLE DE PERÍODO */}
      <div className="flex gap-3 mb-8">
        {(["mensal", "trimestral", "anual"] as Periodo[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded ${
              periodo === p
                ? "bg-green-600"
                : "bg-white text-black"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-5 gap-6">
        {planos.map(plano => (
          <div
            key={plano.codigo}
            className="bg-white text-black rounded-xl p-6 shadow"
          >
            <h2 className="text-xl font-bold mb-2">
              {plano.nome_exibicao}
            </h2>

            <p className="text-3xl font-bold text-green-700 mb-4">
              R$ {plano[periodo].toFixed(2)}
            </p>

            <button className="w-full bg-green-600 text-white py-2 rounded">
              Assinar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
