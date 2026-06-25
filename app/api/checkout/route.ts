import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Configurar Mercado Pago (nova sintaxe)
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

// Mapeamento de planos para valores e descrições
const PLANOS: Record<string, { valor: number; descricao: string }> = {
  basico: { valor: 189.97, descricao: "Plano Básico" },
  profissional: { valor: 389.97, descricao: "Plano Profissional" },
  ultra: { valor: 589.97, descricao: "Plano Ultra" },
  empresarial: { valor: 789.97, descricao: "Plano Empresarial" },
  dominus: { valor: 989.97, descricao: "Plano Dominus 360°" },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plano, user_id, email, nome } = body;

    if (!plano || !user_id || !email) {
      return NextResponse.json(
        { error: "Dados incompletos: plano, user_id e email são obrigatórios" },
        { status: 400 }
      );
    }

    const planoInfo = PLANOS[plano as keyof typeof PLANOS];
    if (!planoInfo) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    // Criar preferência no Mercado Pago (nova sintaxe)
    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: [
          {
            id: plano,
            title: planoInfo.descricao,
            description: `Assinatura do plano ${planoInfo.descricao} - PecuariaTech`,
            quantity: 1,
            currency_id: "BRL",
            unit_price: planoInfo.valor,
          },
        ],
        payer: {
          email: email,
          name: nome || email.split("@")[0],
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/planos`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/planos`,
        },
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
        external_reference: JSON.stringify({
          user_id,
          plano,
          timestamp: Date.now(),
        }),
        auto_return: "approved",
      },
    });

    const initPoint = response.init_point;

    // Salvar pedido pendente no Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const pedidoId = crypto.randomUUID();

    await supabase.from("pedidos").insert({
      id: pedidoId,
      user_id,
      plano,
      valor: planoInfo.valor,
      status: "pendente",
      payment_id: response.id,
      criado_em: new Date().toISOString(),
    });

    return NextResponse.json({ init_point: initPoint });
  } catch (error: any) {
    console.error("[Checkout] Erro:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar checkout" },
      { status: 500 }
    );
  }
}