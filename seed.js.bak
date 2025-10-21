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
    await axios.post(${supabaseUrl}/rest/v1/pastagem, {
      nome: 'Pasto Principal',
      area_ha: 50,
      tipo_pasto: 'Braquiária',
      qualidade: 'Boa',
      latitude: -20.45,
      longitude: -54.62
    }, { headers: { apikey: anonKey, Authorization: Bearer , Prefer: 'return=minimal' } });

    // Financeiro
    await axios.post(${supabaseUrl}/rest/v1/financeiro, {
      descricao: 'Compra de ração',
      valor: 1200,
      data: '2025-09-01',
      categoria: 'Despesa'
    }, { headers: { apikey: anonKey, Authorization: Bearer , Prefer: 'return=minimal' } });

    // Rebanho
    await axios.post(${supabaseUrl}/rest/v1/rebanho, {
      nome: 'Vaca Mimosa',
      raca: 'Nelore',
      idade: 4
    }, { headers: { apikey: anonKey, Authorization: Bearer , Prefer: 'return=minimal' } });

    // Raças
    await axios.post(${supabaseUrl}/rest/v1/racas, {
      raca: 'Angus',
      cruzamento: 'Nenhum',
      clima_ideal: 'Frio',
      ganho_peso_dia: 1.2
    }, { headers: { apikey: anonKey, Authorization: Bearer , Prefer: 'return=minimal' } });

    console.log('✅ Dados inseridos com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao inserir dados:', err.response?.data || err.message);
  }
}

insertData();
