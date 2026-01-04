// app/dashboard/page.tsx
// Server Component — Dashboard PecuariaTech
// Next.js 16 | TypeScript strict

import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando Dashboard…</div>}>
      <DashboardClient />
    </Suspense>
  );
}
