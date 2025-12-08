'use client'

import { useState } from 'react';

export default function PastagemPage() {
  const [nome, setNome] = useState('');
  const [area, setArea] = useState('');
  const [capim, setCapim] = useState('');
  const [data, setData] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { nome, area, capim, data };

    const res = await fetch('/api/pastagem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert('Pastagem registrada com sucesso!');
      setNome('');
      setArea('');
      setCapim('');
      setData('');
    } else {
      alert('Erro ao registrar pastagem');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cadastro de Pastagem</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da Pastagem" className="w-full p-2 border rounded" required />
        <input type="number" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Área (hectares)" className="w-full p-2 border rounded" required />
        <input type="text" value={capim} onChange={(e) => setCapim(e.target.value)} placeholder="Tipo de Capim" className="w-full p-2 border rounded" required />
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full p-2 border rounded" required />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Salvar</button>
      </form>
    </div>
  );
}



