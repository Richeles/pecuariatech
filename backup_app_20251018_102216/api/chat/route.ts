ï»¿import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    const systemPrompt = `VocÃƒÂª ÃƒÂ© UltraBiolÃƒÂ³gico do PecuariaTech Ã¢â‚¬â€ suporte zootÃƒÂ©cnico/veterinÃƒÂ¡rio.
Responda em PT-BR. Quando for apropriado, retorne aÃƒÂ§ÃƒÂµes JSON entre \\json ... \\
com as aÃƒÂ§ÃƒÂµes permitidas: register_animal, register_pastagem, alert_vaccination, recommend_treatment.
NÃƒÂ£o prescreva medicamentos controlados sem avaliaÃƒÂ§ÃƒÂ£o presencial.
Sempre recomende consultar veterinÃƒÂ¡rio quando houver sinais de gravidade.`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    const data = await openaiRes.json();
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err });
  }
}


