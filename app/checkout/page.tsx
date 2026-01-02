// app/checkout/page.tsx
// Server Component (build-safe)

import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p>Carregando checkout…</p>}>
      <CheckoutClient />
    </Suspense>
  );
}
