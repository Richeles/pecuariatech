<#
PecuariaTech Cloud - Triângulo 360° v5.1
Monitoramento com alertas visuais, sonoros e email (opcional)
Autor: Richeles  Alves dos Santos
#>

# ==== CONFIGURAÇÃO ====
$SupabaseUrl  = $env:NEXT_PUBLIC_SUPABASE_URL
$ApiKey       = $env:SUPABASE_SERVICE_ROLE_KEY
$Dominio      = "pecuariatech.com"
$Tabelas      = @("pastagem","rebanho","financeiro","racas","dashboard")
$LogDir       = "C:\Logs\PecuariaTech"
$LogFile      = Join-Path $LogDir "triangulo360_monitor.csv"

# --- email opcional ---
$EnviarEmail  = $false  # mude para $true se quiser alertas por e-mail
$EmailDe      = "alerta@pecuariatech.com"
$EmailPara    = "admin@pecuariatech.com"
$SmtpServidor = "smtp.office365.com"
$SmtpPorta    = 587
$EmailSenha   = "<senha_de_app>"

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

Write-Host "`n🚀 Triângulo 360° v5.1 — PecuariaTech Cloud Monitor" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------------"

$Resultados = @()

# 🌐 1️⃣ Rede
try {
    Test-Connection -Count 1 8.8.8.8 | Out-Null
    Write-Host "✅ Rede OK" -ForegroundColor Green
    $rede = "OK"
} catch {
    Write-Host "❌ Rede Falhou" -ForegroundColor Red
    $rede = "FALHA"
}

# 🌍 2️⃣ DNS
try {
    Resolve-DnsName $Dominio | Out-Null
    Write-Host "✅ DNS OK" -ForegroundColor Green
    $dns = "OK"
} catch {
    Write-Host "❌ DNS Falhou" -ForegroundColor Red
    $dns = "FALHA"
}

# ⚙️ 3️⃣ REST
foreach ($tabela in $Tabelas) {
    $inicio = Get-Date
    try {
        $endpoint = "$SupabaseUrl/rest/v1/$tabela"
        $headers  = @{ apikey = $ApiKey; Authorization = "Bearer $ApiKey" }
        Invoke-RestMethod -Uri $endpoint -Headers $headers -TimeoutSec 10 | Out-Null
        $tempo = ((Get-Date)-$inicio).TotalMilliseconds
        Write-Host "✅ $tabela OK ($([math]::Round($tempo,0)) ms)" -ForegroundColor Green
        $rest = "OK"
    } catch {
        $tempo = ((Get-Date)-$inicio).TotalMilliseconds
        Write-Host "❌ Falha em $tabela — $($_.Exception.Message)" -ForegroundColor Red
        [console]::beep(500,400)
        $rest = "FALHA"
    }

    $Resultados += [PSCustomObject]@{
        Data     = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
        Tabela   = $tabela
        Rede     = $rede
        DNS      = $dns
        REST     = $rest
        Tempo_ms = [math]::Round($tempo,0)
    }
}

# ==== LOG ====
$Resultados | Export-Csv -Path $LogFile -Append -NoTypeInformation
Write-Host "`n📜 Log salvo em $LogFile" -ForegroundColor Yellow

# ==== ALERTA FINAL ====
if ($Resultados.REST -contains "FALHA" -or $rede -eq "FALHA" -or $dns -eq "FALHA") {
    $mensagem = "ALERTA: Falha detectada no Triângulo 360° em $(Get-Date)"
    Write-Host "`n🔻 $mensagem" -ForegroundColor Red
    [console]::beep(400,600)

    # popup visual
    $wshell = New-Object -ComObject WScript.Shell
    $wshell.Popup($mensagem,5,"Triângulo 360° – ALERTA",48)

    # envio de e-mail opcional
    if ($EnviarEmail) {
        try {
            $smtp = New-Object Net.Mail.SmtpClient($SmtpServidor,$SmtpPorta)
            $smtp.EnableSsl = $true
            $smtp.Credentials = New-Object Net.NetworkCredential($EmailDe,$EmailSenha)
            $msg = New-Object Net.Mail.MailMessage($EmailDe,$EmailPara,"[PecuariaTech] $mensagem","Verifique o log em $LogFile")
            $smtp.Send($msg)
            Write-Host "✉️  Alerta enviado para $EmailPara" -ForegroundColor Yellow
        } catch {
            Write-Host "⚠️  Falha ao enviar e-mail: $($_.Exception.Message)" -ForegroundColor DarkYellow
        }
    }
} else {
    Write-Host "`n🟢 Triângulo 360° validado com sucesso — Sistema estável!" -ForegroundColor Green
    [console]::beep(1000,250)
}
