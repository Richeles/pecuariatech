"use client";

import { useState } from "react";

type PlanoInfo = {
  uuid: string;
  nome: string;
  descricao: string;
  destaque?: string;
};

const PLANOS: PlanoInfo[] = [
  // 🔹 MENSAL
  {
    uuid: "COLOQUE_AQUI_O_UUID_DO_PLANO_BASICO_MENSAL",
    nome: "Básico Mensal",
    descricao: "Para começar a testar a PecuariaTech.",
    destaque: "5 dias grátis + mensal",
  },
  {
    uuid: "COLOQUE_AQUI_O_UUID_DO_PLANO_PROFISSIONAL_MENSAL",
    nome: "Profissional Mensal",
    descricao: "Para fazendas em crescimento e manejo mais avançado.",
    destaque: "Mais controle do rebanho",
  },
  {
    uuid: "COLOQUE_AQUI_O_UUID_DO_PLANO_EMPRESARIAL_MENSAL",
    nome: "Empresarial Mensal",
    descricao: "Para grandes operações e pecuária de escala.",
    destaque: "Fazendas com alto volume",
  },

  // 🔹 TRIMESTRAL
  {
    uuid: "COLOQUE_AQUI_O_UUID_DO_PLANO_BASICO_TRIMESTRAL",
    nome: "Básico Trimestral",
    descricao: "Economia para quem já decidiu ficar mais tempo.",
  },
  {
    uuid: "COLOQUE_AQUI_O_UUID_DO_PLANO_PROFISSIONAL_TRIMESTRAL",
    nome: "Profissional Trimestral",
    descricao: "Ideal para acompanhamento de safra e ciclo de pasto.",
  },
  {
    uuid: "COLOQUE_AQUI_O_UUID_DO_PLANO_EMPRESARIAL_TRIMESTRAL",
    nome: "Empresarial Trimestral",
    descricao: "Planejamento estratégico da fazenda no trimestre.",
  },

  // 🔹 ANUAL
  {
    uuid: "COLOQUE_AQUI_O_UUID_DO_PLANO_BASICO_ANUAL",
    nome: "Básico Anual",
    descricao: "Plano econômico para pequenas propriedades.",
  },
  {
    uuid: "COLOQUE_AQUI_O_UUID_DO_PLANO_PROFISSIONAL_ANUAL",
    nome: "Profissional Anual",
    descricao: "Para gestão profissional o ano todo.",
  },
  {
    uuid: "COLOQUE_AQUI_O_UUID_DO_PLANO_EMPRESARIAL_ANUAL",
    nome: "Empresarial Anual",
    descricao: "Pecuária em alto nível, o ano inteiro.",
  },
];

export default function CheckoutPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleCheckout(planoUuid: string) {
    try {
      setLoadingId(planoUuid);

      const res = await fetch("/api/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano_id: planoUuid }),
      });

      if (!res.ok) {
        console.error("Erro na resposta da API", await res.text());
        alert("Erro ao iniciar o pagamento. Tente novamente.");
        return;
      }

      const data = await res.json();

      if (data?.url) {
        // Redireciona para o checkout seguro do Mercado Pago
        window.location.href = data.url;
      } else {
        console.error("Resposta sem URL:", data);
        alert("Não foi possível abrir o checkout. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro no checkout:", error);
      alert("Erro inesperado ao criar o pagamento.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <main
      style={{
        padding: 32,
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        Escolha seu plano e assine 🚀
      </h1>

      <p style={{ marginBottom: 24, fontSize: 16 }}>
        Você será redirecionado para o{" "}
        <strong>checkout seguro do Mercado Pago</strong>. Depois da confirmação,
        seu acesso à PecuariaTech é liberado automaticamente.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {PLANOS.map((plano) => (
          <div
            key={plano.uuid}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              background: "#ffffffcc",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              {plano.nome}
            </h2>

            {plano.destaque && (
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#166534",
                  background: "#dcfce7",
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: 999,
                  marginBottom: 8,
                }}
              >
                {plano.destaque}
              </div>
            )}

            <p style={{ fontSize: 14, marginBottom: 12 }}>{plano.descricao}</p>

            <button
              onClick={() => handleCheckout(plano.uuid)}
              disabled={!!loadingId}
              style={{
                width: "100%",
                background:
                  plano.nome.toLowerCase().includes("empresarial")
                    ? "#0f172a"
                    : plano.nome.toLowerCase().includes("profissional")
                    ? "#1d4ed8"
                    : "#16a34a",
                color: "white",
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                fontSize: 15,
                fontWeight: 600,
                cursor: loadingId ? "not-allowed" : "pointer",
                opacity: loadingId ? 0.7 : 1,
              }}
            >
              {loadingId === plano.uuid
                ? "Redirecionando..."
                : "Assinar este plano"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
