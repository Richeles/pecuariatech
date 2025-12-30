"use client";

import { useSearchParams } from "next/navigation";

export default function CheckoutClient() {
  const params = useSearchParams();

  const plano = params.get("plano");
  const periodo = params.get("periodo");
  const preco = params.get("preco");

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Checkout · PecuariaTech</h1>

      <ul className="space-y-2 text-gray-700">
        <li><strong>Plano:</strong> {plano}</li>
        <li><strong>Período:</strong> {periodo}</li>
        <li><strong>Preço:</strong> {preco}</li>
      </ul>

      {/* Aqui entra o botão Mercado Pago depois */}
    </div>
  );
}
