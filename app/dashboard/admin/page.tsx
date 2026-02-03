// app/dashboard/admin/page.tsx
// Painel Master Admin - PecuariaTech

import { cookies } from "next/headers";

type AdminMeResp = {
  is_admin: boolean;
  role?: string;
};

async function getAdminMe(): Promise<AdminMeResp> {
  try {
    const cookieStore = cookies();
    const cookie = cookieStore.toString();

    const res = await fetch(
      "http://127.0.0.1:3333/api/admin/me",
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Cookie: cookie,
        },
      }
    );

    if (!res.ok) {
      return { is_admin: false };
    }

    const data = (await res.json()) as AdminMeResp;
    return data;

  } catch {
    return { is_admin: false };
  }
}

export default async function AdminPage() {
  const admin = await getAdminMe();

  if (!admin.is_admin) {
    return (
      <main className="p-10">
        <h1 className="text-xl font-semibold">
          Acesso restrito
        </h1>
      </main>
    );
  }

  return (
    <main className="p-10 space-y-6">
      <h1 className="text-2xl font-bold text-green-700">
        Painel Master — PecuariaTech
      </h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <p><b>Role:</b> {admin.role}</p>
        <p>Status: Administrador ativo</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-2">Funções futuras</h2>
        <ul className="list-disc ml-6 space-y-1 text-sm">
          <li>Simular planos</li>
          <li>Criar cupons</li>
          <li>Gerenciar promoções</li>
          <li>Auditoria SaaS</li>
        </ul>
      </div>
    </main>
  );
}
