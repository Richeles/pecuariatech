Write-Host "🚀 Iniciando setup completo do PecuariaTech com Supabase..."

# 1. Instalar dependências
Write-Host "📦 Instalando dependências..."
npm install @supabase/supabase-js axios

# 2. Criar pastas se não existirem
Write-Host "📂 Criando estrutura de pastas..."
if (!(Test-Path "pages")) { mkdir pages }
if (!(Test-Path "lib")) { mkdir lib }

# 3. Criar supabaseClient.ts
$clientCode = @"
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
"@
Set-Content -Path "lib/supabaseClient.ts" -Value $clientCode -Encoding UTF8

# 4. Criar página inicial index.tsx
$indexCode = @"
export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>🚀 PecuariaTech Online</h1>
      <p>Seu projeto Next.js está rodando com Supabase!</p>
      <a href='/teste'>Ir para página de teste</a>
    </div>
  );
}
"@
Set-Content -Path "pages/index.tsx" -Value $indexCode -Encoding UTF8

# 5. Criar página de teste teste.tsx
$testeCode = @"
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Teste() {
  const [pastagem, setPastagem] = useState<any[]>([]);
  const [financeiro, setFinanceiro] = useState<any[]>([]);
  const [rebanho, setRebanho] = useState<any[]>([]);
  const [racas, setRacas] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      let { data: pastagemData } = await supabase.from('pastagem').select('*');
      setPastagem(pastagemData || []);

      let { data: financeiroData } = await supabase.from('financeiro').select('*');
      setFinanceiro(financeiroData || []);

      let { data: rebanhoData } = await supabase.from('rebanho').select('*');
      setRebanho(rebanhoData || []);

      let { data: racasData } = await supabase.from('racas').select('*');
      setRacas(racasData || []);
    }
    fetchData();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🚀 Teste de Integração Supabase</h1>

      <section>
        <h2>🌱 Pastagem</h2>
        <ul>{pastagem.map((p) => <li key={p.id}>{p.nome} - {p.area_ha} ha</li>)}</ul>
      </section>

      <section>
        <h2>💰 Financeiro</h2>
        <ul>{financeiro.map((f) => <li key={f.id}>{f.descricao} - R$ {f.valor}</li>)}</ul>
      </section>

      <section>
        <h2>🐄 Rebanho</h2>
        <ul>{rebanho.map((r) => <li key={r.id}>{r.nome} - {r.raca}</li>)}</ul>
      </section>

      <section>
        <h2>📖 Raças</h2>
        <ul>{racas.map((ra) => <li key={ra.id}>{ra.raca} - {ra.clima_ideal}</li>)}</ul>
      </section>
    </div>
  );
}
"@
Set-Content -Path "pages/teste.tsx" -Value $testeCode -Encoding UTF8

# 6. Criar seed.js para popular Supabase
$seedCode = @"
import axios from 'axios';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('❌ Variáveis de ambiente não configuradas (.env.local).');
  process.exit(1);
}

async function insertData() {
  try {
    console.log('🌱 Inserindo dados de teste...');

    // Pastagem
    await axios.post(`${supabaseUrl}/rest/v1/pastagem`, {
      nome: 'Pasto Principal',
      area_ha: 50,
      tipo_pasto: 'Braquiária',
      qualidade: 'Boa',
      latitude: -20.45,
      longitude: -54.62
    }, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, Prefer: 'return=minimal' } });

    // Financeiro
    await axios.post(`${supabaseUrl}/rest/v1/financeiro`, {
      descricao: 'Compra de ração',
      valor: 1200,
      data: '2025-09-01',
      categoria: 'Despesa'
    }, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, Prefer: 'return=minimal' } });

    // Rebanho
    await axios.post(`${supabaseUrl}/rest/v1/rebanho`, {
      nome: 'Vaca Mimosa',
      raca: 'Nelore',
      idade: 4
    }, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, Prefer: 'return=minimal' } });

    // Raças
    await axios.post(`${supabaseUrl}/rest/v1/racas`, {
      raca: 'Angus',
      cruzamento: 'Nenhum',
      clima_ideal: 'Frio',
      ganho_peso_dia: 1.2
    }, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, Prefer: 'return=minimal' } });

    console.log('✅ Dados inseridos com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao inserir dados:', err.response?.data || err.message);
  }
}

insertData();
"@
Set-Content -Path "seed.js" -Value $seedCode -Encoding UTF8

# 7. Rodar seed.js
Write-Host "▶️ Executando seed.js..."
node seed.js

# 8. Subir servidor local
Write-Host "▶️ Iniciando servidor Next.js..."
npm run dev
