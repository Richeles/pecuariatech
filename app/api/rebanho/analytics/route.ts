import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const total = await supabase.from('animals').select('*', { count: 'exact' });
  const pesos = await supabase.from('pesos').select('*');
  const san = await supabase.from('sanidade').select('*');

  return NextResponse.json({
    total_animais: total?.count ?? 0,
    total_pesagens: pesos?.data?.length ?? 0,
    eventos_sanitarios: san?.data?.length ?? 0,
  });
}
