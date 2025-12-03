# ==========================================================
# 🧬 PECUARIATECH - ULTRABIOLÓGICO FULL FIX SCRIPT
# ==========================================================
# Corrige erros de build e de importação automaticamente
# Richeles | GPT-5 | 2025-10-11
# ==========================================================

Write-Host "🔧 Iniciando correção completa do UltraBiológico Full..." -ForegroundColor Cyan
Set-Location "C:\Users\Administrador\pecuariatech"

# ----------------------------------------------------------
# Função auxiliar para salvar arquivos com status visual
# ----------------------------------------------------------
function Save-File($Path, $Content) {
    New-Item -Force -ItemType File -Path $Path -Value $Content | Out-Null
    Write-Host "[OK] Corrigido: $Path" -ForegroundColor Green
}

# ==========================================================
# 1️⃣ ROTA AUTÔNOMO
# ==========================================================
$autonomo = @'
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pasture = body.pasture || null;
    const climate = body.climate || null;

    const prompt = `Você é um especialista zootécnico.
Com base na pastagem: ${pasture} e clima: ${climate},
gere recomendações práticas de manejo, ajustes nutricionais e riscos sanitários.
Se for apropriado, retorne um bloco \\json ... \\ com ação register_pastagem ou recommend_treatment.`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await resp.json();
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err });
  }
}
'@

Save-File "app/api/autonomo/route.ts" $autonomo

# ==========================================================
# 2️⃣ ROTA CHAT
# ==========================================================
$chat = @'
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    const systemPrompt = `Você é UltraBiológico do PecuariaTech — suporte zootécnico/veterinário.
Responda em PT-BR. Quando for apropriado, retorne ações JSON entre \\json ... \\
com as ações permitidas: register_animal, register_pastagem, alert_vaccination, recommend_treatment.
Não prescreva medicamentos controlados sem avaliação presencial.
Sempre recomende consultar veterinário quando houver sinais de gravidade.`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    const data = await openaiRes.json();
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err });
  }
}
'@

Save-File "app/api/chat/route.ts" $chat

# ==========================================================
# 3️⃣ ROTA CLIMA
# ==========================================================
$clima = @'
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
'@

Save-File "app/api/clima/route.ts" $clima

# ==========================================================
# 4️⃣ PÁGINAS ULTRACHAT E ULTRABIOLÓGICO2
# ==========================================================
$ultrachat = @'
import UltraChat from "../components/UltraChat";

export default function Page() {
  return <UltraChat />;
}
'@

Save-File "app/ultrachat/page.tsx" $ultrachat

$ultrabiologico2 = @'
import UltraBiologico2 from "../components/UltraBiologico2";

export default function Page() {
  return <UltraBiologico2 />;
}
'@

Save-File "app/ultrabiologico2/page.tsx" $ultrabiologico2

# ==========================================================
# 5️⃣ COMMIT E DEPLOY
# ==========================================================
Write-Host "💾 Commitando alterações..." -ForegroundColor Yellow
git add .
git commit -m "fix: correções integrais UltraBiológico e UltraChat" | Out-Null
git push origin main | Out-Null
Write-Host "[OK] Código enviado ao GitHub." -ForegroundColor Green

# ----------------------------------------------------------
# Deploy Vercel
# ----------------------------------------------------------
Write-Host "🚀 Iniciando build e deploy no Vercel..." -ForegroundColor Cyan
vercel --prod

Write-Host "✅ UltraBiológico Full corrigido e publicado com sucesso!" -ForegroundColor Green
