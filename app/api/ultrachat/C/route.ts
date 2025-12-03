import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    comando: "C",
    menu: {
      A: "Status do sistema",
      B: "Informações da conta",
      C: "Ajuda e menu",
      D: "Ferramentas de rastreabilidade"
    }
  });
}
