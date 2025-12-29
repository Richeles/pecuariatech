// app/api/assinaturas/plano/route.ts
// Runtime-only | Build-safe | Equação Y

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anon) {
      return NextResponse.json(
        { error: "Configuração do Supabase ausente" },
        { status: 500 }
      );
    }

    const supabase = createClient(url, anon);

    const { data, error } = await supabase
      .from("planos")
      .select(
        `
        id,
        codigo,
        nome,
        kpis_basicos,
        kpis_avancados,
        acesso_cfo,
        acesso_ultra
        `
      )
      .order("nivel_ordem", { ascending: true });

    if (error) {
      console.error("Erro plano:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro plano:", err);
    return NextResponse.json(
      { error: "Erro interno plano" },
      { status: 500 }
    );
  }
}
