// CAMINHO: app/reset-password/page.tsx
// PecuariaTech Autônomo — Reset Password (Recovery)
// Fonte Y | Supabase oficial | Produção segura

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

  // ======================================
  // 1️⃣ CONVERTER TOKEN DA URL EM SESSÃO
  // ======================================
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
          console.error("Erro ao setar sessão:", error);
          setErro("Link inválido ou expirado.");
          return;
        }

        setSessaoValida(true);
      });
  }, []);

  // ======================================
  // 2️⃣ ATUALIZAR SENHA
  // ======================================
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
      console.error("Erro ao atualizar senha:", error);
      setErro("Erro ao atualizar a senha.");
      return;
    }

    // Sucesso total → redireciona
    router.replace("/dashboard");
  }

  // ======================================
  // UI
  // ======================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-full m
