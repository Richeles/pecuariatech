// app/lib/planos/permissoes.ts
// ÂNCORA CANÔNICA — Equação Y
// Nunca importar API aqui. Apenas regra pura.

export type PlanoNivel =
  | "basico"
  | "profissional"
  | "ultra"
  | "empresarial"
  | "premium_dominus";

export type Permissoes = {
  rebanho: boolean;
  pastagem: boolean;

  engorda_base: boolean;
  engorda_ultra: boolean;

  financeiro: boolean;
  cfo: boolean;

  esg: boolean;
  multiusuario: boolean;
};

export function permissoesDoPlano(plano: PlanoNivel): Permissoes {
  const base: Permissoes = {
    rebanho: true,
    pastagem: true,

    engorda_base: false,
    engorda_ultra: false,

    financeiro: false,
    cfo: false,

    esg: false,
    multiusuario: false,
  };

  switch (plano) {
    case "profissional":
      return {
        ...base,
        engorda_base: true,
        financeiro: true,
      };

    case "ultra":
      return {
        ...base,
        engorda_base: true,
        engorda_ultra: true,
        financeiro: true,
      };

    case "empresarial":
      return {
        ...base,
        engorda_base: true,
        engorda_ultra: true,
        financeiro: true,
        cfo: true,
        multiusuario: true,
      };

    case "premium_dominus":
      return {
        ...base,
        engorda_base: true,
        engorda_ultra: true,
        financeiro: true,
        cfo: true,
        esg: true,
        multiusuario: true,
      };

    default:
      return base;
  }
}
