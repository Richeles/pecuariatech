import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const [rebanho, racas, pastagem, financeiro] = await Promise.all([
      supabase.from('rebanho').select('id'),
      supabase.from('racas').select('id'),
      supabase.from('pastagem').select('area_ha'),
      supabase.from('financeiro').select('valor')
    ]);

    const total_heads = rebanho.data?.length ?? 0;
    const racas_count = racas.data?.length ?? 0;
    const area_total_ha = pastagem.data?.reduce((sum, p) => sum + (p.area_ha || 0),0) ?? 0;
    const finance_sum = financeiro.data?.reduce((sum, f) => sum + (f.valor || 0),0) ?? 0;

    return new Response(JSON.stringify({ kpis: { total_heads, racas_count, area_total_ha, finance_sum } }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
