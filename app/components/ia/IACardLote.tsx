// app/components/ia/IACardLote.tsx
// Card de Diagnóstico UltraBiológico por Lote
// Ajustado para build seguro (Tailwind + props reais)

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
    adequado: {
      border: "border-green-500",
      text: "text-green-600",
    },
    atencao: {
      border: "border-yellow-500",
      text: "text-yellow-600",
    },
    critico: {
      border: "border-red-500",
      text: "text-red-600",
    },
  };

  const estilo = estilosPorStatus[status];

  return (
    <div
      className={`border-l-4 ${estilo.border} bg-white p-6 rounded shadow`}
    >
      <h3 className="font-semibold text-lg mb-2">
        Diagnóstico UltraBiológico — Lote
      </h3>

      <p className="text-sm text-gray-600 mb-1">
        Lote analisado: <b>{lote_id}</b>
      </p>

      <p clas
