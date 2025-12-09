"use client";

export default function CheckoutPage() {

  async function pagar(plan) {
    try {
      const res = await fetch("/api/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erro ao iniciar pagamento.");
      }
    } catch {
      alert("Erro ao conectar com Mercado Pago.");
    }
  }

  const planos = [
    { name: "Básico Mensal", price: 10 },
    { name: "Profissional Mensal", price: 30 },
    { name: "Empresarial Mensal", price: 60 },
  ];

  return (
    <main className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {planos.map((p) => (
        <button
          key={p.name}
          onClick={() => pagar(p)}
          className="p-4 bg-green-600 text-white rounded-lg"
        >
          Assinar {p.name}
        </button>
      ))}
    </main>
  );
}
