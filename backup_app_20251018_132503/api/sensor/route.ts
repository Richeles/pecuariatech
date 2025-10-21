import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request){
  try {
    const body = await req.json();
    const pasture_id = body.pasture_id || null;
    const payload = body.payload || body;
    const ins = await supabase.from('clima_readings').insert([{ pasture_id, payload, created_at: new Date().toISOString() }]);
    return NextResponse.json({ ok:true, result: ins.data || null });
  } catch(e:any){
    return NextResponse.json({ ok:false, error: String(e) }, { status:500 });
  }
}


