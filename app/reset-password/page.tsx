// CAMINHO: app/reset-password/page.tsx
// PecuariaTech Autônomo — Reset Password (Recovery)
// Compatível com Next.js 16 + Turbopack

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessaoValida, setSessaoValida] = useState(false);

  // ===============================
  // 1️⃣ Converter token em sessão
  // ===============================
  useEffect(() => {
    const hash = window.location.hash;

    if (!hash) {
      setErro("Link inválido ou expirado.");
      return;
    }

    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const type = params.get("type");

    if (!access_token || !refresh_token || type !== "recovery") {
      setErro("Link inválido ou expirado.");
      return;
    }

    supabase.auth
      .setSession({
        access_token,
        refresh_token,
      })
      .then(({ error }) => {
        if (error) {
          console.error(error);
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
      console.error(error);
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
          <p className="text-red-600 text-sm text-center mb-3">
            {erro}
          </p>
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
