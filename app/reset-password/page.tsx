// CAMINHO: app/reset-password/page.tsx
// Next.js 16 + TypeScript
// Callback oficial de redefinição de senha Supabase

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  // Garante que o token do link foi aplicado
  useEffect(() => {
    supabase.auth.getSession();
  }, []);

  async function redefinirSenha(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (senha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: senha,
    });

    setLoading(false);

    if (error) {
      setErro("Link expirado ou inválido. Solicite novo reset.");
      return;
    }

    setSucesso(true);

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#eef5ee] px-4">
      <form
        onSubmit={redefinirSenha}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-green-700">
          Redefinir senha
        </h1>

        {erro && (
          <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
            {erro}
          </div>
        )}

        {sucesso ? (
          <div className="bg-green-100 text-green-700 p-3 rounded text-sm text-center">
            Senha atualizada com sucesso. Redirecionando…
          </div>
        ) : (
          <>
            <input
              type="password"
              placeholder="Nova senha"
              className="w-full border rounded px-3 py-2"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirmar nova senha"
              className="w-full border rounded px-3 py-2"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
            >
              {loading ? "Salvando..." : "Atualizar senha"}
            </button>
          </>
        )}
      </form>
    </main>
  );
}
