Write-Host "🚀 Setup PecuariaTech CloudSync v6.4 (App Router + Supabase Auth)" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

$root = "C:\Users\Administrador\pecuariatech"
Set-Location $root

# 1) Pastas
$dirs = @(
  "app", "app\cloudsync", "app\login", "app\admin", "lib"
)
foreach ($d in $dirs) { if (-not (Test-Path $d)) { New-Item -ItemType Directory $d | Out-Null } }

# 2) Supabase client (browser)
@"
"use client";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
"@ | Out-File -Encoding utf8 .\lib\supabase-browser.ts

# 3) Auth helper (admin email + sessão)
@"
"use client";
import { supabase } from "./supabase-browser";

export const ADMIN_EMAIL = "pecuariatech.br@gmail.com";

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function signOut() {
  await supabase.auth.signOut();
}
"@ | Out-File -Encoding utf8 .\lib\auth.ts

# 4) layout.tsx (menu + login/logout)
@"
import "./globals.css";
import Link from "next/link";
"use client";
import { useEffect, useState } from "react";
import { getSession, signOut, ADMIN_EMAIL } from "@/lib/auth";

export const metadata = {
  title: "PecuariaTech Cloud v6.4",
  description: "Triângulo 360° — CloudSync + Dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const s = await getSession();
      setEmail(s?.user?.email ?? null);
    })();
  }, []);

  const isAdmin = email === ADMIN_EMAIL;

  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "Arial, sans-serif", margin: 0, background: "#f4f6f8" }}>
        <header style={{ background: "#155724", color: "#fff", padding: "10px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <b>PecuariaTech Cloud v6.4 🌿</b>
            <nav style={{ display: "flex", gap: 12 }}>
              <Link href="/" style={{ color:"#fff" }}>🏠 Início</Link>
              <Link href="/dashboard" style={{ color:"#fff" }}>📊 Dashboard</Link>
              <Link href="/mapa" style={{ color:"#fff" }}>🗺️ Mapa</Link>
              <Link href="/financeiro" style={{ color:"#fff" }}>💰 Financeiro</Link>
              <Link href="/rebanho" style={{ color:"#fff" }}>🐄 Rebanho</Link>
              <Link href="/cloudsync" style={{ color:"#fff" }}>☁️ CloudSync</Link>
              {isAdmin && <Link href="/admin" style={{ color:"#fff" }}>🛠️ Admin</Link>}
            </nav>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              {email ? (
                <>
                  <span style={{ fontSize: 12, opacity: 0.9 }}>Conectado: {email}</span>
                  <button
                    onClick={async () => { await signOut(); location.reload(); }}
                    style={{ background:"#fff", color:"#155724", border:"none", padding:"6px 10px", borderRadius:6, cursor:"pointer" }}
                  >Sair</button>
                </>
              ) : (
                <Link href="/login" style={{ background:"#fff", color:"#155724", padding:"6px 10px", borderRadius:6 }}>Entrar</Link>
              )}
            </div>
          </div>
        </header>
        <main style={{ padding: 20 }}>{children}</main>
        <footer style={{ textAlign: "center", padding: 14, color: "#555" }}>
          © {new Date().getFullYear()} PecuariaTech — Triângulo 360° Cloud
        </footer>
      </body>
    </html>
  );
}
"@ | Out-File -Encoding utf8 .\app\layout.tsx

# 5) / (home)
@"
export default function Page() {
  return (
    <section>
      <h1>Bem-vindo ao PecuariaTech Cloud 🌎</h1>
      <p>Use o menu acima para navegar pelos módulos. O CloudSync mostra a saúde do Triângulo 360°.</p>
    </section>
  );
}
"@ | Out-File -Encoding utf8 .\app\page.tsx

# 6) /cloudsync (público: leitura)
@"
""use client"";
import { useEffect, useState } from ""react"";
import { createClient } from ""@supabase/supabase-js"";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from ""recharts"";

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
      .from(""triangulo_monitor_v55"")
      .select(""*"");
    if (!error && data) {
      setRows(data as Row[]);
      const total = data.length || 1;
      const oks = data.filter((d:any) => String(d.status_geral).includes(""🟢"")).length;
      setUptime(Math.round((oks / total) * 100));
      setAtualizado(new Date().toLocaleString(""pt-BR""));
    }
  }

  useEffect(() => {
    carregar();
    const ch = supabase
      .channel(""triangulo-rt"")
      .on(""postgres_changes"", { event: ""*"", schema: ""public"", table: ""triangulo_logs"" }, carregar)
      .subscribe();
    const t = setInterval(carregar, 15000);
    return () => { supabase.removeChannel(ch); clearInterval(t); };
  }, []);

  return (
    <div className=""p-4 bg-white rounded-xl shadow"" style={{ padding: 16, background: ""#fff"", borderRadius: 12 }}>
      <h1 style={{ marginBottom: 8 }}>☁️ CloudSync — Triângulo 360°</h1>
      <div style={{ marginBottom: 10 }}>Uptime geral: <b>{uptime}%</b> — Última atualização: {atualizado || ""—""}</div>

      <div style={{ width: ""100%"", height: 280, background: ""#fafafa"", borderRadius: 8, padding: 8 }}>
        <ResponsiveContainer>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray=""3 3"" />
            <XAxis dataKey=""modulo"" />
            <YAxis />
            <Tooltip />
            <Line type=""monotone"" dataKey=""tempo_medio_ms"" stroke=""#16a34a"" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <table style={{ width: ""100%"", marginTop: 14, fontSize: 14, background: ""#fff"", borderCollapse: ""collapse"" }}>
        <thead>
          <tr style={{ background: ""#0a7b37"", color: ""#fff"" }}>
            <th style={{ padding: 8, textAlign: ""left"" }}>Módulo</th>
            <th style={{ padding: 8 }}>Total</th>
            <th style={{ padding: 8 }}>OK</th>
            <th style={{ padding: 8 }}>Falhas</th>
            <th style={{ padding: 8 }}>Tempo médio (ms)</th>
            <th style={{ padding: 8 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: ""1px solid #eee"", textAlign: ""center"" }}>
              <td style={{ padding: 8, textAlign: ""left"" }}>{r.modulo}</td>
              <td>{r.total_testes}</td>
              <td>{r.total_ok}</td>
              <td>{r.total_falhas}</td>
              <td>{Math.round(Number(r.tempo_medio_ms) || 0)}</td>
              <td>{r.status_geral}</td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={6} style={{ padding: 10, color: ""#666"" }}>Sem dados para exibir.</td></tr>
          )}
        </tbody>
      </table>

      <button onClick={carregar} style={{ marginTop: 12, background: ""#155724"", color: ""#fff"", padding: ""8px 12px"", borderRadius: 8, border: ""none"", cursor: ""pointer"" }}>
        🔁 Recarregar
      </button>
    </div>
  );
}
"@ | Out-File -Encoding utf8 .\app\cloudsync\page.tsx

# 7) /login (Supabase Auth email/senha)
@"
""use client"";
import { useState } from ""react"";
import { supabase } from ""@/lib/supabase-browser"";
import { useRouter } from ""next/navigation"";

export default function LoginPage() {
  const [email, setEmail] = useState("""");
  const [senha, setSenha] = useState("""");
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setMsg(""Falha no login: "" + error.message);
      return;
    }
    setMsg(""Login realizado. Redirecionando..."");
    setTimeout(() => router.push(""/admin""), 600);
  }

  return (
    <div style={{ maxWidth: 420, margin: ""40px auto"", background: ""#fff"", padding: 16, borderRadius: 12 }}>
      <h1>Entrar (Admin)</h1>
      <form onSubmit={entrar} style={{ display: ""grid"", gap: 10 }}>
        <label>Email
          <input value={email} onChange={e => setEmail(e.target.value)} required type=""email"" placeholder=""email"" style={{ width: ""100%"", padding: 8, marginTop: 4 }}/>
        </label>
        <label>Senha
          <input value={senha} onChange={e => setSenha(e.target.value)} required type=""password"" placeholder=""senha"" style={{ width: ""100%"", padding: 8, marginTop: 4 }}/>
        </label>
        <button type=""submit"" style={{ background: ""#155724"", color: ""#fff"", padding: ""8px 12px"", borderRadius: 8, border: ""none"", cursor: ""pointer"" }}>
          Entrar
        </button>
        {msg && <div style={{ fontSize: 12, color: ""#333"" }}>{msg}</div>}
      </form>
      <p style={{ fontSize: 12, color: ""#666"", marginTop: 8 }}>Somente o administrador deve usar esta página.</p>
    </div>
  );
}
"@ | Out-File -Encoding utf8 .\app\login\page.tsx

# 8) /admin (restrito por email)
@"
""use client"";
import { useEffect, useState } from ""react"";
import { supabase } from ""@/lib/supabase-browser"";
import { getSession, ADMIN_EMAIL } from ""@/lib/auth"";

export default function AdminPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);

  async function carregar() {
    const { data } = await supabase.from(""triangulo_logs"").select(""*"").order(""id"", { ascending: false }).limit(50);
    setRows(data ?? []);
  }

  useEffect(() => {
    (async () => {
      const session = await getSession();
      const ok = session?.user?.email === ADMIN_EMAIL;
      setAllowed(ok);
      if (!ok) return;
      await carregar();
      const ch = supabase.channel(""logs-rt"").on(""postgres_changes"", { event: ""*"", schema: ""public"", table: ""triangulo_logs"" }, carregar).subscribe();
      return () => { supabase.removeChannel(ch); };
    })();
  }, []);

  if (allowed === null) return <div>Verificando credenciais…</div>;
  if (!allowed) return <div style={{ padding: 16 }}>Acesso restrito. Faça login como administrador.</div>;

  async function limpar() {
    setMsg(null);
    const { error } = await supabase.from(""triangulo_logs"").delete().neq(""id"", -1);
    if (error) { setMsg(""Erro ao limpar: "" + error.message); return; }
    setMsg(""Logs limpos com sucesso."");
    await carregar();
  }

  return (
    <div style={{ padding: 12 }}>
      <h1>🛠️ Painel do Administrador</h1>
      <p>Email admin: <b>{ADMIN_EMAIL}</b></p>
      <div style={{ display: ""flex"", gap: 8, margin: ""8px 0"" }}>
        <button onClick={carregar} style={{ padding:"6px 10px", borderRadius:8, border:"1px solid #ccc", cursor:"pointer" }}>🔁 Recarregar</button>
        <button onClick={limpar} style={{ padding:"6px 10px", borderRadius:8, border:"1px solid #c33", color:"#c33", cursor:"pointer" }}>🧹 Limpar logs</button>
      </div>
      {msg && <div style={{ fontSize: 12, color: ""#155724"" }}>{msg}</div>}

      <div style={{ overflowX: ""auto"", background:"#fff", borderRadius: 8, padding: 8, marginTop: 8 }}>
        <table style={{ width: ""100%"", borderCollapse:"collapse"" }}>
          <thead>
            <tr style={{ background:"#0a7b37"", color:"#fff"" }}>
              <th style={{ padding: 6 }}>ID</th>
              <th style={{ padding: 6 }}>Módulo</th>
              <th style={{ padding: 6 }}>Status</th>
              <th style={{ padding: 6 }}>Tempo (ms)</th>
              <th style={{ padding: 6 }}>Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r:any) => (
              <tr key={r.id} style={{ borderTop: ""1px solid #eee"", textAlign:"center"" }}>
                <td style={{ padding: 6 }}>{r.id}</td>
                <td style={{ padding: 6 }}>{r.modulo}</td>
                <td style={{ padding: 6 }}>{r.status}</td>
                <td style={{ padding: 6 }}>{r.tempo_ms}</td>
                <td style={{ padding: 6 }}>{r.data_hora}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} style={{ padding: 10, color: ""#666"" }}>Sem registros.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
"@ | Out-File -Encoding utf8 .\app\admin\page.tsx

# 9) globals.css mínimo (se não existir)
if (-not (Test-Path .\app\globals.css)) {
@"
body { background:#f4f6f8; color:#222; }
table { font-size:14px; }
"@ | Out-File -Encoding utf8 .\app\globals.css
}

Write-Host "`n✅ Setup v6.4 concluído!"
Write-Host "Agora rode: npm run dev e acesse:" -ForegroundColor Yellow
Write-Host " - http://localhost:3000/cloudsync  (público - leitura)"
Write-Host " - http://localhost:3000/login      (admin: pecuariatech.br@gmail.com)"
Write-Host " - http://localhost:3000/admin      (restrito ao admin)"
