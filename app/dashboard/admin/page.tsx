// app/dashboard/admin/page.tsx
import { notFound } from "next/navigation";
import { getServerAdmin } from "@/app/lib/server-admin";

export default async function AdminPage() {
  const { isAdmin } = await getServerAdmin();

  if (!isAdmin) {
    notFound();
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