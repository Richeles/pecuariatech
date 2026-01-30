import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

type Plano = {
  id: string;
  nome: string;
  nivel: string;
  preco: number;
  ativo: boolean;
};

export default async function AdminPlanosPage() {
  try {
    const cookieStore = await cookies();

    const res = await fetch("/api/admin/planos", {
      headers: {
        cookie: cookieStore
          .getAll()
          .map(c => `${c.name}=${c.value}`)
          .join("; "),
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error();

    const planos: Plano[] = await res.json();

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">
          Planos (Admin)
        </h1>

        <table className="w-full border text-sm">
          <thead>
            <tr>
              <th className="border p-2">Nome</th>
              <th className="border p-2">Nível</th>
              <th className="border p-2">Preço</th>
              <th className="border p-2">Ativo</th>
            </tr>
          </thead>

          <tbody>
            {planos.map(p => (
              <tr key={p.id}>
                <td className="border p-2">{p.nome}</td>
                <td className="border p-2">{p.nivel}</td>
                <td className="border p-2">R$ {p.preco}</td>
                <td className="border p-2">
                  {p.ativo ? "Sim" : "Não"}
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
        <h1>Erro ao carregar planos</h1>
      </div>
    );
  }
}
