import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_KEY = process.env.OPENAI_API_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function POST(req: Request){
  try {
    const body = await req.json();
    const pasture = body.pasture || null;
    const climate = body.climate || null;

    const prompt = Você é um especialista zootécnico. Com base na pastagem:  e clima: , gere recomendações práticas de manejo, ajustes nutricionais e riscos sanitários. Se for apropriado, retorne um bloco \\\json ... \\\ com ação register_pastagem ou recommend_treatment.

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': Bearer , 'Content-Type': 'application/json' },
      body: JSON.stringify({ model:'gpt-4o-mini', messages:[{ role:'system', content:'Você é um assistente zootécnico.' }, { role:'user', content: prompt }], max_tokens:600, temperature:0.18 })
    });
    if(!resp.ok){ const t = await resp.text(); return NextResponse.json({ ok:false, error:'OpenAI error', info:t }, { status:502 }); }
    const j = await resp.json();
    const reply = j.choices?.[0]?.message?.content || 'Sem resposta';
    await supabase.from('chat_messages').insert([{ role:'assistant', text: reply, meta:{ source:'autonomo' }, created_at: new Date().toISOString() }]);

    // attempt action extraction
    const m = reply.match(/`json\\s*([\\s\\S]*?)\\s*`/i);
    let actionResult = null;
    if(m){
      try {
        const action = JSON.parse(m[1]);
        if(action.action === 'register_pastagem' && action.data){
          const d = action.data;
          const ins = await supabase.from('pastagem').insert([{ nome:d.nome||null, area_ha:d.area_ha||null, tipo_pasto:d.tipo_pasto||null, latitude:d.latitude||null, longitude:d.longitude||null }]);
          actionResult = ins.error ? { ok:false, error:ins.error.message } : { ok:true, row:ins.data };
        }
        await supabase.from('actions').insert([{ source:'autonomo', action, result: actionResult, created_at:new Date().toISOString() }]);
      } catch(e){ actionResult = { ok:false, error: String(e) }; }
    }

    return NextResponse.json({ ok:true, reply, actionResult });
  } catch(e:any){
    return NextResponse.json({ ok:false, error:String(e) }, { status:500 });
  }
}
