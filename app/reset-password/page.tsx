// CAMINHO: app/reset-password/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    // Garante que a sessão do reset foi carregada
    supabase.auth.getSession();
  }, []);

  async function redefinirSenha() {
    setErro("");

    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: senha,
    });

    if (error) {
      setErro(error.message);
      return;
    }

    setOk(true);

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#eef5ee]">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">
          Redefinir senha
        </h1>

        {erro && (
          <p className="text-red-600 text-sm text-center">
            {erro}
          </p>
        )}

        {ok ? (
          <p className="text-green-600 text-center">
            Senha redefinida com sucesso. Redirecionando…
          </p>
        ) : (
          <>
            <input
              type="password"
              placeholder="Nova senha"
              className="w-full border rounded px-3 py-2"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirmar nova senha"
              className="w-full border rounded px-3 py-2"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
            />

            <button
              onClick={redefinirSenha}
              className="w-full bg-green-600 text-white py-2 rounded font-semibold"
            >
              Salvar nova senha
            </button>
          </>
        )}
      </div>
    </main>
  );
}
