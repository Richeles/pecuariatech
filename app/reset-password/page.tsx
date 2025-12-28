"use client";

import { useState } from "react";
import { supabaseClient } from "@/app/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMsg(null);
    setLoading(true);

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: "https://www.pecuariatech.com/update-password",
    });

    setLoading(false);

    if (error) {
      setErro("Erro ao enviar email de recuperação.");
      return;
    }

    setMsg("Email enviado! Verifique sua caixa de entrada.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">
          Recuperar senha · PecuariaTech
        </h1>

        <input
          type="email"
          placeholder="Seu email"
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {erro && <p className="text-red-600 text-sm">{erro}</p>}
        {msg && <p className="text-green-700 text-sm">{msg}</p>}

        <button
          onClick={enviar}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:opacity-90"
        >
          {loading ? "Enviando..." : "Enviar link de recuperação"}
        </button>
      </form>
    </main>
  );
}
