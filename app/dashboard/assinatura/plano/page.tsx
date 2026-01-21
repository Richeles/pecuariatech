// CAMINHO: app/dashboard/assinatura/plano/page.tsx
// Server Component (Next.js 16)
// ✅ Regra oficial: page.tsx SEM hooks client-side
// ✅ Suspense -> Client Component separado

import { Suspense } from "react";
import PlanoClient from "./PlanoClient";

export default function PlanoAssinaturaPage() {
  return (
    <Suspense fallback={<p className="p-6">Carregando...</p>}>
      <PlanoClient />
    </Suspense>
  );
}
