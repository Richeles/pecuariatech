"use client";

import { useState } from "react";

export default function RebanhoPage() {
  const [nome, setNome] = useState("");
  const [brinco, setBrinco] = useState("");
  const [raca, setRaca] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cadastro de Animal</h1>

      <div className="space-y-3">
        <input className="text-black p-2 rounded" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input className="text-black p-2 rounded" placeholder="Brinco" value={brinco} onChange={(e) => setBrinco(e.target.value)} />
        <input className="text-black p-2 rounded" placeholder="Raça" value={raca} onChange={(e) => setRaca(e.target.value)} />
        <input className="text-black p-2 rounded" placeholder="Data de Nascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
      </div>
    </div>
  );
}
