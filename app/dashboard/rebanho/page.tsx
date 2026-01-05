// app/dashboard/rebanho/page.tsx
// Rebanho — Server Component
// Next.js 16 App Router

import { Suspense } from "react";
import RebanhoClient from "./RebanhoClient";

export default function RebanhoPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando Rebanho…</div>}>
      <RebanhoClient />
    </Suspense>
  );
}
