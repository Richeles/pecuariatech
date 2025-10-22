﻿ï»¿"use client";

import { useState } from "react";

export default function PastagemPage() {
  const [nome, setNome] = useState("");
  const [area, setArea] = useState("");
  const [capim, setCapim] = useState("");
  const [ultimaRotacao, setUltimaRotacao] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Ã°Å¸Å’Â¿ Pastagem cadastrada com sucesso:
    Ã°Å¸â€œÂ Nome: ${nome}
    Ã°Å¸â€œÂ ÃƒÂrea: ${area} hectares
    Ã°Å¸Å’Â¾ Tipo de capim: ${capim}
    Ã°Å¸â€œâ€¦ ÃƒÅ¡ltima rotaÃƒÂ§ÃƒÂ£o: ${ultimaRotacao}`);

    // resetar campos
    setNome("");
    setArea("");
    setCapim("");
    setUltimaRotacao("");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Ã°Å¸Å’Â¿ Cadastro de Pastagem</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block font-medium">Nome da Pastagem</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">ÃƒÂrea (hectares)</label>
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Tipo de Capim</label>
          <input
            type="text"
            value={capim}
            onChange={(e) => setCapim(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">ÃƒÅ¡ltima RotaÃƒÂ§ÃƒÂ£o</label>
          <input
            type="date"
            value={ultimaRotacao}
            onChange={(e) => setUltimaRotacao(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
        >
          Cadastrar Pastagem
        </button>
      </form>
    </div>
  );
}




