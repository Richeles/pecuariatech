// app/dashboard/page.tsx
// Next.js 16 + TypeScript strict

"use client";

import { useEffect } from "react";
import { supabase } from "@/app/lib/supabase";

export default function DashboardPage() {
  useEffect(() => {
    const vincularAssinatura = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) return;

      await fetch("/api/assinaturas/vincular", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    };

    vincularAssinatura();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">
        Dashboard PecuariaTech
      </h1>

      <p className="mt-4 text-gray-600">
        Bem-vindo ao seu painel de controle.
      </p>
    </main>
  );
}
