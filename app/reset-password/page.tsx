// CAMINHO: app/reset-password/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 🔐 garante que o token do Supabase seja consumido
  useEffect(() => {
    supabase.auth.getSession();
  }, []);

  async function handleReset() {
    setError(null);

    if (!password || password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError("Link inválido ou expirado.");
      return;
    }

    setSuccess(true);

    // 🔁 redireciona somente após sucesso real
    setTimeout(() => {
      router.replace("/login");
    }, 2000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4 text-center">
          Definir nova senha · PecuariaTech
        </h1>

        <input
          type="password"
          placeholder="Nova senha"
          className="w-full border p-2 rounded mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmar senha"
          className="w-full border p-2 rounded mb-3"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && (
          <p className="text-red-600 text-sm mb-2">{error}</p>
        )}

        {success && (
          <p className="text-green-600 text-sm mb-2">
            Senha atualizada com sucesso. Redirecionando…
          </p>
        )}

        <button
          onClick={handleReset}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Atualizar senha
        </button>
      </div>
    </div>
  );
}
