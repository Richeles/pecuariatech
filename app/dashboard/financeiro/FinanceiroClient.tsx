"use client";

export default function FinanceiroClient() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="font-medium">Receita</h2>
        <p className="text-2xl font-bold">—</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="font-medium">Custos</h2>
        <p className="text-2xl font-bold">—</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="font-medium">Resultado</h2>
        <p className="text-2xl font-bold">—</p>
      </div>
    </div>
  );
}
