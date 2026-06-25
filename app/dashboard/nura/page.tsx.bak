"use client";
import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function NuraPage() {
  const [pergunta, setPergunta] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const consultar = async () => {
    const texto = pergunta.trim();
    if (!texto || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: texto, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setPergunta("");
    setLoading(true);

    try {
      const res = await fetch("/api/nura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: texto }),
      });
      const data = await res.json();
      const resposta = data.resposta || "Não foi possível obter resposta.";
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: resposta, timestamp: new Date() };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "Erro de conexão com a IA. Tente novamente.", timestamp: new Date() };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); consultar(); }
  };

  const formatResposta = (texto: string) => {
    const linhas = texto.split("\n");
    const elementos: JSX.Element[] = [];
    let lista: string[] = [];
    const finalizarLista = () => {
      if (lista.length) { elementos.push(<ul key={elementos.length} className="list-disc ml-5 space-y-1">{lista.map((item, i) => <li key={i}>{item}</li>)}</ul>); lista = []; }
    };
    linhas.forEach((linha, idx) => {
      const trimmed = linha.trim();
      if (trimmed.startsWith("•") || trimmed.startsWith("-")) lista.push(trimmed.substring(1).trim());
      else { finalizarLista(); if (trimmed === "") elementos.push(<br key={idx} />); else elementos.push(<p key={idx} className="mb-2">{linha}</p>); }
    });
    finalizarLista();
    return elementos;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-600 to-green-800 flex items-center justify-center shadow-md"><span className="text-white text-xl">🧠</span></div>
          <div><h1 className="text-xl font-bold text-gray-800">NURA – IA Pecuária</h1><p className="text-xs text-gray-500">Online • Especialista em pecuária e mercado</p></div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-5xl w-full mx-auto">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg">👋 Olá! Sou a NURA.</p>
            <p>Especialista em rebanho, pastagem, nutrição, sanidade, genética, financeiro e mercado.</p>
            <p className="mt-4">Faça sua pergunta sobre pecuária.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${msg.role === "user" ? "bg-green-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"}`}>
              <div className="font-semibold text-sm mb-1 flex items-center gap-2">{msg.role === "user" ? "👤 Você" : "🤖 NURA"}<span className="text-xs font-normal text-gray-400">{msg.timestamp.toLocaleTimeString()}</span></div>
              <div className="whitespace-pre-wrap">{msg.role === "assistant" ? formatResposta(msg.content) : msg.content}</div>
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start mb-4"><div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-5 py-3 shadow-sm flex items-center gap-2"><div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div><span className="text-gray-500">Pensando...</span></div></div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-white p-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex gap-3">
          <textarea ref={inputRef} className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" rows={2} placeholder="Digite sua pergunta... (Enter para enviar, Shift+Enter nova linha)" value={pergunta} onChange={(e) => setPergunta(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} />
          <button onClick={consultar} disabled={loading || !pergunta.trim()} className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-xl disabled:opacity-50 transition shadow-md">Enviar</button>
        </div>
        <div className="max-w-5xl mx-auto mt-2 text-xs text-gray-400"><kbd className="px-1 border rounded">Enter</kbd> enviar • <kbd className="px-1 border rounded">Shift+Enter</kbd> nova linha</div>
      </div>
    </div>
  );
}