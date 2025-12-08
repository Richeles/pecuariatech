"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold text-green-700">
        🐂 Bem-vindo ao PecuariaTech
      </h1>

      <p className="text-lg text-gray-700">
        Gestão inteligente para sua fazenda!
      </p>

      <nav className="flex flex-col gap-3 mt-6">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          📊 Acessar Dashboard
        </Link>

        <Link href="/financeiro" className="text-blue-600 hover:underline">
          💰 Acessar Financeiro
        </Link>

        <Link href="/rebanho" className="text-blue-600 hover:underline">
          🐄 Acessar Rebanho
        </Link>

        <Link href="/pastagem" className="text-blue-600 hover:underline">
          🌱 Acessar Pastagem
        </Link>

        <Link href="/ultrabiologica/status" className="text-blue-600 hover:underline">
          🔬 UltraBiológica Status
        </Link>
      </nav>
    </main>
  );
}






