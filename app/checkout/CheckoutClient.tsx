// app/checkout/CheckoutClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckoutClient() {
  const params = useSearchParams();
  const plano = params.get("plano");

  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function iniciarCheckout() {
      if (!plano) {
        setErro("Plano não informado");
        return;
      }

      try {
        const res = await fetch("/api/checkout/preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plano }),
        });

        const data = await res.json();

        if (!data.init_point) {
          throw new Error("Checkout indisponível");
        }

        window.location.href = data.init_point;
      } catch (err) {
        setErro("Erro ao iniciar pagamento");
      }
    }

    iniciarCheckout();
  }, [plano]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {erro ? (
        <p className="text-red-600">{erro}</p>
      ) : (
        <p>Redirecionando para o pagamento seguro…</p>
      )}
    </div>
  );
}
