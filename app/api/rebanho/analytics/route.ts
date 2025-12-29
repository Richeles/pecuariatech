// app/api/rebanho/analytics/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("rebanho")
      .select("status, count:id");

    if (error) throw error;

    return NextResponse.json(data);
  } catch (e) {
    console.error("Erro analytics rebanho:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
