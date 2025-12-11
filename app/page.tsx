"use client";

import Link from "next/link";
import { FaChartLine, FaMoneyBillWave, FaMapMarkedAlt } from "react-icons/fa";
import { GiCow } from "react-icons/gi";
import { MdBiotech } from "react-icons/md";

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center text-center px-4 pt-28">

      {/* FUNDO SOMENTE PARA A HOME */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bois-header.png')" }}
      />

      {/* TÍTULO */}
      <h1 className="text-4xl font-bold text-green-900 drop-shadow mb-2">
        Bem-vindo ao PecuariaTech
      </h1>

      {/* SUBTÍTULO */}
      <p className="text-lg font-semibold px-6 py-2 rounded-3xl bg-white/70 text-green-900 shadow mb-10">
        Gestão inteligente e moderna para sua fazenda 🐂🧠
      </p>

      {/* CARDS DO MENU */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">

        {/* DASHBOARD */}
        <Link
          href="/dashboard"
          className="bg-white/95 shadow-xl p-6 rounded-3xl border border-green-200 hover:shadow-2xl transition-all"
        >
          <FaChartLine className="text-green-700 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-bold text-green-700">Dashboard</h2>
          <p className="text-gray-700 mt-2">Indicadores em tempo real</p>
        </Link>

        {/* FINANCEIRO */}
        <Link
          href="/financeiro"
          className="bg-white/95 shadow-xl p-6 rounded-3xl border border-green-200 hover:shadow-2xl transition-all"
        >
          <FaMoneyBillWave className="text-green-700 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-bold text-green-700">Financeiro</h2>
          <p className="text-gray-700 mt-2">Controle total dos custos e lucros</p>
        </Link>

        {/* REBANHO */}
        <Link
          href="/rebanho"
          className="bg-white/95 shadow-xl p-6 rounded-3xl border border-green-200 hover:shadow-2xl transition-all"
        >
          <GiCow className="text-green-700 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-bold text-green-700">Rebanho</h2>
          <p className="text-gray-700 mt-2">Gestão completa do gado</p>
        </Link>

        {/* PASTAGEM */}
        <Link
          href="/pastagem"
          className="bg-white/95 shadow-xl p-6 rounded-3xl border border-green-200 hover:shadow-2xl transition-all"
        >
          <FaMapMarkedAlt className="text-green-700 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-bold text-green-700">Pastagem</h2>
          <p className="text-gray-700 mt-2">Manejo e lotação de áreas</p>
        </Link>

        {/* ULTRABIOLÓGICA */}
        <Link
          href="/ultrabiologica/status"
          className="bg-white/95 shadow-xl p-6 rounded-3xl border border-green-200 hover:shadow-2xl transition-all"
        >
          <MdBiotech className="text-green-700 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-bold text-green-700">UltraBiológica</h2>
          <p className="text-gray-700 mt-2">Diagnóstico avançado</p>
        </Link>

      </div>

    </main>
  );
}
