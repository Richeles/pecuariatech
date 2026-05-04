import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    }
  );

  // 🔥 SIMULAÇÃO (depois liga no banco)
  return Response.json({
    receita_total: 100000,
    custos_totais: 60000,
    resultado: 40000,
    margem_percentual: 40,
    periodo: "Abril/2026",
  });
}