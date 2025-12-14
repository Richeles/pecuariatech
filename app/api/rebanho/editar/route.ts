import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

type EditarAnimalInput = {
  id: string;
  nome?: string;
  categoria?: string;
  sexo?: string;
  peso_inicial?: number;
  origem?: string;
  status?: string;
};

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as EditarAnimalInput;
    const { id, ...campos } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id é obrigatório" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("animais")
      .update(campos)
      .eq("id", id);

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
