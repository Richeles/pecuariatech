import { cookies } from "next/headers";

export type StatusPlanoResp = {
  ativo: boolean;
  plano: string;
  nivel: number;
  expires_at: string | null;
  beneficios: Record<string, boolean>;
};

const BENEFICIOS_FALLBACK: Record<string, boolean> = {
  rebanho: false,
  pastagem: false,
  engorda_base: false,
  engorda_ultra: false,
  financeiro: false,
  cfo: false,
  esg: false,
  multiusuario: false,
};

export async function getStatusPlanoSSR(): Promise<StatusPlanoResp> {
  try {
    const cookieStore = cookies();
    const cookie = cookieStore.toString();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/assinaturas/status`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Cookie: cookie,
        },
      }
    );

    if (!res.ok) throw new Error("status not ok");

    const data = (await res.json()) as Partial<StatusPlanoResp>;

    return {
      ativo: Boolean(data?.ativo),
      plano: String(data?.plano ?? "basico"),
      nivel: Number(data?.nivel ?? 1),
      expires_at: (data?.expires_at as any) ?? null,
      beneficios: (data?.beneficios as any) ?? BENEFICIOS_FALLBACK,
    };
  } catch {
    return {
      ativo: false,
      plano: "basico",
      nivel: 1,
      expires_at: null,
      beneficios: BENEFICIOS_FALLBACK,
    };
  }
}
