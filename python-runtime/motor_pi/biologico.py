def calcular_gmd(peso_final_medio: float, peso_inicial_medio: float, duracao_media: float) -> float:
    if duracao_media == 0:
        return 0.0
    return round((peso_final_medio - peso_inicial_medio) / duracao_media, 3)