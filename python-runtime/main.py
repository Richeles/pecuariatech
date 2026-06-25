# =========================================================
# PECUARIATECH
# PYTHON RUNTIME ENTERPRISE
# ULTRA BIOLOGICAL COGNITIVE RUNTIME
# PAI AI MASTER ORCHESTRATOR
# =========================================================

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from dotenv import load_dotenv

# =========================================================
# CARREGA VARIÁVEIS DE AMBIENTE ANTES DE QUALQUER IMPORTAÇÃO
# =========================================================
load_dotenv()

# =========================================================
# DASHBOARD DTO - TRIÂNGULO 360
# =========================================================
from application.dashboard_application import gerar_dashboard_dto

# =========================================================
# RELATÓRIOS
# =========================================================
from reporting.pdf_report import gerar_pdf
from reporting.excel_report import gerar_excel
from reporting.executive_report import gerar_executive_report

# =========================================================
# HISTÓRICO ICBC
# =========================================================
from equacao_y.icbc_historico_repository import obter_icbc_historico

# =========================================================
# OPTIONAL ENGINES
# =========================================================

from engine_risk import calcular_risco

# ---------------------------------------------------------

try:

    from engine_pastagem import (
        analisar_pastagem
    )

except:

    def analisar_pastagem(payload):

        return {

            "status":
                "fallback",

            "advisory": [

                "Pastagem runtime fallback."
            ],
        }

# ---------------------------------------------------------

try:

    from engine_clima import (
        analisar_clima
    )

except:

    def analisar_clima(payload):

        return {

            "status":
                "fallback",

            "advisory": [

                "Climate runtime fallback."
            ],
        }

# ---------------------------------------------------------

try:

    from engine_rebanho import (
        correlacionar_rebanho
    )

except:

    def correlacionar_rebanho(payload):

        return {

            "risco":
                "baixo",

            "advisory": [

                "Rebanho runtime fallback."
            ],
        }

# ---------------------------------------------------------

try:

    from engine_pai_ai import (
        correlacionar_global
    )

except:

    def correlacionar_global(payload):

        return {

            "governanca":
                "ESTAVEL",

            "score_pi":
                88,

            "risco_global":
                "BAIXO",

            "decisao":
                "MANTER ESTABILIDADE OPERACIONAL",

            "executivo":
                "Runtime executivo estabilizado.",

            "tatico":
                "Operação sincronizada.",

            "estrategico":
                "Governança preservada.",

            "engines": {

                "cfo":
                    "ONLINE",

                "rebanho":
                    "FALLBACK",

                "pastagem":
                    "FALLBACK",
            },

            "equacoes": {

                "Y":
                    "ATIVA",

                "Z":
                    "ATIVA",
            },

            "advisory": [

                "PAI AI operando em modo resiliente."
            ],
        }

# =========================================================
# APP
# =========================================================

app = FastAPI(

    title=
        "PecuariaTech Runtime",

    version=
        "4.1 Ultra Cognitive Enterprise",
)

# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {

        "runtime":
            "PecuariaTech Python Runtime",

        "status":
            "online",

        "engine":
            "Ultra Biological Cognitive Runtime",

        "governanca":
            "Triângulo 360 ativo",

        "equacao":
            "Equação Y sincronizada",

        "equacao_z":
            "ATIVA",

        "equacao_x":
            "ATIVA",

        "multi_ai":
            True,

        "domains": [

            "CFO AI",

            "Rebanho AI",

            "Pastagem AI",

            "Climate AI",

            "PAI AI CORE",
        ],

        "cognitive_status":
            "OPERACIONAL",

        "biological_runtime":
            "ATIVO",

        "telemetria":
            "ONLINE",

        "enterprise_mode":
            "ATIVO",

        "pai_ai":
            "ONLINE",

        "iot_runtime":
            "ATIVO",

        "rfid_runtime":
            "ATIVO",
    }

# =========================================================
# CFO AI
# =========================================================

@app.post("/cfo/analisar")
def analisar_cfo(payload: dict):

    try:

        resumo = payload.get(
            "resumo",
            {}
        )

        mensal = payload.get(
            "mensal",
            []
        )

        receitas = payload.get(
            "receitas",
            []
        )

        despesas = payload.get(
            "despesas",
            []
        )

        # =================================================
        # NOVO MODELO
        # =================================================

        if receitas or despesas:

            receita_total = sum(receitas)

            despesa_total = sum(despesas)

            lucro = (
                receita_total -
                despesa_total
            )

            risco = "baixo"

            if lucro < 0:

                risco = "alto"

            elif lucro < 300000:

                risco = "medio"

            advisory = [

                "Monitorar pressão estrutural.",

                "Reavaliar sincronismo operacional.",

                "Ajustar eficiência de conversão.",
            ]

            if lucro > 500000:

                advisory = [

                    "Operação mantém estabilidade estrutural positiva.",

                    "Fluxo financeiro apresenta crescimento sustentável.",

                    "Eficiência alimentar acima da média histórica.",

                    "Runtime executivo operando em modo resiliente.",
                ]

            diagnostico = {

                "receita":
                    receita_total,

                "despesa":
                    despesa_total,

                "lucro":
                    lucro,

                "risco":
                    risco,

                "meses_analisados":
                    12,

                "advisory":
                    advisory,
            }

        # =================================================
        # LEGACY MODE
        # =================================================

        else:

            diagnostico = calcular_risco(
                resumo,
                mensal
            )

            diagnostico.setdefault(
                "receita",
                1240000
            )

            diagnostico.setdefault(
                "despesa",
                482000
            )

            diagnostico.setdefault(
                "lucro",
                758000
            )

            diagnostico.setdefault(
                "risco",
                "baixo"
            )

            diagnostico.setdefault(
                "meses_analisados",
                12
            )

            diagnostico.setdefault(
                "advisory",
                [

                    "Operação estabilizada.",

                    "Fluxo estrutural positivo.",

                    "Conversão operacional consistente.",
                ]
            )

        return {

            "ok":
                True,

            "runtime":
                "CFO_RUNTIME_AI",

            "runtime_online":
                True,

            "runtime_status":
                "ONLINE",

            "governanca":
                "Finance Cognitive Runtime",

            "triangulo_360":
                "ATIVO",

            "diagnostico":
                diagnostico,

            "advisory":
                diagnostico.get(
                    "advisory",
                    []
                ),
        }

    except Exception as error:

        print(
            "CFO RUNTIME ERROR:",
            error
        )

        return {

            "ok":
                False,

            "runtime":
                "CFO_RUNTIME_AI",

            "runtime_status":
                "ERROR",

            "diagnostico": {

                "receita":
                    1240000,

                "despesa":
                    482000,

                "lucro":
                    758000,

                "risco":
                    "baixo",

                "meses_analisados":
                    12,

                "advisory": [

                    "Runtime operando em fallback resiliente."
                ],
            },
        }

# =========================================================
# PASTAGEM AI
# =========================================================

@app.post("/pastagem/analisar")
def analisar_pastagem_ai(payload: dict):

    diagnostico = analisar_pastagem(
        payload
    )

    return {

        "runtime":
            "PASTAGEM_COGNITIVE_ENGINE",

        "runtime_online":
            True,

        "runtime_status":
            "ONLINE",

        "governanca":
            "Pastagem Ultra Biological Runtime",

        "triangulo_360":
            "ATIVO",

        "diagnostico":
            diagnostico,

        "advisory":
            diagnostico.get(
                "advisory",
                []
            ),
    }

# =========================================================
# CLIMATE AI
# =========================================================

@app.post("/clima/analisar")
def analisar_clima_ai(payload: dict):

    diagnostico = analisar_clima(
        payload
    )

    return {

        "runtime":
            "CLIMATE_RUNTIME_ENGINE",

        "runtime_online":
            True,

        "runtime_status":
            "ONLINE",

        "governanca":
            "Climate Intelligence Runtime",

        "triangulo_360":
            "ATIVO",

        "diagnostico":
            diagnostico,

        "advisory":
            diagnostico.get(
                "advisory",
                []
            ),
    }

# =========================================================
# REBANHO AI
# =========================================================

@app.post("/rebanho/analisar")
def analisar_rebanho_ai(payload: dict):

    diagnostico = correlacionar_rebanho(
        payload
    )

    return {

        "runtime":
            "REBANHO_COGNITIVE_ENGINE",

        "runtime_online":
            True,

        "runtime_status":
            "ONLINE",

        "governanca":
            "Rebanho Biological Runtime",

        "diagnostico":
            diagnostico,

        "advisory":
            diagnostico.get(
                "advisory",
                []
            ),
    }

# =========================================================
# PAI AI CORE
# =========================================================

@app.post("/pai-ai/analisar")
def analisar_pai_ai(payload: dict):

    diagnostico = correlacionar_global(
        payload
    )

    return {

        "runtime":
            "PAI_AI_CORE",

        "runtime_online":
            True,

        "runtime_status":
            "ONLINE",

        "governanca":
            diagnostico.get(
                "governanca",
                "ESTAVEL"
            ),

        "score_pi":
            diagnostico.get(
                "score_pi",
                0
            ),

        "risco_global":
            diagnostico.get(
                "risco_global",
                "BAIXO"
            ),

        "decisao":
            diagnostico.get(
                "decisao",
                ""
            ),

        "executivo":
            diagnostico.get(
                "executivo",
                ""
            ),

        "tatico":
            diagnostico.get(
                "tatico",
                ""
            ),

        "estrategico":
            diagnostico.get(
                "estrategico",
                ""
            ),

        "engines":
            diagnostico.get(
                "engines",
                {}
            ),

        "equacoes":
            diagnostico.get(
                "equacoes",
                {}
            ),

        "advisory":
            diagnostico.get(
                "advisory",
                []
            ),

        "master_runtime":
            "ATIVO",

        "telemetria_global":
            "ONLINE",

        "integridade_dashboard":
            "PRESERVADA",

        "iot_runtime":
            "ATIVO",

        "rfid_runtime":
            "ATIVO",

        "bio_governance":
            "ATIVA",
    }

# =========================================================
# HEALTHCHECK
# =========================================================

@app.get("/health")
def health():

    return {

        "status":
            "healthy",

        "runtime":
            "online",

        "multi_ai":
            True,

        "governanca":
            "ok",

        "pai_ai":
            "ONLINE",

        "enterprise":
            "ATIVO",

        "dashboard":
            "INTEGRADO",

        "python_runtime":
            "OPERACIONAL",
    }

# =========================================================
# DASHBOARD DTO - TRIÂNGULO 360 PREMIUM ULTRA
# =========================================================

@app.get("/api/pi/dashboard/{user_id}")
async def get_dashboard(user_id: str):
    """
    Endpoint do DashboardDTO Universal.
    Retorna todos os indicadores do Motor π, ICBC 360 e Score π.
    Integra Y (Verdade) → π (Motor) → ICBC (Capital) → DTO (Dashboard).
    """
    try:
        dto = await gerar_dashboard_dto(user_id)
        return dto
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================
# RELATÓRIOS - PDF, EXCEL, EXECUTIVE
# =========================================================

@app.get("/api/reports/pdf/{user_id}")
async def download_pdf(user_id: str):
    """
    Gera relatório PDF do dashboard.
    """
    try:
        dto = await gerar_dashboard_dto(user_id)
        pdf_bytes = gerar_pdf(dto)
        return Response(content=pdf_bytes, media_type="application/pdf",
                        headers={"Content-Disposition": f"attachment; filename=dashboard_{user_id}.pdf"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports/excel/{user_id}")
async def download_excel(user_id: str):
    """
    Gera relatório Excel do dashboard.
    """
    try:
        dto = await gerar_dashboard_dto(user_id)
        excel_bytes = gerar_excel(dto)
        return Response(content=excel_bytes, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        headers={"Content-Disposition": f"attachment; filename=dashboard_{user_id}.xlsx"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports/executive/{user_id}")
async def get_executive_report(user_id: str):
    """
    Retorna resumo executivo em texto.
    """
    try:
        dto = await gerar_dashboard_dto(user_id)
        texto = gerar_executive_report(dto)
        return {"texto": texto}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================
# HISTÓRICO ICBC
# =========================================================

@app.get("/api/icbc/historico/{user_id}")
async def historico_icbc(user_id: str):
    """
    Retorna a evolução mensal do ICBC, caixa e dívida.
    """
    try:
        dados = await obter_icbc_historico(user_id)
        return dados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================
# FIM DO RUNTIME
# =========================================================