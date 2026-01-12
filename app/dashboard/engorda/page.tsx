import EngordaClient from "./components/EngordaClient";

export const dynamic = "force-dynamic";

export default function EngordaPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Engorda ULTRA</h1>
        <p className="text-sm text-slate-600">
          Motor π com 3 cenários (ÓTIMO / SEGURO / RÁPIDO), ranking executivo e alertas.
        </p>
      </div>

      <EngordaClient />
    </div>
  );
}
