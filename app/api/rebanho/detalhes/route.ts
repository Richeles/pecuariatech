import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

type DetalhesRebanhoInput = {
  id: string;
};

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as DetalhesRebanhoInput;
    const { id } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id é obrigatório" },
        { status: 400 }
      );
    }

    const { data: animal, error } = await supabase
      .from("animais")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: animal,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}
