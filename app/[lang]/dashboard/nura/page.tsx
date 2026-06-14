"use client";
import { useState } from "react";

export default function NuraPage() {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [loading, setLoading] = useState(false);

  async function consultar() {
    if (!pergunta.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/nura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta }),
      });
      const data = await res.json();
      setResposta(data.resposta || "Erro ao obter resposta.");
    } catch (err) {
      setResposta("Erro de conexão com a IA.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-green-700">🧠 NURA – Assistente IA</h1>
      <textarea
        className="w-full mt-4 p-2 border rounded"
        rows={3}
        placeholder="Ex.: Como melhorar a pastagem na seca?"
        value={pergunta}
        onChange={(e) => setPergunta(e.target.value)}
      />
      <button
        onClick={consultar}
        disabled={loading}
        className="mt-2 bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Pensando..." : "Consultar NURA"}
      </button>
      {resposta && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <strong>Resposta:</strong>
          <p className="whitespace-pre-wrap">{resposta}</p>
        </div>
      )}
    </div>
  );
}
