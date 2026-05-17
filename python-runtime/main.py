# =========================================================
# PecuariaTech
# Python Runtime AI
# CFO Runtime
# =========================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# =========================================================
# APP
# =========================================================

app = FastAPI()

# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "runtime": "PecuariaTech Python Runtime",
        "status": "online"
    }

# =========================================================
# CFO ANALISAR
# =========================================================

@app.post("/cfo/analisar")
async def analisar_cfo(payload: dict):

    resumo = payload.get("resumo", {})
    mensal = payload.get("mensal", [])

    receita = resumo.get("receita_total", 0)
    despesa = resumo.get("despesa_total", 0)

    lucro = receita - despesa

    risco = "baixo"

    if lucro < 0:
        risco = "alto"

    elif lucro < receita * 0.1:
        risco = "moderado"

    return {
        "runtime": "CFO_RUNTIME_AI",

        "diagnostico": {
            "receita": receita,
            "despesa": despesa,
            "lucro": lucro,
            "risco": risco,
            "meses_analisados": len(mensal),
        },

        "advisory": [
            "Monitorar sincronismo de fluxo.",
            "Avaliar eficiência operacional.",
            "Reduzir pressão estrutural de caixa."
        ]
    }