import { cookies, headers } from "next/headers";

export const dynamic = "force-dynamic";

type Plano = {
  id: string;
  nome: string;
  nivel: string;
  preco: number;
  ativo: boolean;
};

function formatarPreco(preco: number) {
  if (!Number.isFinite(preco)) return "—";

  return preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function AdminPlanosPage() {
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();

    const host = headerStore.get("host");

    if (!host) {
      throw new Error("Host não identificado.");
    }

    const protocol =
      host.includes("localhost") || host.includes("127.0.0.1")
        ? "http"
        : "https";

    const url = `${protocol}://${host}/api/admin/planos`;

    const res = await fetch(url, {
      headers: {
        cookie: cookieStore
          .getAll()
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join("; "),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Falha ao consultar a API de planos.");
    }

    const planos: Plano[] = await res.json();

    if (!Array.isArray(planos)) {
      throw new Error("Formato de resposta inválido.");
    }

    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Planos — Admin Master
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Consulta dos planos cadastrados no sistema.
          </p>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          Total de planos: <strong>{planos.length}</strong>
        </p>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[650px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Nível</th>
                <th className="p-3 text-left">Preço</th>
                <th className="p-3 text-left">Ativo</th>
              </tr>
            </thead>

            <tbody>
              {planos.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-6 text-center text-gray-500"
                  >
                    Nenhum plano encontrado.
                  </td>
                </tr>
              ) : (
                planos.map((plano) => (
                  <tr key={plano.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">
                      {plano.nome}
                    </td>

                    <td className="p-3">
                      {plano.nivel}
                    </td>

                    <td className="p-3">
                      {formatarPreco(Number(plano.preco))}
                    </td>

                    <td className="p-3">
                      {plano.ativo ? "Sim" : "Não"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  } catch {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold">
          Erro ao carregar planos
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Não foi possível consultar os planos pela API administrativa.
        </p>
      </div>
    );
  }
}