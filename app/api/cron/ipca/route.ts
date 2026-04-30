// app/api/cron/ipca/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    // 🔐 SERVICE ROLE (OBRIGATÓRIO)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🔁 EXECUTA REAJUSTE
    const { error } = await supabase.rpc("aplicar_reajuste_ipca");

    if (error) {
      console.error("[IPCA CRON ERROR]", error);
      return NextResponse.json({ ok: false, error: error.message });
    }

    return NextResponse.json({
      ok: true,
      message: "Reajuste IPCA aplicado com sucesso",
    });

  } catch (err: any) {
    console.error("[IPCA CRON FATAL]", err);
    return NextResponse.json({
      ok: false,
      error: err.message,
    });
  }
}