import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { user_id, email, plano, periodo } = body;

    // Validação de tipos
    if (!user_id || !email || !plano || !periodo) {
      return NextResponse.json(
        { ok: false, error: "dados_invalidos" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ==========================================
    // PROTEÇÃO CONTRA DUPLICATAS
    // Verifica se já existe lead aberto para este usuário
    // ==========================================

    const { data: jaExiste } = await supabase
      .from("leads_checkout_abandonado")
      .select("id")
      .eq("user_id", user_id)
      .eq("recuperado", false)
      .limit(1)
      .maybeSingle();

    if (jaExiste) {
      console.log("[NURA_LEAD_DUPLICATE]", { 
        user_id, 
        email, 
        plano, 
        periodo,
        lead_id: jaExiste.id
      });

      return NextResponse.json({
        ok: true,
        duplicate: true,
        message: "Lead já existe e ainda não foi recuperado",
      });
    }

    // ==========================================
    // INSERIR LEAD (apenas se não existe)
    // ==========================================

    const { error } = await supabase
      .from("leads_checkout_abandonado")
      .insert({
        user_id,      // uuid
        email,        // text
        plano,        // text
        periodo,      // text
        recuperado: false, // boolean
      });

    if (error) {
      console.error("[NURA_LEAD_ERROR]", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    console.log("[NURA_LEAD_OK]", { 
      user_id,
      email, 
      plano, 
      periodo,
      criado_em: new Date().toISOString()
    });

    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error("[NURA_FATAL]", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "erro_interno" },
      { status: 500 }
    );
  }
}