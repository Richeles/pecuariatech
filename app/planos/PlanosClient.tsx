"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Periodo = "mensal" | "trimestral" | "anual";

const PLANOS = [
  { id: "basico", nome: "Básico", preco: { mensal: 31.75, trimestral: 79.38, anual: 317.5 } },
  { id: "profissional", nome: "Profissional", preco: { mensal: 52.99, trimestral: 132.48, anual: 529.9 } },
  { id: "ultra", nome: "Ultra", preco: { mensal: 106.09, trimestral: 265.23, anual: 1060.9 } },
  { id: "empresarial", nome: "Empresarial", preco: { mensal: 159.19, trimestral: 397.98, anual: 1591.9 } },
  { id: "premium_dominus", nome: "Premium Dominus 360°", preco: { mensal: 318.49, trimestral: 796.23, anual: 3184.9 } },
];

export default function PlanosClient() {
  const [periodo, setPeriodo] = useState<Periodo>("mensal");
  const searchParams = useSearchParams();

  const bloqueado = searchParams.get("bloqueado") === "1";

  return (
    <div className="space-y-8">
      {bloqueado && (
        <div className="rounded-xl border border-yellow-400 bg-yellow-50 p-4 text-center text-sm text-yellow-800">
          Seu acesso está bloqueado. Escolha um plano para continuar.
        </div>
      )}

      <div className="flex justify-center gap-2">
        {(["mensal", "trimestral", "anual"] as Periodo[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded ${
              periodo === p ? "bg-green-600 text-white" : "border"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {PLANOS.map((plano) => (
          <div key={plano.id} className="rounded-xl border p-4 space-y-2">
            <h3 className="font-bold">{plano.nome}</h3>
            <p className="text-2xl text-green-600">
              R$ {plano.preco[periodo].toFixed(2).replace(".", ",")}
            </p>
            <Link
              href={`/checkout?plano=${plano.id}&periodo=${periodo}`}
              className="block bg-green-600 text-white text-center py-2 rounded"
            >
              Assinar
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
