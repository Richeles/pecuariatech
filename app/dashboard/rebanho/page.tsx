"use client";

import { useDashboard } from "../DashboardContext";
import RebanhoClient from "./components/RebanhoClient";

export const dynamic = 'force-dynamic';

export default function RebanhoPage() {
  const { data, loading } = useDashboard();
  
  if (loading) {
    return <div className="p-10 text-[#A7F3D0]/60">Carregando dados do rebanho...</div>;
  }

  return <RebanhoClient />;
}