// =========================================================
// PecuariaTech
// Runtime Gateway
// Equação Y + Runtime Cognitivo
// =========================================================

// =========================================================
// URL CENTRAL DO RUNTIME
// =========================================================

export const RUNTIME_URL =
  process.env.PYTHON_RUNTIME_URL ||
  "http://127.0.0.1:8000";

// =========================================================
// HEALTH CHECK
// =========================================================

export async function runtimeHealth() {
  try {

    const response = await fetch(
      `${RUNTIME_URL}/`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {

      return {
        ok: false,
        status: response.status,
      };
    }

    const data =
      await response.json();

    return {
      ok: true,
      runtime: data,
    };

  } catch (error: any) {

    return {
      ok: false,

      error:
        error?.message ||
        "runtime_unavailable",
    };
  }
}

// =========================================================
// GENERIC POST
// =========================================================

export async function runtimePost(
  endpoint: string,
  payload: any
) {

  const response = await fetch(
    `${RUNTIME_URL}${endpoint}`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(payload),

      cache: "no-store",
    }
  );

  if (!response.ok) {

    throw new Error(
      `Runtime error: ${response.status}`
    );
  }

  return response.json();
}