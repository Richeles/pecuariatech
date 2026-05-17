import { Suspense } from "react";

import PlanosClient from "./PlanosClient";

export default function PlanosPage() {

  return (

    <Suspense
      fallback={
        <div className="min-h-screen bg-white" />
      }
    >

      <main className="min-h-screen">

        <PlanosClient />

      </main>

    </Suspense>
  );
}