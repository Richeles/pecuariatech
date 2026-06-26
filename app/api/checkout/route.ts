import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

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
    const { plano, user_id, email, nome, plano_atual } = body;

    if (!plano || !user_id || !email) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const planoInfo = PLANOS[plano as keyof typeof PLANOS];
    if (!planoInfo) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

    let valor = planoInfo.valor;
    let descricao = planoInfo.descricao;

    if (plano_atual && PLANOS[plano_atual as keyof typeof PLANOS]) {
      const atualInfo = PLANOS[plano_atual as keyof typeof PLANOS];
      const diff = planoInfo.valor - atualInfo.valor;
      if (diff > 0) {
        valor = diff;
        descricao = `Upgrade de ${atualInfo.descricao} para ${planoInfo.descricao}`;
      } else if (diff === 0) {
        return NextResponse.json({ error: "Você já está neste plano." }, { status: 400 });
      } else {
        return NextResponse.json({ error: "Downgrade não permitido via checkout. Entre em contato." }, { status: 400 });
      }
    }

    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: [
          {
            id: plano,
            title: descricao,
            description: `Assinatura - ${descricao}`,
            quantity: 1,
            currency_id: "BRL",
            unit_price: Math.round(valor * 100) / 100,
          },
        ],
        payer: { email, name: nome || email.split("@")[0] },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/planos`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/planos`,
        },
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
        external_reference: JSON.stringify({ user_id, plano, timestamp: Date.now() }),
        auto_return: "approved",
      },
    });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.from("pedidos").insert({
      id: crypto.randomUUID(),
      user_id,
      plano,
      valor,
      status: "pendente",
      payment_id: response.id,
      criado_em: new Date().toISOString(),
    });

    return NextResponse.json({ init_point: response.init_point });
  } catch (error: any) {
    console.error("[Checkout] Erro:", error);
    return NextResponse.json({ error: error.message || "Erro ao criar checkout" }, { status: 500 });
  }
}