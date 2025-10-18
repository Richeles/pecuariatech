import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request){
  try{
    const body = await req.json();
    const text = String(body.text||'');
    const lat = body.lat || null; const lon = body.lon || null;
    if(!text) return NextResponse.json({ok:false,error:'text required'},{status:400});
    await supabase.from('ultrachat_messages').insert([{ user_name: 'web', content: text, meta: { lat, lon } }]);
    return NextResponse.json({ok:true});
  } catch(e:any){ return NextResponse.json({ok:false,error:e.message},{status:500}); }
}
