import pino from 'pino';
import fetch from 'node-fetch';

// Logger ultrabiológico
export const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

// Funções de alerta
async function sendTelegram(text: string) {
  const bot = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!bot || !chatId) return;
  await fetch(`https://api.telegram.org/bot${bot}/sendMessage`, {
    method: 'POST',
    body: JSON.stringify({ chat_id: chatId, text }),
    headers: { 'Content-Type': 'application/json' }
  });
}

async function sendWhatsApp(text: string) {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;
  if (!apiUrl || !token) return;
  await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ text })
  });
}

export async function alertAll(text: string) {
  await Promise.allSettled([sendTelegram(text), sendWhatsApp(text)]);
}

// Módulo exemplo
type ModuleResult = { name: string; ok: boolean; message?: string };

async function runModule(name: string): Promise<ModuleResult> {
  try {
    logger.info({ module: name }, 'Módulo iniciado');
    // Simulação de execução
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
  if (failures.length > 0) await alertAll(`⚠ Pipeline terminou com ${failures.length} falhas`);

  logger.info({ results }, '🏁 Pipeline finalizado');
  return results;
}

// Permite execução direta
if (require.main === module) runPipeline();

