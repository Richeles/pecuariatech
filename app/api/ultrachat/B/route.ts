import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    comando: "B",
    descricao: "Informações da conta e plano",
    nome: "Richeles",
    plano: "UltraChat Free Trial 7 dias",
    renovacao: "pendente",
  });
}
