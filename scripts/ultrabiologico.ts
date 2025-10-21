import * as dotenv from 'dotenv';
dotenv.config({ path: './scripts/.env.local' }); // garante carregamento certo

import fetch from 'node-fetch';
import pino from 'pino';
import { createClient } from '@supabase/supabase-js';

// Logger
const logger = pino({
  transport: { target: 'pino-pretty', options: { colorize: true } }
});

// Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('⚠ Variáveis do Supabase não foram carregadas. Verifique seu .env.local');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
    await new Promise(res => setTimeout(res, 500));
    logger.info({ module: name }, 'Módulo finalizado com sucesso');
    return { name, ok: true };
  } catch (err) {
    logger.error({ err }, `Erro no módulo ${name}`);
    return { name, ok: false, message: (err as Error).message };
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

