import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<p>Carregando checkout...</p>}>
        <CheckoutClient />
      </Suspense>
    </main>
  );
}
