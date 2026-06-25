// app/lib/planos.ts
export function getModulesForPlan(plano?: string | null): string[] {
  const base = ["", "/financeiro", "/rebanho", "/pastagem"];

  // ✅ MASTER – acesso total (para administradores)
  if (plano === "master") {
    return [
      ...base,
      "/engorda",
      "/cfo",
      "/planilha-operacional",
      "/linha-do-tempo",
      "/equipes",
      "/multi",
      "/relatorios-avancados",
    ];
  }

  switch (plano?.toLowerCase()) {
    case "profissional":
      return [...base, "/relatorios", "/alertas"];
    case "ultra":
      return [...base, "/engorda", "/cfo", "/planilha-operacional", "/linha-do-tempo"];
    case "empresarial":
      return [...base, "/engorda", "/cfo", "/planilha-operacional", "/linha-do-tempo", "/equipes", "/multi"];
    case "dominus":
      return [
        ...base,
        "/engorda",
        "/cfo",
        "/planilha-operacional",
        "/linha-do-tempo",
        "/equipes",
        "/multi",
        "/relatorios-avancados",
      ];
    default:
      return base; // básico
  }
}