'use client';
import { getCoreKPIs } from '@/lib/kpis/core';

export async function GET() {
  const kpis = await getCoreKPIs();
  return Response.json(kpis);
}

