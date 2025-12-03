import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ultrachat: "online",
    version: "1.0.0",
    commands: ["A", "B", "C", "D"],
    bot: "@pecuariatech_bot",
    status: "ready"
  });
}
