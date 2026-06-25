"use client";

type Props = {
  alertas?: { tipo: "crítico" | "atenção" | "info"; mensagem: string }[];
};

export default function PastagemAlertasCard({ alertas = [] }: Props) {
  const defaultAlertas = [
    { tipo: "atenção" as const, mensagem: "Lotação abaixo do potencial" },
    { tipo: "info" as const, mensagem: "Monitorar condição do solo" },
  ];

  const items = alertas.length > 0 ? alertas : defaultAlertas;

  const cores = {
    crítico: "border-red-500/20 bg-red-500/5 text-red-400",
    atenção: "border-yellow-500/20 bg-yellow-500/5 text-yellow-400",
    info: "border-blue-500/20 bg-blue-500/5 text-blue-400",
  };

  return (
    <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
        <span className="text-[#34D399]">⚠️</span> Alertas
      </h3>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className={`rounded-xl border p-4 ${cores[item.tipo]}`}>
            <p className="text-sm">{item.mensagem}</p>
          </div>
        ))}
      </div>
    </div>
  );
}