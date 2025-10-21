"use client";

import { useState } from "react";

export default function RebanhoPage() {
  const [nome, setNome] = useState("");
  const [brinco, setBrinco] = useState("");
  const [raca, setRaca] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Animal cadastrado:
    🐄 Nome: ${nome}
    🏷️ Brinco: ${brinco}
    🐮 Raça: ${raca}
    🎂 Data de Nascimento: ${dataNascimento}`);
    
    setNome("");
    setBrinco("");
    setRaca("");
    setDataNascimento("");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Cadastro de Animais 🐄</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block font-medium">Nome do Animal</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Número do Brinco</label>
          <input
            type="text"
            value={brinco}
            onChange={(e) => setBrinco(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Raça</label>
          <input
            type="text"
            value={raca}
            onChange={(e) => setRaca(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Data de Nascimento</label>
          <input
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Cadastrar Animal
        </button>
      </form>
    </div>
  );
}



