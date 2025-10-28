'use client';
import React, { useEffect, useRef, useState } from 'react';

type Msg = { role: 'user'|'assistant'|'system'; text: string; ts?: string };

export default function UltraChat(){
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement|null>(null);

  useEffect(()=>{ (async ()=> {
    try {
      const r = await fetch('/api/chat');
      if (r.ok) {
        const j = await r.json();
        setMessages(j.messages || []);
      }
    } catch(e) {}
  })(); }, []);

  useEffect(()=>{ boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  async function sendMessage(){
    if (!text.trim()) return;
    const user: Msg = { role: 'user', text: text.trim(), ts: new Date().toISOString() };
    setMessages((m: Msg[]) => [...m, user]);
    setText(''); setLoading(true);
    try {
      const r = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: user.text }) });
      const j = await r.json();
      if (r.ok && j.reply) {
        setMessages((m: Msg[]) => [...m, { role:'assistant', text: j.reply, ts: new Date().toISOString() }]);
        if (j.actionResult) setMessages((m: Msg[]) => [...m, { role:'system', text: 'AÃƒÂ§ÃƒÂ£o: ' + JSON.stringify(j.actionResult), ts: new Date().toISOString() }]);
      } else {
        setMessages((m: Msg[]) => [...m, { role:'assistant', text: 'Erro: ' + (j.error || 'sem resposta'), ts: new Date().toISOString() }]);
      }
    } catch(e) {
      setMessages((m: Msg[]) => [...m, { role:'assistant', text: 'Erro de conexÃƒÂ£o', ts: new Date().toISOString() }]);
    } finally { setLoading(false); }
  }

  return (
    <div className='flex flex-col h-[520px]'>
      <div ref={boxRef} className='flex-1 overflow-y-auto p-3 bg-white rounded space-y-2'>
        {messages.length === 0 && <div className='text-gray-400 text-center'>Nenhuma mensagem ainda</div>}
        {messages.map((m,i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={m.role === 'user' ? 'inline-block bg-emerald-600 text-white px-3 py-1 rounded' : 'inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded'}>
              {m.text}
            </div>
            <div className='text-xs text-gray-400 mt-1'>{m.ts ? new Date(m.ts).toLocaleString() : ''}</div>
          </div>
        ))}
      </div>
      <div className='flex gap-2 mt-2'>
        <textarea rows={2} value={text} onChange={e=>setText(e.target.value)} className='flex-1 border rounded p-2' placeholder='Pergunte ao UltraChat' />
        <button onClick={sendMessage} disabled={loading||!text.trim()} className='bg-emerald-600 text-white px-3 py-1 rounded'>{loading ? '...' : 'Enviar'}</button>
      </div>
    </div>
  );
}









