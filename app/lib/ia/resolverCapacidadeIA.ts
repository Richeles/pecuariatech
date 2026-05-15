// app/lib/ia/resolverCapacidadeIA.ts
// PecuariaTech Runtime
// IA Capability Resolver
// Next.js 16 Stable Runtime
// Equação X + Equação Y + Regra Z
//
// Runtime:
// ✔ type-safe
// ✔ resiliente
// ✔ compatível com IA animal
// ✔ compatível com dashboard
// ✔ compatível com runtime premium
// ✔ PT-BR / ES-ES canonical
// ✔ sem quebra de build
// ✔ sem dependência fantasma

/* =====================================================
   TYPES
===================================================== */

export type PlanoIA =
  | "basico"
  | "profissional"
  | "ultra"
  | "empresarial"
  | "premium";

/* =====================================================
   CAPACIDADES IA
===================================================== */

export type CapacidadeIA = {

  diagnostico: boolean;

  recomendacao: boolean;

  previsao: boolean;

  analise360: boolean;

  exportacao: boolean;

  prioridadeCognitiva: number;
};

/* =====================================================
   FALLBACK
===================================================== */

const fallback:
  CapacidadeIA = {

  diagnostico: false,

  recomendacao: false,

  previsao: false,

  analise360: false,

  exportacao: false,

  prioridadeCognitiva: 0,
};

/* =====================================================
   RESOLVER
===================================================== */

export function resolverCapacidadeIA(
  plano?: string | null
): CapacidadeIA {

  const p =
    String(
      plano ??
      "basico"
    ).toLowerCase();

  /* ==========================================
     BASICO
  ========================================== */

  if (
    p === "basico"
  ) {

    return {

      diagnostico: true,

      recomendacao: false,

      previsao: false,

      analise360: false,

      exportacao: false,

      prioridadeCognitiva: 1,
    };
  }

  /* ==========================================
     PROFISSIONAL
  ========================================== */

  if (
    p === "profissional"
  ) {

    return {

      diagnostico: true,

      recomendacao: true,

      previsao: false,

      analise360: false,

      exportacao: true,

      prioridadeCognitiva: 2,
    };
  }

  /* ==========================================
     ULTRA
  ========================================== */

  if (
    p === "ultra"
  ) {

    return {

      diagnostico: true,

      recomendacao: true,

      previsao: true,

      analise360: true,

      exportacao: true,

      prioridadeCognitiva: 3,
    };
  }

  /* ==========================================
     EMPRESARIAL
  ========================================== */

  if (
    p === "empresarial"
  ) {

    return {

      diagnostico: true,

      recomendacao: true,

      previsao: true,

      analise360: true,

      exportacao: true,

      prioridadeCognitiva: 4,
    };
  }

  /* ==========================================
     PREMIUM
  ========================================== */

  if (
    p === "premium"
  ) {

    return {

      diagnostico: true,

      recomendacao: true,

      previsao: true,

      analise360: true,

      exportacao: true,

      prioridadeCognitiva: 5,
    };
  }

  /* ==========================================
     SAFE FALLBACK
  ========================================== */

  return fallback;
}