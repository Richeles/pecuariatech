import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Suspense fallback={<div />}>
        <RegisterClient />
      </Suspense>
    </main>
  );
}