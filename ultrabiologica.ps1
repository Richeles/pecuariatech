<# UltraBiológica Cloud v5.3 — PecuariaTech Painel de Voo #>
param(
  [ValidateSet('dev','build','deploy')]
  [string]$Mode = 'dev',
  [string]$RepoUrl = 'https://github.com/Richeles/pecuariatech.git',
  [string]$Branch = 'main',
  [switch]$OpenSite,
  [string]$AutoCommit
)

$ErrorActionPreference = 'Stop'
$ScriptRoot = (Get-Location).Path
$LogDir = Join-Path $ScriptRoot 'logs'
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
$LogFile = Join-Path $LogDir ('ultrabiologica_{0:yyyy-MM-dd_HH-mm-ss}.log' -f (Get-Date))
Start-Transcript -Path $LogFile -Force | Out-Null

function W($t,$c='White'){Write-Host "[INFO]" $t -ForegroundColor $c}
function Warn($t){Write-Host "[WARN]" $t -ForegroundColor Yellow}
function Err($t){Write-Host "[ERRO]" $t -ForegroundColor Red}

function Send-Telegram($txt){
  if ($env:TELEGRAM_BOT_TOKEN -and $env:TELEGRAM_CHAT_ID){
    try{
      Invoke-RestMethod -Uri "https://api.telegram.org/bot$($env:TELEGRAM_BOT_TOKEN)/sendMessage" `
        -Method Post -Body @{chat_id=$env:TELEGRAM_CHAT_ID;text=$txt} | Out-Null
    }catch{Warn "Falha Telegram: $($_.Exception.Message)"}
  }
}

function Find-Proj{
  $cands=@("pecuariatech","pecuaritech","pecuaria")
  $dirs=@((Get-Location).Path,$env:USERPROFILE,"C:\Users\Administrador")|?{Test-Path $_}
  foreach($d in $dirs){foreach($c in $cands){
    $p=Join-Path $d $c
    if(Test-Path (Join-Path $p 'package.json')){return $p}
  }}
  return $null
}

function Clone-Proj{
  param($url)
  $t=Join-Path $env:USERPROFILE 'pecuariatech'
  if(-not(Test-Path $t)){git clone $url $t}
  return $t
}

function PM($p){
  if(Test-Path "$p\pnpm-lock.yaml"){return 'pnpm'}
  if(Test-Path "$p\yarn.lock"){return 'yarn'}
  return 'npm'
}

function Ensure-Deps($p,$m){
  if(-not(Test-Path "$p\node_modules")){
    W "Instalando dependências ($m)..."
    Push-Location $p
    switch($m){'pnpm'{pnpm i};'yarn'{yarn};default{npm i}}
    Pop-Location
  }else{W "Dependências ok."}
}

function Ensure-Env($p){
  $f="$p\.env.local"
  if(-not(Test-Path $f)){
@"
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SEU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=SEU_SERVICE_ROLE_KEY
"@|Out-File -Encoding utf8 $f
    Warn ".env.local criado. Configure suas chaves Supabase."
  }else{W ".env.local encontrado."}
}

function Diagnostics($p){
  try{node -v}catch{Warn "Node não encontrado"}
  try{git --version}catch{Warn "Git não encontrado"}
  $envMap=Get-Content "$p\.env.local" -ErrorAction SilentlyContinue|?{$_ -match "="}|%{
    $k,$v=$_ -split '=',2;$envMap=@{};$envMap[$k]=$v.Trim()
  }
}

function Deploy($p){
  Push-Location $p
  git fetch --all
  git checkout $Branch
  git pull origin $Branch
  if($AutoCommit){git add -A;git commit -m $AutoCommit 2>$null|Out-Null}
  git push origin $Branch
  Pop-Location
  Send-Telegram "Deploy PecuariaTech branch $Branch iniciado"
  if($OpenSite){Start-Process "https://pecuariatech.com"}
}

try{
  $proj=Find-Proj
  if(-not$proj){Warn "Projeto não encontrado — clonando...";$proj=Clone-Proj $RepoUrl}
  if(-not(Test-Path $proj)){throw "Falha ao localizar ou criar o projeto."}
  W "Projeto: $proj"
  $pm=PM $proj;W "Gerenciador detectado: $pm"
  Ensure-Env $proj
  Diagnostics $proj
  Ensure-Deps $proj $pm

  Push-Location $proj
  switch($Mode){
    'dev'{W "Modo DEV ativo";switch($pm){'pnpm'{pnpm dev};'yarn'{yarn dev};default{npm run dev}}}
    'build'{W "Build produção...";switch($pm){'pnpm'{pnpm build};'yarn'{yarn build};default{npm run build}}}
    'deploy'{W "Iniciando deploy...";Deploy $proj}
  }
  Pop-Location
  W "Log: $LogFile"
}catch{
  Err $_.Exception.Message
  Send-Telegram "Erro UltraBiológica: $($_.Exception.Message)"
}finally{
  Stop-Transcript|Out-Null
}
