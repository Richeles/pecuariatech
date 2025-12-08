"use client";

import { useState } from "react";

export default function RebanhoPage() {
  const [nome, setNome] = useState("");
  const [brinco, setBrinco] = useState("");
  const [raca, setRaca] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  return (
    <div className=" min-h-[100vh]" style={{ minHeight: "300px" }}>
      <h1 className=" min-h-[100vh]">Cadastro de Animal</h1>

      <div className=" min-h-[100vh]" style={{ minHeight: "300px" }}>
        <input className=" min-h-[100vh]" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input className=" min-h-[100vh]" placeholder="Brinco" value={brinco} onChange={(e) => setBrinco(e.target.value)} />
        <input className=" min-h-[100vh]" placeholder="Raça" value={raca} onChange={(e) => setRaca(e.target.value)} />
        <input className=" min-h-[100vh]" placeholder="Data de Nascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
      </div>
    </div>
  );
}


