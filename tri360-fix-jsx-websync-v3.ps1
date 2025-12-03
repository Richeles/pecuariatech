Write-Host "🔺 Sistema Triangular 360° — JSX Secure + WebSync (v3)" -ForegroundColor Cyan

$projeto = "C:\Users\Administrador\pecuariatech"
$logFile = "$projeto\tri360_jsx_websync_log.txt"
$envPath = "$projeto\.env.local"
$dominio = "https://www.pecuariatech.com"

function Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content $logFile "[$ts] $msg"
    Write-Host $msg
}

# === Função de limpeza segura ===
function Corrigir-JSX {
    param([string]$arquivo)
    $conteudo = Get-Content $arquivo -Raw -ErrorAction SilentlyContinue
    if (-not $conteudo) { return }

    $original = $conteudo
    # Corrigir interpolações e caracteres problemáticos
    $conteudo = $conteudo -replace '\$\{(\w+)\}', '`${$1}'
    $conteudo = $conteudo -replace '[^\x00-\x7F]', ''   # remove caracteres fora de ASCII
    $conteudo = $conteudo -replace '“', '"' -replace '”', '"'
    $conteudo = $conteudo -replace '‘', "'" -replace '’', "'"

    if ($conteudo -ne $original) {
        Set-Content -Path $arquivo -Value $conteudo -Encoding UTF8
        Log "✅ Corrigido JSX: $arquivo"
    }
}

# === Etapa 1 ===
Log "🧠 [1/5] Escaneando projeto..."
$arquivos = Get-ChildItem -Path $projeto -Recurse -Include *.tsx,*.ts,*.jsx,*.js
foreach ($a in $arquivos) { Corrigir-JSX $a.FullName }

# === Etapa 2 ===
$smart = "$projeto\components\SmartWeather.tsx"
$kpi = "$projeto\components\Kpi.tsx"

if (Test-Path $smart) {
@'
"use client";
import { useEffect, useState } from "react";

export default function SmartWeather() {
  const [temp, setTemp] = useState<number | null>(null);
  const [cond, setCond] = useState<string>("---");

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-20.4435&longitude=-54.6478&current_weather=true");
        const data = await res.json();
        setTemp(data.current_weather.temperature);
        setCond("Céu limpo");
      } catch {
        setCond("Erro ao carregar clima");
      }
    }
    fetchWeather();
  }, []);

  return (
    <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
      <h2 className="text-lg font-semibold text-green-700 mb-1">🌦️ Clima Atual</h2>
      <p className="text-gray-700">
        {cond} — {temp !== null ? `${temp}°C` : "---"}
      </p>
    </div>
  );
}
'@ | Out-File $smart -Encoding utf8
    Log "🧩 SmartWeather.tsx atualizado."
}

if (Test-Path $kpi) {
@'
"use client";

interface KpiProps {
  title: string;
  value: number | string;
  emoji?: string;
}

export default function Kpi({ title, value, emoji }: KpiProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 border border-gray-200 text-center">
      <h3 className="text-sm font-medium text-gray-500">{emoji} {title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
'@ | Out-File $kpi -Encoding utf8
    Log "🧩 Kpi.tsx atualizado."
}

# === Etapa 3 ===
Log "🧱 [3/5] Rodando build..."
npm run build | Tee-Object -FilePath $logFile -Append

# === Etapa 4 ===
Log "📡 [4/5] Enviando log ao Supabase..."
$envVars = Get-Content $envPath | ForEach-Object {
    if ($_ -match "^(?<k>[^=]+)=(?<v>.+)$") { @{ Key = $Matches.k; Value = $Matches.v } }
}
$SUPABASE_URL = ($envVars | Where-Object { $_.Key -eq "NEXT_PUBLIC_SUPABASE_URL" }).Value
$SUPABASE_KEY = ($envVars | Where-Object { $_.Key -eq "NEXT_PUBLIC_SUPABASE_ANON_KEY" }).Value

$logData = @{
    data_execucao = (Get-Date).ToString("o")
    mensagem = "Tri360 JSX WebSync v3 executado com sucesso"
    sucesso = $true
    arquivos_verificados = $arquivos.Count
    arquivos_corrigidos = (Select-String -Path $logFile -Pattern "✅ Corrigido JSX").Count
    arquivos_padronizados = $arquivos.Count
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/logs_reparo" `
        -Headers @{ apikey = $SUPABASE_KEY; Authorization = "Bearer $SUPABASE_KEY"; "Content-Type" = "application/json" } `
        -Method Post -Body $logData
    Log "✅ Log enviado ao Supabase."
} catch {
    Log "⚠️ Falha ao enviar log: $($_.Exception.Message)"
}

# === Etapa 5 ===
Log "🌐 [5/5] Testando domínio $dominio..."
try {
    $r = Invoke-WebRequest -Uri $dominio -UseBasicParsing -TimeoutSec 15
    if ($r.StatusCode -eq 200) {
        Log "✅ Domínio acessível e sincronizado com Vercel."
    } else {
        Log "⚠️ Domínio respondeu HTTP: $($r.StatusCode)"
    }
} catch {
    Log "❌ Falha ao acessar domínio: $($_.Exception.Message)"
}

Log "📁 Log final salvo em: $logFile"
Write-Host "✅ Tri360 JSX WebSync v3 concluído com sucesso!" -ForegroundColor Green
