"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { getLangFromClient, t } from "@/app/lib/i18n";

export default function CheckoutClient() {
  const params = useSearchParams();
  const lang = getLangFromClient();
  const plano = params.get("plano");
  const periodo = params.get("periodo");

  useEffect(() => {
    async function iniciarCheckout() {
      if (!plano || !periodo) {
        window.location.href = "/planos";
        return;
      }

      try {
        const response = await fetch("/api/checkout/preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plano, periodo }),
        });

        const data = await response.json();

        if (!response.ok || !data.init_point) {
          console.error("[CHECKOUT_ERROR]", data);
          if (response.status === 401) {
            const encodedNext = encodeURIComponent(`/checkout?plano=${plano}&periodo=${periodo}`);
            window.location.href = `/${lang}/login?next=${encodedNext}`;
          } else {
            window.location.href = "/planos";
          }
          return;
        }

        window.location.href = data.init_point;
      } catch (err) {
        console.error("[CHECKOUT_FATAL]", err);
        window.location.href = "/planos";
      }
    }

    iniciarCheckout();
  }, [plano, periodo, lang]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-lg text-neutral-600">{t(lang, "processando")}</p>
    </div>
  );
}