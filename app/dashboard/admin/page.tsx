import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    const cookieStore = await cookies();

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL?.startsWith("http")
        ? process.env.VERCEL_URL
        : `https://${process.env.VERCEL_URL}`;

    const url = `${baseUrl}/api/admin/me`;

    const res = await fetch(url, {
      headers: {
        cookie: cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; "),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("admin_me_failed");
    }

    const data = await res.json();

    if (!data?.is_admin) {
      return (
        <div className="p-8">
          <h1>Acesso negado</h1>
        </div>
      );
    }

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">
          Painel Admin Master
        </h1>

        <p className="text-sm text-gray-600 mt-2">
          Área restrita de controle interno.
        </p>
      </div>
    );
  } catch (err) {
    return (
      <div className="p-8">
        <h1>Erro ao carregar Admin</h1>
      </div>
    );
  }
}
