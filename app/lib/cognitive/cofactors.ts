// ========================================================
// PecuariaTech
// Cognitive Cofactors
// ========================================================

// ========================================================
// PASTAGEM
// ========================================================

export function gerarCofatorPastagem(
  data: any
) {

  return {

    origem:
      "PASTAGEM_AI",

    tipo:
      "bioestrutural",

    peso:
      Number(
        (
          data?.score_estrutural || 0
        ) / 100
      ),

    payload: {

      pressao:
        data?.pressao_bioestrutural,

      suporte:
        data?.capacidade_suporte,

      degradacao:
        data?.degradacao,
    },
  };
}

// ========================================================
// FINANCEIRO
// ========================================================

export function gerarCofatorFinanceiro(
  data: any
) {

  return {

    origem:
      "CFO_AI",

    tipo:
      "financeiro",

    peso:
      Number(
        (
          data?.score_estrutural || 0
        ) / 100
      ),

    payload: {

      roi:
        data?.margem_operacional,

      caixa:
        data?.receita,

      risco:
        data?.risco,
    },
  };
}

// ========================================================
// π EXECUTIVO
// ========================================================

export function gerarCofatorPi(
  data: any
) {

  return {

    origem:
      "PI_EXECUTIVE_AI",

    tipo:
      "governanca",

    peso:
      Number(
        data?.pi_t || 0
      ),

    payload: {

      sustentacao:
        data?.estado,

      interseccao:
        data?.interseccao_operacional,
    },
  };
}