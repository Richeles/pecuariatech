"use client";

import RebanhoCards from "./components/RebanhoCards";
import RebanhoTabela from "./components/RebanhoTabela";
import RebanhoEmpty from "./components/RebanhoEmpty";

export default function RebanhoClient() {
  // FASE 1 — ainda sem dados reais
  const totalAnimais = 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-700">
        Rebanho — PecuariaTech
      </h1>

      {totalAnimais === 0 ? (
        <RebanhoEmpty />
      ) : (
        <>
          <RebanhoCards />
          <RebanhoTabela />
        </>
      )}
    </div>
  );
}
