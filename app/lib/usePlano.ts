// app/lib/usePlano.ts
import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase-browser";

export function usePlano(userId?: string) {
  const [plano, setPlano] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setPlano("basico");
      setLoading(false);
      return;
    }

    async function fetchPlano() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("assinaturas")
        .select("plano")
        .eq("user_id", userId)
        .eq("status", "ativa")
        .order("criado_em", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.warn("[usePlano] Plano não encontrado, usando 'basico'");
        setPlano("basico");
      } else {
        setPlano(data.plano || "basico");
      }
      setLoading(false);
    }

    fetchPlano();
  }, [userId]);

  return { plano, loading };
}