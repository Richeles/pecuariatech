// app/api/assinaturas/plano/route.ts
// Next.js 16 + TypeScript strict

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const token = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { plano: "trial", recursos: {} },
        { status: 401 }
      );
    }

    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🔐 Usuário
    const { data } = await supabaseUser.auth.getUser(token);
    const user = data?.user;

    if (!user) {
      return NextResponse.json({ plano: "trial" });
    }

    // 🔎 Assinatura ativa
    const { data: assinatura } = await supabaseAdmin
      .from("assinaturas")
      .select("plano_codigo")
      .eq("user_id", user.id)
      .eq("status", "ativo")
      .maybeSingle();

    const plano = assinatura?.plano_codigo ?? "trial";

    // 🎯 CAPACIDADES POR PLANO (BASE)
    const recursosPorPlano: Record<
      string,
      Record<string, boolean>
    > = {
      trial: {
        kpisBasicos: true,
        kpisAvancados: false,
        planilhas: false,
        ia: false,
        dispositivos: false,
      },
      basico: {
        kpisBasicos: true,
        kpisAvancados: false,
        planilhas: false,
        ia: false,
        dispositivos: false,
      },
      profissional: {
        kpisBasicos: true,
        kpisAvancados: true,
        planilhas: true,
        ia: false,
        dispositivos: false,
      },
      ultra: {
        kpisBasicos: true,
        kpisAvancados: true,
        planilhas: true,
        ia: true,
        dispositivos: false,
      },
      dominus: {
        kpisBasicos: true,
        kpisAvancados: true,
        planilhas: true,
        ia: true,
        dispositivos: true,
      },
    };

    return NextResponse.json({
      plano,
      recursos: recursosPorPlano[plano],
    });
  } catch (err) {
    console.error("Erro plano:", err);
    return NextResponse.json(
      { plano: "trial", recursos: {} },
      { status: 500 }
    );
  }
}
