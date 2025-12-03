import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    comando: "A",
    status: "online",
    descricao: "Status geral do PecuariaTech",
    backend: "OK",
    database: "OK",
    ultrachat: "OK"
  });
}
