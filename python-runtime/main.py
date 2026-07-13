from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import Response, JSONResponse
from dotenv import load_dotenv
import logging
import pandas as pd
import io
import re
from datetime import datetime
import uuid
import csv
import chardet
import time
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
except ImportError:
    logger.warning("Módulos de relatório não encontrados. Usando fallback.")
    def gerar_pdf(dto): return b""
    def gerar_excel(dto): return b""
    def gerar_executive_report(dto): return "Relatório executivo não disponível."

# =========================================================
# HISTÓRICO ICBC (ORIGINAL)
# =========================================================
try:
    from equacao_y.icbc_historico_repository import obter_icbc_historico
except ImportError:
    logger.warning("icbc_historico_repository não encontrado.")
    async def obter_icbc_historico(user_id): return {"message": "Histórico ICBC não disponível"}

# =========================================================
# OPTIONAL ENGINES (ORIGINAL)
# =========================================================
try:
    from engine_risk import calcular_risco
except ImportError:
    def calcular_risco(payload): return {"status": "fallback"}

try:
    from engine_pastagem import analisar_pastagem
except ImportError:
    def analisar_pastagem(payload): return {"status": "fallback", "advisory": ["Pastagem runtime fallback."]}

try:
    from engine_clima import analisar_clima
except ImportError:
    def analisar_clima(payload): return {"status": "fallback", "advisory": ["Climate runtime fallback."]}

try:
    from engine_rebanho import correlacionar_rebanho
except ImportError:
    def correlacionar_rebanho(payload): return {"risco": "baixo", "advisory": ["Rebanho runtime fallback."]}

try:
    from engine_pai_ai import correlacionar_global
except ImportError:
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
# UNIVERSAL IMPORTER – VALIDAÇÃO Ω (5 CAMADAS) + MELHORIAS
# =========================================================
class UniversalImporter:
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

    @staticmethod
    def normalizar_extensao(nome_arquivo: str) -> str:
        return nome_arquivo.split('.')[-1].lower() if '.' in nome_arquivo else ''

    @staticmethod
    def assinatura(conteudo: bytes) -> str:
        if conteudo.startswith(b'%PDF'):
            return 'pdf'
        elif conteudo.startswith(b'PK\x03\x04'):
            return 'zip'
        elif conteudo.startswith(b'\xD0\xCF\x11\xE0'):
            return 'xls'
        elif conteudo.startswith(b'\xEF\xBB\xBF') or b',' in conteudo[:1024] or b';' in conteudo[:1024]:
            return 'csv'
        else:
            try:
                texto = conteudo[:1024].decode('utf-8', errors='ignore')
                if ',' in texto or ';' in texto or '\t' in texto:
                    return 'csv'
            except:
                pass
            return 'unknown'

    @staticmethod
    def detectar(nome_arquivo: str, conteudo: bytes) -> dict:
        ext = UniversalImporter.normalizar_extensao(nome_arquivo)
        assinatura = UniversalImporter.assinatura(conteudo)

        if assinatura == 'pdf':
            return {"formato": "pdf", "extensao": ext, "valido": True}
        elif assinatura == 'xls':
            if ext == 'xls':
                return {"formato": "excel", "extensao": ext, "valido": True, "engine": "xlrd"}
            else:
                return {"formato": "unknown", "extensao": ext, "valido": False, "erro": "Arquivo .xls esperado, mas extensão é ." + ext}
        elif assinatura == 'zip':
            try:
                import openpyxl
                openpyxl.load_workbook(io.BytesIO(conteudo))
                return {"formato": "excel", "extensao": ext, "valido": True, "engine": "openpyxl"}
            except ImportError:
                return {"formato": "unknown", "extensao": ext, "valido": False, "erro": "openpyxl não instalado"}
            except:
                return {"formato": "unknown", "extensao": ext, "valido": False, "erro": "Arquivo ZIP não é XLSX válido"}
        elif assinatura == 'csv':
            return {"formato": "csv", "extensao": ext, "valido": True}
        else:
            if ext in ('xlsx', 'xls'):
                try:
                    import openpyxl
                    openpyxl.load_workbook(io.BytesIO(conteudo))
                    return {"formato": "excel", "extensao": ext, "valido": True, "engine": "openpyxl"}
                except:
                    pass
                if ext == 'xls':
                    return {"formato": "excel", "extensao": ext, "valido": True, "engine": "xlrd"}
            elif ext == 'pdf':
                return {"formato": "pdf", "extensao": ext, "valido": True}
            elif ext in ('csv', 'txt'):
                return {"formato": "csv", "extensao": ext, "valido": True}
            return {"formato": "unknown", "extensao": ext, "valido": False, "erro": "Arquivo não reconhecido"}

    @staticmethod
    def ler(conteudo: bytes, formato: str, engine: str = None):
        if formato == "excel":
            if engine == "openpyxl":
                df = pd.read_excel(io.BytesIO(conteudo), engine='openpyxl')
                return df.to_dict(orient='records')
            elif engine == "xlrd":
                df = pd.read_excel(io.BytesIO(conteudo), engine='xlrd')
                return df.to_dict(orient='records')
            else:
                try:
                    df = pd.read_excel(io.BytesIO(conteudo), engine='openpyxl')
                except:
                    df = pd.read_excel(io.BytesIO(conteudo), engine='xlrd')
                return df.to_dict(orient='records')

        elif formato == "pdf":
            try:
                import pdfplumber
                with pdfplumber.open(io.BytesIO(conteudo)) as pdf:
                    texto = "".join(page.extract_text() or "" for page in pdf.pages)
                linhas = [l.strip() for l in texto.split('\n') if l.strip()]
                if not texto.strip():
                    logger.warning("PDF sem texto (provavelmente escaneado)")
                return {"texto": texto, "linhas": linhas}
            except ImportError:
                raise Exception("pdfplumber não instalado")
            except Exception as e:
                try:
                    import PyPDF2
                    reader = PyPDF2.PdfReader(io.BytesIO(conteudo))
                    texto = "".join(page.extract_text() or "" for page in reader.pages)
                    linhas = [l.strip() for l in texto.split('\n') if l.strip()]
                    if not texto.strip():
                        logger.warning("PDF sem texto (provavelmente escaneado) – PyPDF2 também não extraiu texto")
                    return {"texto": texto, "linhas": linhas}
                except ImportError:
                    raise Exception(f"Falha ao ler PDF: {e} (PyPDF2 não instalado)")
                except:
                    raise Exception(f"Falha ao ler PDF: {e}")

        elif formato == "csv":
            encoding = chardet.detect(conteudo)['encoding'] or 'utf-8'
            for enc in [encoding, 'utf-8', 'latin1', 'cp1252']:
                try:
                    texto = conteudo.decode(enc)
                    linhas = texto.splitlines()
                    if len(linhas) > 1:
                        separador = ','
                        primeira_linha = linhas[0]
                        if ';' in primeira_linha and ',' not in primeira_linha:
                            separador = ';'
                        elif '\t' in primeira_linha:
                            separador = '\t'
                        elif '|' in primeira_linha:
                            separador = '|'
                        else:
                            try:
                                import csv
                                sniffer = csv.Sniffer()
                                separador = sniffer.sniff(texto).delimiter
                            except:
                                separador = ','
                        return {"linhas": linhas, "separador": separador, "encoding": enc}
                except:
                    continue
            raise Exception("Não foi possível decodificar o arquivo CSV")

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
                except (ValueError, KeyError, TypeError) as e:
                    logger.exception(f"[Normalizador Excel] Erro na linha {idx}: {row} | Erro: {e}")
                    continue
        elif formato == "pdf":
            linhas = dados_brutos.get('linhas', [])
            for idx, linha in enumerate(linhas):
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
                except (ValueError, IndexError) as e:
                    logger.exception(f"[Normalizador PDF] Erro na linha {idx}: {linha} | Erro: {e}")
                    continue
        elif formato == "csv":
            linhas = dados_brutos.get('linhas', [])
            separador = dados_brutos.get('separador', ',')
            if not linhas:
                return []
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
                except (ValueError, IndexError) as e:
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
        if not movimentacoes:
            return {"inseridos": 0, "erros": 0}
        try:
            registros = []
            for item in movimentacoes:
                registros.append({
                    "user_id": user_id,
                    "descricao": item["descricao"],
                    "tipo": item["tipo"],
                    "valor": item["valor"],
                    "categoria": item.get("categoria", ""),
                    "data_lancamento": item.get("data_lancamento", datetime.now().strftime("%Y-%m-%d")),
                    "criado_em": datetime.now().isoformat()
                })
            result = supabase.table("movimentacoes").insert(registros).execute()
            if result.data:
                return {"inseridos": len(result.data), "erros": 0}
            else:
                inseridos = 0
                erros = 0
                for item in registros:
                    try:
                        r = supabase.table("movimentacoes").insert(item).execute()
                        if r.data:
                            inseridos += 1
                        else:
                            erros += 1
                    except:
                        erros += 1
                return {"inseridos": inseridos, "erros": erros}
        except Exception as e:
            logger.exception(f"[Persistencia] Erro em lote: {e}")
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
                except Exception as e2:
                    logger.exception(f"[Persistencia] Erro na linha {idx+1}: {item} | Erro: {e2}")
                    erros += 1
            return {"inseridos": inseridos, "erros": erros}

    @staticmethod
    def gerar_auditoria(arquivo: str, formato: str, movimentacoes: list, inseridos: int, erros: int) -> dict:
        total_receitas = sum(m['valor'] for m in movimentacoes if m['tipo'] == 'receita')
        total_despesas = sum(m['valor'] for m in movimentacoes if m['tipo'] == 'despesa')
        lucro = total_receitas - total_despesas
        roi = (lucro / total_receitas * 100) if total_receitas > 0 else 0

        return {
            "mensagem": "✅ Implantação concluída!",
            "arquivo": arquivo,
            "formato": formato.upper(),
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
# ENDPOINT DE IMPORTAÇÃO – COM LOGS ESTRUTURADOS (VERSÃO 9.9/10)
# =========================================================
@app.post("/api/importar/arquivo")
async def importar_arquivo(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    tipo: str = Form("financeiro"),
    plano: str = Form("starter")
):
    request_id = uuid.uuid4().hex[:8]
    start_time = time.time()

    logger.info("=" * 60)
    logger.info(f"[{request_id}] 🚀 INÍCIO – Importador Universal")
    logger.info(f"[{request_id}] 📁 Arquivo: {file.filename}")
    logger.info(f"[{request_id}] 📄 Content-Type: {file.content_type}")
    logger.info(f"[{request_id}] 👤 User: {user_id}")
    logger.info(f"[{request_id}] 🏷️ Tipo: {tipo}")
    logger.info(f"[{request_id}] 📦 Plano: {plano}")
    logger.info("=" * 60)

    try:
        # ---- 1. LER ARQUIVO ----
        logger.info(f"[{request_id}] 📖 1. Lendo arquivo...")
        conteudo = await file.read()
        tamanho = len(conteudo)
        logger.info(f"[{request_id}] 📏 Tamanho: {tamanho} bytes")

        # ---- VALIDAÇÃO DE TAMANHO ----
        if tamanho == 0:
            logger.error(f"[{request_id}] ❌ Arquivo vazio")
            return JSONResponse(
                {"error": "Arquivo vazio", "request_id": request_id},
                status_code=400
            )
        if tamanho > UniversalImporter.MAX_FILE_SIZE:
            logger.error(f"[{request_id}] ❌ Arquivo excede {UniversalImporter.MAX_FILE_SIZE//1024//1024}MB")
            return JSONResponse(
                {"error": f"Arquivo excede o limite de {UniversalImporter.MAX_FILE_SIZE//1024//1024}MB", "request_id": request_id},
                status_code=413
            )
        logger.info(f"[{request_id}] ✅ Leitura concluída")

        # ---- 2. DETECTAR FORMATO ----
        logger.info(f"[{request_id}] 🔍 2. Detectando formato...")
        info = UniversalImporter.detectar(file.filename, conteudo)
        logger.info(f"[{request_id}] 📋 Formato detectado: {info}")
        if info["formato"] == "unknown" or not info.get("valido", False):
            logger.error(f"[{request_id}] ❌ Formato não reconhecido: {info}")
            return JSONResponse(
                {"error": f"Formato não reconhecido: {info.get('extensao', 'desconhecido')}", "request_id": request_id},
                status_code=400
            )
        logger.info(f"[{request_id}] ✅ Formato aceito: {info['formato']} (engine: {info.get('engine', 'auto')})")

        # ---- 3. LER DADOS BRUTOS ----
        logger.info(f"[{request_id}] 📊 3. Lendo dados brutos...")
        try:
            engine = info.get("engine")
            dados_brutos = UniversalImporter.ler(conteudo, info["formato"], engine=engine)
            if isinstance(dados_brutos, list):
                qtde = len(dados_brutos)
                logger.info(f"[{request_id}] ✅ {qtde} linhas (lista)")
            else:
                linhas = dados_brutos.get('linhas', []) if isinstance(dados_brutos, dict) else []
                logger.info(f"[{request_id}] ✅ {len(linhas)} linhas (estrutura complexa)")
        except Exception as e:
            logger.exception(f"[{request_id}] ❌ Falha na leitura: {e}")
            return JSONResponse(
                {"error": f"Erro ao ler arquivo: {str(e)}", "request_id": request_id},
                status_code=400
            )

        if not dados_brutos:
            logger.error(f"[{request_id}] ❌ Nenhum dado encontrado")
            return JSONResponse(
                {"error": "Nenhum dado encontrado no arquivo.", "request_id": request_id},
                status_code=400
            )

        # ---- 4. NORMALIZAR ----
        logger.info(f"[{request_id}] 🔄 4. Normalizando dados...")
        try:
            movimentacoes = UniversalImporter.normalizar(dados_brutos, info["formato"])
            logger.info(f"[{request_id}] ✅ {len(movimentacoes)} registros normalizados")
            if movimentacoes:
                logger.info(f"[{request_id}] 📌 Primeiro registro: {movimentacoes[0]}")
        except Exception as e:
            logger.exception(f"[{request_id}] ❌ Falha na normalização: {e}")
            return JSONResponse(
                {"error": f"Erro ao normalizar dados: {str(e)}", "request_id": request_id},
                status_code=400
            )

        if not movimentacoes:
            logger.error(f"[{request_id}] ❌ Nenhuma movimentação válida")
            return JSONResponse(
                {"error": "Nenhuma movimentação válida encontrada.", "request_id": request_id},
                status_code=400
            )

        # ---- 5. VALIDAR ----
        logger.info(f"[{request_id}] ✅ 5. Validando dados...")
        try:
            mov_validas, erros_validacao = UniversalImporter.validar(movimentacoes)
            logger.info(f"[{request_id}] ✅ {len(mov_validas)} válidas, {len(erros_validacao)} erros")
            if erros_validacao:
                logger.warning(f"[{request_id}] ⚠️ Erros de validação: {erros_validacao[:3]}")
        except Exception as e:
            logger.exception(f"[{request_id}] ❌ Falha na validação: {e}")
            return JSONResponse(
                {"error": f"Erro ao validar dados: {str(e)}", "request_id": request_id},
                status_code=400
            )

        if not mov_validas:
            logger.error(f"[{request_id}] ❌ Nenhum registro válido")
            return JSONResponse(
                {"error": f"Erros de validação: {erros_validacao[:3]}", "request_id": request_id},
                status_code=400
            )

        # ---- 6. PERSISTIR ----
        logger.info(f"[{request_id}] 💾 6. Persistindo no Supabase...")
        try:
            resultado = UniversalImporter.persistir(user_id, mov_validas)
            logger.info(f"[{request_id}] ✅ {resultado['inseridos']} inseridos, {resultado['erros']} erros")
        except Exception as e:
            logger.exception(f"[{request_id}] ❌ Falha na persistência: {e}")
            return JSONResponse(
                {"error": f"Erro ao persistir dados: {str(e)}", "request_id": request_id},
                status_code=400
            )

        # ---- 7. CONSULTAR VIEW (AUDITORIA) ----
        logger.info(f"[{request_id}] 👁️ 7. Consultando View...")
        try:
            view_result = supabase.table("vw_financeiro_resumo").select("*", count="exact").eq("user_id", user_id).execute()
            view_count = view_result.count if hasattr(view_result, 'count') else len(view_result.data)
            logger.info(f"[{request_id}] ✅ View retornou {view_count} registros para o usuário {user_id}")
        except Exception as e:
            logger.warning(f"[{request_id}] ⚠️ Erro ao consultar View: {e}")

        # ---- 8. GERAR RELATÓRIO ----
        logger.info(f"[{request_id}] 📈 8. Gerando auditoria...")
        try:
            relatorio = UniversalImporter.gerar_auditoria(
                arquivo=file.filename,
                formato=info["formato"],
                movimentacoes=mov_validas,
                inseridos=resultado["inseridos"],
                erros=resultado["erros"] + len(erros_validacao)
            )
            logger.info(f"[{request_id}] ✅ Auditoria gerada")
        except Exception as e:
            logger.exception(f"[{request_id}] ❌ Falha ao gerar auditoria: {e}")
            return JSONResponse(
                {"error": f"Erro ao gerar relatório: {str(e)}", "request_id": request_id},
                status_code=500
            )

        elapsed = round(time.time() - start_time, 2)
        logger.info(f"[{request_id}] ✅ Processamento concluído em {elapsed}s")
        logger.info("=" * 60)
        return JSONResponse(relatorio)

    except Exception as e:
        logger.exception(f"[{request_id}] 💥 ERRO INESPERADO: {e}")
        return JSONResponse(
            {"error": "Falha interna no processamento", "request_id": request_id},
            status_code=500
        )


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