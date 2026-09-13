"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getLangFromClient, t } from "@/app/lib/i18n";

export default function CheckoutClient() {
  const params = useSearchParams();
  const lang = getLangFromClient();
  const plano = params.get("plano");
  const periodo = params.get("periodo");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function iniciarCheckout() {
      if (!plano || !periodo) {
        window.location.href = "/planos";
        return;
      }

      try {
        setErro(null);

        const response = await fetch("/api/checkout/preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plano, periodo }),
          credentials: "include",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.init_point) {
          console.error("[CHECKOUT_ERROR]", data);

          if (response.status === 401) {
            const encodedNext = encodeURIComponent(
              `/checkout?plano=${encodeURIComponent(plano)}&periodo=${encodeURIComponent(periodo)}`
            );

            window.location.href = `/${lang}/login?next=${encodedNext}`;
            return;
          }

          setErro(
            data?.detalhe ||
              data?.message ||
              data?.error ||
              "Não foi possível iniciar o checkout."
          );
          return;
        }

        window.location.href = data.init_point;
      } catch (err) {
        console.error("[CHECKOUT_FATAL]", err);

        setErro(
          "Não foi possível iniciar o checkout. Verifique sua conexão e tente novamente."
        );
      }
    }

    iniciarCheckout();
  }, [plano, periodo, lang]);

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900">
            Não foi possível iniciar o pagamento
          </h1>

          <p className="mt-3 text-sm text-neutral-600">
            {erro}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-lg text-neutral-600">
        {t(lang, "processando")}
      </p>
    </div>
  );
}
