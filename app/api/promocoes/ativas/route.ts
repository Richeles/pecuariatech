import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function respostaErro() {
  return NextResponse.json(
    { error: "promotions_unavailable" },
    {
      status: 500,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      console.error("[PROMOCOES_PUBLICAS] Configuração Supabase ausente.");
      return respostaErro();
    }

    const supabase = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const agora = new Date().toISOString();

    const { data, error } = await supabase
      .from("promocoes_comerciais")
      .select("id, desconto, planos, periodos, data_inicio, data_fim")
      .eq("ativo", true)
      .lte("data_inicio", agora)
      .gte("data_fim", agora)
      .order("data_inicio", { ascending: false });

    if (error) {
      console.error("[PROMOCOES_PUBLICAS][GET]", error.code);
      return respostaErro();
    }

    return NextResponse.json(data ?? [], {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[PROMOCOES_PUBLICAS][GET]", error);
    return respostaErro();
  }
}
