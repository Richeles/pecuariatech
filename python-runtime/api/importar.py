from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
import pandas as pd
import io
import re
from datetime import datetime
from supabase_client import supabase

router = APIRouter(prefix="/api/importar", tags=["importador"])

# Mapeamento de colunas
MAPEAMENTO = {
    "descricao": ["descri", "historico", "documento", "lançamento", "memorial", "nome", "item"],
    "tipo": ["tipo", "categoria", "natureza"],
    "valor": ["valor", "total", "montante", "preço", "preco"],
    "data": ["data", "competência", "emissão", "movimento", "vencimento"]
}

def normalizar_colunas(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [str(col).lower().strip() for col in df.columns]
    for oficial, variacoes in MAPEAMENTO.items():
        for col in df.columns:
            if any(var in col for var in variacoes):
                df = df.rename(columns={col: oficial})
                break
    return df

def extrair_valor(valor: any) -> float:
    if isinstance(valor, (int, float)):
        return abs(float(valor))
    if isinstance(valor, str):
        valor = re.sub(r'[R$]', '', valor).strip().replace(',', '.')
        match = re.search(r'(\d+\.?\d*)', valor)
        if match:
            return abs(float(match.group(1)))
    return 0.0

def extrair_data(data: any) -> str:
    if pd.isna(data) or data is None:
        return datetime.now().strftime("%Y-%m-%d")
    if isinstance(data, pd.Timestamp):
        return data.strftime("%Y-%m-%d")
    if isinstance(data, str):
        if '/' in data:
            partes = data.split('/')
            if len(partes) == 3:
                return f"{partes[2]}-{partes[1]}-{partes[0]}"
        return str(data)
    return datetime.now().strftime("%Y-%m-%d")

def classificar_tipo(texto: str) -> str:
    texto = str(texto).lower()
    if any(p in texto for p in ['receita', 'entrada', 'venda', 'credito']):
        return 'receita'
    if any(p in texto for p in ['despesa', 'saida', 'pagamento', 'debito', 'custo']):
        return 'despesa'
    return 'receita'

@router.post("/arquivo")
async def importar_arquivo(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    tipo: str = Form("financeiro"),
    plano: str = Form("starter")
):
    try:
        conteudo = await file.read()
        
        if file.filename.endswith('.xlsx') or file.filename.endswith('.xls'):
            df = pd.read_excel(io.BytesIO(conteudo), engine='openpyxl')
        elif file.filename.endswith('.pdf'):
            try:
                import pdfplumber
                with pdfplumber.open(io.BytesIO(conteudo)) as pdf:
                    texto = "".join(page.extract_text() or "" for page in pdf.pages)
                linhas = [l for l in texto.split('\n') if l.strip()]
                dados = []
                for linha in linhas:
                    partes = re.split(r'\s{2,}|\t', linha.strip())
                    if len(partes) >= 3:
                        dados.append(partes)
                df = pd.DataFrame(dados)
            except:
                df = pd.DataFrame()
        else:
            df = pd.DataFrame()
        
        if len(df) == 0:
            return JSONResponse({"error": "Nenhum dado encontrado"}, status_code=400)
        
        df = normalizar_colunas(df)
        
        inseridos = 0
        for _, row in df.iterrows():
            try:
                descricao = str(row.get('descricao', 'Sem descrição')).strip()
                valor = extrair_valor(row.get('valor', 0))
                if valor == 0:
                    continue
                tipo_lancamento = classificar_tipo(row.get('tipo', ''))
                data_lancamento = extrair_data(row.get('data', ''))
                categoria = str(row.get('categoria', '')).strip()
                
                result = supabase.table("movimentacoes").insert({
                    "user_id": user_id,
                    "descricao": descricao,
                    "tipo": tipo_lancamento,
                    "valor": abs(valor),
                    "categoria": categoria,
                    "data_lancamento": data_lancamento,
                    "criado_em": datetime.now().isoformat()
                }).execute()
                
                if result.data:
                    inseridos += 1
            except Exception as e:
                print(f"[Importador] Erro na linha: {e}")
                continue
        
        return JSONResponse({
            "message": f"✅ {inseridos} registros importados!",
            "inseridos": inseridos,
            "erros": 0
        })
        
    except Exception as e:
        print(f"[Importador] Erro geral: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)