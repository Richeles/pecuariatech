// app/components/ia/IACardLote.tsx
// Card de Diagnóstico UltraBiológico por Lote

"use client";

type Props = {
  loteId: string;
  status: "adequado" | "atencao" | "critico";
  score: number;
  alerta?: string | null;
  recomendacao: string;
};

export default function IACardLote({
  loteId,
  status,
  score,
  alerta,
  recomendacao,
}: Props) {
  const cor =
    status === "adequado"
      ? "green"
      : status === "atencao"
      ? "yellow"
      : "red";

  return (
    <div
      className={`border-l-4 border-${cor}-500 bg-white p-6 rounded shadow`}
    >
      <h3 className="font-semibold text-lg mb-2">
        Diagnóstico UltraBiológico — Lote
      </h3>

      <p className="text-sm text-gray-600 mb-1">
        Lote analisado: <b>{loteId}</b>
      </p>

      <p className="text-sm mb-2">
        Status técnico:{" "}
        <span className={`font-semibold text-${cor}-600`}>
          {status.toUpperCase()}
        </span>
      </p>

      <p className="text-sm mb-2">
        Score UltraBiológico:{" "}
        <span className="font-semibold">{score}/100</span>
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
