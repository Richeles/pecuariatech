import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = String(body.password || '');
    if (!password) return NextResponse.json({ ok:false, error: 'password required' }, { status:400 });

    const { data, error } = await supabase.rpc('owner_unlock', { p_password: password });
    if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 403 });
    return NextResponse.json({ ok:true, settings: data });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status:500 });
  }
}


