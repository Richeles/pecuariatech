# =========================================================
# PECUARIATECH
# ENGINE REBANHO AI
# ULTRA BIOLOGICAL COGNITIVE ENGINE
# =========================================================

def correlacionar_rebanho(payload):

    # =====================================================
    # INPUTS
    # =====================================================

    peso = payload.get(
        "peso",
        0
    )

    ganho = payload.get(
        "ganho",
        0
    )

    pressao = payload.get(
        "pressao",
        0
    )

    temperatura = payload.get(
        "temperatura",
        0
    )

    sanidade = payload.get(
        "sanidade",
        0
    )

    # =====================================================
    # SCORE BASE
    # =====================================================

    score_biologico = 96

    risco = "BAIXO"

    compliance = 94

    advisory = []

    decisao = (
        "Estrutura biológica estabilizada."
    )

    executivo = (
        "Governança biológica preservada."
    )

    operacional = (
        "Rastreabilidade contínua ativa."
    )

    tatico = (
        "Motor cognitivo sincronizado."
    )

    # =====================================================
    # PRESSÃO ANIMAL
    # =====================================================

    if pressao > 0.85:

        score_biologico -= 18

        risco = "MODERADO"

        advisory.append(
            "Alta pressão animal detectada."
        )

        decisao = (
            "Reduzir lotação animal."
        )

    # =====================================================
    # TEMPERATURA
    # =====================================================

    if temperatura > 34:

        score_biologico -= 10

        advisory.append(
            "Estresse térmico detectado."
        )

    # =====================================================
    # SANIDADE
    # =====================================================

    if sanidade < 70:

        score_biologico -= 22

        compliance -= 15

        risco = "ALTO"

        advisory.append(
            "Baixa conformidade sanitária."
        )

        decisao = (
            "Revisar protocolo sanitário."
        )

    # =====================================================
    # GANHO DE PESO
    # =====================================================

    if ganho < 0.4:

        score_biologico -= 8

        advisory.append(
            "Ganho de peso abaixo do ideal."
        )

    # =====================================================
    # SCORE MÍNIMO
    # =====================================================

    if score_biologico < 0:

        score_biologico = 0

    # =====================================================
    # RETURN FINAL
    # =====================================================

    return {

        "executivo":
            executivo,

        "operacional":
            operacional,

        "tatico":
            tatico,

        "decisao_recomendada":
            decisao,

        "score_biologico":
            score_biologico,

        "risco":
            risco,

        "compliance":
            compliance,

        "peso":
            peso,

        "ganho":
            ganho,

        "pressao":
            pressao,

        "temperatura":
            temperatura,

        "sanidade":
            sanidade,

        "advisory":
            advisory,
    }