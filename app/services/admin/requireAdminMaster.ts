// =========================================================
// PECUARIATECH
// SERVIÇO CENTRAL — AUTORIZAÇÃO ADMIN MASTER
//
// ESR + MPVEC SIMBIÓTICO
//
// X  = Interface
// Y  = Supabase / Verdade dos dados
// Z  = Identidade e governança
// π  = Validação de autorização
// Ω  = Coerência de acesso
//
// PRINCÍPIOS:
// - Somente usuário autenticado.
// - Somente role master.
// - Somente registro ativo.
// - Falha de banco nunca concede acesso.
// - Nenhuma autorização por e-mail fixo.
// =========================================================

import { createSupabaseServer } from "@/app/lib/supabase-server";

// =========================================================
// CONTRATO DE AUTORIZAÇÃO
// =========================================================

export type AdminMasterResult =
  | {
      authorized: true;
      status: 200;
      userId: string;
    }
  | {
      authorized: false;
      status: 401 | 403 | 500;
      userId: null;
    };

// =========================================================
// AUTORIZAÇÃO CENTRAL
// =========================================================

export async function requireAdminMaster(): Promise<AdminMasterResult> {
  try {
    // 1. Y — CLIENTE SUPABASE SSR

    const supabase = await createSupabaseServer();

    // 2. Z — IDENTIDADE DO USUÁRIO

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error(
        "[ESR][ADMIN_MASTER] Falha na autenticação:",
        {
          name: authError.name,
          code: authError.code,
          message: authError.message,
          status: authError.status,
        }
      );

      return {
        authorized: false,
        status: 401,
        userId: null,
      };
    }

    if (!user) {
      return {
        authorized: false,
        status: 401,
        userId: null,
      };
    }

    // 3. Z — CONSULTA DA GOVERNANÇA ADMINISTRATIVA

    const {
      data: admin,
      error: adminError,
    } = await supabase
      .from("admin_users")
      .select("role, ativo")
      .eq("user_id", user.id)
      .eq("ativo", true)
      .maybeSingle();

    // 4. FALHA DE BANCO
    // Erro operacional não é ausência de autorização.

    if (adminError) {
      console.error(
        "[ESR][ADMIN_MASTER] Falha na consulta administrativa:",
        {
          userId: user.id,
          code: adminError.code,
        }
      );

      return {
        authorized: false,
        status: 500,
        userId: null,
      };
    }

    // 5. VALIDAÇÃO DA FUNÇÃO ADMINISTRATIVA

    if (admin?.role !== "master" || admin.ativo !== true) {
      return {
        authorized: false,
        status: 403,
        userId: null,
      };
    }

    // 6. AUTORIZAÇÃO CONFIRMADA

    return {
      authorized: true,
      status: 200,
      userId: user.id,
    };
  } catch (error) {
    console.error(
      "[ESR][ADMIN_MASTER] Erro crítico na autorização:",
      error
    );

    return {
      authorized: false,
      status: 500,
      userId: null,
    };
  }
}