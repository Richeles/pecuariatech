// app/dashboard/pastagem/page.tsx
import { Suspense } from "react";
import PastagemClient from "./components/PastagemClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function PastagemPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Carregando Pastagem...</div>}>
      <PastagemClient />
    </Suspense>
  );
}
