"use client";

import { useEffect, useState } from "react";

export default function RebanhoPage() {

  const [animais, setAnimais] = useState([]);

  async function carregarDados() {
    const res = await fetch("/api/animais");
    const data = await res.json();
    setAnimais(data);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>🐂 Registro de Rebanho</h1>

      {animais.length === 0 ? (
        <p>Carregando...</p>
      ) : (
        <table style={{ marginTop: 20, borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Brinco</th>
              <th>Raça</th>
              <th>Sexo</th>
              <th>Peso</th>
              <th>Piquete</th>
            </tr>
          </thead>
          <tbody>
            {animais.map((a, i) => (
              <tr key={i}>
                <td>{a.brinco}</td>
                <td>{a.raca}</td>
                <td>{a.sexo}</td>
                <td>{a.peso}</td>
                <td>{a.piquete}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
