// CAMINHO: app/components/cfo/CFOResumoEstrategico.tsx
// Componente de decisão CFO — Opção B4
// Linux / Vercel safe

"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "../../lib/supabaseClient";

// ===============================
// TIPOS
// ===============================
type Alerta = {
  tipo: string;
  severidade: "baixa" | "media" | "alta";
  mensagem: string;
};

export default function CFOResumoEstrategico() {
  const [loading, setLoading] = useState(true);
  const [narrativa, setNarrativa] = useState<string | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [tendencia, setTendencia] = useState<string | null>(null);

  useEffect(() => {
    const carregarResumo = async () => {
      try {
        setLoading(true);

        const {
          data: { session },
        } = await supabaseClient.auth.getSession();

        if (!session?.access_token) {
          return;
        }

        const headers = {
          Authorization: `Bearer ${session.access_token}`,
        };

        const [resTendencia, resAlertas, resNarrativa] =
          await Promise.all([
            fetch("/api/financeiro/tendencia", { headers }),
            fetch("/api/financeiro/alertas", { headers }),
            fetch("/api/financeiro/narrativa", { headers }),
          ]);

        if (resTendencia.ok) {
          const tendenciaJson = await resTendencia.json();
          setTendencia(tendenciaJson.tendencia ?? null);
        }

        if (resAlertas.ok) {
          const alertasJson = await resAlertas.json();
          setAlertas(alertasJson.alertas ?? []);
        }

        if (resNarrativa.ok) {
          const narrativaJson = await resNarrativa.json();
          setNarrativa(narrativaJson.narrativa_principal ?? null);
        }
      } catch (err) {
        console.error("Erro ao carregar resumo CFO", err);
      } finally {
        setLoading(false);
      }
    };

    carregarResumo();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border p-4 text-sm text-gray-500">
        Carregando análise estratégica CFO...
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-6 space-y-4">
      <h2 className="text-lg font-semibold">
        Análise Estratégica — CFO Autônomo
      </h2>

      {tendencia && (
        <div className="text-sm">
          <strong>Tendência:</strong>{" "}
          <span
            className={
              tendencia === "alta"
                ? "text-green-600"
                : tendencia === "queda"
                ? "text-red-600"
                : "text-yellow-600"
            }
          >
            {tendencia.toUpperCase()}
          </span>
        </div>
      )}

      {alertas.length > 0 && (
        <div className="space-y-2">
          <strong className="text-sm">Alertas Ativos:</strong>
          <ul className="list-disc pl-5 text-sm">
            {alertas.map((a, i) => (
              <li key={i} className="text-gray-700">
                [{a.severidade.toUpperCase()}] {a.mensagem}
              </li>
            ))}
          </ul>
        </div>
      )}

      {narrativa && (
        <div className="text-sm text-gray-800">
          <strong>Leitura do CFO:</strong>
          <p className="mt-1">{narrativa}</p>
        </div>
      )}
    </div>
  );
}
