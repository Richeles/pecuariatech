import { getFarmKPIs } from "../lib/kpis";

export default async function Dashboard() {
  const stats = await getFarmKPIs();

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">📊 PecuariaTech Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-green-700 text-white p-6 rounded-xl shadow">
          <h2 className="text-lg">🐂 Animais</h2>
          <p className="text-4xl font-bold">{stats.animais}</p>
        </div>

        <div className="bg-blue-600 text-white p-6 rounded-xl shadow">
          <h2 className="text-lg">🌾 Pastos</h2>
          <p className="text-4xl font-bold">{stats.pastos}</p>
        </div>

        <div className="bg-yellow-600 text-gray-900 p-6 rounded-xl shadow">
          <h2 className="text-lg">💰 Gastos Totais</h2>
          <p className="text-4xl font-bold">R$ {stats.gastos}</p>
        </div>
      </div>
    </main>
  );
}
