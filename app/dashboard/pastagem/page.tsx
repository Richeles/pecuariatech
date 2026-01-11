// app/dashboard/pastagem/page.tsx
import React, { Suspense } from "react";
import PastagemClient from "./components/PastagemClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Carregando Pastagem...</div>}>
      <PastagemClient />
    </Suspense>
  );
}
