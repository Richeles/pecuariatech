// app/rebanho/animal/[id]/page.tsx
// Detalhe do Animal + IA UltraBiológica
// Build-safe | Auth desacoplado | Fase de estabilização

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import IACardAnimal from "@/app/components/ia/IACardAnimal";
import { resolverCapacidadeIA } from "@/app/lib/iaPlano";

export default function AnimalPage() {
  const { id } = useParams<{ id: string }>();

  const [ia, setIa] = useState<any>(null);
  const [plano, setPlano] = useState<string>("trial");

  useEffect(() => {
    async function carregarIA() {
      try {
        // 🔹 Plano mockado / temporário (fase segura)
        const planoRes = await fetch("/api/assinaturas/plano");
        const planoData = await planoRes.json();
        setPlano(planoData?.plano ?? "trial");

        // 🔹 IA por animal (endpoint já existente)
        const res = await fetch(`/api/ia/animal/${id}`);
        const data = await res.json();
        setIa(data);
      } catch (err) {
        console.error("Erro ao carregar IA do animal:", err);
      }
    }

    carregarIA();
  }, [id]);

  if (!ia) {
    return (
      <p className="p-6 text-gray-500">
        Carregando diagnóstico do animal…
      </p>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">
        Animal {id}
      </h1>

      <IACardAnimal
        animalId={id}
        status={ia.status}
        ipP={ia.ipp}
        alerta={ia.alerta}
        recomendacao={ia.recomendacao}
        diagnostico={ia.diagnostico}
        capacidades={resolverCapacidadeIA(plano)}
      />
    </div>
  );
}
