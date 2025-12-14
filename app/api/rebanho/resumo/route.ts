import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    total_animais: 540,
    lotes_ativos: 12,
    peso_medio: 485.3,
  });
}
