"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Row = {
  modulo: string;
  total_testes: number;
  total_ok: number;
  total_falhas: number;
  tempo_medio_ms: number;
  status_geral: string;
  data_execucao?: string;
};

export default function CloudSyncPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [uptime, setUptime] = useState(0);
  const [atualizado, setAtualizado] = useState<string>("");

  async function carregar() {
    const { data, error } = await supabase
      .from("triangulo_monitor_v55")
      .select("*");
    if (!error && data) {
      setRows(data as Row[]);
      const total = data.length || 1;
      const oks = data.filter((d:any) => String(d.status_geral).includes("🟢")).length;
      setUptime(Math.round((oks / total) * 100));
      setAtualizado(new Date().toLocaleString("pt-BR"));
    }
  }

  useEffect(() => {
    carregar();
    const ch = supabase
      .channel("triangulo-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "triangulo_logs" }, carregar)
      .subscribe();
    const t = setInterval(carregar, 15000);
    return () => { supabase.removeChannel(ch); clearInterval(t); };
  }, []);

  return (
    <div className="p-4 bg-white rounded-xl shadow" style={{ padding: 16, background: "#fff", borderRadius: 12 }}>
      <h1 style={{ marginBottom: 8 }}>☁️ CloudSync — Triângulo 360°</h1>
      <div style={{ marginBottom: 10 }}>Uptime geral: <b>{uptime}%</b> — Última atualização: {atualizado || "—"}</div>

      <div style={{ width: "100%", height: 280, background: "#fafafa", borderRadius: 8, padding: 8 }}>
        <ResponsiveContainer>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="modulo" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="tempo_medio_ms" stroke="#16a34a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <table style={{ width: "100%", marginTop: 14, fontSize: 14, background: "#fff", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#0a7b37", color: "#fff" }}>
            <th style={{ padding: 8, textAlign: "left" }}>Módulo</th>
            <th style={{ padding: 8 }}>Total</th>
            <th style={{ padding: 8 }}>OK</th>
            <th style={{ padding: 8 }}>Falhas</th>
            <th style={{ padding: 8 }}>Tempo médio (ms)</th>
            <th style={{ padding: 8 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: "1px solid #eee", textAlign: "center" }}>
              <td style={{ padding: 8, textAlign: "left" }}>{r.modulo}</td>
              <td>{r.total_testes}</td>
              <td>{r.total_ok}</td>
              <td>{r.total_falhas}</td>
              <td>{Math.round(Number(r.tempo_medio_ms) || 0)}</td>
              <td>{r.status_geral}</td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={6} style={{ padding: 10, color: "#666" }}>Sem dados para exibir.</td></tr>
          )}
        </tbody>
      </table>

      <button onClick={carregar} style={{ marginTop: 12, background: "#155724", color: "#fff", padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer" }}>
        🔁 Recarregar
      </button>
    </div>
  );
}


