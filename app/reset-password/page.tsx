"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ✅ CLIENTE CORRETO PARA BROWSER
import { supabase } from "@/app/lib/supabase-browser";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleReset() {
    if (loading) return;

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(
        error.message ||
          "Sessão inválida ou expirada. Solicite o reset novamente."
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h1>Definir nova senha</h1>

      <input
        type="password"
        placeholder="Nova senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          marginTop: 16,
          fontSize: 16,
        }}
      />

      {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}

      {success && (
        <p style={{ color: "green", marginTop: 12 }}>
          Senha atualizada com sucesso. Redirecionando…
        </p>
      )}

      <button
        onClick={handleReset}
        disabled={loading}
        style={{
          width: "100%",
          padding: 14,
          marginTop: 20,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Salvando..." : "Salvar nova senha"}
      </button>
    </div>
  );
}
