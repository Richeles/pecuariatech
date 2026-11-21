import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServer } from "../../lib/supabase-server";
import { requireBenefitSSR } from "../../lib/getStatusPlanoSSR";

export type NutricaoContext = {
  userId: string;
  db: SupabaseClient;
};

export type NutricaoContextResult =
  | { ok: true; context: NutricaoContext }
  | { ok: false; response: NextResponse };

export function nutricaoJson(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function getNutricaoContext(
  request: Request
): Promise<NutricaoContextResult> {
  try {
    const authClient = await createSupabaseServer();

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return {
        ok: false,
        response: nutricaoJson(
          { ok: false, error: "Usuário não autenticado." },
          401
        ),
      };
    }

    const gate = await requireBenefitSSR("engorda_ultra", request);

    if (!gate.allowed) {
      return {
        ok: false,
        response: nutricaoJson(
          { ok: false, error: "Benefício Engorda Ultra não disponível.", reason: gate.reason },
          gate.httpStatus
        ),
      };
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
      return {
        ok: false,
        response: nutricaoJson(
          { ok: false, error: "Configuração administrativa do Supabase ausente." },
          503
        ),
      };
    }

    const db = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    return {
      ok: true,
      context: {
        userId: user.id,
        db,
      },
    };
  } catch (error) {
    console.error("[NUTRICAO][CONTEXT]", error);

    return {
      ok: false,
      response: nutricaoJson(
        { ok: false, error: "Falha ao validar autenticação e benefício." },
        500
      ),
    };
  }
}