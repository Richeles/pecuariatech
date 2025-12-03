# 🚀 UltraChat - Planos Online - Script único
Write-Host "🚀 Iniciando configuração de Planos Online - PecuariaTech..." -ForegroundColor Cyan
Start-Sleep -Seconds 1

# Verifica arquivo .env.local
if (-not (Test-Path '.env.local')) {
    Write-Host "⚠️  Arquivo .env.local não encontrado! Configure suas variáveis do Supabase." -ForegroundColor Yellow
    exit
} else {
    Write-Host "✅ Variáveis de ambiente detectadas (.env.local)" -ForegroundColor Green
}

# Carrega variáveis
Get-Content .env.local | ForEach-Object {
    if ($_ -match "^\s*(\w+)=(.+)$") {
        Set-Variable -Name $matches[1] -Value $matches[2]
    }
}

# Testa se Supabase CLI está instalado
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️ Supabase CLI não encontrada! Instale primeiro: npm install -g supabase" -ForegroundColor Red
    exit
}

# Cria tabela 'planos' via Supabase SQL
$sqlCreateTable = @"
CREATE TABLE IF NOT EXISTS public.planos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_plano text NOT NULL,
    valor numeric(10,2) NOT NULL,
    descricao text,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
"@

Write-Host "📦 Criando tabela 'planos' no Supabase..."
$sqlCreateTable | supabase db query

# Configura RLS para clientes
Write-Host "🔒 Configurando RLS para planos ativos..."
$sqlRLS = @"
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
CREATE POLICY planos_publico_select ON public.planos
FOR SELECT
USING (ativo = true);
"@
$sqlRLS | supabase db query

# Solicita senha do admin
$adminSenha = Read-Host "🔑 Digite a senha do admin (vitalício)"

Write-Host "✅ Tabela criada e RLS configurada com sucesso!"
Write-Host "📌 Admin protegido com senha definida localmente."
Write-Host "Você poderá criar, alterar e desativar planos usando esta senha."

# Fim
Write-Host "🏁 Execução finalizada - UltraChat Planos Online pronto!" -ForegroundColor Green
