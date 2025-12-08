import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getFarmKPIs() {
  try {
    const totalAnimals = await supabase
      .from("animais")
      .select("*", { count: "exact" });

    const totalPastos = await supabase
      .from("pastos")
      .select("*", { count: "exact" });

    const totalGastos = await supabase
      .from("financeiro")
      .select("valor")
      .then((r) =>
        r.data ? r.data.reduce((sum, entry) => sum + entry.valor, 0) : 0
      );

    return {
      animais: totalAnimals.count || 0,
      pastos: totalPastos.count || 0,
      gastos: totalGastos || 0,
    };
  } catch (e) {
    console.error("❌ Erro Supabase:", e);
    return { animais: 0, pastos: 0, gastos: 0 };
  }
}
