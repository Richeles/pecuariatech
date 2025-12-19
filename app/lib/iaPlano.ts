// app/lib/iaPlano.ts
// Resolver oficial de capacidades da IA por plano

export type PlanoIA =
  | "trial"
  | "basico"
  | "profissional"
  | "ultra"
  | "empresarial"
  | "dominus";

export function resolverCapacidadeIA(plano: PlanoIA) {
  switch (plano) {
    case "dominus":
      return {
        iaLote: true,
        iaAnimal: true,
        ipP: true,
        alertasInteligentes: true,
        recomendacao: true,
        laudoCompleto: true,
        preditiva: true,
        simulacaoFinanceira: true,
      };

    case "empresarial":
      return {
        iaLote: true,
        iaAnimal: true,
        ipP: true,
        alertasInteligentes: true,
        recomendacao: true,
        laudoCompleto: false,
        preditiva: false,
        simulacaoFinanceira: false,
      };

    case "ultra":
      return {
        iaLote: true,
        iaAnimal: false,
        ipP: true,
        alertasInteligentes: true,
        recomendacao: true,
        laudoCompleto: false,
        preditiva: false,
        simulacaoFinanceira: false,
      };

    case "profissional":
      return {
        iaLote: false,
        iaAnimal: false,
        ipP: true, // Índice PecuariaTech
        alertasInteligentes: true,
        recomendacao: false,
        laudoCompleto: false,
        preditiva: false,
        simulacaoFinanceira: false,
      };

    default:
      return {
        iaLote: false,
        iaAnimal: false,
        ipP: false,
        alertasInteligentes: false,
        recomendacao: false,
        laudoCompleto: false,
        preditiva: false,
        simulacaoFinanceira: false,
      };
  }
}
