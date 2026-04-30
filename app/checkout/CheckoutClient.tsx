"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { getLangFromClient, t } from "@/app/lib/i18n";

export default function CheckoutClient() {
  const params = useSearchParams();
  const plano = params.get("plano");

  const lang = getLangFromClient();

  useEffect(() => {
    if (!plano) return;

    async function iniciarCheckout() {
      const res = await fetch("/api/checkout/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano }),
      });

      const data = await res.json();

      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("Erro ao iniciar pagamento");
      }
    }

    iniciarCheckout();
  }, [plano]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600 text-lg">
        {t(lang, "processando")}
      </p>
    </div>
  );
}