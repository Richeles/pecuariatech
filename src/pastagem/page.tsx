"use client";

import { useState } from "react";

export default function PastagemPage() {
  const [nome, setNome] = useState("");
  const [area, setArea] = useState("");
  const [capim, setCapim] = useState("");
  const [ultimaRotacao, setUltimaRotacao] = useState("");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cadastro de Pastagem</h1>

      <div className="space-y-3">
        <input className="text-black p-2 rounded" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input className="text-black p-2 rounded" placeholder="Área (hectares)" value={area} onChange={(e) => setArea(e.target.value)} />
        <input className="text-black p-2 rounded" placeholder="Tipo de capim" value={capim} onChange={(e) => setCapim(e.target.value)} />
        <input className="text-black p-2 rounded" placeholder="Última rotação" value={ultimaRotacao} onChange={(e) => setUltimaRotacao(e.target.value)} />
      </div>
    </div>
  );
}
