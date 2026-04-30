"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/app/lib/supabase-browser";
import { getLangFromClient, t } from "@/app/lib/i18n";

const supabase = createClient();

type Periodo = "mensal" | "trimestral" | "anual";
type Lang = "pt" | "es";

export default function PlanosClient() {
  const [periodo, setPeriodo] = useState<Periodo>("mensal");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>("pt");

  const searchParams = useSearchParams();
  const bloqueado = searchParams.get("bloqueado") === "1";

  useEffect(() => {
    setLang(getLangFromClient());
  }, []);

  const preco = (v: number) =>
    `R$ ${v.toFixed(2).replace(".", ",")}`;

  const PLANOS = [
    {
      id: "basico",
      nome: "Básico",
      frase: "Controle essencial da fazenda",
      descricao: ["Gestão básica", "Controle inicial"],
      precos: { mensal: 31.75, trimestral: 79.38, anual: 317.5 },
    },
    {
      id: "profissional",
      nome: "Profissional",
      frase: "Gestão avançada com indicadores",
      descricao: ["Indicadores", "Relatórios"],
      precos: { mensal: 52.99, trimestral: 132.48, anual: 529.9 },
    },
    {
      id: "ultra",
      nome: "Ultra",
      frase: "IA + CFO + decisão estratégica",
      destaque: true,
      descricao: ["CFO", "IA", "Análise avançada"],
      precos: { mensal: 106.09, trimestral: 265.23, anual: 1060.9 },
    },
  ];

  async function iniciarCheckout(plano: string) {
    if (loading) return;

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 🔐 REGRA Z (não quebra UX)
      if (!user) {
        window.location.href = "/login?next=/planos";
        return;
      }

      const res = await fetch("/api/checkout/preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plano,
          periodo,
        }),
      });

      const data = await res.json();

      if (!data?.init_point) {
        console.error("Erro checkout:", data);
        alert("Erro ao iniciar pagamento");
        return;
      }

      window.location.href = data.init_point;

    } catch (err) {
      console.error("Erro:", err);
      alert("Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ALERTA BLOQUEIO */}
      {bloqueado && (
        <div className="mx-auto max-w-3xl bg-yellow-50 border border-yellow-400 p-4 text-center rounded mt-4">
          {t(lang, "bloqueado_msg")}
        </div>
      )}

      {/* TÍTULO */}
      <div className="text-center mt-6">
        <h1 className="text-3xl font-bold">
          {t(lang, "planos_titulo")}
        </h1>
        <p className="text-gray-600 mt-2">
          {t(lang, "planos_subtitulo")}
        </p>
      </div>

      {/* PERÍODO */}
      <div className="flex justify-center gap-2 mt-6">
        {(["mensal", "trimestral", "anual"] as Periodo[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded ${
              periodo === p ? "bg-green-600 text-white" : "border"
            }`}
          >
            {t(lang, p)}
          </button>
        ))}
      </div>

      {/* PLANOS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {PLANOS.map((plano) => (
          <div
            key={plano.id}
            className={`bg-white p-6 rounded-xl shadow ${
              plano.destaque ? "border-2 border-green-600" : ""
            }`}
          >
            <h2 className="text-xl font-bold">{plano.nome}</h2>
            <p className="text-sm italic">{plano.frase}</p>

            <p className="text-2xl text-green-600 mt-2">
              {preco(plano.precos[periodo])}
            </p>

            <ul className="text-sm mt-3 space-y-1">
              {plano.descricao.map((d) => (
                <li key={d}>✓ {d}</li>
              ))}
            </ul>

            <button
              onClick={() => iniciarCheckout(plano.id)}
              disabled={loading}
              className="w-full bg-green-600 text-white mt-4 py-2 rounded"
            >
              {loading ? t(lang, "processando") : t(lang, "assinar")}
            </button>
          </div>
        ))}
      </section>
    </>
  );
}