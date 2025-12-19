// app/rebanho/animal/[id]/page.tsx
// Detalhe do Animal + IA UltraBiológica

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import IACardAnimal from "@/app/components/ia/IACardAnimal";
import { resolverCapacidadeIA } from "@/app/lib/iaPlano";

export default function AnimalPage() {
  const { id } = useParams<{ id: string }>();

  const [ia, setIa] = useState<any>(null);
  const [plano, setPlano] = useState<string>("trial");

  useEffect(() => {
    const carregarIA = async () => {
      const { data: { session } } =
        await supabase.auth.getSession();

      if (!session?.access_token) return;

      const planoRes = await fetch("/api/assinaturas/plano", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const planoData = await planoRes.json();
      setPlano(planoData.plano);

      const res = await fetch(`/api/ia/animal/${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const data = await res.json();
      setIa(data);
    };

    carregarIA();
  }, [id]);

  if (!ia) return <p className="p-6">Carregando diagnóstico...</p>;

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
