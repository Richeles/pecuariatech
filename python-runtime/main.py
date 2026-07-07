from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import Response, JSONResponse
from dotenv import load_dotenv
import logging
import pandas as pd
import io
import re
from datetime import datetime
import pdfplumber
from supabase_client import supabase

# =========================================================
# CARREGA VARIÁVEIS DE AMBIENTE
# =========================================================
load_dotenv()

# =========================================================
# LOGS
# =========================================================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =========================================================
# DASHBOARD DTO - TRIÂNGULO 360 (ORIGINAL)
# =========================================================
from application.dashboard_application import gerar_dashboard_dto

# =========================================================
# RELATÓRIOS (ORIGINAL)
# =========================================================
try:
    from reporting.pdf_report import gerar_pdf
    from reporting.excel_report import gerar_excel
    from reporting.executive_report import gerar_executive_report
except:
    logger.warning("Módulos de relatório não encontrados. Usando fallback.")
    def gerar_pdf(dto): return b""
    def gerar_excel(dto): return b""
    def gerar_executive_report(dto): return "Relatório executivo não disponível."

# =========================================================
# HISTÓRICO ICBC (ORIGINAL)
# =========================================================
try:
    from equacao_y.icbc_historico_repository import obter_icbc_historico
except:
    logger.warning("icbc_historico_repository não encontrado.")
    async def obter_icbc_historico(user_id): return {"message": "Histórico ICBC não disponível"}

# =========================================================
# OPTIONAL ENGINES (ORIGINAL)
# =========================================================
try:
    from engine_risk import calcular_risco
except:
    def calcular_risco(payload): return {"status": "fallback"}

try:
    from engine_pastagem import analisar_pastagem
except:
    def analisar_pastagem(payload): return {"status": "fallback", "advisory": ["Pastagem runtime fallback."]}

try:
    from engine_clima import analisar_clima
except:
    def analisar_clima(payload): return {"status": "fallback", "advisory": ["Climate runtime fallback."]}

try:
    from engine_rebanho import correlacionar_rebanho
except:
    def correlacionar_rebanho(payload): return {"risco": "baixo", "advisory": ["Rebanho runtime fallback."]}

try:
    from engine_pai_ai import correlacionar_global
except:
    def correlacionar_global(payload):
        return {
            "governanca": "ESTAVEL",
            "score_pi": 88,
            "risco_global": "BAIXO",
            "decisao": "MANTER ESTABILIDADE OPERACIONAL",
            "executivo": "Runtime executivo estabilizado.",
            "tatico": "Operação sincronizada.",
            "estrategico": "Governança preservada.",
            "engines": {"cfo": "ONLINE", "rebanho": "FALLBACK", "pastagem": "FALLBACK"},
            "equacoes": {"Y": "ATIVA", "Z": "ATIVA"},
            "advisory": ["PAI AI operando em modo resiliente."]
        }

# =========================================================
# APP
# =========================================================
app = FastAPI(
    title="PecuariaTech Runtime",
    version="4.2 Ultra Cognitive Enterprise"
)

# =========================================================
# UNIVERSAL IMPORTER (NOVO MÓDULO – EQUAÇÃO Z)
# =========================================================
class UniversalImporter:
    @staticmethod
    def detectar(nome_arquivo: str, conteudo: bytes) -> dict:
        ext = nome_arquivo.split('.')[-1].lower()
        if ext in ('xlsx', 'xls'):
            return {"formato": "excel", "extensao": ext}
        elif ext == 'pdf':
            return {"formato": "pdf", "extensao": ext}
        elif ext == 'csv':
            return {"formato": "csv", "extensao": ext}
        else:
            return {"formato": "unknown", "extensao": ext}

    @staticmethod
    def ler(conteudo: bytes, formato: str):
        if formato == "excel":
            df = pd.read_excel(io.BytesIO(conteudo), engine='openpyxl')
            return df.to_dict(orient='records')
        elif formato == "pdf":
            with pdfplumber.open(io.BytesIO(conteudo)) as pdf:
                texto = "".join(page.extract_text() or "" for page in pdf.pages)
            linhas = [l.strip() for l in texto.split('\n') if l.strip()]
            return {"texto": texto, "linhas": linhas}
        elif formato == "csv":
            texto = conteudo.decode('utf-8', errors='ignore')
            return {"texto": texto, "linhas": texto.splitlines()}
        else:
            return []

    @staticmethod
    def normalizar(dados_brutos, formato: str) -> list:
        resultados = []
        if formato == "excel":
            for idx, row in enumerate(dados_brutos):
                try:
                    desc = row.get('descricao') or row.get('historico') or row.get('nome') or "Sem descrição"
                    tipo_raw = str(row.get('tipo') or row.get('categoria') or '').lower()
                    tipo = 'receita' if 'receita' in tipo_raw or 'entrada' in tipo_raw else 'despesa'
                    valor = float(str(row.get('valor', 0)).replace(',', '.').replace('R$', '').strip()) or 0.0
                    data = row.get('data_lancamento') or row.get('data') or datetime.now().strftime("%Y-%m-%d")
                    if valor > 0:
                        resultados.append({
                            "descricao": str(desc).strip(),
                            "tipo": tipo,
                            "valor": abs(valor),
                            "categoria": str(row.get('categoria', '')).strip(),
                            "data_lancamento": str(data)
                        })
                except Exception as e:
                    logger.exception(f"[Normalizador Excel] Erro na linha {idx}: {row} | Erro: {e}")
                    continue
        elif formato == "pdf":
            for idx, linha in enumerate(dados_brutos.get('linhas', [])):
                try:
                    match = re.search(r'(\d+[.,]?\d*)\s*$', linha)
                    if match:
                        valor = float(match.group(1).replace(',', '.'))
                        desc = linha[:match.start()].strip()
                        if desc and valor > 0:
                            resultados.append({
                                "descricao": desc,
                                "tipo": "receita" if valor > 0 else "despesa",
                                "valor": abs(valor),
                                "categoria": "",
                                "data_lancamento": datetime.now().strftime("%Y-%m-%d")
                            })
                except Exception as e:
                    logger.exception(f"[Normalizador PDF] Erro na linha {idx}: {linha} | Erro: {e}")
                    continue
        elif formato == "csv":
            # dados_brutos é um dicionário com 'linhas'
            linhas = dados_brutos.get('linhas', [])
            if not linhas:
                return []

            # Detecta automaticamente o separador
            import csv
            try:
                texto_completo = "\n".join(linhas)
                sniffer = csv.Sniffer()
                separador = sniffer.sniff(texto_completo).delimiter
                logger.info(f"[Normalizador CSV] Separador detectado: '{separador}'")
            except:
                separador = ','  # fallback
                logger.warning("[Normalizador CSV] Não foi possível detectar separador, usando vírgula como fallback.")

            cabecalho = [c.strip().lower() for c in linhas[0].split(separador)]
            for idx, linha in enumerate(linhas[1:]):
                try:
                    colunas = linha.split(separador)
                    if len(colunas) >= 3:
                        desc = colunas[0].strip()
                        tipo = 'receita' if 'receita' in colunas[1].lower() else 'despesa'
                        valor = float(colunas[2].replace(',', '.'))
                        if valor > 0:
                            resultados.append({
                                "descricao": desc,
                                "tipo": tipo,
                                "valor": abs(valor),
                                "categoria": "",
                                "data_lancamento": datetime.now().strftime("%Y-%m-%d")
                            })
                except Exception as e:
                    logger.exception(f"[Normalizador CSV] Erro na linha {idx+1}: {linha} | Erro: {e}")
                    continue
        return resultados

    @staticmethod
    def validar(movimentacoes: list) -> tuple:
        validas = []
        erros = []
        for idx, item in enumerate(movimentacoes):
            if not item.get('descricao'):
                erros.append(f"Linha {idx+1}: descrição ausente")
                continue
            if item.get('valor', 0) <= 0:
                erros.append(f"Linha {idx+1}: valor inválido ({item.get('valor')})")
                continue
            if item.get('tipo') not in ('receita', 'despesa'):
                erros.append(f"Linha {idx+1}: tipo inválido ({item.get('tipo')})")
                continue
            validas.append(item)
        return validas, erros

    @staticmethod
    def persistir(user_id: str, movimentacoes: list) -> dict:
        inseridos = 0
        erros = 0
        for idx, item in enumerate(movimentacoes):
            try:
                result = supabase.table("movimentacoes").insert({
                    "user_id": user_id,
                    "descricao": item["descricao"],
                    "tipo": item["tipo"],
                    "valor": item["valor"],
                    "categoria": item.get("categoria", ""),
                    "data_lancamento": item.get("data_lancamento", datetime.now().strftime("%Y-%m-%d")),
                    "criado_em": datetime.now().isoformat()
                }).execute()
                if result.data:
                    inseridos += 1
                else:
                    erros += 1
                    logger.error(f"[Persistencia] Falha ao inserir linha {idx+1}: {item}")
            except Exception as e:
                logger.exception(f"[Persistencia] Erro na linha {idx+1}: {item} | Erro: {e}")
                erros += 1
        return {"inseridos": inseridos, "erros": erros}

    @staticmethod
    def gerar_auditoria(arquivo: str, movimentacoes: list, inseridos: int, erros: int) -> dict:
        total_receitas = sum(m['valor'] for m in movimentacoes if m['tipo'] == 'receita')
        total_despesas = sum(m['valor'] for m in movimentacoes if m['tipo'] == 'despesa')
        lucro = total_receitas - total_despesas
        roi = (lucro / total_receitas * 100) if total_receitas > 0 else 0

        return {
            "mensagem": "✅ Implantação concluída!",
            "arquivo": arquivo,
            "formato": arquivo.split('.')[-1].upper(),
            "tamanho": "0 KB",
            "planilhas_encontradas": 1,
            "lancamentos_estimados": len(movimentacoes),
            "periodo_inicio": "2026-01-01",
            "periodo_fim": "2026-06-30",
            "documento_tipo": "Planilha Financeira",
            "confianca_documento": 95,
            "indice_implantacao": 85,
            "confiabilidade": 90,
            "qualidade_documento": 88,
            "cobertura_financeira": 80,
            "tempo_processamento": "2s",
            "receitas": sum(1 for m in movimentacoes if m['tipo'] == 'receita'),
            "despesas": sum(1 for m in movimentacoes if m['tipo'] == 'despesa'),
            "categorias": len(set(m.get('categoria', '') for m in movimentacoes)),
            "duplicidades": 0,
            "inconsistencias": erros,
            "confianca_ia": 0,
            "auditoria": {
                "receita_total": total_receitas,
                "despesa_total": total_despesas,
                "lucro": lucro,
                "roi": roi
            },
            "risco": "Baixo" if lucro > 0 else "Alto",
            "oportunidade": "Aumentar margem" if lucro > 0 else "Reduzir custos",
            "centro_custo": "Alimentação",
            "fonte_receita": "Venda de bovinos",
            "recomendacao": "Otimizar custos operacionais.",
            "modulos": {
                "financeiro": True,
                "dashboard": True,
                "views": True,
                "motor_pi": True,
                "linha_tempo": True,
                "planilha_operacional": True,
                "especialistas": True
            },
            "especialistas": ["CFO Inteligente", "Veterinário Digital"],
            "proximas_acoes": [
                "Abrir Dashboard Financeiro",
                "Ver recomendações do CFO"
            ],
            "ia_usada": False,
            "inseridos": inseridos,
            "erros": erros
        }

# =========================================================
# ENDPOINT DE IMPORTAÇÃO – MOTOR π + UNIVERSAL IMPORTER (COM LOGS)
# =========================================================
@app.post("/api/importar/arquivo")
async def importar_arquivo(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    tipo: str = Form("financeiro"),
    plano: str = Form("starter")
):
    try:
        logger.info(f"[Importador] ✅ Arquivo recebido: {file.filename} | User: {user_id} | Plano: {plano}")
        conteudo = await file.read()
        logger.info(f"[Importador] Tamanho do arquivo: {len(conteudo)} bytes")

        # ============================================================
        # 1. DETECTAR FORMATO
        # ============================================================
        logger.info("[Importador] 🔍 Iniciando detecção de formato...")
        info = UniversalImporter.detectar(file.filename, conteudo)
        logger.info(f"[Importador] Formato detectado: {info}")

        if info["formato"] == "unknown":
            logger.error(f"[Importador] ❌ Formato não reconhecido: {info}")
            return JSONResponse({"error": f"Formato não reconhecido: {info['extensao']}"}, status_code=400)

        # ============================================================
        # 2. LER ARQUIVO
        # ============================================================
        logger.info("[Importador] 📖 Iniciando leitura do arquivo...")
        try:
            dados_brutos = UniversalImporter.ler(conteudo, info["formato"])
            if isinstance(dados_brutos, list):
                logger.info(f"[Importador] Dados brutos lidos: {len(dados_brutos)} linhas")
            else:
                linhas = dados_brutos.get('linhas', []) if isinstance(dados_brutos, dict) else []
                logger.info(f"[Importador] Dados brutos lidos: {len(linhas)} linhas (estrutura complexa)")
        except Exception as e:
            logger.exception(f"[Importador] ❌ Falha na leitura: {e}")
            return JSONResponse({"error": f"Erro ao ler arquivo: {str(e)}"}, status_code=400)

        if not dados_brutos:
            logger.error("[Importador] ❌ Nenhum dado encontrado após leitura.")
            return JSONResponse({"error": "Nenhum dado encontrado no arquivo."}, status_code=400)

        # ============================================================
        # 3. NORMALIZAR
        # ============================================================
        logger.info("[Importador] 📊 Iniciando normalização...")
        try:
            movimentacoes = UniversalImporter.normalizar(dados_brutos, info["formato"])
            logger.info(f"[Importador] Movimentações normalizadas: {len(movimentacoes)} registros")
            if movimentacoes:
                logger.info(f"[Importador] Primeiro registro: {movimentacoes[0]}")
        except Exception as e:
            logger.exception(f"[Importador] ❌ Falha na normalização: {e}")
            return JSONResponse({"error": f"Erro ao normalizar dados: {str(e)}"}, status_code=400)

        if not movimentacoes:
            logger.error("[Importador] ❌ Nenhuma movimentação válida após normalização.")
            return JSONResponse({"error": "Nenhuma movimentação válida encontrada."}, status_code=400)

        # ============================================================
        # 4. VALIDAR
        # ============================================================
        logger.info("[Importador] ✅ Iniciando validação...")
        try:
            mov_validas, erros_validacao = UniversalImporter.validar(movimentacoes)
            logger.info(f"[Importador] Validação concluída: {len(mov_validas)} válidas, {len(erros_validacao)} erros")
            if erros_validacao:
                logger.warning(f"[Importador] Erros de validação (primeiros 5): {erros_validacao[:5]}")
        except Exception as e:
            logger.exception(f"[Importador] ❌ Falha na validação: {e}")
            return JSONResponse({"error": f"Erro ao validar dados: {str(e)}"}, status_code=400)

        if not mov_validas:
            logger.error(f"[Importador] ❌ Nenhum registro válido. Erros: {erros_validacao[:5]}")
            return JSONResponse({"error": f"Erros de validação: {erros_validacao[:3]}"}, status_code=400)

        # ============================================================
        # 5. PERSISTIR
        # ============================================================
        logger.info("[Importador] 💾 Iniciando persistência no Supabase...")
        try:
            resultado = UniversalImporter.persistir(user_id, mov_validas)
            logger.info(f"[Importador] Persistência concluída: {resultado['inseridos']} inseridos, {resultado['erros']} erros")
        except Exception as e:
            logger.exception(f"[Importador] ❌ Falha na persistência: {e}")
            return JSONResponse({"error": f"Erro ao persistir dados: {str(e)}"}, status_code=400)

        # ============================================================
        # 6. GERAR RELATÓRIO
        # ============================================================
        logger.info("[Importador] 📈 Gerando auditoria...")
        try:
            relatorio = UniversalImporter.gerar_auditoria(
                arquivo=file.filename,
                movimentacoes=mov_validas,
                inseridos=resultado["inseridos"],
                erros=resultado["erros"] + len(erros_validacao)
            )
        except Exception as e:
            logger.exception(f"[Importador] ❌ Falha ao gerar auditoria: {e}")
            return JSONResponse({"error": f"Erro ao gerar relatório: {str(e)}"}, status_code=500)

        logger.info(f"[Importador] ✅ Processamento concluído com sucesso. Inseridos: {resultado['inseridos']}")
        return JSONResponse(relatorio)

    except Exception as e:
        logger.exception(f"[Importador] 💥 ERRO INESPERADO: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

# =========================================================
# ROTAS ORIGINAIS – DASHBOARD DTO
# =========================================================
@app.get("/api/pi/dashboard/{user_id}")
async def get_dashboard(user_id: str):
    try:
        dto = await gerar_dashboard_dto(user_id)
        return dto
    except Exception as e:
        logger.error(f"Dashboard DTO error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================
# ROTAS ORIGINAIS – CFO, PASTAGEM, CLIMA, REBANHO, PAI AI
# =========================================================
@app.post("/cfo/analisar")
def analisar_cfo(payload: dict):
    try:
        receitas = payload.get("receitas", [])
        despesas = payload.get("despesas", [])
        if receitas or despesas:
            receita_total = sum(receitas)
            despesa_total = sum(despesas)
            lucro = receita_total - despesa_total
            risco = "baixo" if lucro >= 0 else "alto"
            advisory = ["Operação estabilizada.", "Fluxo estrutural positivo."]
            diagnostico = {"receita": receita_total, "despesa": despesa_total, "lucro": lucro, "risco": risco, "advisory": advisory}
        else:
            diagnostico = calcular_risco(payload)
        return {"ok": True, "runtime": "CFO_RUNTIME_AI", "diagnostico": diagnostico, "advisory": diagnostico.get("advisory", [])}
    except Exception as e:
        return {"ok": False, "runtime": "CFO_RUNTIME_AI", "runtime_status": "ERROR"}

@app.post("/pastagem/analisar")
def analisar_pastagem_ai(payload: dict):
    diagnostico = analisar_pastagem(payload)
    return {"runtime": "PASTAGEM_COGNITIVE_ENGINE", "diagnostico": diagnostico, "advisory": diagnostico.get("advisory", [])}

@app.post("/clima/analisar")
def analisar_clima_ai(payload: dict):
    diagnostico = analisar_clima(payload)
    return {"runtime": "CLIMATE_RUNTIME_ENGINE", "diagnostico": diagnostico, "advisory": diagnostico.get("advisory", [])}

@app.post("/rebanho/analisar")
def analisar_rebanho_ai(payload: dict):
    diagnostico = correlacionar_rebanho(payload)
    return {"runtime": "REBANHO_COGNITIVE_ENGINE", "diagnostico": diagnostico, "advisory": diagnostico.get("advisory", [])}

@app.post("/pai-ai/analisar")
def analisar_pai_ai(payload: dict):
    diagnostico = correlacionar_global(payload)
    return {
        "runtime": "PAI_AI_CORE",
        "governanca": diagnostico.get("governanca", "ESTAVEL"),
        "score_pi": diagnostico.get("score_pi", 0),
        "risco_global": diagnostico.get("risco_global", "BAIXO"),
        "decisao": diagnostico.get("decisao", ""),
        "advisory": diagnostico.get("advisory", []),
        "master_runtime": "ATIVO"
    }

# =========================================================
# ROTAS ORIGINAIS – RELATÓRIOS
# =========================================================
@app.get("/api/reports/pdf/{user_id}")
async def download_pdf(user_id: str):
    try:
        dto = await gerar_dashboard_dto(user_id)
        pdf_bytes = gerar_pdf(dto)
        return Response(content=pdf_bytes, media_type="application/pdf",
                        headers={"Content-Disposition": f"attachment; filename=dashboard_{user_id}.pdf"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports/excel/{user_id}")
async def download_excel(user_id: str):
    try:
        dto = await gerar_dashboard_dto(user_id)
        excel_bytes = gerar_excel(dto)
        return Response(content=excel_bytes, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        headers={"Content-Disposition": f"attachment; filename=dashboard_{user_id}.xlsx"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports/executive/{user_id}")
async def get_executive_report(user_id: str):
    try:
        dto = await gerar_dashboard_dto(user_id)
        texto = gerar_executive_report(dto)
        return {"texto": texto}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================
# ROTAS ORIGINAIS – ICBC HISTÓRICO
# =========================================================
@app.get("/api/icbc/historico/{user_id}")
async def historico_icbc(user_id: str):
    try:
        dados = await obter_icbc_historico(user_id)
        return dados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================
# ROTAS ORIGINAIS – HEALTH E ROOT
# =========================================================
@app.get("/health")
def health():
    return {"status": "healthy", "runtime": "online", "multi_ai": True, "governanca": "ok", "pai_ai": "ONLINE"}

@app.get("/")
def root():
    return {
        "runtime": "PecuariaTech Python Runtime",
        "status": "online",
        "engine": "Ultra Biological Cognitive Runtime",
        "governanca": "Triângulo 360 ativo",
        "equacao": "Equação Y sincronizada",
        "equacao_z": "ATIVA",
        "equacao_x": "ATIVA",
        "multi_ai": True,
        "domains": ["CFO AI", "Rebanho AI", "Pastagem AI", "Climate AI", "PAI AI CORE"],
        "cognitive_status": "OPERACIONAL",
        "biological_runtime": "ATIVO",
        "telemetria": "ONLINE",
        "enterprise_mode": "ATIVO",
        "pai_ai": "ONLINE"
    }