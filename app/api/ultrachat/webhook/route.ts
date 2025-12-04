import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message?.text || "";
    const chat_id = body.message?.chat?.id;

    let resposta = "Mensagem não reconhecida.";

    if (message.toUpperCase() === "D") resposta = "Menu D funcionando!";

    if (chat_id) {
      await fetch(
        "https://api.telegram.org/bot8384906982:AAFkRtD5ye7O_Z2JQNZTp9rpXweSy3RFXzg/sendMessage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chat_id,
            text: resposta,
          }),
        }
      );
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json({ status: "error", message: error.message });
  }
}
