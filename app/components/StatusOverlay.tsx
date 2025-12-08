"use client";

type StatusConfig = {
  label: string;
  description: string;
  background: string;
};

export default function StatusOverlay() {
  // 👉 Aqui simulamos o tamanho do rebanho.
  // Depois podemos trocar esse valor por um dado vindo do banco.
  const rebanhoTotal = 120; // EXEMPLO: 120 cabeças

  let config: StatusConfig;

  if (rebanhoTotal < 50) {
    config = {
      label: "Rebanho em crescimento",
      description: "Espaço folgado e boa capacidade de expansão.",
      background:
        "radial-gradient(circle at top, rgba(52, 172, 224, 0.35), transparent 60%)",
    };
  } else if (rebanhoTotal <= 150) {
    config = {
      label: "Rebanho saudável",
      description: "Lotação equilibrada e manejo em boa condição.",
      background:
        "radial-gradient(circle at center, rgba(46, 204, 113, 0.4), transparent 65%)",
    };
  } else {
    config = {
      label: "Atenção à lotação",
      description: "Alta densidade — monitorar pastagem e ganho de peso.",
      background:
        "radial-gradient(circle at center, rgba(241, 196, 15, 0.45), transparent 65%)",
    };
  }

  return (
    <>
      {/* Camada visual sobre o fundo, sem bloquear cliques */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          mixBlendMode: "soft-light",
          background: config.background,
          zIndex: 5,
        }}
      />

      {/* Selo de status no canto superior direito */}
      <div
        style={{
          position: "fixed",
          top: 12,
          right: 16,
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.45)",
            color: "#f9fafb",
            fontSize: 12,
            fontWeight: 600,
            boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
          }}
        >
          🧠 Status visual: {config.label}
        </div>
        <div
          style={{
            marginTop: 4,
            padding: "6px 10px",
            borderRadius: 12,
            background: "rgba(0,0,0,0.35)",
            color: "#e5e7eb",
            fontSize: 11,
            maxWidth: 260,
          }}
        >
          {config.description}
        </div>
      </div>
    </>
  );
}
