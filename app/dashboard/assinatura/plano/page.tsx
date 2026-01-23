// CAMINHO: app/dashboard/assinatura/plano/page.tsx
// Page Server + Suspense (regra Next 16: evitar hook em page.tsx)
import { Suspense } from "react";
import PlanoClient from "./PlanoClient";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6">Carregando...</p>}>
      <PlanoClient />
    </Suspense>
  );
}
