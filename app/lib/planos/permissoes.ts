// app/lib/planos/permissoes.ts
// ÂNCORA CANÔNICA DE PERMISSÕES POR PLANO
// Equação Y: Plano → Permissões (DERIVADO)
// Triângulo 360: Operacional + Financeiro + Estratégico

export type PlanoInterno = "basico" | "pro" | "premium";

export type PermissoesPlano = {
  // Módulos base
  rebanho: boolean;
  pastagem: boolean;

  // Engorda
  engorda_base: boolean;
  engorda_ultra: boolean;

  // Financeiro
  financeiro: boolean;
  cfo: boolean;

  // Estratégico
  esg: boolean;

  // SaaS
  multiusuario: boolean;
};

// 🎯 FONTE ÚNICA DA VERDADE
export function getPermissoes(plano: PlanoInterno): PermissoesPlano {
  const base: PermissoesPlano = {
    rebanho: true,
    pastagem: true,

    engorda_base: false,
    engorda_ultra: false,

    financeiro: false,
    cfo: false,

    esg: false,
    multiusuario: false,
  };

  if (plano === "pro") {
    return {
      ...base,
      engorda_base: true,
      financeiro: true,
    };
  }

  if (plano === "premium") {
    return {
      ...base,
      engorda_base: true,
      engorda_ultra: true,
      financeiro: true,
      cfo: true,
      esg: true,
      multiusuario: true,
    };
  }

  return base;
}
