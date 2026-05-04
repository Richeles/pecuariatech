import FinanceiroClient from "./components/FinanceiroClient";
import T from "@/app/components/T";

export const dynamic = "force-dynamic";

/* 🔥 FETCH SERVER-SIDE (EQUAÇÃO Y) */
async function getData() {
  try {
    const res = await fetch(
      "http://127.0.0.1:3333/api/financeiro/indicadores-avancados",
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error("Erro ao buscar financeiro:", res.status);
      return null;
    }

    const json = await res.json();
    console.log("DATA SERVER:", json);

    return json;
  } catch (err) {
    console.error("Erro fetch financeiro:", err);
    return null;
  }
}

export default async function FinanceiroPage() {
  const resumo = await getData();

  return (
    <main className="p-10 max-w-7xl mx-auto space-y-12">

      {/* HEADER */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          <T k="dashboard.modulos.financeiro.titulo" /> · CFO
        </h1>

        <p className="text-gray-500">
          <T k="dashboard.modulos.financeiro.desc" />
        </p>
      </header>

      {/* KPIs ESTÁTICOS (mantidos) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "dashboard.cards.receita", value: "—" },
          { label: "dashboard.cards.custos", value: "—" },
          { label: "dashboard.cards.resultado", value: "—", active: true },
          { label: "dashboard.cards.margem", value: "—" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border p-6">
            <p className="text-sm text-gray-500">
              <T k={kpi.label} />
            </p>

            <p className="text-2xl font-bold text-green-700">
              {kpi.value}
            </p>
          </div>
        ))}
      </section>

      {/* CFO */}
      <section className="bg-white border rounded-2xl p-8">
        <h2 className="text-lg font-semibold">
          <T k="dashboard.modulos.cfo.titulo" />
        </h2>

        <p className="text-gray-500 mt-2">
          <T k="financeiro.sem_dados" />
        </p>
      </section>

      {/* ALERTA */}
      <section className="bg-yellow-50 border rounded-xl p-5">
        <p className="text-yellow-800 text-sm">
          <T k="financeiro.alerta_cfo" />
        </p>
      </section>

      {/* DRE */}
      <section className="bg-white border rounded-2xl p-8 flex justify-between">
        <div>
          <h3 className="font-semibold">
            <T k="financeiro.dre.titulo" />
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            <T k="financeiro.dre.desc" />
          </p>
        </div>

        <button className="px-5 py-2 bg-green-600 text-white rounded-lg">
          <T k="financeiro.dre.acao" />
        </button>
      </section>

      {/* 🔥 CLIENT AGORA RECEBE DADOS */}
      <FinanceiroClient resumo={resumo} />

    </main>
  );
}