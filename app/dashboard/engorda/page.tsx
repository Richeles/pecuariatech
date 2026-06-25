"use client";

import { useDashboard } from "../DashboardContext";
import EngordaClient from "./components/EngordaClient";

export const dynamic = 'force-dynamic';

export default function EngordaPage() {
  const { data, loading } = useDashboard();
  
  if (loading) {
    return <div className="p-10 text-[#A7F3D0]/60">Carregando dados da engorda...</div>;
  }

  return <EngordaClient />;
}