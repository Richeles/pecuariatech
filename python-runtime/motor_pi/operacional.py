import os

# Fator regional (padrão 1.0). Ajuste no Render ou .env
FATOR_LOTACAO = float(os.getenv("FATOR_LOTACAO", 1.0))

def calcular_lotacao(total_animais: int, area_total_ha: float, lotacao_real_media: float = None) -> float:
    """
    Calcula a lotação em UA/ha.

    Parâmetros:
        total_animais: número de cabeças (UA)
        area_total_ha: área total de pastagem (hectares)
        lotacao_real_media: média ponderada da lotação real por piquete (se disponível)

    Retorna:
        float: lotação em UA/ha, ajustada pelo fator regional.
    """
    if area_total_ha == 0:
        return 0.0

    # Se o usuário forneceu lotação real, usa ela (prioridade)
    if lotacao_real_media is not None and lotacao_real_media > 0:
        base = lotacao_real_media
    else:
        # Fórmula universal
        base = total_animais / area_total_ha

    # Aplica fator regional
    return round(base * FATOR_LOTACAO, 2)