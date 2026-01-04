// CAMINHO: app/planos/page.tsx
// Planos PecuariaTech — Server Wrapper
// Next.js 16 | App Router

import { Suspense } from "react";
import PlanosClient from "./PlanosClient";

export default function PlanosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Carregando planos...
        </div>
      }
    >
      <PlanosClient />
    </Suspense>
  );
}
