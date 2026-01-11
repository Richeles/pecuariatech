import { Suspense } from "react";
import EngordaClient from "./components/EngordaClient";

export const dynamic = "force-dynamic";

export default function EngordaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Engorda ULTRA</h1>
          <p className="text-sm text-muted-foreground">
            Motor π com 3 cenários (ÓTIMO / SEGURO / RÁPIDO), ranking executivo e alertas.
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            Carregando Engorda…
          </div>
        }
      >
        <EngordaClient />
      </Suspense>
    </div>
  );
}
