import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

type PesoInput = {
  animal_id: string;
  peso: number;
  data_pesagem: string;
};

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as PesoInput;

    if (!data.animal_id || typeof data.peso !== "number") {
      return NextResponse.json(
        { success: false, error: "Dados inválidos" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("pesagens").insert({
      animal_id: data.animal_id,
      peso: data.peso,
      data_pesagem: data.data_pesagem,
    });

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
