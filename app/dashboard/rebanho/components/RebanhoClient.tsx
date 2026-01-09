"use client";

// KPIs estratégicos do Rebanho

export default function RebanhoClient() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Kpi titulo="Animais Ativos" valor="—" descricao="Em produção" />
      <Kpi titulo="Rastreáveis" valor="—" descricao="Com origem registrada" />
      <Kpi titulo="Em Piquetes" valor="—" descricao="Sistema extensivo" />
      <Kpi titulo="Em Confinamento" valor="—" descricao="Sistema intensivo" />
    </section>
  );
}

function Kpi({
  titulo,
  valor,
  descricao,
}: {
  titulo: string;
  valor: string;
  descricao: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold text-green-700 mt-1">{valor}</p>
      <p className="text-xs text-gray-400 mt-1">{descricao}</p>
    </div>
  );
}
