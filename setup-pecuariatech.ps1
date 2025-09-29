# 1️⃣ Definir diretório base do projeto
$baseDir = "C:\Users\Administrador\pecuariatech"

# 2️⃣ Criar pasta scripts se não existir
if (!(Test-Path "$baseDir\scripts")) {
    mkdir "$baseDir\scripts"
    Write-Host "📁 Pasta 'scripts' criada" -ForegroundColor Green
} else {
    Write-Host "📁 Pasta 'scripts' já existe" -ForegroundColor Yellow
}

# 3️⃣ Criar arquivo .env.local com suas chaves
$envFile = "$baseDir\scripts\.env.local"

@"
NEXT_PUBLIC_SUPABASE_URL=https://kpzzekflqpoeccnqfkng.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9uLCJpYXQiOjE3NTA4MDcxNTIsImV4cCI6MjA2NjM4MzE1Mn0.0QL2lRFVTXTr_2DFV0dywfElLzXirgFvx0qZRWPZUSQ
TELEGRAM_BOT_TOKEN=COLE_SEU_TOKEN_AQUI
TELEGRAM_CHAT_ID=COLE_SEU_CHAT_ID
WHATSAPP_API_URL=COLE_SUA_URL_AQUI
WHATSAPP_API_TOKEN=COLE_SEU_TOKEN_AQUI
"@ | Out-File -FilePath $envFile -Encoding UTF8

Write-Host "📄 Arquivo '.env.local' criado com sucesso em 'scripts'" -ForegroundColor Green

# 4️⃣ Criar arquivo ultrabiologico.ts
$bioFile = "$baseDir\scripts\ultrabiologico.ts"

@"
import 'dotenv/config';
import fetch from 'node-fetch';
import pino from 'pino';
import { createClient } from '@supabase/supabase-js';

// Configurar logger com pino-pretty
const logger = pino({
  transport: { target: 'pino-pretty', options: { colorize: true } }
});

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Função de alertas
async function alertAll(text: string) {
  const bot = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const apiUrl = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;

  if (bot && chatId) {
    await fetch(`https://api.telegram.org/bot${bot}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });
  }

  if (apiUrl && token) {
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ text })
    });
  }
}

// Função principal ultrabiológica
async function ultrabiologico() {
  logger.info('🚀 Iniciando análise ultrabiológica...');

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const data = await response.json();
    logger.info({ data }, '📡 Dados coletados com sucesso!');

    if (data.id === 1) {
      logger.info('🌱 Sistema biointeligente ativo e validado.');
    } else {
      logger.warn('⚠️ Algo inesperado ocorreu na validação.');
    }

    // Exemplo: consulta Supabase
    const { data: tables, error } = await supabase.from('dashboard').select('*');
    if (error) {
      await alertAll(`❌ Erro Supabase: ${error.message}`);
      logger.error({ error }, 'Erro Supabase');
    } else {
      logger.info({ tables }, '📊 Dados do Supabase carregados');
    }
  } catch (error) {
    logger.error({ error }, '💥 Erro no ultrabiologico');
    await alertAll(`❌ Erro no ultrabiologico: ${(error as Error).message}`);
  }

  logger.info('✅ Finalizado com sucesso!');
}

ultrabiologico();
"@ | Out-File -FilePath $bioFile -Encoding UTF8

Write-Host "📄 Script 'ultrabiologico.ts' criado com sucesso em 'scripts'" -ForegroundColor Green

# 5️⃣ Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
npm install dotenv node-fetch @supabase/supabase-js pino pino-pretty

Write-Host "✅ Tudo pronto! Agora você pode rodar:" -ForegroundColor Green
Write-Host "npx ts-node .\scripts\ultrabiologico.ts"
