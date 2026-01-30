// app/dashboard/admin/usuarios/page.tsx

import { cookies, headers } from "next/headers";

export const dynamic = "force-dynamic";

type Usuario = {
  id: string;
  email: string;
  created_at: string;
};

export default async function AdminUsuariosPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const host = headerStore.get("host");
  const protocol =
    host?.includes("localhost") || host?.includes("127.0.0.1")
      ? "http"
      : "https";

  const url = `${protocol}://${host}/api/admin/usuarios`;

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
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold">Erro ao carregar usuários</h1>
      </div>
    );
  }

  const data: Usuario[] = await res.json();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Usuários (Admin)
      </h1>

      <table className="w-full border">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Criado em</th>
          </tr>
        </thead>

        <tbody>
          {data.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-2">{u.id}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">
                {new Date(u.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
