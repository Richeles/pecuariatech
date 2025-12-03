"use client";
import { useState, useEffect } from "react";

async function fetchJSON(url: string) {
  try {
    const r = await fetch(url, { cache: "no-store" });
    return await r.json();
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export default function CloudStatus() {
  const [ping, setPing] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);

  async function load() {
    setPing(await fetchJSON("/api/ultra/ping"));
    setHealth(await fetchJSON("/api/ultra/health"));
    setStatus(await fetchJSON("/api/ultra/status"));
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>PecuariaTech Cloud v21</h1>
      <p>Status em tempo real do ambiente em producao</p>
      <hr />

      <h2>Ping</h2>
      <pre>{JSON.stringify(ping, null, 2)}</pre>

      <h2>Health</h2>
      <pre>{JSON.stringify(health, null, 2)}</pre>

      <h2>Metrics</h2>
      <pre>{JSON.stringify(status, null, 2)}</pre>

      <p>Atualizacao automatica a cada 10 segundos.</p>
    </div>
  );
}
