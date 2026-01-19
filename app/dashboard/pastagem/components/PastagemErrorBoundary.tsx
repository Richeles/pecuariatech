"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message?: string;
};

export default class PastagemErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: any): State {
    return {
      hasError: true,
      message: String(err?.message ?? "Erro inesperado na Pastagem."),
    };
  }

  componentDidCatch(err: any) {
    // log seguro (não derruba SaaS)
    console.error("[PastagemErrorBoundary]", err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-lg font-semibold">Pastagem em modo seguro</div>
          <p className="mt-2 text-sm text-gray-700">
            Detectamos um erro de renderização no client.
            <b> Nenhum dado foi perdido.</b>
          </p>

          <div className="mt-4 rounded-xl border bg-gray-50 p-4">
            <div className="text-xs font-semibold text-gray-600">Detalhe técnico</div>
            <div className="mt-1 text-sm text-gray-800">
              {this.state.message ?? "Erro desconhecido."}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-700">
            Ação recomendada:
            <ul className="mt-2 list-disc pl-6">
              <li>Atualize a página (F5) 2 vezes.</li>
              <li>Se persistir, revise campos do motor que podem retornar objeto.</li>
            </ul>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
