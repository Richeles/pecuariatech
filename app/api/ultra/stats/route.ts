import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    health: {
      status: "OK",
      internet: "Online",
      supabase: "Connected",
      cpu: 12
    },
    logs: [
      "Sistema iniciado com sucesso...",
      "Supabase conectado.",
      "Monitoramento ativo."
    ]
  });
}
