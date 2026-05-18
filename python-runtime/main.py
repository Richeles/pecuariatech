# =========================================================
# PecuariaTech
# Python Runtime Enterprise
# =========================================================

from fastapi import FastAPI

from engine_risk import calcular_risco

from engine_pastagem import analisar_pastagem

from engine_clima import analisar_clima

# =========================================================
# APP
# =========================================================

app = FastAPI()

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
    }

# =========================================================
# CFO AI
# =========================================================

@app.post("/cfo/analisar")
def analisar_cfo(payload: dict):

    resumo = payload.get(
        "resumo",
        {}
    )

    mensal = payload.get(
        "mensal",
        []
    )

    diagnostico = calcular_risco(
        resumo,
        mensal
    )

    return {

        "runtime":
            "CFO_RUNTIME_AI",

        "diagnostico":
            diagnostico,

        "advisory":
            diagnostico.get(
                "advisory",
                []
            ),
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

        "diagnostico":
            diagnostico,

        "advisory":
            diagnostico.get(
                "advisory",
                []
            ),
    }