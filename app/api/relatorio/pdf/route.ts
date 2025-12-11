import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    { status: "pdf_ok", msg: "Geração de PDF será integrada na próxima etapa." },
    { status: 200 }
  );
}
