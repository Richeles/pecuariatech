"use client";

import { useDashboard } from "../DashboardContext";
import CFOInsightsClient from "./CFOInsightsClient";

export const dynamic = 'force-dynamic';

export default function CFOPage() {
  const { data, loading } = useDashboard();
  
  if (loading) {
    return <div className="p-10 text-[#A7F3D0]/60">Carregando dados do CFO...</div>;
  }

  return <CFOInsightsClient />;
}