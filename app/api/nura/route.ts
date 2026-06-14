// app/api/nura/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const REQUEST_TIMEOUT_MS = 120000; // 120 segundos

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set() {},
          remove() {},
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { pergunta } = await req.json();
    if (!pergunta?.trim()) {
      return NextResponse.json({ error: "Pergunta vazia" }, { status: 400 });
    }

    const { data: assinatura } = await supabase
      .from("assinaturas")
      .select("plano")
      .eq("user_id", user.id)
      .eq("status", "ativa")
      .maybeSingle();

    const plano = assinatura?.plano ?? null;
    const planosPermitidos = ["ultra", "empresarial", "dominus"];
    if (!plano || !planosPermitidos.includes(plano)) {
      return NextResponse.json(
        { error: "NURA disponível apenas para planos Ultra, Empresarial ou Dominus" },
        { status: 403 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    // 🔧 URL do backend Python (usa variável de ambiente em produção, fallback local)
    const pythonUrl = process.env.NURA_PYTHON_URL || "http://127.0.0.1:8000/nura";

    const response = await fetch(pythonUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texto: pergunta,
        fazenda_id: user.id,
        user_id: user.id,
        plano,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend Python retornou ${response.status}: ${errorText}`);
      return NextResponse.json({ error: "NURA indisponível no momento" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ resposta: data.resposta, metadata: data.metadata });
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json({ error: "A NURA demorou muito. Tente novamente." }, { status: 504 });
    }
    console.error("Erro na rota /api/nura:", error);
    return NextResponse.json({ error: "NURA indisponível" }, { status: 500 });
  }
}