import httpx
import asyncio

async def testar():
    async with httpx.AsyncClient(timeout=120) as client:
        payload = {
            "model": "llama3.2:3b",
            "prompt": "Você é o NURA, especialista em pecuária. Pergunta: O que é pecuária de corte?",
            "stream": False
        }
        try:
            print("Enviando requisição para Ollama...")
            response = await client.post("http://localhost:11434/api/generate", json=payload)
            print("Status:", response.status_code)
            data = response.json()
            print("Resposta (primeiros 200 caracteres):", data.get("response", "")[:200])
        except Exception as e:
            print("Erro:", e)

asyncio.run(testar())
