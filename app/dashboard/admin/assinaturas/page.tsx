import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

type Assinatura = {
  user_id: string;
  status: string;
  plano: string;
  nivel: string;
  created_at: string;
};

export default async function AdminAssinaturasPage() {
  try {
    const cookieStore = await cookies();

    const res = await fetch("/api/admin/assinaturas", {
      headers: {
        cookie: cookieStore
          .getAll()
          .map(c => `${c.name}=${c.value}`)
          .join("; "),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("api_error");
    }

    const data: Assinatura[] = await res.json();

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">
          Assinaturas
        </h1>

        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">User</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Plano</th>
              <th className="border p-2">Nível</th>
              <th className="border p-2">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a, i) => (
              <tr key={i}>
                <td className="border p-2">{a.user_id}</td>
                <td className="border p-2">{a.status}</td>
                <td className="border p-2">{a.plano}</td>
                <td className="border p-2">{a.nivel}</td>
                <td className="border p-2">
                  {new Date(a.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  } catch {
    return (
      <div className="p-8">
        <h1>Erro ao carregar assinaturas</h1>
      </div>
    );
  }
}
