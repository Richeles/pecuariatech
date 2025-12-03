import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  const { brinco_origem, brinco_propriedade } = body;

  const rastreio = await buscarDadosOficiais(brinco_origem);

  const { data, error } = await supabase
    .from("animal")
    .insert({
      brinco_propriedade,
      brinco_origem,
      origem: rastreio.origem,
      data_nascimento: rastreio.nascimento,
      sexo: rastreio.sexo,
      raca: rastreio.raca,
      vacinas: rastreio.vacinas,
      procedencia: rastreio.procedencia,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error }, { status: 400 });

  return NextResponse.json({ message: "Animal cadastrado!", data });
}

async function buscarDadosOficiais(brinco: string) {
  return {
    origem: "Fazenda Modelo - GO",
    nascimento: "2024-02-20",
    sexo: "M",
    raca: "Nelore",
    vacinas: [
      { tipo: "aftosa", data: "2024-09-15" },
      { tipo: "raiva", data: "2024-08-01" },
    ],
    procedencia: "Lote 12 — Leilão ABC",
  };
}
