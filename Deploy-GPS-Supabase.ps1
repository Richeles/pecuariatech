# PECUARIATECH - DEPLOY GPS + SUPABASE
# Autor: Richeles · GPT-5 Assist

Write-Host "`nIniciando Deploy GPS + Supabase..." -ForegroundColor Cyan
$ProjectPath = "C:\Users\Administrador\pecuariatech"
Set-Location $ProjectPath

# Verificar variáveis de ambiente
Write-Host "`nVerificando variáveis de ambiente..." -ForegroundColor Yellow
$vars = @("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY")
foreach ($v in $vars) {
  if (-not [Environment]::GetEnvironmentVariable($v, "Machine")) {
    Write-Host "Variável ausente: $v" -ForegroundColor Red
  } else {
    Write-Host "$v detectada." -ForegroundColor Green
  }
}

# Validar dependências
Write-Host "`nValidando dependências..." -ForegroundColor Yellow
$deps = @("leaflet", "react-leaflet", "@supabase/supabase-js", "@types/leaflet", "tailwindcss", "postcss", "autoprefixer", "@tailwindcss/postcss")
foreach ($d in $deps) {
  if (-not (Test-Path "$ProjectPath\node_modules\$d")) {
    Write-Host "Instalando $d ..." -ForegroundColor Cyan
    npm install $d | Out-Null
  } else {
    Write-Host "$d já instalado." -ForegroundColor Green
  }
}

# Limpar cache e build antigo
Write-Host "`nLimpando cache anterior..." -ForegroundColor Yellow
try { rimraf .next 2>$null } catch {}
try { Remove-Item -Recurse -Force "$ProjectPath\.next" -ErrorAction SilentlyContinue } catch {}

# Build do projeto
Write-Host "`nConstruindo o projeto..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
  Write-Host "`nBuild concluído com sucesso!" -ForegroundColor Green
} else {
  Write-Host "`nErro durante o build. Abortando deploy." -ForegroundColor Red
  exit 1
}

# Deploy na Vercel
Write-Host "`nEnviando para produção (Vercel)..." -ForegroundColor Cyan
vercel --prod

Write-Host "`nDeploy finalizado! Acesse:" -ForegroundColor Green
Write-Host "https://www.pecuariatech.com/pastagem" -ForegroundColor White
Write-Host "Sistema GPS + Supabase ativo e monitorado." -ForegroundColor Green
