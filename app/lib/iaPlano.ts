// app/lib/iaPlano.ts
// Resolver de capacidades da IA por plano

export type PlanoIA = "trial" | "basico" | "profissional" | "ultra" | "dominus";

export function resolverCapacidadeIA(plano: PlanoIA) {
  switch (plano) {
    case "dominus":
      return {
        iaLote: true,
        iaAnimal: true,
        score: true,
        alerta: true,
        recomendacao: true,
        laudoCompleto: true,
      };

    case "ultra":
      return {
        iaLote: true,
        iaAnimal: false,
        score: true,
        alerta: true,
        recomendacao: true,
        laudoCompleto: false,
      };

    default:
      return {
        iaLote: false,
        iaAnimal: false,
        score: false,
        alerta: false,
        recomendacao: false,
        laudoCompleto: false,
      };
  }
}
