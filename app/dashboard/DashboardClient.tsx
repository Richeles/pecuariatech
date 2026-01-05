"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase-browser";

// ===============================
// TIPOS
// ===============================
type IndicadoresFinanceiros = {
  receita_total: number;
  custo_total: number;
  resultado: number;
  margem_percentual: number;
};

// ===============================
// COMPONENTE
// ===============================
export default function DashboardClient() {
  const [indicadores, setIndicadores] =
    useState<IndicadoresFinanceiros | null>(null);
  const [erroFinanceiro, setErroFinanceiro] = useState(false);
  const [loading, setLoading] = useState(true);

  // ===============================
  // CARREGAR FINANCEIRO (TOKEN OK)
  // ===============================
  useEffect(() => {
    async function carregarFinanceiro() {
      try {
        const { data: sessionData } =
          await supabase.auth.getSession();

        const token =
          sessionData.session?.access_token;

        if (!token) {
          throw new Error("Sessão não encontrada");
        }

        const res = await fetch(
          "/api/financeiro/indicadores-avancados",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Erro ao buscar financeiro");
        }

        const data = await res.json();
        setIndicadores(data);
      } catch (err) {
        console.error(err);
        setErroFinanceiro(true);
      } finally {
        setLoading(false);
      }
    }

    carregarFinanceiro();
  }, []);

  // ===============================
  // UI
  // ===============================
  return (
    <div className="space-y-6">
      {/* =============================== */}
      {/* DASHBOARD FINANCEIRO */}
      {/* =============================== */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">
            Receita Total
          </p>
          <p className="text-2xl font-bold text-green-600">
            {indicadores
              ? `R$ ${indicadores.receita_total.toFixed(
                  2
                )}`
              : "--"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">
            Custos Totais
          </p>
          <p className="text-2xl font-bold text-red-600">
            {indicadores
              ? `R$ ${indicadores.custo_total.toFixed(
                  2
                )}`
              : "--"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">
            Resultado
          </p>
          <p className="text-2xl font-bold">
            {indicadores
              ? `R$ ${indicadores.resultado.toFixed(
                  2
                )}`
              : "--"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">
            Margem
          </p>
          <p className="text-2xl font-bold">
            {indicadores
              ? `${indicadores.margem_percentual.toFixed(
                  1
                )}%`
              : "--"}
          </p>
        </div>
      </section>

      {/* =============================== */}
      {/* ERRO FINANCEIRO (SEM QUEBRAR UI) */}
      {/* =============================== */}
      {erroFinanceiro && (
        <p className="text-sm text-red-600">
          Não foi possível carregar os dados financeiros.
        </p>
      )}

      {/* =============================== */}
      {/* PLANOS PECUARIATECH (INFORMATIVO) */}
      {/* =============================== */}
      <section className="mt-12 rounded-xl border bg-white p-6">
        <h2 className="text-xl font-semibold mb-2">
          Qual plano faz sentido para sua realidade?
        </h2>

        <p className="text-sm text-gray-600 mb-6">
          Cada plano foi pensado para um estágio diferente da
          operação rural.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">Básico</h3>
            <p className="text-sm italic text-gray-700">
              Para quem quer sair do caderno e organizar a
              fazenda.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Dashboard simples</li>
              <li>✓ Controle básico de rebanho</li>
              <li>✓ Pastagem essencial</li>
              <li>✓ Relatório mensal</li>
            </ul>
            <p className="font-bold text-green-600">
              a partir de R$ 31,75/mês
            </p>
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">
              Profissional
            </h3>
            <p className="text-sm italic text-gray-700">
              Para quem precisa entender melhor os números.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Tudo do Básico</li>
              <li>✓ Relatórios financeiros</li>
              <li>✓ Indicadores</li>
            </ul>
            <p className="font-bold text-green-600">
              a partir de R$ 52,99/mês
            </p>
          </div>

          <div className="border rounded-lg p-4 space-y-2 border-yellow-400">
            <h3 className="font-semibold">Ultra</h3>
            <p className="text-sm italic text-gray-700">
              Para quem quer decidir com inteligência.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Análises avançadas</li>
              <li>✓ Alertas de decisão</li>
              <li>✓ IA aplicada</li>
            </ul>
            <p className="font-bold text-green-600">
              a partir de R$ 106,09/mês
            </p>
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">
              Empresarial
            </h3>
            <p className="text-sm italic text-gray-700">
              Para operações maiores e equipes.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Multi-fazendas</li>
              <li>✓ Gestão de equipes</li>
              <li>✓ Relatórios customizados</li>
            </ul>
            <p className="font-bold text-green-600">
              a partir de R$ 159,19/mês
            </p>
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">
              Premium Dominus 360°
            </h3>
            <p className="text-sm italic text-gray-700">
              Para quem pensa como dono e investidor.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ CFO Autônomo</li>
              <li>✓ EBITDA e valuation</li>
              <li>✓ IA completa</li>
            </ul>
            <p className="font-bold text-green-600">
              a partir de R$ 318,49/mês
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/planos"
            className="inline-block rounded bg-green-600 px-6 py-2 text-white hover:opacity-90"
          >
            Ver detalhes dos planos
          </a>
        </div>
      </section>
    </div>
  );
}
