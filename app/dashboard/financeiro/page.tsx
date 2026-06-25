"use client";

import { useDashboard } from "../DashboardContext";
import FinanceiroClient from "./components/FinanceiroClient";

export const dynamic = 'force-dynamic';

export default function FinanceiroPage() {
  const { data, loading } = useDashboard();
  
  if (loading) {
    return <div className="p-10 text-[#A7F3D0]/60">Carregando dados financeiros...</div>;
  }

  return <FinanceiroClient />;
}