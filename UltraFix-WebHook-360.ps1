Clear-Host
Write-Host "🔵 UltraFix WebHook 360º — PecuariaTech" -ForegroundColor Cyan
Write-Host "🚀 Criando rota completa do UltraChat Webhook..." -ForegroundColor Green

# Caminho base do projeto
$base = "C:\Users\Administrador\pecuariatech"

# 1. Criar pastas corretas
$folders = @(
    "$base\app\api\ultrachat",
    "$base\app\api\ultrachat\webhook"
)

foreach ($f in $folders) {
    if (!(Test-Path $f)) {
        New-Item -ItemType Directory -Path $f | Out-Null
        Write-Host "📁 Pasta criada: $f"
    } else {
        Write-Host "✔ Pasta já existe: $f"
    }
}

# 2. Criar/atualizar arquivo route.ts
$routeFile = "$base\app\api\ultrachat\webhook\route.ts"

$code = @"
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message?.text || "";
    const chatId = body.message?.chat.id;

    if (!chatId) {
      return Response.json({ ok: false, error: "chatId inválido" });
    }

    let resposta = "Olá! Sou o UltraChat PecuariaTech 🚜🌱";

    if (message.toUpperCase() === "A") resposta = "Menu A selecionado!";
    if (message.toUpperCase() === "B") resposta = "Menu B ativo!";
    if (message.toUpperCase() === "C") resposta = "Menu C carregado!";
    if (message.toUpperCase() === "D") resposta = "Menu D funcionando!";

    await fetch(
      \`https://api.telegram.org/bot8384906982:AAFkRtD5ye7O_Z2JQNZTp9rpXweSy3RFXzg/sendMessage\`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: resposta,
        }),
      }
    );

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e.toString() });
  }
}

export function GET() {
  return Response.json({ ok: true, message: "Webhook ativo 👍" });
}
"@

Set-Content -Path $routeFile -Value $code -Encoding UTF8
Write-Host "📝 route.ts criado/atualizado com sucesso!"

# 3. Testar se o arquivo foi criado
if (Test-Path $routeFile) {
    Write-Host "✔ Arquivo detectado: $routeFile" -ForegroundColor Green
} else {
    Write-Host "❌ ERRO: route.ts não foi criado!" -ForegroundColor Red
    exit
}

# 4. Git add / commit / push
Set-Location $base

Write-Host "🔄 Enviando para GitHub..."
git add . 
git commit -m "UltraFix WebHook 360 – rota ultrachat criada" 
git push origin main

Write-Host "🚀 Deploy está sendo iniciado automaticamente na Vercel!"
Write-Host "🌐 Após o deploy, teste:"
Write-Host "    https://www.pecuariatech.com/api/ultrachat/webhook"
Write-Host ""
Write-Host "💬 Para ativar o Telegram, execute:"
Write-Host "https://api.telegram.org/bot8384906982:AAFkRtD5ye7O_Z2JQNZTp9rpXweSy3RFXzg/setWebhook?url=https://www.pecuariatech.com/api/ultrachat/webhook"
Write-Host ""
Write-Host "✨ UltraFix WebHook 360º finalizado."
