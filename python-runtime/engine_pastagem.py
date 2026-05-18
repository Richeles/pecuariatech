# =========================================================
# PecuariaTech
# Pastagem Cognitive Engine
# =========================================================

def to_number(value):

    try:

        if value is None:
            return 0.0

        return float(value)

    except:
        return 0.0


# =========================================================
# ENGINE
# =========================================================

def analisar_pastagem(payload):

    # =====================================================
    # INPUTS
    # =====================================================

    ua_por_ha = to_number(
        payload.get("ua_por_ha")
    )

    capacidade_suporte = to_number(
        payload.get("capacidade_suporte")
    )

    chuva_mm = to_number(
        payload.get("chuva_mm")
    )

    dias_sem_chuva = to_number(
        payload.get("dias_sem_chuva")
    )

    recuperacao = to_number(
        payload.get("recuperacao_pasto")
    )

    # =====================================================
    # SCORE BASE
    # =====================================================

    score = 94

    risco = "baixo"

    pressao = "estavel"

    estabilidade = "alta"

    alertas = []

    advisory = []

    # =====================================================
    # PRESSÃO OPERACIONAL
    # =====================================================

    if ua_por_ha > capacidade_suporte:

        risco = "medio"

        pressao = "alta"

        estabilidade = "moderada"

        score -= 20

        alertas.append(
            "Pressão operacional acima da capacidade."
        )

    # =====================================================
    # SECA OPERACIONAL
    # =====================================================

    if dias_sem_chuva >= 15:

        risco = "alto"

        pressao = "critica"

        estabilidade = "baixa"

        score -= 25

        alertas.append(
            "Período prolongado sem chuva."
        )

    # =====================================================
    # BAIXA RECUPERAÇÃO
    # =====================================================

    if recuperacao < 40:

        risco = "alto"

        score -= 25

        alertas.append(
            "Recuperação vegetativa comprometida."
        )

    # =====================================================
    # RISCO SANITÁRIO OPERACIONAL
    # =====================================================

    risco_sanitario = "baixo"

    if (
        ua_por_ha > capacidade_suporte
        and chuva_mm > 120
    ):

        risco_sanitario = "moderado"

        alertas.append(
            "Ambiente favorável para pressão sanitária."
        )

    # =====================================================
    # SCORE FLOOR
    # =====================================================

    if score < 0:
        score = 0

    # =====================================================
    # ADVISORY
    # =====================================================

    if risco == "baixo":

        advisory = [

            "Sistema biologicamente estável.",

            "Conversão operacional sustentável.",

            "Pastagem dentro da capacidade estrutural.",
        ]

    elif risco == "medio":

        advisory = [

            "Monitorar pressão operacional.",

            "Ajustar sincronismo de lotação.",

            "Avaliar recuperação da área ativa.",
        ]

    elif risco == "alto":

        advisory = [

            "Estrutura entrando em deterioração.",

            "Necessária redução da pressão operacional.",

            "Monitorar estabilidade bioestrutural.",
        ]

    # =====================================================
    # RESPONSE
    # =====================================================

    return {

        "risco": risco,

        "pressao_bioestrutural": pressao,

        "estabilidade_operacional": estabilidade,

        "risco_sanitario_operacional":
            risco_sanitario,

        "score_estrutural": score,

        "chuva_mm": chuva_mm,

        "dias_sem_chuva": dias_sem_chuva,

        "capacidade_suporte":
            capacidade_suporte,

        "ua_por_ha": ua_por_ha,

        "alertas": alertas,

        "advisory": advisory,
    }