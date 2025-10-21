"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.alertAll = alertAll;
exports.runPipeline = runPipeline;
const pino_1 = __importDefault(require("pino"));
const node_fetch_1 = __importDefault(require("node-fetch"));
// Logger ultrabiológico
exports.logger = (0, pino_1.default)({
    level: 'info',
    transport: {
        target: 'pino-pretty',
        options: { colorize: true }
    }
});
// Funções de alerta
async function sendTelegram(text) {
    const bot = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!bot || !chatId)
        return;
    await (0, node_fetch_1.default)(`https://api.telegram.org/bot${bot}/sendMessage`, {
        method: 'POST',
        body: JSON.stringify({ chat_id: chatId, text }),
        headers: { 'Content-Type': 'application/json' }
    });
}
async function sendWhatsApp(text) {
    const apiUrl = process.env.WHATSAPP_API_URL;
    const token = process.env.WHATSAPP_API_TOKEN;
    if (!apiUrl || !token)
        return;
    await (0, node_fetch_1.default)(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text })
    });
}
async function alertAll(text) {
    await Promise.allSettled([sendTelegram(text), sendWhatsApp(text)]);
}
async function runModule(name) {
    try {
        exports.logger.info({ module: name }, 'Módulo iniciado');
        // Simulação de execução
        await new Promise(res => setTimeout(res, 500));
        exports.logger.info({ module: name }, 'Módulo finalizado com sucesso');
        return { name, ok: true };
    }
    catch (err) {
        exports.logger.error({ err }, `Erro no módulo ${name}`);
        return { name, ok: false, message: err.message };
    }
}
// Pipeline principal
async function runPipeline() {
    exports.logger.info('🚀 Iniciando pipeline ultrabiológica');
    const modules = ['Rebanho', 'Pastagem', 'Financeiro', 'Alertas'];
    const results = [];
    for (const m of modules) {
        const r = await runModule(m);
        results.push(r);
        if (!r.ok)
            await alertAll(`🚨 Módulo ${r.name} falhou: ${r.message || 'erro desconhecido'}`);
    }
    const failures = results.filter(r => !r.ok);
    if (failures.length > 0)
        await alertAll(`⚠ Pipeline terminou com ${failures.length} falhas`);
    exports.logger.info({ results }, '🏁 Pipeline finalizado');
    return results;
}
// Permite execução direta
if (require.main === module)
    runPipeline();

