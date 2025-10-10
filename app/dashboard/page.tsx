import React from 'react';
export default function Dashboard() {
  return (
    <div style={{ display: 'flex', fontFamily:'sans-serif', height:'100vh' }}>
      <nav style={{ width:'200px', backgroundColor:'#2c3e50', color:'white', padding:'20px' }}>
        <h2>PecuariaTech</h2>
        <ul style={{ listStyle:'none', padding:0 }}>
          <li><a href='/dashboard' style={{ color:'white' }}>Dashboard</a></li>
          <li><a href='/rebanho' style={{ color:'white' }}>Rebanho</a></li>
          <li><a href='/pastagem' style={{ color:'white' }}>Pastagem</a></li>
          <li><a href='/ultrabiologica/status' style={{ color:'white' }}>UltraBiológica</a></li>
        </ul>
      </nav>
      <main style={{ flexGrow:1, padding:'20px' }}>
        <h1>Dashboard PecuariaTech</h1>
        <section><h3>Indicadores</h3><p>Total de animais, média de ganho de peso, área de pastagem...</p></section>
        <section><h3>Gráficos</h3><p>[Placeholder para gráficos de peso, pastagem e financeiro]</p></section>
        <section><h3>Tabela do Rebanho</h3><p>[Placeholder para tabela de animais]</p></section>
      </main>
    </div>
  );
}
