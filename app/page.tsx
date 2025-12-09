"use client";

export default function HomePage() {
  return (
    <main className="relative flex flex-col items-center text-center">

      {/* 🔥 IMAGEM DE FUNDO NORMAL — SEM INVADIR O HEADER */}
      <div className="w-full h-[480px] overflow-hidden">
        <img
          src="/bois-header.png"
          alt="PecuariaTech Header"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 🔥 TÍTULO E SUBTÍTULO — COM FUNDO PARA DESTACAR */}
      <div className="mt-[-140px] mb-8">
        <h1 className="text-3xl font-bold text-green-900 drop-shadow-lg">
          Bem-vindo ao PecuariaTech
        </h1>

        <p className="mt-2 bg-white/60 px-4 py-1 rounded-lg text-sm font-medium text-green-900 shadow">
          Gestão inteligente e moderna para sua fazenda 🐂🧠
        </p>
      </div>

      {/* 🔥 CAIXAS DE FUNÇÕES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl p-4">

        {/* Dashboard */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-100">
          <h2 className="text-lg font-semibold text-green-800">Dashboard</h2>
          <p className="text-gray-700 text-sm mt-2">
            Indicadores da fazenda em tempo real
          </p>
        </div>

        {/* Financeiro */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-100">
          <h2 className="text-lg font-semibold text-green-800">Financeiro</h2>
          <p className="text-gray-700 text-sm mt-2">
            Controle total dos custos e lucros
          </p>
        </div>

        {/* Rebanho */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-100">
          <h2 className="text-lg font-semibold text-green-800">Rebanho</h2>
          <p className="text-gray-700 text-sm mt-2">
            Cadastro completo e gestão do gado
          </p>
        </div>

        {/* Pastagem */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-100">
          <h2 className="text-lg font-semibold text-green-800">Pastagem</h2>
          <p className="text-gray-700 text-sm mt-2">
            Acompanhe áreas, lotação e manejo
          </p>
        </div>

        {/* UltraBiológica */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-100 md:col-span-3">
          <h2 className="text-lg font-semibold text-green-800">UltraBiológica</h2>
          <p className="text-gray-700 text-sm mt-2">
            Diagnóstico avançado da fazenda
          </p>
        </div>
      </div>
    </main>
  );
}
