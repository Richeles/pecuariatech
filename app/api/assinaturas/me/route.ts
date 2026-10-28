
 // CAMINHO: app/api/assinaturas/me/route.ts
 // PECUARIATECH — ESR SIMBIÓTICA + TRIÂNGULO ESPELHADO 360°
 // MPVEC | X → Y → Z | π → Ω
 // Função: leitura individual da assinatura autenticada.
 // Y = fonte de verdade; esta rota não altera pagamentos nem assinaturas.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function respostaErro(
  mensagem: string,
  status: number
): NextResponse {
  return NextResponse.json(
    { error: mensagem },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function GET(req: NextRequest) {
  // ESR — OBSERVAR: verificar configuração e pedido recebido.
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // A configuração é verificada em execução, não na importação.
    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "[ESR][Y][ASSINATURA] Configuração Supabase incompleta."
      );

      return respostaErro(
        "Serviço temporariamente indisponível.",
        500
      );
    }

    // Z — autenticação: exigir um token Bearer explícito.
    const authorization = req.headers.get("authorization");
    const correspondencia = authorization?.match(/^Bearer\s+(.+)$/i);
    const token = correspondencia?.[1]?.trim();

    if (!token) {
      return respostaErro("Não autenticado.", 401);
    }

    // Cliente restrito à execução no servidor.
    // A chave de serviço nunca deve ser enviada ao cliente.
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    // Z — validar o token no Supabase Auth.
    const { data: auth, error: authError } =
      await supabase.auth.getUser(token);

    if (authError || !auth?.user?.id) {
      return respostaErro("Sessão inválida ou expirada.", 401);
    }

    // Ω — correlacionar a consulta com a identidade autenticada.
    const userId = auth.user.id;

    // Y — leitura exclusivamente individual da fonte de verdade.
    // Não criar, atualizar ou ativar assinaturas nesta rota.
    const { data: assinatura, error: assinaturaError } =
      await supabase
        .from("assinaturas")
        .select(
          "plano, periodo, status, origem, inicio, fim"
        )
        .eq("user_id", userId)
        .order("inicio", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (assinaturaError) {
      console.error(
        "[ESR][Y][ASSINATURA] Falha na consulta:",
        assinaturaError.message
      );

      return respostaErro(
        "Não foi possível consultar a assinatura.",
        500
      );
    }

    // ESPELHAR — devolver um estado explícito e sem cache.
    if (!assinatura) {
      return NextResponse.json(
        { possui_assinatura: false },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // CONVERGIR — devolver apenas os dados selecionados da assinatura.
    return NextResponse.json(
      {
        possui_assinatura: true,
        ...assinatura,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    // Observabilidade ESR: registar a falha sem expor credenciais.
    console.error(
      "[ESR][Ω][ASSINATURA] Erro inesperado:",
      error instanceof Error ? error.message : "Erro desconhecido"
    );

    return respostaErro("Erro interno.", 500);
  }
}
