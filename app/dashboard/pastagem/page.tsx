"use client";

import { useDashboard } from "../DashboardContext";
import PastagemClient from "./components/PastagemClient";

export const dynamic = 'force-dynamic';

export default function PastagemPage() {
  const { data, loading } = useDashboard();
  
  if (loading) {
    return <div className="p-10 text-[#A7F3D0]/60">Carregando dados da pastagem...</div>;
  }

  return <PastagemClient />;
}