"use client";

import { useEffect, useState } from "react";

type Recomendacao = {
  plano: string;
  motivo: string;
};

export default function RecomendacaoIA() {
  const [rec, setRec] = useState<Recomendacao | null>(null);

  useEffect(() => {
    fetch("/api/planos/recomendacao")
      .then((r) => r.json())
      .then(setRec)
      .catch(() => null);
  }, []);

  if (!rec) return null;

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-green-500 bg-green-50 p-6 text-center">
      <h3 className="text-lg font-semibold text-green-800">
        Plano recomendado para você
      </h3>
      <p className="mt-2 text-sm text-green-700">
        <strong>{rec.plano.toUpperCase()}</strong> — {rec.motivo}
      </p>
    </div>
  );
}
