import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    comando: "D",
    rastreabilidade: [
      "Cadastrar Animal",
      "Movimentação de Piquete",
      "Confinamento",
      "Tratamentos",
      "Alimentação"
    ]
  });
}
