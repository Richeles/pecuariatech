import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

type ExcluirAnimalInput = {
  id: string;
};

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as ExcluirAnimalInput;

    if (!data.id) {
      return NextResponse.json(
        { success: false, error: "id é obrigatório" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("animais")
      .delete()
      .eq("id", data.id);

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
