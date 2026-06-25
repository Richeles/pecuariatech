def calcular_lotacao(total_animais: int, area_total_ha: float) -> float:
    if area_total_ha == 0:
        return 0.0
    return round(total_animais / area_total_ha, 2)