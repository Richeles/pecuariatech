import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

type CadastrarAnimalInput = {
  nome: string;
  categoria: string;
  sexo: string;
  peso_inicial: number;
  data_nascimento?: string;
  origem?: string;
  lote_id?: string;
  custo_medio?: number;
};

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as CadastrarAnimalInput;

    const {
      nome,
      categoria,
      sexo,
      peso_inicial,
      data_nascimento,
      origem,
      lote_id,
      custo_medio,
    } = data;

    if (!nome || !categoria || !sexo || typeof peso_inicial !== "number") {
      return NextResponse.json(
        { success: false, error: "Dados obrigatórios inválidos" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("animais").insert({
      nome,
      categoria,
      sexo,
      peso_inicial,
      data_nascimento,
      origem,
      lote_id,
      custo_medio,
      status: "ativo",
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Animal cadastrado com sucesso",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}
