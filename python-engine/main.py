from fastapi import FastAPI

app = FastAPI()

# ================================
# BASE ORIGINAL
# ================================
BASE = {
    "basico": 31.75,
    "profissional": 52.99,
    "ultra": 106.09,
    "empresarial": 159.19,
    "premium_dominus": 318.49,
}

# ================================
# MOTOR DE PREÇO (+150%)
# ================================
def calcular_preco(base):
    mensal = base * 2.5
    trimestral = mensal * 3 * 0.95
    anual = mensal * 12 * 0.8

    return {
        "mensal": round(mensal, 2),
        "trimestral": round(trimestral, 2),
        "anual": round(anual, 2),
    }

# ================================
# ENDPOINT
# ================================
@app.get("/pricing")
def pricing():
    resultado = {}

    for plano, valor in BASE.items():
        resultado[plano] = calcular_preco(valor)

    return resultado