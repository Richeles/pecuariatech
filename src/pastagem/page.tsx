"use client";

import { useState } from "react";

export default function PastagemPage() {
  const [nome, setNome] = useState("");
  const [area, setArea] = useState("");
  const [capim, setCapim] = useState("");
  const [ultimaRotacao, setUltimaRotacao] = useState("");

  return (
    <div className=" min-h-[100vh]" style={{ minHeight: "300px" }}>
      <h1 className=" min-h-[100vh]">Cadastro de Pastagem</h1>

      <div className=" min-h-[100vh]" style={{ minHeight: "300px" }}>
        <input className=" min-h-[100vh]" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input className=" min-h-[100vh]" placeholder="Área (hectares)" value={area} onChange={(e) => setArea(e.target.value)} />
        <input className=" min-h-[100vh]" placeholder="Tipo de capim" value={capim} onChange={(e) => setCapim(e.target.value)} />
        <input className=" min-h-[100vh]" placeholder="Última rotação" value={ultimaRotacao} onChange={(e) => setUltimaRotacao(e.target.value)} />
      </div>
    </div>
  );
}


