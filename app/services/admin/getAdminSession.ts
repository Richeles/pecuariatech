// =========================================================
// PECUARIATECH
// SERVIÇO DE SESSÃO ADMINISTRATIVA
//
// ESR + MPVEC SIMBIÓTICO
//
// X  = Interface administrativa
// Y  = Supabase / Verdade dos dados
// Z  = Identidade e autorização
// π  = Processamento
// Ω  = Coerência administrativa
//
// REGRA:
// requireAdminMaster é a única fonte de autorização.
// Este serviço não concede privilégios.
// Não altera assinaturas, checkout ou webhook.
// =========================================================

import { createSupabaseServer } from "@/app/lib/supabase-server";
import { requireAdminMaster } from "@/app/services/admin/requireAdminMaster";

export type AdminSession = {
  is_admin: boolean;
  role?: string;
  email?: string;
};

export async function getAdminSession(): Promise<AdminSession> {
  try {
    // Z — Validação central da identidade e autorização.
    const authorization = await requireAdminMaster();

    if (!authorization.authorized) {
      return {
        is_admin: false,
      };
    }

    // Identificação complementar para apresentação no painel.
    // A consulta de e-mail não concede nem altera privilégios.
    let email: string | undefined;

    try {
      const supabase = await createSupabaseServer();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user?.id === authorization.userId) {
        email = user.email;
      }
    } catch (error) {
      console.warn(
        "[ESR][ADMIN_SESSION] E-mail indisponível para apresentação:",
        error
      );
    }

    // Ω — Autorização já confirmada pela fonte central.
    return {
      is_admin: true,
      role: "master",
      email,
    };
  } catch (error) {
    console.error(
      "[ESR][ADMIN_SESSION] Falha na recuperação da sessão:",
      error
    );

    return {
      is_admin: false,
    };
  }
}