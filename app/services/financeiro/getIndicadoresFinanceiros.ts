import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getIndicadoresFinanceiros() {
  try {
    const { data, error } = await supabase
      .from("financeiro_resumo_view")
      .select("*")
      .single();

    if (error) {
      console.error(
        "Erro financeiro_resumo_view:",
        error.message
      );

      return null;
    }

    return data;
  } catch (error) {
    console.error(
      "Erro estrutural financeiro:",
      error
    );

    return null;
  }
}