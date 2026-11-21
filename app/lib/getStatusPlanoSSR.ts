// =========================================================
// PECUARIATECH — GATE SSR DE BENEFÍCIOS
// Next.js 16 | ESR + Triângulo Espelhado 360°
// =========================================================

export type StatusPlanoResp = {
  ativo: boolean;
  plano: string;
  nivel: number;
  expires_at: string | null;
  beneficios: Record<string, boolean>;
  origem?: string | null;
  degraded?: boolean;
};

export const BENEFICIOS_FALLBACK: Record<string, boolean> = {
  all: false,
  rebanho: false,
  pastagem: false,
  engorda_base: false,
  engorda_ultra: false,
  financeiro: false,
  financeiro_profissional: false,
  financeiro_ultra: false,
  cfo: false,
  cfo_ultra: false,
  motor_pi: false,
  esg: false,
  multiusuario: false,
};

export type BeneficioPlano = keyof typeof BENEFICIOS_FALLBACK;

const HOSTS_LOCAIS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "[::1]",
]);

function hostCanonico(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function portaEfetiva(url: URL): string {
  if (url.port) return url.port;
  return url.protocol === "https:" ? "443" : "80";
}

function beneficiosValidados(valor: unknown): Record<string, boolean> {
  const resultado = { ...BENEFICIOS_FALLBACK };
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return resultado;
  }

  const recebidos = valor as Record<string, unknown>;
  for (const chave of Object.keys(BENEFICIOS_FALLBACK)) {
    resultado[chave] = recebidos[chave] === true;
  }
  return resultado;
}

function respostaInativa(): StatusPlanoResp {
  return {
    ativo: false,
    plano: "starter",
    nivel: 0,
    expires_at: null,
    beneficios: { ...BENEFICIOS_FALLBACK },
  };
}

export async function getStatusPlanoSSR(
  request: Request
): Promise<StatusPlanoResp> {
  try {
    const incomingUrl = new URL(request.url);
    const isLocalDevelopmentHost =
      process.env.NODE_ENV !== "production" &&
      HOSTS_LOCAIS.has(incomingUrl.hostname.toLowerCase());

    // Preview usa exclusivamente os domínios confiáveis da implantação Vercel.
    // Produção mantém o domínio canônico e os domínios da própria implantação.
    let authorizedOrigin = isLocalDevelopmentHost;

    if (!isLocalDevelopmentHost) {
      const vercelOrigins = [
        process.env.VERCEL_URL
          ? "https://" + process.env.VERCEL_URL
          : null,
        process.env.VERCEL_BRANCH_URL
          ? "https://" + process.env.VERCEL_BRANCH_URL
          : null,
      ];

      const allowedOrigins =
        process.env.VERCEL_ENV === "preview"
          ? vercelOrigins
          : [process.env.NEXT_PUBLIC_SITE_URL, ...vercelOrigins];

      authorizedOrigin = allowedOrigins.some((baseUrl) => {
        if (!baseUrl) return false;

        try {
          const configuredUrl = new URL(baseUrl);

          return (
            hostCanonico(incomingUrl.hostname) ===
              hostCanonico(configuredUrl.hostname) &&
            incomingUrl.protocol === configuredUrl.protocol &&
            portaEfetiva(incomingUrl) === portaEfetiva(configuredUrl)
          );
        } catch {
          return false;
        }
      });
    }

    if (!authorizedOrigin) {
      throw new Error("Origem não autorizada para consulta de assinatura");
    }

    // Mantém a chamada na mesma origem já validada. Não usa URL fornecida pelo cliente.
    const statusUrl = new URL("/api/assinaturas/status", incomingUrl.origin);
    const cookie = request.headers.get("cookie");

    const response = await fetch(statusUrl, {
      method: "GET",
      cache: "no-store",
      redirect: "manual",
      headers: cookie ? { Cookie: cookie } : undefined,
    });

    if (response.status === 401) return respostaInativa();

    if (!response.ok) {
      throw new Error(`Status da assinatura indisponível: HTTP ${response.status}`);
    }

    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Resposta inválida da API de assinatura");
    }

    const payload = data as Record<string, unknown>;
    const ativo = payload.ativo === true;

    if (!ativo) return respostaInativa();

    const nivelInformado = Number(payload.nivel);
    if (!Number.isFinite(nivelInformado) || nivelInformado < 1) {
      throw new Error("Nível de assinatura inválido na resposta");
    }

    const plano = String(payload.plano ?? "").trim().toLowerCase();
    if (!plano) throw new Error("Plano ausente na resposta de assinatura");

    return {
      ativo: true,
      plano,
      nivel: Math.trunc(nivelInformado),
      expires_at:
        typeof payload.expires_at === "string" ? payload.expires_at : null,
      beneficios: beneficiosValidados(payload.beneficios),
      origem: typeof payload.origem === "string" ? payload.origem : null,
    };
  } catch (error) {
    console.error("[PLAN_GATE][STATUS]", error);
    return {
      ...respostaInativa(),
      degraded: true,
    };
  }
}

export async function requireBenefitSSR(
  beneficio: BeneficioPlano,
  request: Request
) {
  const status = await getStatusPlanoSSR(request);

  if (status.degraded) {
    return {
      allowed: false as const,
      httpStatus: 503 as const,
      reason: "subscription_status_unavailable",
    };
  }

  if (!status.ativo) {
    return {
      allowed: false as const,
      httpStatus: 401 as const,
      reason: "subscription_inactive",
    };
  }

  if (status.beneficios[beneficio] !== true) {
    return {
      allowed: false as const,
      httpStatus: 403 as const,
      reason: "plan_feature_not_included",
    };
  }

  return {
    allowed: true as const,
    status,
  };
}
