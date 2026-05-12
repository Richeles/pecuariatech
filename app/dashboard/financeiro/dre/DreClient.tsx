"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase-browser";

const supabase = createClient();

type DreLinha = {
  mes_referencia: string;
  receita_bruta: number;
  despesas_operacionais: number;
  resultado_operacional: number;
};

export default function DreClient() {
  const [dados, setDados] = useState<DreLinha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDre() {
      try {
        const { data, error } = await supabase
          .from("dre_mensal_view")
          .select("*")
          .order("mes_referencia", {
            ascending: false,
          });

        if (error) {
          console.error(
            "Erro ao carregar DRE:",
            error
          );

          setDados([]);
          return;
        }

        if (data) {
          setDados(data);
        }
      } catch (err) {
        console.error(
          "Erro inesperado no DRE:",
          err
        );

        setDados([]);
      } finally {
        setLoading(false);
      }
    }

    carregarDre();
  }, []);

  if (loading) {
    return (
      <div
        className="
          rounded-2xl
          border border-[#d7e5da]
          bg-white
          p-6
          shadow-sm
        "
      >
        <p className="text-sm text-[#4f6d58]">
          Carregando DRE financeiro...
        </p>
      </div>
    );
  }

  if (dados.length === 0) {
    return (
      <div
        className="
          rounded-2xl
          border border-yellow-200
          bg-yellow-50
          p-5
        "
      >
        <p className="text-sm text-yellow-800">
          Nenhum dado financeiro disponível ainda.
        </p>

        <p className="mt-2 text-xs text-yellow-700">
          O DRE será exibido após os
          primeiros lançamentos financeiros.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        overflow-x-auto
        rounded-2xl
        border border-[#d7e5da]
        bg-white
        shadow-sm
      "
    >
      <table className="w-full text-sm">
        <thead
          className="
            border-b border-[#d7e5da]
            bg-[#f4f8f4]
            text-[#355845]
          "
        >
          <tr>
            <th className="px-5 py-4 text-left font-semibold">
              Mês
            </th>

            <th className="px-5 py-4 text-right font-semibold">
              Receita
            </th>

            <th className="px-5 py-4 text-right font-semibold">
              Custos
            </th>

            <th className="px-5 py-4 text-right font-semibold">
              Resultado
            </th>
          </tr>
        </thead>

        <tbody>
          {dados.map((linha) => {
            const positivo =
              linha.resultado_operacional >= 0;

            return (
              <tr
                key={linha.mes_referencia}
                className="
                  border-b border-[#edf2ee]
                  transition-colors
                  hover:bg-[#f8fbf8]
                "
              >
                <td className="px-5 py-4 text-[#173222] capitalize">
                  {new Date(
                    linha.mes_referencia
                  ).toLocaleDateString(
                    "pt-BR",
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </td>

                <td
                  className="
                    px-5 py-4
                    text-right
                    font-medium
                    text-green-700
                  "
                >
                  R${" "}
                  {linha.receita_bruta.toLocaleString(
                    "pt-BR"
                  )}
                </td>

                <td
                  className="
                    px-5 py-4
                    text-right
                    font-medium
                    text-red-600
                  "
                >
                  R${" "}
                  {linha.despesas_operacionais.toLocaleString(
                    "pt-BR"
                  )}
                </td>

                <td
                  className={`
                    px-5 py-4
                    text-right
                    font-bold
                    ${
                      positivo
                        ? "text-[#1f7a45]"
                        : "text-red-700"
                    }
                  `}
                >
                  R${" "}
                  {linha.resultado_operacional.toLocaleString(
                    "pt-BR"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}