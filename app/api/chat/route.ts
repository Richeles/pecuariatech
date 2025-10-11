import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_KEY = process.env.OPENAI_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// helper to log
async function log(role:string, text:string, meta:any=null){
  try { await supabase.from('chat_messages').insert([{ role, text, meta, created_at: new Date().toISOString() }]); } catch(e){ console.error('log error', e); }
}

function extractJsonAction(text:string){
  const m = text.match(/`json\\s*([\\s\\S]*?)\\s*`/i);
  if(!m) return null;
  try { return JSON.parse(m[1]); } catch(e) { return null; }
}

// GET -> history
export async function GET(){
  const { data } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true }).limit(400);
  return NextResponse.json({ messages: data || [] });
}

// POST -> send to OpenAI
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = String(body.message || '').slice(0, 4000);
    if(!userMessage) return NextResponse.json({ ok:false, error:'Mensagem vazia' }, { status: 400 });

    await log('user', userMessage);

    const systemPrompt = Você é UltraBiológico do PecuariaTech — suporte zootécnico/veterinário. Responda em PT-BR. Quando for apropriado, retorne ações JSON entre \\\json ... \\\ com as ações permitidas: register_animal, register_pastagem, alert_vaccination, recommend_treatment. Não prescreva medicamentos controlados sem avaliação presencial. Sempre recomende consultar veterinário quando houver sinais de gravidade.;

    // Call OpenAI Chat Completions (chat.completions)
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': Bearer , 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 800,
        temperature: 0.2
      })
    });

    if(!openaiRes.ok){
      const t = await openaiRes.text();
      console.error('openai error', t);
      return NextResponse.json({ ok:false, error:'Erro OpenAI' }, { status: 502 });
    }
    const openaiJson = await openaiRes.json();
    const reply = openaiJson.choices?.[0]?.message?.content || 'Sem resposta';
    await log('assistant', reply, { openai_usage: openaiJson.usage || null });

    // attempt to run JSON action if returned
    const actionObj = extractJsonAction(reply);
    let actionResult = null;
    if(actionObj && actionObj.action){
      try {
        if(actionObj.action === 'register_animal' && actionObj.data){
          const d = actionObj.data;
          const ins = await supabase.from('rebanho').insert([{ nome: d.nome||null, raca: d.raca||null, peso_kg: d.peso||null, data_nascimento: d.data_nascimento||null }]);
          actionResult = ins.error ? { ok:false, error: ins.error.message } : { ok:true, row: ins.data };
        } else if(actionObj.action === 'register_pastagem' && actionObj.data){
          const d = actionObj.data;
          const ins = await supabase.from('pastagem').insert([{ nome: d.nome||null, area_ha: d.area_ha||null, tipo_pasto: d.tipo_pasto||null, latitude:d.latitude||null, longitude:d.longitude||null }]);
          actionResult = ins.error ? { ok:false, error: ins.error.message } : { ok:true, row: ins.data };
        } else if(actionObj.action === 'alert_vaccination' && actionObj.data){
          // do not auto-send vaccine alerts, just log
          await supabase.from('actions').insert([{ source:'chat', action: actionObj, result: null, created_at: new Date().toISOString() }]);
          actionResult = { ok:true, note:'alert_logged' };
        } else {
          actionResult = { ok:false, error:'action_not_supported' };
        }
        // log action result
        await supabase.from('actions').insert([{ source:'chat', action: actionObj, result: actionResult, created_at: new Date().toISOString() }]);
      } catch(e:any){
        actionResult = { ok:false, error: String(e) };
      }
    }

    return NextResponse.json({ ok:true, reply, actionResult });
  } catch(e:any){
    console.error(e);
    return NextResponse.json({ ok:false, error: String(e) }, { status: 500 });
  }
}
