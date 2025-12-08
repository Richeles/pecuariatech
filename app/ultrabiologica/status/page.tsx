"use client";

export default function Status() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-700">Painel UltraBiológica • Status</h1>

      <p className="text-gray-600">Monitoramento de sistema, rotas e integrações.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 bg-white shadow rounded-xl">
          <h3 className="font-semibold text-green-700">API Supabase</h3>
          <p>Carregando...</p>
        </div>

        <div className="p-4 bg-white shadow rounded-xl">
          <h3 className="font-semibold text-green-700">Deploy</h3>
          <p>OK ✔</p>
        </div>

        <div className="p-4 bg-white shadow rounded-xl">
          <h3 className="font-semibold text-green-700">Integrações</h3>
          <p>Carregando...</p>
        </div>
      </div>
    </div>
  );
}
