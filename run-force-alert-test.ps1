# run-force-alert-test.ps1
# Cria backup, cria/atualiza .env.local, escreve uma versão de teste de ultrabiologico.ts (erro forçado em Financeiro),
# instala dependências e roda o pipeline para validar alertas.
# Execute: powershell -ExecutionPolicy Bypass -File .\run-force-alert-test.ps1

Write-Host "🚀 run-force-alert-test iniciado" -ForegroundColor Cyan

# 1) Garantir pasta scripts
if (!(Test-Path .\scripts)) {
  New-Item -ItemType Directory -Path .\scripts | Out-Null
  Write-Host "📁 Pasta 'scripts' criada" -ForegroundColor Green
} else {
  Write-Host "📁 Pasta 'scripts' já existe" -ForegroundColor Yellow
}

# 2) Backup do ultrabiologico.ts atual
$bioPath = ".\scripts\ultrabiologico.ts"
$backup = ".\scripts\ultrabiologico.ts.bak"
if (Test-Path $bioPath) {
  Copy-Item $bioPath $backup -Force
  Write-Host "📦 Backup criado: $backup" -ForegroundColor Green
} else {
  Write-Host "ℹ Não havia ultrabiologico.ts — será criado novo." -ForegroundColor Yellow
}

# 3) Carregar .env.local existente (se houver) para mostrar defaults
$envPath = ".\scripts\.env.local"
$existing = @{}
if (Test-Path $envPath) {
  Get-Content $envPath | ForEach-Object {
    if ($_ -match "^\s*#") { return }
    if ($_ -match "^\s*$") { return }
    $pair = $_ -split "=",2
    if ($pair.Length -ge 2) { $existing[$pair[0].Trim()] = $pair[1].Trim() }
  }
}

# 4) Perguntar valores (usa valores existentes como default)
function Ask([string]$label, [string]$default="") {
  if ($default -and $default.Length -gt 0) {
    $ans = Read-Host "$label [$($default.Substring(0, [Math]::Min(20,$default.Length)))...]"
    if ($ans -and $ans.Length -gt 0) { return $ans } else { return $default }
  } else {
    return Read-Host $label
  }
}

$NEXT_PUBLIC_SUPABASE_URL = Ask "NEXT_PUBLIC_SUPABASE_URL" ($existing["NEXT_PUBLIC_SUPABASE_URL"])
$SUPABASE_ANON_KEY       = Ask "SUPABASE_ANON_KEY (use anon para createClient)" ($existing["SUPABASE_ANON_KEY"])
$SUPABASE_SERVICE        = Ask "SUPABASE_SERVICE_ROLE_KEY (opcional)" ($existing["SUPABASE_SERVICE_ROLE_KEY"])
$TELEGRAM_BOT_TOKEN      = Ask "TELEGRAM_BOT_TOKEN (opcional)" ($existing["TELEGRAM_BOT_TOKEN"])
$TELEGRAM_CHAT_ID        = Ask "TELEGRAM_CHAT_ID (opcional)" ($existing["TELEGRAM_CHAT_ID"])
$WHATSAPP_API_URL        = Ask "WHATSAPP_API_URL (opcional)" ($existing["WHATSAPP_API_URL"])
$WHATSAPP_API_TOKEN      = Ask "WHATSAPP_API_TOKEN (opcional)" ($existing["WHATSAPP_API_TOKEN"])

# 5) Escrever .env.local (scripts/.env.local)
@"
NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE
TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID=$TELEGRAM_CHAT_ID
WHATSAPP_API_URL=$WHATSAPP_API_URL
WHATSAPP_API_TOKEN=$WHATSAPP_API_TOKEN
"@ | Set-Content -Path $envPath -Encoding UTF8

Write-Host "✅ .env.local salvo em scripts\.env.local" -ForegroundColor Green

# 6) Escrever a versão de teste de ultrabiologico.ts (erro forçado no Financeiro)
@"
import * as dotenv from 'dotenv';
dotenv.config({ path: './scripts/.env.local' });

import fetch from 'node-fetch';
import pino from 'pino';
import { createClient } from '@supabase/supabase-js';

// Logger com pino-pretty
const logger = pino({
  transport: { target: 'pino-pretty', options: { colorize: true } }
});

// Supabase — usa ANON key para createClient
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  logger.error('⚠ Variáveis do Supabase ausentes. Verifique scripts/.env.local');
  throw new Error('Variáveis do Supabase ausentes');
}

const supabase = createClient(supabaseUrl, supabaseAnon);

// Funções de alerta
async function sendTelegram(text: string) {
  const bot = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!bot || !chatId) return;
  await fetch(`https://api.telegram.org/bot${bot}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

async function sendWhatsApp(text: string) {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;
  if (!apiUrl || !token) return;
  await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ text })
  });
}

async function alertAll(text: string) {
  await Promise.allSettled([sendTelegram(text), sendWhatsApp(text)]);
}

// Execução de módulos
type ModuleResult = { name: string; ok: boolean; message?: string };

async function runModule(name: string): Promise<ModuleResult> {
  try {
    logger.info({ module: name }, 'Módulo iniciado');

    // Simula trabalho
    await new Promise((res) => setTimeout(res, 500));

    // 🔥 Força falha no módulo Financeiro para testar alertas
    if (name === 'Financeiro') {
      throw new Error('Erro forçado no módulo Financeiro ⚠️');
    }

    logger.info({ module: name }, 'Módulo finalizado com sucesso');
    return { name, ok: true };
  } catch (err) {
    const msg = (err as Error)?.message || 'erro desconhecido';
    logger.error({ err, module: name }, `Erro no módulo ${name}: ${msg}`);
    return { name, ok: false, message: msg };
  }
}

// Pipeline principal
export async function runPipeline() {
  logger.info('🚀 Iniciando pipeline ultrabiológica');
  const modules = ['Rebanho', 'Pastagem', 'Financeiro', 'Alertas'];
  const results: ModuleResult[] = [];

  for (const m of modules) {
    const r = await runModule(m);
    results.push(r);
    if (!r.ok) await alertAll(`🚨 Módulo ${r.name} falhou: ${r.message || 'erro desconhecido'}`);
  }

  const failures = results.filter(r => !r.ok);
  if (failures.length > 0) {
    await alertAll(`⚠ Pipeline terminou com ${failures.length} falhas`);
  }

  logger.info({ results }, '🏁 Pipeline finalizado');
  return results;
}

// Executa pipeline direto
if (require.main === module) runPipeline();
"@ | Set-Content -Path $bioPath -Encoding UTF8

Write-Host "📝 ultrabiologico.ts (versão de teste) escrito em scripts\ultrabiologico.ts" -ForegroundColor Green

# 7) Instalar dependências essenciais (não quebra se já instaladas)
Write-Host "📦 Instalando dependências (dotenv, node-fetch@2, @supabase/supabase-js, pino, pino-pretty, ts-node, typescript)..." -ForegroundColor Cyan
npm install dotenv node-fetch@2 @supabase/supabase-js pino pino-pretty ts-node typescript --save

# 8) Ajustar terminal para UTF-8 e executar
Write-Host "🔤 Ajustando console para UTF-8 (chcp 65001) e executando pipeline..." -ForegroundColor Cyan
chcp 65001 | Out-Null

Write-Host "⚡ Iniciando execução do pipeline (vai forçar erro no Financeiro)..." -ForegroundColor Yellow
npx ts-node -r dotenv/config .\scripts\ultrabiologico.ts
$exit = $LASTEXITCODE

if ($exit -ne 0) {
  Write-Host "❌ Execução retornou código $exit" -ForegroundColor Red
} else {
  Write-Host "🏁 Execução finalizada com sucesso (saída 0)." -ForegroundColor Green
}

Write-Host "👉 Para restaurar o arquivo original: if (Test-Path .\scripts\ultrabiologico.ts.bak) { Move-Item .\scripts\ultrabiologico.ts.bak .\scripts\ultrabiologico.ts -Force }" -ForegroundColor Cyan
