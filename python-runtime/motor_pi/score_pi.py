def calcular_score_pi(financeiro_score: float, biologico_score: float, operacional_score: float,
                      sanidade_score: float, esg_score: float, governanca_score: float) -> float:
    pesos = {
        'financeiro': 0.30,
        'biologico': 0.25,
        'operacional': 0.15,
        'sanidade': 0.10,
        'esg': 0.10,
        'governanca': 0.10
    }
    total = (financeiro_score * pesos['financeiro'] +
             biologico_score * pesos['biologico'] +
             operacional_score * pesos['operacional'] +
             sanidade_score * pesos['sanidade'] +
             esg_score * pesos['esg'] +
             governanca_score * pesos['governanca'])
    return round(min(total, 100), 2)