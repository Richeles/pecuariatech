"use client";
import React from 'react';

export default function UltraBiologico2() {
  async function generate(p:any){
    try {
      const r1 = await fetch('/api/clima?lat=&lon=');
      const cj = await r1.json();
      const r2 = await fetch('/api/autonomo', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ pasture: p, climate: cj.data }) 
      });
      const j = await r2.json();
      console.log('Resultado:', j);
    } catch(e){
      console.error('Erro ao gerar dados:', e);
    }
  }

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold text-green-700'>UltraBiológico 2</h1>
      <button onClick={() => generate('pastagemTeste')} className='mt-4 bg-green-500 text-white p-2 rounded'>
        Gerar Dados Biológicos
      </button>
    </div>
  );
}


