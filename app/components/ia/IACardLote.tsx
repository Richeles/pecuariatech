// app/components/ia/IACardLote.tsx
// Card de Diagnóstico UltraBiológico por Lote
// Versão segura para Tailwind + props reais

"use client";

type Props = {
  lote_id: string;
  status: "adequado" | "atencao" | "critico";
  score_ultrabiologico: number;
  alerta?: string | null;
  recomendacao: string;
};

export default function IACardLote({
  lote_id,
  status,
  score_ultrabiologico,
  alerta,
  recomendacao,
}: Props) {
  const estilosPorStatus: Record<
    Props["status"],
    { border: string; text: string }
  > = {
    adequado: { border: "border-green-500", text: "text-green-600" },
    atencao: { border: "border-yellow-500", text: "text-yellow-600" },
    critico: { border: "border-red-500", text: "text-red-600" },
  };

  const estilo = estilosPorStatus[status];

  return (
    <div className={`border-l-4 ${estilo.border} bg-white p-6 rounded shadow`}>
      <h3 className="font-semibold text-lg mb-2">
        Diagnóstico UltraBiológico — Lote
      </h3>

      <p className="text-sm text-gray-600 mb-1">
        Lote analisado: <b>{lote_id}</b>
      </p>

      <p className="text-sm mb-2">
        Status técnico:{" "}
        <span className={`font-semibold ${estilo.text}`}>
          {status.toUpperCase()}
        </span>
      </p>

      <p className="text-sm mb-2">
        Score UltraBiológico:{" "}
        <span className="font-semibold">
          {score_ultrabiologico}/100
        </span>
      </p>

      {alerta && (
        <div className="text-sm text-red-600 mb-2">
          ⚠ {alerta}
        </div>
      )}

      <p className="text-sm text-gray-700">
        <b>Orientação técnica:</b> {recomendacao}
      </p>
    </div>
  );
}
