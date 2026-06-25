import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("❌ Supabase env vars missing");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tipo, dados, user_id } = body;

    if (!tipo || !dados || !user_id) {
      return NextResponse.json(
        { message: "Campos obrigatórios: tipo, dados, user_id" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const tabelas: Record<string, string> = {
      rebanho: "rebanho",
      financeiro: "financeiro",
      pastagem: "pastagem",
      engorda: "engorda",
    };

    const tabela = tabelas[tipo];
    if (!tabela) {
      return NextResponse.json({ message: "Tipo inválido" }, { status: 400 });
    }

    // Processar cada linha
    const resultados = [];
    for (const linha of dados) {
      const registro = {
        ...linha,
        user_id: user_id,
        id: crypto.randomUUID(),
        // Converter campos numéricos
        peso_inicial: linha.peso_inicial ? parseFloat(linha.peso_inicial) : null,
        peso_atual: linha.peso_atual ? parseFloat(linha.peso_atual) : null,
        gmd: linha.gmd ? parseFloat(linha.gmd) : null,
        area: linha.area ? parseFloat(linha.area) : null,
        valor: linha.valor ? parseFloat(linha.valor) : null,
        // Converter datas
        data_entrada: linha.data_entrada || null,
        data_lancamento: linha.data_lancamento || null,
        data_plantio: linha.data_plantio || null,
        data_inicio: linha.data_inicio || null,
      };

      const { error } = await supabase.from(tabela).insert(registro);
      if (error) {
        resultados.push({ erro: error.message, linha });
      } else {
        resultados.push({ sucesso: true });
      }
    }

    const processados = resultados.filter((r) => r.sucesso).length;
    const erros = resultados.filter((r) => r.erro).length;

    return NextResponse.json({
      message: `${processados} registros importados com sucesso. ${erros} erros.`,
      processados,
      erros,
      resultados,
    });
  } catch (error: any) {
    console.error("Erro ao processar planilha:", error);
    return NextResponse.json(
      { message: error?.message || "Erro ao processar" },
      { status: 500 }
    );
  }
}