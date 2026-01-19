"use client";

import PastagemErrorBoundary from "./PastagemErrorBoundary";
import PastagemClient from "../PastagemClient";

export default function PastagemSafe() {
  return (
    <PastagemErrorBoundary>
      <PastagemClient />
    </PastagemErrorBoundary>
  );
}
