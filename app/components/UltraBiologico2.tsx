'use client';
import React, { useEffect, useState } from 'react';

export default function UltraBiologico2(){
  const [state, setState] = useState<any>(null);

  useEffect(()=>{ (async ()=> {
    try {
      const r = await fetch('/api/ultrabiologico');
      if (r.ok) setState(await r.json());
    } catch(e) {}
  })(); }, []);

  async function generate(p:any){
    try {
      const r1 = await fetch(/api/clima?lat=&lon=);
      const cj = await r1.json();
      const r2 = await fetch('/api/autonomo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ pasture: p, climate: cj.data }) });
      const j = await r2.json();
      if (r2.ok) { alert('Recomendação gerada'); const r = await fetch('/api/ultrabiologico'); setState(await r.json()); }
      else alert('Erro: ' + (j.error||''));
    } catch(e) { alert('Falha ao gerar recomendação'); }
  }

  if (!state) return <div>Carregando dados biológicos...</div>;

  return (
    <div className='space-y-3'>
      <div className='bg-white p-3 rounded shadow'>
        <h3 className='font-bold'>Resumo</h3>
        <pre className='text-xs'>{JSON.stringify({ rebanhoCount: state.rebanho?.length||0, pastagemCount: state.pastagem?.length||0 }, null, 2)}</pre>
      </div>

      <div className='bg-white p-3 rounded shadow'>
        <h3 className='font-bold'>Pastagens (amostra)</h3>
        <ul className='text-sm'>
          {(state.pastagem||[]).slice(0,6).map((p:any,i:number)=>(
            <li key={i}>{p.nome} - {p.area_ha} ha
              <button onClick={()=>generate(p)} className='ml-2 text-xs bg-emerald-600 text-white px-2 rounded'>Gerar recomendação</button>
            </li>
          ))}
        </ul>
      </div>

      {state.suggestedActions && state.suggestedActions.length > 0 && (
        <div className='bg-white p-3 rounded shadow'>
          <h3 className='font-bold'>Ações Sugeridas</h3>
          <ul className='text-sm'>{state.suggestedActions.map((a:string,i:number)=>(<li key={i}>{a}</li>))}</ul>
        </div>
      )}
    </div>
  );
}
