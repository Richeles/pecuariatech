import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");

  if (!lat || !lon)
    return NextResponse.json({ ok: false, error: "lat/lon required" }, { status: 400 });

  const api = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=3`;

  const resp = await fetch(api);
  if (!resp.ok)
    return NextResponse.json({ ok: false, error: "provider error" }, { status: 502 });

  const data = await resp.json();
  return NextResponse.json({ ok: true, data });
}