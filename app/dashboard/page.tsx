"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Paywall from "../components/Paywall";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function DashboardPage() {
  // ---------------------------------------------
  // 🔐 CONTROLE DE ASSINATURA
  // ---------------------------------------------
  const [nivel, setNivel] = useState(null);

  useEffect(() => {
    async function verificarPlano() {
      const token = localStorage.getItem("sb-access-token");

      const resp = await fetch("/api/assinatura", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await resp.json();
      setNivel(json.nivel);
    }

    verificarPlano();
  }, []);

  if (!nivel) return <div>Carregando dashboard...</div>;

  // ---------------------------------------------
  // 🔒 BLOQUEAR DASHBOARD PARA USUÁRIOS SEM PLANO
  // ---------------------------------------------
  if (nivel === "trial_expirado") return <Paywall />;

  // ---------------------------------------------
  // 🔓 CONTROLE VISUAL POR PLANO
  // ---------------------------------------------
  const permitirUltra = ["ultra", "empresarial", "premium"].includes(nivel);
  const permitirEmpresarial = ["empresarial", "premium"].includes(nivel);
  const permitirPremium = nivel === "premium";

  // ---------------------------------------------
  // 🔓 A PARTIR DAQUI → LIBERAR O DASHBOARD
  // ---------------------------------------------

  // FILTROS
  const [filtroRaca, setFiltroRaca] = useState("Todos");
  const [filtroSexo, setFiltroSexo] = useState("Todos");
  const [filtroMeses, setFiltroMeses] = useState(12);

  // KPIs
  const [totalAnimais, setTotalAnimais] = useState(0);
  const [pesoMedio, setPesoMedio] = useState(0);
  const [ganhoDiario, setGanhoDiario] = useState(0);
  const [custosMes, setCustosMes] = useState(0);

  // UltraBiológica
  const [avisos, setAvisos] = useState([]);
  const [score, setScore] = useState(100);
  const [sugestao, setSugestao] = useState("");

  // Gráficos
  const [dadosPeso, setDadosPeso] = useState([]);
  const [dadosFinanceiro, setDadosFinanceiro] = useState([]);

  // Financeiro Ultra
  const [financeiroUltra, setFinanceiroUltra] = useState(null);

  // Buscar dados conforme filtros
  useEffect(() => {
    async function carregarDados() {
      // ----------- ANIMAIS FILTRADOS -----------
      let query = supabase.from("animais").select("*");

      if (filtroRaca !== "Todos") query = query.eq("raca", filtroRaca);
      if (filtroSexo !== "Todos") query = query.eq("sexo", filtroSexo);

      query = query.gte(
        "criado_at",
        new Date(Date.now() - filtroMeses * 30 * 24 * 60 * 60 * 1000).toISOString()
      );

      const { data: animais } = await query;

      if (animais && animais.length > 0) {
        setTotalAnimais(animais.length);

        setPesoMedio(
          Math.round(animais.reduce((s, a) => s + Number(a.peso), 0) / animais.length)
        );

        setGanhoDiario(
          Math.round(
            animais.reduce((s, a) => s + Number(a.ganho_diario), 0) / animais.length
          )
        );
      } else {
        setTotalAnimais(0);
        setPesoMedio(0);
        setGanhoDiario(0);
      }

      // ----------- FINANCEIRO -----------
      const { data: financeiro } = await supabase.from("financeiro").select("*");

      if (financeiro) {
        setDadosFinanceiro(financeiro);
        setCustosMes(financeiro.reduce((s, f) => s + Number(f.valor), 0));
      }

      // ----------- EVOLUÇÃO DO PESO (RPC) -----------
      const { data: pesoMensal } = await supabase.rpc("peso_evolucao_mensal", {
        meses: filtroMeses,
      });

      if (pesoMensal) setDadosPeso(pesoMensal);

      // ----------- ULTRABIOLÓGICA BÁSICA -----------
      const avisosTemp = [];
      let scoreTemp = 100;

      if (ganhoDiario < 900) {
        avisosTemp.push("Ganho diário abaixo do recomendado.");
        scoreTemp -= 10;
      }
      if (pesoMedio < 400) {
        avisosTemp.push("Peso médio abaixo do ideal.");
        scoreTemp -= 10;
      }
      if (custosMes > 3500) {
        avisosTemp.push("Custos acima da média.");
        scoreTemp -= 5;
      }

      setAvisos(avisosTemp);
      setScore(scoreTemp);
      setSugestao(
        scoreTemp < 80
          ? "Aumentar suplementação e revisar manejo."
          : "A fazenda está dentro do padrão ideal."
      );
    }

    carregarDados();
  }, [filtroRaca, filtroSexo, filtroMeses]);

  // ---------------------------------------------------------------------
  // 🔥 ULTRA FINANCEIRO — SOMENTE PARA PREMIUM
  // ---------------------------------------------------------------------
  async function calcularValuation() {
    if (!permitirPremium) {
      alert("Recurso exclusivo do plano Premium.");
      return;
    }

    const receita = totalAnimais * 3000;
    const opex = custosMes;
    const capex = 10000;
    const manutencao = 5000;
    const restauracao = 3000;

    const { data } = await supabase.rpc("calcular_financas", {
      receita,
      opex,
      capex,
      manutencao,
      restauracao,
    });

    if (data) setFinanceiroUltra(data[0]);
  }

  return (
    <div className="min-h-screen px-6 py-6">

      {/* ===================== FILTROS ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-white p-4 rounded-2xl shadow">

        <div>
          <label className="font-bold text-green-700">Filtrar por Raça:</label>
          <select
            className="w-full border rounded p-2"
            value={filtroRaca}
            onChange={(e) => setFiltroRaca(e.target.value)}
          >
            <option>Todos</option>
            <option>Nelore</option>
            <option>Angus</option>
            <option>Brahman</option>
            <option>Brangus</option>
            <option>Girolando</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-green-700">Filtrar por Sexo:</label>
          <select
            className="w-full border rounded p-2"
            value={filtroSexo}
            onChange={(e) => setFiltroSexo(e.target.value)}
          >
            <option>Todos</option>
            <option>Macho</option>
            <option>Fêmea</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-green-700">Período (meses):</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            min={1}
            max={36}
            value={filtroMeses}
            onChange={(e) => setFiltroMeses(Number(e.target.value))}
          />
        </div>

      </div>

      {/* ===================== KPIs ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-white shadow rounded-3xl p-6 border border-green-200">
          <h2 className="text-xl font-bold text-green-600">Total de Animais</h2>
          <p className="text-3xl font-bold">{totalAnimais}</p>
        </div>

        <div className="bg-white shadow rounded-3xl p-6 border border-green-200">
          <h2 className="text-xl font-bold text-green-600">Peso Médio</h2>
          <p className="text-3xl font-bold">{pesoMedio} kg</p>
        </div>

        <div className="bg-white shadow rounded-3xl p-6 border border-green-200">
          <h2 className="text-xl font-bold text-green-600">Ganho Diário</h2>
          <p className="text-3xl font-bold">{ganhoDiario} g/dia</p>
        </div>

        <div className="bg-white shadow rounded-3xl p-6 border border-green-200">
          <h2 className="text-xl font-bold text-green-600">Custos do Mês</h2>
          <p className="text-3xl font-bold">R$ {custosMes.toLocaleString("pt-BR")}</p>
        </div>

      </div>

      {/* ===================== PREMIUM — VALUATION ===================== */}
      {permitirPremium && (
        <div className="bg-white shadow rounded-3xl p-6 border border-yellow-400 mb-10">

          <h2 className="text-2xl font-bold text-yellow-700 mb-2">
            UltraBiológica 360° — Valuation Premium
          </h2>

          <button
            onClick={calcularValuation}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg mb-4"
          >
            Calcular Valuation
          </button>

          {financeiroUltra && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">

              <div className="bg-yellow-100 p-4 rounded-xl shadow">
                <p className="font-bold text-yellow-700">EBITDA</p>
                <p className="text-xl font-bold">R$ {financeiroUltra.ebitda}</p>
              </div>

              <div className="bg-yellow-100 p-4 rounded-xl shadow">
                <p className="font-bold text-yellow-700">EBIT</p>
                <p className="text-xl font-bold">R$ {financeiroUltra.ebit}</p>
              </div>

              <div className="bg-yellow-100 p-4 rounded-xl shadow">
                <p className="font-bold text-yellow-700">Valuation Mercado</p>
                <p className="text-xl font-bold">R$ {financeiroUltra.avaliacao_mercado}</p>
              </div>

              <div className="bg-yellow-100 p-4 rounded-xl shadow">
                <p className="font-bold text-yellow-700">Holding Agro</p>
                <p className="text-xl font-bold">R$ {financeiroUltra.avaliacao_participacao}</p>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ===================== ULTRABIOLÓGICA ===================== */}
      {permitirUltra ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          {/* Avisos */}
          <div className="bg-yellow-50 border-l-8 border-yellow-500 p-5 rounded-3xl shadow">
            <h2 className="text-xl font-bold text-yellow-700">⚠ Avisos Inteligentes</h2>
            <ul className="mt-2 space-y-1 text-gray-700">
              {avisos.map((a, i) => (
                <li key={i}>• {a}</li>
              ))}
            </ul>
          </div>

          {/* Score */}
          <div className="bg-green-50 border-l-8 border-green-600 p-5 rounded-3xl shadow">
            <h2 className="text-xl font-bold text-green-700">🧬 Score UltraBiológico</h2>
            <p className="text-5xl font-extrabold text-green-900">{score}</p>
            <p className="text-gray-600 mt-2">Saúde geral da fazenda</p>
          </div>

          {/* Sugestão */}
          <div className="bg-blue-50 border-l-8 border-blue-600 p-5 rounded-3xl shadow">
            <h2 className="text-xl font-bold text-blue-700">💡 Sugestão Automática</h2>
            <p className="text-gray-800 mt-2">{sugestao}</p>
          </div>

        </div>
      ) : (
        <div className="bg-gray-100 p-5 rounded-3xl border-2 border-gray-300 opacity-60 mb-12">
          <h2 className="text-xl font-bold text-gray-600">🔒 UltraBiológica</h2>
          <p>Disponível a partir do plano Ultra.</p>
        </div>
      )}

      {/* ===================== GRÁFICOS ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Evolução do Peso */}
        <div className="bg-white shadow rounded-3xl p-6 border border-green-200 h-80">
          <h3 className="text-xl font-bold text-green-700 mb-3">Evolução do Peso Médio</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosPeso}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="peso" stroke="#2f7a43" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Financeiro */}
        <div className="bg-white shadow rounded-3xl p-6 border border-green-200 h-80">
          <h3 className="text-xl font-bold text-green-700 mb-3">Financeiro Mensal</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosFinanceiro}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valor" fill="#2f7a43" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
}
