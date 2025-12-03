<#
.SYNOPSIS
UltraFix-Integracao.ps1 - Script único para integração do UltraSimbioFusion no dashboard PecuariaTech

.DESCRIPTION
1. Instala dependências do projeto (Node.js, framer-motion)
2. Cria componente UltraSimbioViz.tsx
3. Integra o componente no app/page.tsx
4. Faz backup do arquivo original antes de alterar
#>

# --- Configurações ---
$ProjectPath = "C:\Users\Administrador\pecuariatech"
$ComponentPath = "$ProjectPath\app\components\UltraSimbioViz.tsx"
$PagePath = "$ProjectPath\app\page.tsx"
$BackupPage = "$ProjectPath\app/page.tsx.bak"

# --- Entrar no diretório do projeto ---
Write-Host "📁 Entrando no diretório do projeto..."
Set-Location $ProjectPath

# --- Instalar dependências ---
Write-Host "📦 Instalando dependências do Node.js..."
npm install
npm install framer-motion

# --- Criar componente UltraSimbioViz ---
Write-Host "🛠 Criando componente UltraSimbioViz..."
$UltraSimbioVizContent = @"
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Fusion {
  Elemento1: string;
  Elemento2: string;
  Vertice: string;
  Estado: string;
  Persepcao: number;
  Cofatores: string[];
  Timestamp: string;
}

export default function UltraSimbioViz() {
  const [fusion, setFusion] = useState<Fusion | null>(null);

  const runFusion = () => {
    const result: Fusion = {
      Elemento1: "Elemento_A",
      Elemento2: "Elemento_B",
      Vertice: "Vertice_Central",
      Estado: "Auto-Promovido e Auto-Avançado",
      Persepcao: 1,
      Cofatores: ["Colaboração", "Percepção"],
      Timestamp: new Date().toLocaleString(),
    };
    setFusion(result);
  };

  return (
    <div className="p-6 bg-green-800 text-white rounded-xl shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-4">🔱 UltraSimbioFusion</h2>
      <button
        onClick={runFusion}
        className="mb-6 px-4 py-2 bg-green-700 hover:bg-green-600 rounded"
      >
        🔹 Executar Fusão
      </button>

      {fusion && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-green-700 p-4 rounded-lg space-y-2"
        >
          <p>🌟 <strong>Elemento1:</strong> {fusion.Elemento1}</p>
          <p>🌟 <strong>Elemento2:</strong> {fusion.Elemento2}</p>
          <p>📍 <strong>Vértice:</strong> {fusion.Vertice}</p>
          <p>⚡ <strong>Estado:</strong> {fusion.Estado}</p>
          <p>👁 <strong>Percepção:</strong> {fusion.Persepcao}</p>
          <p>🤝 <strong>Cofatores:</strong> {fusion.Cofatores.join(", ")}</p>
          <p>⏱ <strong>Timestamp:</strong> {fusion.Timestamp}</p>
        </motion.div>
      )}
    </div>
  );
}
"@
Set-Content -Path $ComponentPath -Value $UltraSimbioVizContent -Force
Write-Host "✅ Componente criado em $ComponentPath"

# --- Backup do page.tsx ---
if (Test-Path $BackupPage) {
    Write-Host "⚠ Backup já existe em $BackupPage, pulando..."
} else {
    Copy-Item -Path $PagePath -Destination $BackupPage
    Write-Host "💾 Backup criado em $BackupPage"
}

# --- Integrar no page.tsx ---
Write-Host "🔗 Integrando UltraSimbioViz no page.tsx..."

$PageContent = Get-Content $PagePath -Raw

# Verifica se o import já existe
if ($PageContent -notmatch 'UltraSimbioViz') {
    $PageContent = $PageContent -replace '(?<=from "\.\.\/lib\/supabaseClient";)', "`r`nimport UltraSimbioViz from './components/UltraSimbioViz';"
    # Adiciona o componente antes da seção de alertas
    $PageContent = $PageContent -replace '(?=<section className="mb-8">\s*<h2 className="text-2xl font-semibold mb-4">Alertas</h2>)', "`r`n<UltraSimbioViz />`r`n"
    Set-Content -Path $PagePath -Value $PageContent -Force
    Write-Host "✅ Integração realizada com sucesso!"
} else {
    Write-Host "⚠ UltraSimbioViz já está integrado no page.tsx"
}

Write-Host "🎯 Script concluído! Rode 'npm run dev' e acesse http://localhost:3000"
