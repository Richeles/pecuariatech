def calcular_roi(receita: float, despesa: float) -> float:
    if despesa == 0:
        return 0.0
    return round(((receita - despesa) / despesa) * 100, 2)

def calcular_margem(receita: float, despesa: float) -> float:
    if receita == 0:
        return 0.0
    return round(((receita - despesa) / receita) * 100, 2)

def calcular_ebitda(receita: float, despesa_operacional: float) -> float:
    return round(receita - despesa_operacional, 2)