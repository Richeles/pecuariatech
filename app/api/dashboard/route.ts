import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // A identidade vem exclusivamente da sessão autenticada.
    // Qualquer user_id enviado pelo cliente é deliberadamente ignorado.

    const pythonApi =
      process.env.PYTHON_API_URL ||
      "https://pecuariatech-motor-pi.onrender.com";

    const url = `${pythonApi}/api/pi/dashboard/${user.id}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(url, {
        headers: {
          "Cache-Control": "no-cache",
        },
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Sem corpo");

        return NextResponse.json(
          {
            error: `Python retornou ${response.status}`,
            details: errorText,
          },
          { status: response.status }
        );
      }

      let data;

      try {
        data = await response.json();
      } catch {
        return NextResponse.json(
          { error: "Resposta do Python não é JSON válido" },
          { status: 500 }
        );
      }

      if (!data.schema_version) {
        data.schema_version = "1.0.0";
        data.api_version = "v1";
      }

      return NextResponse.json(data);
    } catch (error: any) {
      clearTimeout(timeoutId);

      return NextResponse.json(
        {
          error: "Serviço temporariamente indisponível",
          status: "DEGRADED",
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: `Erro interno: ${error?.message || "Desconhecido"}`,
      },
      { status: 500 }
    );
  }
}
