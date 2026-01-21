// CAMINHO: app/dashboard/assinatura/plano/page.tsx
// Plano Premium Internacional (SaaS)
// ✅ Next.js 16: page.tsx SERVER + Suspense (anti build bailout)
// ✅ Equação Y: UI consome APIs
// ✅ Triângulo 360: Auth + Paywall + Dados

import { Suspense } from "react";
import PlanoClient from "./PlanoClient";

export default function PlanoAssinaturaPage() {
  return (
    <Suspense fallback={<p className="p-6">Carregando...</p>}>
      <PlanoClient />
    </Suspense>
  );
}
