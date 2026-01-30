import { cookies } from "next/headers";

export default async function AdminPage() {
  const cookieStore = await cookies();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3333"}/api/admin/me`,
    {
      headers: {
        cookie: cookieStore
          .getAll()
          .map(c => `${c.name}=${c.value}`)
          .join("; "),
      },
      cache: "no-store",
    }
  );

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
}
