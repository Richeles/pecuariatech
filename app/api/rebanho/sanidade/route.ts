import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

type SanidadeInput = {
  animal_id: string;
  tipo: string;
  descricao?: string;
  data: string;
  proximo?: string;
};

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as SanidadeInput;

    if (!data.animal_id || !data.tipo || !data.data) {
      return NextResponse.json(
        { success: false, error: "Dados obrigatórios faltando" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("sanidade").insert(data);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}
