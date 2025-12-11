import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// =====================================================
// GET /api/assinatura
// Retorna o nível de assinatura e data de expiração
// =====================================================
export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ nivel: "sem_autenticacao" }, { status: 200 });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user?.id) {
      return NextResponse.json({ nivel: "erro_usuario" }, { status: 200 });
    }

    const { data: assinatura } = await supabase
      .from("assinaturas")
      .select("*")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (!assinatura) {
      return NextResponse.json({ nivel: "nenhuma_assinatura" }, { status: 200 });
    }

    const hoje = new Date();
    const expira = new Date(assinatura.expiracao);

    if (expira < hoje) {
      return NextResponse.json({ nivel: "trial_expirado" }, { status: 200 });
    }

    return NextResponse.json(
      {
        nivel: assinatura.nivel,
        expira_em: assinatura.expiracao,
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ error: e }, { status: 500 });
  }
}
