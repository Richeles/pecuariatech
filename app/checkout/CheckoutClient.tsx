// app/checkout/CheckoutClient.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CheckoutClient() {
  const params = useSearchParams();
  const plano = params.get("plano");

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
        Redirecionando para o pagamento seguro…
      </p>
    </div>
  );
}
