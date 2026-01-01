// CAMINHO: app/reset-password/page.tsx
// PecuariaTech Autônomo — Reset Password
// Next.js 16 + Supabase (fluxo oficial, sem atalho)

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessaoValida, setSessaoValida] = useState(false);

  // ===============================
  // 1️⃣ Validar sessão de recovery
  // ===============================
  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session) {
        setErro("Link inválido ou expirado.");
        return;
      }

      setSessaoValida(true);
    });
  }, []);

  // ===============================
  // 2️⃣ Atualizar senha
  // ===============================
  async function atualizarSenha() {
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
      setErro("Erro ao atualizar a senha.");
      return;
    }

    router.replace("/dashboard");
  }

  // ===============================
  // UI
  // ===============================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4 text-center">
          Definir nova senha · PecuariaTech
        </h1>

        {!sessaoValida && erro && (
          <p className="text-red-600 text-sm text-center">{erro}</p>
        )}

        {sessaoValida && (
          <>
            <input
              type="password"
              placeholder="Nova senha"
              className="w-full border rounded px-3 py-2 mb-3"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirmar senha"
              className="w-full border rounded px-3 py-2 mb-3"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
            />

            {erro && (
              <p className="text-red-600 text-sm mb-3 text-center">
                {erro}
              </p>
            )}

            <button
              onClick={atualizarSenha}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            >
              {loading ? "Atualizando..." : "Atualizar senha"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
