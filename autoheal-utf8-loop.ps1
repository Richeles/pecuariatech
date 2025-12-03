<#
.AUTOHEAL UTF-8 PECUARIATECH
Versão: 1.0 – Richeles Edition
Função: Repara, verifica e faz deploy automático contínuo
#>

# === CONFIGURAÇÃO BASE ===
$Path = "C:\Users\Administrador\pecuariatech"
$Log  = "$Path\autoheal.log"
$DeployScript = "$Path\full-deploy-pecuariatech.ps1"

# === FUNÇÕES ===
function Write-Log($msg, $color="White") {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $msg" -ForegroundColor $color
    Add-Content -Path $Log -Value "[$timestamp] $msg"
}

function Convert-ToUtf8($file) {
    try {
        $content = Get-Content -Raw -Encoding Default $file
        [IO.File]::WriteAllText($file, $content, (New-Object System.Text.UTF8Encoding($false)))
        return $true
    } catch {
        Write-Log "Falha ao converter: $file" "Red"
        return $false
    }
}

function Check-Utf8Integrity($file) {
    $bytes = [System.IO.File]::ReadAllBytes($file)
    return ($bytes -notcontains 0xC3 -or $bytes -notcontains 0x83) # verifica padrões comuns de BOM
}

# === CICLO LIMITE-X ===
while ($true) {
    Write-Log "🔍 Iniciando varredura UTF-8 no projeto PecuariaTech..." "Cyan"
    $files = Get-ChildItem -Path $Path -Recurse -Include *.tsx,*.ts,*.js,*.json,*.css,*.md

    $repaired = 0
    foreach ($f in $files) {
        if (-not (Check-Utf8Integrity $f.FullName)) {
            if (Convert-ToUtf8 $f.FullName) { $repaired++ }
        }
    }

    if ($repaired -eq 0) {
        Write-Log "✅ Nenhum erro UTF-8 detectado. Iniciando build e deploy..." "Green"

        cd $Path
        npm cache clean --force | Out-Null
        npm install --legacy-peer-deps | Out-Null

        $build = npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ Build bem-sucedido!" "Green"
            if (Test-Path $DeployScript) {
                Write-Log "🚀 Executando deploy automático (Vercel)..." "Cyan"
                & $DeployScript
            } else {
                Write-Log "⚠️ Script de deploy não encontrado em $DeployScript" "Yellow"
            }
            Write-Log "🎯 AutoHeal concluído com sucesso!" "Green"
            break
        } else {
            Write-Log "❌ Erro no build! Reiniciando ciclo (limite-x)..." "Red"
        }
    } else {
        Write-Log "🧩 Corrigidos $repaired arquivos UTF-8. Revalidando..." "Yellow"
    }

    Start-Sleep -Seconds 10
}
