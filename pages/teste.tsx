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
