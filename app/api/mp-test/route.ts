export async function GET() {
  return Response.json({
    chave_publica: process.env.MERCADOPAGO_CHAVE_PUBLICA || "VAZIA",
    token: process.env.MERCADOPAGO_ACCESS_TOKEN ? "OK" : "VAZIO",
  });
}
