"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase-browser";

export default function RegisterClient() {
  const router = useRouter();

  const [pais, setPais] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const nome = form.get("nome") as string;
    const email = form.get("email") as string;
    const senha = form.get("senha") as string;
    const sistema_produtivo = form.get("sistema_produtivo") as string;
    const funcao = form.get("funcao") as string;
    const telefone = form.get("telefone") as string;
    const documento = form.get("documento") as string;

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          perfil: "pecuarista",
          nome,
          pais,
          sistema_produtivo,
          funcao,
          telefone,
          tipo_documento: tipoDocumento,
          documento,
        },
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
    <div className="w-full max-w-xl bg-emerald-50/95 backdrop-blur-xl p-10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] border border-emerald-200">

      <h1 className="text-3xl font-bold mb-8 text-center text-emerald-800 tracking-tight">
        Cadastro PecuariaTech
      </h1>

      <form onSubmit={handleRegister} className="space-y-5">

        <input
          name="nome"
          required
          placeholder="Nome completo"
          className="w-full bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/40 p-3 rounded-xl transition outline-none"
        />

        <input
          name="email"
          required
          type="email"
          placeholder="Email"
          className="w-full bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/40 p-3 rounded-xl transition outline-none"
        />

        <input
          name="senha"
          required
          type="password"
          placeholder="Senha"
          className="w-full bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/40 p-3 rounded-xl transition outline-none"
        />

        <select
          required
          value={pais}
          onChange={(e) => setPais(e.target.value)}
          className="w-full bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/40 p-3 rounded-xl transition outline-none"
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
          name="sistema_produtivo"
          required
          className="w-full bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/40 p-3 rounded-xl transition outline-none"
        >
          <option value="">Sistema Produtivo</option>
          <option value="corte">Corte</option>
          <option value="leite">Leite</option>
          <option value="misto">Misto</option>
        </select>

        <select
          name="funcao"
          className="w-full bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/40 p-3 rounded-xl transition outline-none"
        >
          <option value="">Função (opcional)</option>
          <option value="proprietario">Proprietário</option>
          <option value="gerente">Gerente</option>
          <option value="consultor">Consultor</option>
          <option value="veterinario">Veterinário</option>
        </select>

        <select
          required
          value={tipoDocumento}
          onChange={(e) => setTipoDocumento(e.target.value)}
          className="w-full bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/40 p-3 rounded-xl transition outline-none"
        >
          <option value="">Tipo de Documento</option>
          <option value="cpf">CPF</option>
          <option value="cnpj">CNPJ</option>
        </select>

        <input
          name="documento"
          required
          placeholder="Digite o CPF ou CNPJ"
          className="w-full bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/40 p-3 rounded-xl transition outline-none"
        />

        <input
          name="telefone"
          placeholder="Telefone (com DDI)"
          className="w-full bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/40 p-3 rounded-xl transition outline-none"
        />

        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 to-green-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:scale-[1.02] transition disabled:opacity-60"
        >
          {loading ? "Criando conta..." : "Criar Conta"}
        </button>

      </form>
    </div>
  );
}