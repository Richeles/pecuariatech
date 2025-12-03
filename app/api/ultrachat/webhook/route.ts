export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message?.text || "";
    const chatId = body.message?.chat.id;

    if (!chatId) {
      return Response.json({ ok: false, error: "chatId inválido" });
    }

    let resposta = "Olá! Sou o UltraChat PecuariaTech 🚜🌱";

    if (message.toUpperCase() === "A") resposta = "Menu A selecionado!";
    if (message.toUpperCase() === "B") resposta = "Menu B ativo!";
    if (message.toUpperCase() === "C") resposta = "Menu C carregado!";
    if (message.toUpperCase() === "D") resposta = "Menu D funcionando!";

    await fetch(
      \https://api.telegram.org/bot8384906982:AAFkRtD5ye7O_Z2JQNZTp9rpXweSy3RFXzg/sendMessage\,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: resposta,
        }),
      }
    );

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e.toString() });
  }
}

export function GET() {
  return Response.json({ ok: true, message: "Webhook ativo 👍" });
}
