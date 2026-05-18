# =========================================================
# PecuariaTech
# Climate Runtime Engine
# =========================================================

def analisar_clima(payload):

    chuva_mm = float(payload.get("chuva_mm", 0) or 0)
    dias_sem_chuva = int(payload.get("dias_sem_chuva", 0) or 0)
    temperatura = float(payload.get("temperatura", 28) or 28)
    umidade = float(payload.get("umidade", 60) or 60)
    ua_por_ha = float(payload.get("ua_por_ha", 0) or 0)

    stress_termico = "baixo"
    risco_parasitario = "baixo"
    risco_laminite = "baixo"
    janela_adubacao = "moderada"
    janela_plantio = "moderada"
    recuperacao_pasto = "moderada"

    score = 90

    alertas = []
    advisory = []

    # =====================================================
    # STRESS TÉRMICO
    # =====================================================

    if temperatura >= 34:

        stress_termico = "alto"

        score -= 18

        alertas.append(
            "Stress térmico elevado no rebanho."
        )

    elif temperatura >= 30:

        stress_termico = "moderado"

        score -= 8

    # =====================================================
    # RISCO PARASITÁRIO
    # =====================================================

    if umidade >= 80 and chuva_mm >= 120:

        risco_parasitario = "alto"

        score -= 15

        alertas.append(
            "Ambiente favorável para pressão parasitária."
        )

    elif umidade >= 65:

        risco_parasitario = "moderado"

        score -= 5

    # =====================================================
    # RISCO LAMINITE
    # =====================================================

    if ua_por_ha >= 4:

        risco_laminite = "moderado"

        score -= 10

    # =====================================================
    # RECUPERAÇÃO PASTO
    # =====================================================

    if chuva_mm >= 120 and dias_sem_chuva <= 5:

        recuperacao_pasto = "alta"

    elif dias_sem_chuva >= 12:

        recuperacao_pasto = "baixa"

        score -= 12

        alertas.append(
            "Recuperação estrutural do pasto comprometida."
        )

    # =====================================================
    # JANELA ADUBAÇÃO
    # =====================================================

    if chuva_mm >= 80 and dias_sem_chuva <= 4:

        janela_adubacao = "favoravel"

    # =====================================================
    # JANELA PLANTIO
    # =====================================================

    if chuva_mm >= 100:

        janela_plantio = "ideal"

    # =====================================================
    # ADVISORY
    # =====================================================

    advisory.append(
        "Monitorar equilíbrio bioestrutural da área."
    )

    if stress_termico != "baixo":

        advisory.append(
            "Avaliar sombra e disponibilidade hídrica."
        )

    if risco_parasitario == "alto":

        advisory.append(
            "Monitorar pressão sanitária operacional."
        )

    if recuperacao_pasto == "baixa":

        advisory.append(
            "Reduzir pressão operacional temporariamente."
        )

    return {
        "score_climatico": score,
        "stress_termico": stress_termico,
        "risco_parasitario": risco_parasitario,
        "risco_laminite": risco_laminite,
        "janela_adubacao": janela_adubacao,
        "janela_plantio": janela_plantio,
        "recuperacao_pasto": recuperacao_pasto,
        "alertas": alertas,
        "advisory": advisory,
    }