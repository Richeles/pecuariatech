// app/checkout/page.tsx
// Next.js 16 — Server Component

import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600 text-lg">
            Preparando checkout…
          </p>
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
