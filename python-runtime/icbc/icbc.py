async def calcular_icbc(governanca: float, esg: float, rastreabilidade: float,
                        maturidade: float, compliance: float, capital: float):
    pesos = {
        'governanca': 0.25,
        'esg': 0.20,
        'rastreabilidade': 0.20,
        'maturidade': 0.15,
        'compliance': 0.10,
        'capital': 0.10
    }
    capital_score = (governanca * pesos['governanca'] +
                     esg * pesos['esg'] +
                     rastreabilidade * pesos['rastreabilidade'] +
                     maturidade * pesos['maturidade'] +
                     compliance * pesos['compliance'] +
                     capital * pesos['capital'])
    capital_score = round(capital_score, 2)
    
    if capital_score >= 70:
        risco = "baixo"
    elif capital_score >= 50:
        risco = "moderado"
    else:
        risco = "alto"
    
    return {
        "capital_score": capital_score,
        "governanca": governanca,
        "esg": esg,
        "rastreabilidade": rastreabilidade,
        "maturidade_digital": maturidade,
        "compliance": compliance,
        "capital_intelectual": capital,
        "risco_estrutural": risco
    }