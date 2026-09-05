import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// =====================================================
// GET /api/rebanho
// Lista os animais do usuário autenticado (via sessão)
// =====================================================
export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('animais')
      .select(
        `
        id,
        brinco,
        lote,
        sexo,
        raca,
        peso_entrada,
        peso_atual,
        gmd,
        data_vacina,
        piquete_atual,
        criado_em
        `
      )
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro Supabase listar animais:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    const rows = (data || []).map((item) => {
      let sexoNormalizado = item.sexo || '—';
      if (sexoNormalizado === 'M') sexoNormalizado = 'Macho';
      else if (sexoNormalizado === 'F') sexoNormalizado = 'Fêmea';

      return {
        animal_id: item.id,
        animal_brinco: item.brinco || '—',
        raca: item.raca || '—',
        sexo: sexoNormalizado,
        peso: item.peso_atual ?? item.peso_entrada ?? null,
        status_biologico: 'Ativo',
        movimentacao_local: item.piquete_atual || item.lote || '—',
      };
    });

    return NextResponse.json({
      ok: true,
      message: 'Operacao concluida',
      data: rows,
      rows,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Erro inesperado ao listar rebanho:', err);
    return NextResponse.json(
      { ok: false, error: 'Erro interno ao listar rebanho' },
      { status: 500 }
    );
  }
}