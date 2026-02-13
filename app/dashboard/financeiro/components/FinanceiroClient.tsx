"use client";

type Props = {
  resumo?: any;
  dre?: any;
};

export default function FinanceiroClient({ resumo, dre }: Props) {
  return (
    <div className="space-y-6">

      <section className="rounded-2xl border p-4">
        <h2 className="text-lg font-semibold">Visão Financeira</h2>
        <p className="text-sm opacity-70">
          Dados consolidados do módulo financeiro.
        </p>
      </section>

      <section className="rounded-2xl border p-4">
        <h3 className="font-medium">Resumo</h3>
        <pre className="text-xs opacity-70 overflow-auto">
          {JSON.stringify(resumo ?? {}, null, 2)}
        </pre>
      </section>

      <section className="rounded-2xl border p-4">
        <h3 className="font-medium">DRE</h3>
        <pre className="text-xs opacity-70 overflow-auto">
          {JSON.stringify(dre ?? {}, null, 2)}
        </pre>
      </section>

    </div>
  );
}
