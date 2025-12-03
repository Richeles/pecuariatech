# ================================
# UltraFix Login + Build + Deploy
# ================================

Write-Host "🔧 Criando estrutura..."
$loginPath = "C:\Users\Administrador\pecuariatech\app\login"

if (-Not (Test-Path $loginPath)) {
    New-Item -ItemType Directory -Path $loginPath -Force | Out-Null
    Write-Host "📁 Pasta criada: $loginPath"
} else {
    Write-Host "📁 Pasta já existe: $loginPath"
}

# ================================
# Criar/Atualizar arquivo page.tsx
# ================================
Write-Host "📝 Atualizando arquivo page.tsx..."

$pageCode = @"
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    console.log("Login enviado:", email);

    if (email && senha) {
      router.push("/dashboard");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
"@

$pageCode | Set-Content -Path "$loginPath\page.tsx" -Encoding UTF8

Write-Host "✅ Arquivo page.tsx criado/atualizado com sucesso!"

# ================================
# Rodar Build Local
# ================================
Write-Host "📦 Rodando build local para testar..."

cd C:\Users\Administrador\pecuariatech

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERRO NO BUILD — Deploy cancelado!"
    exit
}

Write-Host "✅ Build OK!"

# ================================
# Deploy para a Vercel
# ================================
Write-Host "🚀 Enviando deploy para Vercel..."

vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Deploy finalizado com sucesso!"
} else {
    Write-Host "❌ Deploy falhou!"
}
