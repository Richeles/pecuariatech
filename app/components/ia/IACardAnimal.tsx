// app/components/ia/IACardAnimal.tsx
// Card de Microdiagnóstico UltraBiológico por Animal

"use client";

type CapacidadesIA = {
  ipP: boolean;
  alertasInteligentes: boolean;
  recomendacao: boolean;
  laudoCompleto: boolean;
};

type Props = {
  animalId: string;
  status: "adequado" | "atencao" | "critico";
  ipP: number;
  alerta?: string | null;
  recomendacao?: string;
  diagnostico?: string;
  capacidades: CapacidadesIA;
};

export default function IACardAnimal({
  animalId,
  status,
  ipP,
  alerta,
  recomendacao,
  diagnostico,
  capacidades,
}: Props) {
  const cor =
    status === "adequado"
      ? "green"
      : status === "atencao"
      ? "yellow"
      : "red";

  return (
    <div className={`border-l-4 border-${cor}-500 bg-white p-5 rounded shadow`}>
      <h3 className="font-semibold text-md mb-2">
        Microdiagnóstico UltraBiológico
      </h3>

      <p className="text-sm mb-1">
        <b>Animal:</b> {animalId}
      </p>

      <p className="text-sm mb-2">
        <b>Status:</b>{" "}
        <span className={`font-semibold text-${cor}-600`}>
          {status.toUpperCase()}
        </span>
      </p>

      {capacidades.ipP && (
        <p className="text-sm mb-2">
          <b>IPP Individual:</b> {ipP}/100
        </p>
      )}

      {capacidades.alertasInteligentes && alerta && (
        <div className="text-sm text-red-600 mb-2">
          ⚠ {alerta}
        </div>
      )}

      {capacidades.recomendacao && recomendacao && (
        <p className="text-sm text-gray-700 mb-2">
          <b>Orientação técnica:</b> {recomendacao}
        </p>
      )}

      {capacidades.laudoCompleto && diagnostico && (
        <div className="mt-3 text-sm text-gray-700 whitespace-pre-line border-t pt-3">
          <b>Laudo técnico completo:</b>
          <p className="mt-2">{diagnostico}</p>
        </div>
      )}

      {!capacidades.laudoCompleto && (
        <a href="/planos" className="text-sm text-blue-600 font-medium">
          Desbloquear laudo individual completo
        </a>
      )}
    </div>
  );
}
