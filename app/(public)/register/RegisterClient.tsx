"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase-browser";

export default function RegisterClient() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pais, setPais] = useState("");

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const nome = formData.get("nome") as string;
    const email = formData.get("email") as string;
    const senha = formData.get("senha") as string;
    const segmento = formData.get("segmento") as string;
    const telefone = formData.get("telefone") as string;
    const documento = formData.get("documento") as string;

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha.trim(),
      options: {
        data: {
          nome_completo: nome,
          pais,
          segmento_pecuario: segmento,
          telefone: telefone || null,
          documento: documento || null,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/login?confirm=true");
  }

  return (
    <div className="w-full max-w-xl bg-white p-10 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        Cadastro Profissional Internacional
      </h1>

      <form onSubmit={handleRegister} className="space-y-4">

        <input
          name="nome"
          required
          placeholder="Nome completo"
          className="w-full border p-3 rounded-lg"
        />

        <input
          name="email"
          required
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-lg"
        />

        <input
          name="senha"
          required
          type="password"
          placeholder="Senha"
          className="w-full border p-3 rounded-lg"
        />

        {/* País ISO */}
        <select
          required
          value={pais}
          onChange={(e) => setPais(e.target.value)}
          className="w-full border p-3 rounded-lg"
        >
          <option value="">Selecione o País</option>
          <option value="BR">Brasil</option>
          <option value="US">Estados Unidos</option>
          <option value="AR">Argentina</option>
          <option value="MX">México</option>
          <option value="CO">Colômbia</option>
          <option value="UY">Uruguai</option>
          <option value="CL">Chile</option>
          <option value="PY">Paraguai</option>
        </select>

        <select
          name="segmento"
          required
          className="w-full border p-3 rounded-lg"
        >
          <option value="">Segmento Pecuário</option>
          <option value="corte">Corte</option>
          <option value="leite">Leite</option>
          <option value="misto">Misto</option>
          <option value="consultor">Consultor</option>
          <option value="veterinario">Veterinário</option>
        </select>

        <input
          name="telefone"
          placeholder="Telefone (com DDI)"
          className="w-full border p-3 rounded-lg"
        />

        {/* Documento condicional (Brasil obrigatório) */}
        {pais === "BR" && (
          <input
            name="documento"
            required
            placeholder="CPF ou CNPJ"
            className="w-full border p-3 rounded-lg"
          />
        )}

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-semibold"
        >
          {loading ? "Criando conta..." : "Criar Conta"}
        </button>

      </form>
    </div>
  );
}