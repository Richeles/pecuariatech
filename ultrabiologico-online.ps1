function Write-Stamp {
    param([string]$Message)
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Message"
}

Write-Stamp "Iniciando automação do PecuariaTech (modo online)."

# 1. Atualizar dependências
Write-Stamp "Atualizando dependências..."
npm install --legacy-peer-deps | Out-Null

# 2. Build local
Write-Stamp "Executando build local..."
npm run build | Out-Null

# 3. Deploy no Vercel
Write-Stamp "Realizando deploy no Vercel..."
vercel --prod --yes | Out-Null

# 4. Configurar domínio
$Domain = "pecuariatech.com"
Write-Stamp "Configurando domínio $Domain..."
vercel domains add $Domain --yes | Out-Null
vercel domains add "www.$Domain" --yes | Out-Null
vercel alias set pecuariatech "www.$Domain" --yes | Out-Null

# 5. Checar DNS
function Test-DNS {
    param([string]$d)
    try {
        $records = (Resolve-DnsName $d -Type CNAME -ErrorAction Stop).NameHost
        return $records -like "*vercel-dns.com"
    } catch {
        return $false
    }
}

Write-Stamp "Verificando propagação do DNS..."
$dnsOk = $false
for ($i=0; $i -lt 30; $i++) {
    if (Test-DNS "www.$Domain") {
        Write-Stamp "DNS de www.$Domain já aponta para Vercel."
        $dnsOk = $true
        break
    } else {
        Write-Stamp "Aguardando propagação DNS... (tentativa $($i+1)/30)"
        Start-Sleep -Seconds 30
    }
}

if (-not $dnsOk) {
    Write-Stamp "DNS não propagou. Verifique no painel do provedor de domínio."
    exit 1
}

# 6. Monitorar SSL
Write-Stamp "Aguardando ativação do SSL..."
for ($i=0; $i -lt 30; $i++) {
    try {
        $req = Invoke-WebRequest "https://www.$Domain" -UseBasicParsing -TimeoutSec 10
        if ($req.StatusCode -eq 200) {
            Write-Stamp "Site online com SSL ativo: https://www.$Domain"
            exit 0
        }
    } catch {
        Write-Stamp "SSL ainda não ativo... (tentativa $($i+1)/30)"
    }
    Start-Sleep -Seconds 30
}

Write-Stamp "SSL não ficou ativo dentro do tempo esperado. Verifique no painel do Vercel."
exit 1
