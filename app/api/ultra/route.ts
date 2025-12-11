import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { data, error } = await supabase.rpc("calcular_financas");
    if (error) {
      console.error("Erro na função calcular_financas:", error);
      return NextResponse.json({ error: "Erro na função de valuation." }, { status: 500 });
    }
    return NextResponse.json({ status: "ok", resultado: data });
  } catch (e) {
    console.error("Erro inesperado:", e);
    return NextResponse.json({ error: "Erro inesperado na rota /api/ultra." }, { status: 500 });
  }
}
