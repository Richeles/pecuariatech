// app/lib/checkout/context.ts

export interface CheckoutContext {

  plano: string;

  periodo: string;

  lang: string;

  origem?: string;

  createdAt: number;
}

const KEY =
  "pecuariatech_checkout_context";

/* =====================================================
   SAVE
===================================================== */

export function saveCheckoutContext(
  data: CheckoutContext
) {

  if (
    typeof window ===
    "undefined"
  ) {

    return;
  }

  localStorage.setItem(
    KEY,
    JSON.stringify(data)
  );
}

/* =====================================================
   GET
===================================================== */

export function getCheckoutContext():
  | CheckoutContext
  | null {

  if (
    typeof window ===
    "undefined"
  ) {

    return null;
  }

  try {

    const raw =
      localStorage.getItem(KEY);

    if (!raw) {

      return null;
    }

    return JSON.parse(raw);

  } catch {

    return null;
  }
}

/* =====================================================
   CLEAR
===================================================== */

export function clearCheckoutContext() {

  if (
    typeof window ===
    "undefined"
  ) {

    return;
  }

  localStorage.removeItem(KEY);
}