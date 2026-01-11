// app/dashboard/engorda/nutricao/page.tsx
// Dashboard Nutrição – Fase 2 (Visual)
// Next.js 16 | App Router | Server Component
// Equação Y: Views → APIs → Dashboard

import { cookies, headers } from "next/headers";

// resolve baseURL de forma segura em DEV e PROD
async function getBaseUrl() {
  const h = await headers();

  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    "localhost:3333";

  const proto =
    h.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}

async function fetchAPI(path: string) {
  // ✅ Next 16: cookies() é Promise
  const store = await cookies();

  // token do Supabase (padrão)
  const token =
    store.get("sb-access-token")?.value ||
    store.get("supabase-access-token")?.value ||
    "";

  // ✅ base url correto (DEV/PROD)
  const baseUrl = await getBaseUrl();

  const res = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
    cache: "no-store",
  });

  if (!res.ok) {
    let err: any = {};
    try {
      err = await res.json();
    } catch {
      // ignore
    }

    throw new Error(
      err?.error ||
        `Erro ao carregar ${path} (HTTP ${res.status})`
    );
  }

  return res.json();
}

export default async function NutricaoDashboard() {
  let itens: any[] = [];
  let aplicacoes: any[] = [];
  let custoDia: any = { total: 0 };

  try {
    [itens, aplicacoes, custoDia] = await Promise.all([
      fetchAPI("/api/nutricao/itens"),
      fetchAPI("/api/nutricao/aplicacoes"),
      fetchAPI("/api/nutricao/custo-dia"),
    ]);
  } catch (e: any) {
    return (
      <div className="space-y-4">
        <header>
          <h1 className="text-2xl font-bold text-gray-800">
            Nutrição – Visão Geral
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Controle operacional e impacto econômico da nutrição
          </p>
        </header>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <p className="font-semibold">Erro ao carregar Nutrição</p>
          <p className="mt-1">
            {e?.message || "Falha desconhecida"}
          </p>

          <p className="mt-2 text-xs text-red-600">
            Observação: as APIs exigem autenticação (Bearer Token). Se você
            estiver fora do login, a resposta será 401.
          </p>
        </div>
      </div>
    );
  }

  const totalItens = Array.isArray(itens) ? itens.length : 0;
  const totalAplicacoes = Array.isArray(aplicacoes)
    ? aplicacoes.length
    : 0;

  const totalCustoDia = Number(custoDia?.total || 0);

  return (
    <div className="space-y-8">
      {/* TÍTULO */}
      <header>
        <h1 className="text-2xl font-bold text-gray-800">
          Nutrição – Visão Geral
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Controle operacional e impacto econômico da nutrição animal
        </p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-5 shadow">
          <p className="text-sm text-gray-500">
            Itens Nutricionais Ativos
          </p>
          <p className="text-2xl font-bold text-green-700">
            {totalItens}
          </p>
        </div>

        <div className="bg-white rounded-lg p-5 shadow">
          <p className="text-sm text-gray-500">
            Aplicações Ativas
          </p>
          <p className="text-2xl font-bold text-green-700">
            {totalAplicacoes}
          </p>
        </div>

        <div className="bg-white rounded-lg p-5 shadow">
          <p className="text-sm text-gray-500">
            Custo Diário Total (R$)
          </p>
          <p className="text-2xl font-bold text-green-700">
            R$ {totalCustoDia.toFixed(2)}
          </p>
        </div>
      </section>

      {/* ITENS */}
      <section className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">
          Catálogo de Itens Nutricionais
        </h2>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">
                  Nome
                </th>
                <th className="text-left py-2">
                  Tipo
                </th>
                <th className="text-right py-2">
                  Custo/dia (R$)
                </th>
              </tr>
            </thead>

            <tbody>
              {itens?.map((i: any) => (
                <tr
                  key={i.id}
                  className="border-b last:border-0"
                >
                  <td className="py-2">
                    {i.nome}
                  </td>
                  <td className="py-2 capitalize">
                    {i.tipo}
                  </td>
                  <td className="py-2 text-right">
                    {Number(i.custo_dia || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
              {!itens?.length && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-3 text-gray-500"
                  >
                    Nenhum item encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* APLICAÇÕES */}
      <section className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">
          Aplicações Ativas
        </h2>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">
                  Item
                </th>
                <th className="text-left py-2">
                  Alvo
                </th>
                <th className="text-left py-2">
                  Início
                </th>
                <th className="text-left py-2">
                  Fim
                </th>
              </tr>
            </thead>

            <tbody>
              {aplicacoes?.map((a: any) => (
                <tr
                  key={a.id}
                  className="border-b last:border-0"
                >
                  <td className="py-2">
                    {a.item_nome}
                  </td>
                  <td className="py-2">
                    {a.animal_id ? "Animal" : "Piquete"}
                  </td>
                  <td className="py-2">
                    {a.data_inicio
                      ? new Date(a.data_inicio).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-2">
                    {a.data_fim
                      ? new Date(a.data_fim).toLocaleDateString()
                      : "Em andamento"}
                  </td>
                </tr>
              ))}
              {!aplicacoes?.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-3 text-gray-500"
                  >
                    Nenhuma aplicação ativa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* AVISO DE RESPONSABILIDADE */}
      <footer className="text-xs text-gray-500">
        Nutrição registrada pelo produtor. O PecuariaTech entrega
        gestão e análise econômica (CFO/Engorda), não prescrição
        zootécnica/veterinária.
      </footer>
    </div>
  );
}
