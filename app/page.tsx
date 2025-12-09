"use client";

import { FaChartLine, FaMoneyBillWave, FaMapMarkedAlt } from "react-icons/fa";
import { GiCow } from "react-icons/gi";
import { MdBiotech } from "react-icons/md";
import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center text-center px-4"
      style={{
        backgroundImage: "url('/bois-header.png')",
        marginTop: "-70px", // Ajuste para remover a faixa entre navbar e imagem
      }}
    >
      {/* TÍTULO */}
      <h1 className="text-4xl font-bold text-green-900 drop-shadow mt-32 mb-2">
        Bem-vindo ao PecuariaTech
      </h1>

      {/* SUBTÍTULO CORRIGIDO (com contraste melhorado) */}
      <p className="text-lg font-semibold px-4 py-1 rounded-full bg-white/60 text-green-900 shadow-md inline-block mb-10">
        Gestão inteligente e moderna para sua fazenda 🐂🧠
      </p>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">

        {/* Dashboard */}
        <Link
          href="/dashboard"
          className="bg-white/90 shadow-lg p-6 rounded-2xl border border-green-200 hover:shadow-2xl hover:bg-white transition-all"
        >
          <FaChartLine className="text-green-700 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-bold text-green-700">Dashboard</h2>
          <p className="text-gray-700 mt-2">Indicadores da fazenda em tempo real</p>
        </Link>

        {/* Financeiro */}
        <Link
          href="/financeiro"
          className="bg-white/90 shadow-lg p-6 rounded-2xl border border-green-200 hover:shadow-2xl hover:bg-white transition-all"
        >
          <FaMoneyBillWave className="text-green-700 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-bold text-green-700">Financeiro</h2>
          <p className="text-gray-700 mt-2">Controle total dos custos e lucros</p>
        </Link>

        {/* Rebanho */}
        <Link
          href="/rebanho"
          className="bg-white/90 shadow-lg p-6 rounded-2xl border border-green-200 hover:shadow-2xl hover:bg-white transition-all"
        >
          <GiCow className="text-green-700 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-bold text-green-700">Rebanho</h2>
          <p className="text-gray-700 mt-2">Cadastro completo e gestão do gado</p>
        </Link>

        {/* Pastagem */}
        <Link
          href="/pastagem"
          className="bg-white/90 shadow-lg p-6 rounded-2xl border border-green-200 hover:shadow-2xl hover:bg-white transition-all"
        >
          <FaMapMarkedAlt className="text-green-700 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-bold text-green-700">Pastagem</h2>
          <p className="text-gray-700 mt-2">Acompanhe áreas, lotação e manejo</p>
        </Link>

        {/* UltraBiológica */}
        <Link
          href="/ultrabiologica/status"
          className="bg-white/90 shadow-lg p-6 rounded-2xl border border-green-200 hover:shadow-2xl hover:bg-white transition-all"
        >
          <MdBiotech className="text-green-700 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-bold text-green-700">UltraBiológica</h2>
          <p className="text-gray-700 mt-2">Diagnóstico avançado da fazenda</p>
        </Link>

      </div>

      <div className="h-20" />
    </main>
  );
}
