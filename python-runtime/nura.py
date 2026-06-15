import os
import json
import hashlib
import re
import uuid
import requests
import numpy as np
from datetime import datetime
from typing import Any, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

# Carrega variáveis de ambiente
load_dotenv()

app = FastAPI()

# ============================================
# Configurações
# ============================================
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("⚠️ GROQ_API_KEY não configurada")
    groq_client = None
else:
    groq_client = Groq(api_key=GROQ_API_KEY)
MODELO_GROQ = "llama-3.1-8b-instant"

SERPER_API_KEY = os.getenv("SERPER_API_KEY")
if not SERPER_API_KEY:
    print("⚠️ SERPER_API_KEY não configurada. A busca web não estará disponível.")

# ============================================
# RAG – Conhecimento permanente (opcional, desligado por padrão para evitar excesso de memória)
# ============================================
ENABLE_RAG = os.getenv("ENABLE_RAG", "false").lower() == "true"

embedder = None
rag_index = None
rag_texts = []

def load_rag():
    """Carrega o RAG local apenas se ENABLE_RAG=true e as bibliotecas estiverem disponíveis."""
    global embedder, rag_index, rag_texts
    if not ENABLE_RAG:
        print("⚠️ RAG desabilitado (ENABLE_RAG=false). Apenas busca web e LLM.")
        return
    try:
        from sentence_transformers import SentenceTransformer
        import faiss
        embedder = SentenceTransformer('all-MiniLM-L6-v2')
    except ImportError:
        print("⚠️ sentence-transformers ou faiss não instalados. RAG não disponível.")
        return
    except Exception as e:
        print(f"⚠️ Erro ao carregar SentenceTransformer: {e}")
        return

    index_path = "data/rag/index.faiss"
    texts_path = "data/rag/texts.json"
    if os.path.exists(index_path) and os.path.exists(texts_path):
        rag_index = faiss.read_index(index_path)
        with open(texts_path, 'r', encoding='utf-8') as f:
            rag_texts = json.load(f)
        print("✅ RAG carregado do disco (local)")
    else:
        # Documentos de exemplo (apenas regras técnicas, sem preços fixos)
        docs = [
            "Brachiaria brizantha: resistente a cigarrinhas, boa produção em solos de média fertilidade.",
            "Capim Mombaça: alto valor nutritivo (12% PB), requer alta fertilidade e manejo intensivo.",
            "Sal mineral (12% PB) deve ser fornecido o ano todo. Sal proteinado (28% PB) no período seco.",
            "Confinamento: dieta total com silagem + concentrado, GMD esperado 1,5-1,8 kg/dia.",
            "Vacinas obrigatórias: febre aftosa (2x/ano), brucelose (bezerras 3-8 meses), raiva (anual), clostridioses (8 vias).",
            "1 arroba = 15 kg. Para converter kg para arroba: kg / 15. Para converter arroba para kg: arroba * 15.",
            "Preço de um animal (R$) = peso (kg) × (preço da arroba (R$) / 15).",
            "Margem de lucro (%) = (receita total - custos totais) / receita total × 100. Margem saudável >20%.",
            "Para calcular lucro de venda: receita total (quantidade × preço por animal) - custos (aquisição, alimentação, sanidade, mão de obra).",
            "Se o comprador oferecer um valor por animal, calcule o preço por kg = valor / peso. Compare com o preço de mercado por kg (preço da arroba / 15)."
        ]
        rag_texts = docs
        embeddings = embedder.encode(docs)
        dim = embeddings.shape[1]
        rag_index = faiss.IndexFlatL2(dim)
        rag_index.add(embeddings.astype(np.float32))
        os.makedirs("data/rag", exist_ok=True)
        faiss.write_index(rag_index, index_path)
        with open(texts_path, 'w', encoding='utf-8') as f:
            json.dump(rag_texts, f, indent=2)
        print("✅ RAG criado localmente (apenas regras técnicas)")

# Carrega o RAG apenas se habilitado
load_rag()

def busca_rag(pergunta: str, top_k: int = 5) -> list:
    """Retorna documentos do RAG local se ativo, senão lista vazia."""
    if not ENABLE_RAG or embedder is None or rag_index is None or not rag_texts:
        return []
    query_emb = embedder.encode([pergunta])
    distances, indices = rag_index.search(query_emb.astype(np.float32), top_k)
    return [rag_texts[i] for i in indices[0] if i != -1]

# ============================================
# Detector de perguntas dinâmicas (busca web)
# ============================================
def precisa_dados_dinamicos(pergunta: str) -> bool:
    termos = [
        "preço", "cotação", "arroba", "bezerro", "boi gordo",
        "vender", "comprar", "lucro", "margem", "dólar", "câmbio",
        "clima", "tempo", "chuva", "temperatura", "notícia", "mercado"
    ]
    return any(termo in pergunta.lower() for termo in termos)

# ============================================
# Busca na web via Serper.dev
# ============================================
async def buscar_web(pergunta: str) -> Optional[str]:
    if not SERPER_API_KEY:
        return None
    url = "https://google.serper.dev/search"
    headers = {"X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json"}
    payload = {"q": pergunta, "num": 3}
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        resultados = []
        for item in data.get("organic", []):
            titulo = item.get("title", "Sem título")
            snippet = item.get("snippet", "")
            if snippet:
                resultados.append(f"📌 {titulo}\n   {snippet[:500]}")
        return "\n".join(resultados) if resultados else None
    except Exception as e:
        print(f"Erro na busca web: {e}")
        return None

# ============================================
# Memória cache (em dicionário)
# ============================================
class MemoriaFazenda:
    def __init__(self, fazenda_id: str):
        self.fazenda_id = fazenda_id
        self.cache = {}
    def obter_cache(self, pergunta: str) -> Optional[dict]:
        h = hashlib.md5(pergunta.encode()).hexdigest()
        if h in self.cache:
            ts, resp = self.cache[h]
            if datetime.now().timestamp() - ts < 3600:
                return resp
        return None
    def salvar_cache(self, pergunta: str, resposta: dict):
        h = hashlib.md5(pergunta.encode()).hexdigest()
        self.cache[h] = (datetime.now().timestamp(), resposta)

memorias = {}
def get_memoria(fazenda_id: str):
    if fazenda_id not in memorias:
        memorias[fazenda_id] = MemoriaFazenda(fazenda_id)
    return memorias[fazenda_id]

# ============================================
# Endpoint principal
# ============================================
class Pergunta(BaseModel):
    texto: str
    fazenda_id: str = "demo_fazenda"
    plano: str = "basico"

@app.post("/nura")
async def nura(pergunta: Pergunta):
    texto_limpo = pergunta.texto.strip().lower()
    if re.match(r"^(bom dia|boa tarde|boa noite|oi|olá|ola)$", texto_limpo):
        return {"resposta": "Olá! Sou a NURA. Como posso ajudar?"}

    memoria = get_memoria(pergunta.fazenda_id)
    cached = memoria.obter_cache(pergunta.texto)
    if cached:
        return cached

    # RAG técnico (apenas se habilitado)
    rag_contexto = "\n".join(busca_rag(pergunta.texto, top_k=5)) if ENABLE_RAG else ""

    # Busca web para dados dinâmicos
    web_contexto = None
    if precisa_dados_dinamicos(pergunta.texto):
        web_resultados = await buscar_web(pergunta.texto)
        if web_resultados:
            web_contexto = f"[PESQUISA NA WEB – INFORMAÇÕES ATUALIZADAS]\n{web_resultados}\n\n⚠️ ATENÇÃO: Essas informações são obtidas de fontes públicas. Confirme os valores com sua praça e frigorífico local antes de qualquer negociação."
        else:
            web_contexto = "[NÃO FOI POSSÍVEL OBTER DADOS ATUALIZADOS. Peça ao usuário o preço da arroba, localização ou outros dados necessários.]"

    # Monta o prompt final
    prompt = f"""Você é a NURA, consultora técnica e de mercado do PecuariaTech.

**CONHECIMENTO TÉCNICO PERMANENTE (RAG):**
{rag_contexto if rag_contexto else "Nenhuma regra específica encontrada."}

**INFORMAÇÕES DINÂMICAS (MERCADO/CLIMA):**
{web_contexto if web_contexto else "Não foram utilizados dados dinâmicos para esta consulta."}

**INSTRUÇÕES OBRIGATÓRIAS:**
- Quando houver necessidade de cálculos financeiros ou produtivos oficiais, utilize os dados fornecidos pelo usuário ou pelas APIs oficiais do PecuariaTech.
- Caso não existam dados suficientes, solicite as informações necessárias em vez de assumir valores.
- Se utilizar dados da web, inclua o aviso de confirmação local.

**Pergunta do pecuarista:**
{pergunta.texto}

**Resposta (em português, objetiva, prática):**"""

    if not groq_client:
        raise HTTPException(status_code=500, detail="API Groq não configurada")
    try:
        completion = groq_client.chat.completions.create(
            model=MODELO_GROQ,
            messages=[
                {"role": "system", "content": "Você é NURA, especialista em pecuária. Responda em português, de forma clara e útil. Se faltarem dados oficiais, peça ao usuário."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=4096,
        )
        resposta = completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na Groq: {e}")

    resposta_final = {
        "resposta": resposta,
        "metadata": {
            "fonte": "rag+web" if web_contexto else ("rag" if rag_contexto else "llm"),
            "rag_ativado": ENABLE_RAG
        }
    }
    memoria.salvar_cache(pergunta.texto, resposta_final)
    return resposta_final

@app.get("/nura/health")
async def health():
    return {
        "status": "ok",
        "modelo": MODELO_GROQ,
        "rag_carregado": rag_index is not None and ENABLE_RAG,
        "busca_web_disponivel": bool(SERPER_API_KEY)
    }