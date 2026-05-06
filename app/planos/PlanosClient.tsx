"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getLangFromClient,
  setLangClient,
  t,
  type Lang,
} from "@/app/lib/i18n";

// 🔥 NOVO (SUPABASE REAL)
import { createClient } from "@/app/lib/supabase-browser";

type Periodo = "mensal" | "trimestral" | "anual";

export default function PlanosClient() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("pt");
  const [periodo, setPeriodo] = useState<Periodo>("mensal");
  const [loadingPlano, setLoadingPlano] = useState<string | null>(null);

  // =========================
  // INIT LANG
  // =========================
  useEffect(() => {
    const l = getLangFromClient();
    setLang(l);
  }, []);

  // =========================
  // TROCAR IDIOMA (FIX BUG)
  // =========================
  function handleLangChange(newLang: Lang) {
    setLangClient(newLang);
    setLang(newLang);

    // 🔥 CORREÇÃO: evita undefined
    window.location.href = `/${newLang}/planos`;
  }

  // =========================
  // CALCULO PREÇO
  // =========================
  function calcularPreco(valorMensal: number, periodo: Periodo) {
    if (periodo === "mensal") return valorMensal;
    if (periodo === "trimestral") return valorMensal * 3 * 0.95;
    if (periodo === "anual") return valorMensal * 12 * 0.8;
    return valorMensal;
  }

  // =========================
  // PLANOS (FONTE ÚNICA)
  // =========================
  const planos = [
    {
      id: "basico",
      nome: "Básico",
      descricao:
        "Para quem quer sair do caderno, organizar a fazenda e ter clareza do dia a dia.",
      mensal: 149.9,
      features: [
        "Dashboard simples e intuitivo",
        "Controle básico de rebanho",
        "Controle essencial de pastagem",
        "Relatório mensal automático",
        "Indicadores operacionais iniciais",
        "Base sólida para começar a gestão digital",
      ],
    },
    {
      id: "profissional",
      nome: "Profissional",
      descricao:
        "Para o produtor que já se organiza, mas precisa entender melhor os números.",
      mensal: 247.9,
      features: [
        "Tudo do plano Básico",
        "Relatórios mensais avançados",
        "Exportação de dados (Excel)",
        "Indicadores financeiros iniciais",
        "Planilhas profissionais automatizadas",
        "Alertas operacionais inteligentes",
      ],
    },
    {
      id: "ultra",
      nome: "Ultra",
      destaque: true,
      descricao:
        "Para quem quer parar de reagir e começar a decidir com apoio de IA.",
      mensal: 452.9,
      features: [
        "Tudo do plano Profissional",
        "Relatórios premium automatizados",
        "Análises financeiras avançadas",
        "Diagnóstico mensal por IA",
        "Alertas de decisão",
        "Plano mais escolhido por produtores",
      ],
    },
    {
      id: "empresarial",
      nome: "Empresarial",
      descricao:
        "Para operações maiores que exigem controle, padrão e escala.",
      mensal: 627.9,
      features: [
        "Tudo do plano Ultra",
        "Multi-fazendas e multi-usuários",
        "Gestão de equipes",
        "Relatórios personalizados",
        "Alertas automáticos avançados",
      ],
    },
    {
      id: "premium_dominus",
      nome: "Premium Dominus 360°",
      descricao:
        "Para quem pensa como dono ou investidor e precisa enxergar a fazenda como empresa.",
      mensal: 789.9,
      features: [
        "Tudo do plano Empresarial",
        "CFO Autônomo integrado",
        "IA preditiva e diagnóstica",
        "EBITDA e EBIT automáticos",
        "Valuation e simulações financeiras",
        "Suporte Ultra VIP",
      ],
    },
  ];

  // =========================
  // CHECKOUT REAL (FIX)
  // =========================
  async function handleCheckout(planoId: string) {
    try {
      setLoadingPlano(planoId);

      const supabase = createClient();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        alert("Sessão inválida. Faça login.");
        window.location.href = "/login";
        return;
      }

      const res = await fetch("/api/checkout/preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plano: planoId,
          periodo,
          user_id: user.id,
          email: user.email,
        }),
      });

      const data = await res.json();

      if (!data?.init_point) {
        throw new Error("Checkout inválido");
      }

      window.location.href = data.init_point;

    } catch (err) {
      console.error("CHECKOUT ERROR:", err);
      alert("Erro ao iniciar checkout");
    } finally {
      setLoadingPlano(null);
    }
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="mt-10 px-4">

      {/* IDIOMA */}
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={() => handleLangChange("pt")}>BR Português</button>
        <button onClick={() => handleLangChange("es")}>ES Español</button>
        <button onClick={() => handleLangChange("en")}>EN English</button>
      </div>

      {/* HEADER */}
      <h2 className="text-3xl font-bold text-center">
        {t(lang, "planos_titulo")}
      </h2>

      <p className="text-center text-gray-600 mt-2">
        {t(lang, "planos_subtitulo")}
      </p>

      {/* TOGGLE */}
      <div className="flex justify-center gap-2 mt-6">
        {(["mensal", "trimestral", "anual"] as Periodo[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded ${
              periodo === p
                ? "bg-green-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {t(lang, p)}
          </button>
        ))}
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-10">
        {planos.map((plano) => {
          const preco = calcularPreco(plano.mensal, periodo);

          return (
            <div
              key={plano.id}
              className={`rounded-xl border p-6 shadow ${
                plano.destaque
                  ? "border-green-600 scale-105"
                  : ""
              }`}
            >
              <h3 className="text-xl font-semibold">
                {plano.nome}
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                {plano.descricao}
              </p>

              <p className="text-3xl font-bold text-green-600 mt-4">
                R$ {preco.toFixed(2)}
              </p>

              <ul className="mt-4 space-y-2 text-sm">
                {plano.features.map((f, i) => (
                  <li key={i}>✓ {f}</li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plano.id)}
                disabled={loadingPlano === plano.id}
                className="mt-6 w-full bg-green-600 text-white py-2 rounded"
              >
                {loadingPlano === plano.id
                  ? t(lang, "processando")
                  : t(lang, "assinar")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}