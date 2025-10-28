import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pasture = body.pasture || null;
    const climate = body.climate || null;

    const prompt = `VocÃƒÂª ÃƒÂ© um especialista zootÃƒÂ©cnico.
Com base na pastagem: ${pasture} e clima: ${climate},
gere recomendaÃƒÂ§ÃƒÂµes prÃƒÂ¡ticas de manejo, ajustes nutricionais e riscos sanitÃƒÂ¡rios.
Se for apropriado, retorne um bloco \\json ... \\ com aÃƒÂ§ÃƒÂ£o register_pastagem ou recommend_treatment.`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await resp.json();
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err });
  }
}







