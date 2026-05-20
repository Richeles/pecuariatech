// ========================================================
// PecuariaTech
// Cognitive Triangle Runtime
// ========================================================

export interface Cofator {

  origem: string;

  tipo: string;

  peso: number;

  payload: any;
}

// ========================================================
// TRIANGULAR ENGINE
// ========================================================

export function triangularCofatores(
  cofatores: Cofator[]
) {

  if (!cofatores?.length) {

    return {

      pi_t: 0,

      estado:
        "sem_dados",

      cofatores: [],
    };
  }

  // ====================================================
  // SCORE
  // ====================================================

  const soma = cofatores.reduce(

    (
      acc,
      atual
    ) => {

      return (
        acc +
        atual.peso
      );
    },

    0
  );

  const media =
    soma / cofatores.length;

  // ====================================================
  // ESTADO π
  // ====================================================

  let estado =
    "estavel";

  if (media < 0.4) {

    estado =
      "deterioracao";
  }

  else if (
    media >= 0.4 &&
    media < 0.7
  ) {

    estado =
      "transicao";
  }

  else {

    estado =
      "sustentacao";
  }

  // ====================================================
  // RESULTADO
  // ====================================================

  return {

    pi_t:
      Number(
        media.toFixed(2)
      ),

    estado,

    cofatores,
  };
}