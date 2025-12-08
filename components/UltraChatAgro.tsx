'use client'
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function UltraChatAgro(){
  const [msgs,setMsgs] = useState<any[]>([]);
  const [text,setText] = useState('');
  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      const { data } = await supabase.from('ultrachat_messages').select('*').order('created_at',{ascending:true}).limit(200);
      if (mounted) setMsgs(data || []);
    })();
    const sub = supabase.channel('realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'ultrachat_messages' }, payload => {
      setMsgs(prev => [...prev, payload.new]);
    }).subscribe();
    return ()=>{ mounted=false; supabase.removeAllChannels(); }
  },[]);

  async function send(){
    if(!text) return;
    await supabase.from('ultrachat_messages').insert([{ user_name: 'web', content: text }]);
    setText('');
  }

  return (
    <div style={{border:'1px solid #ddd',padding:12,borderRadius:8}} style={{ minHeight: "300px" }}>
      <div style={{maxHeight:300,overflow:'auto'}} style={{ minHeight: "300px" }}>
        {msgs.map((m:any)=> <div key={m.id} style={{ minHeight: "300px" }}><b>{m.user_name}</b>: {m.content}</div> )}
      </div>
      <div style={{display:'flex',gap:8,marginTop:8}} style={{ minHeight: "300px" }}>
        <input value={text} onChange={e=>setText(e.target.value)} style={{flex:1}} />
        <button onClick={send}>Enviar</button>
      </div>
    </div>
  );
}










