# =========================================================
# PECUARIATECH
# PAI AI CORE
# MASTER COGNITIVE ORCHESTRATOR
# =========================================================

from datetime import datetime

# =========================================================
# CORRELAÇÃO GLOBAL
# =========================================================

def correlacionar_global(payload):

    # =====================================================
    # INPUTS
    # =====================================================

    rebanho = payload.get(
        "rebanho",
        {}
    )

    engorda = payload.get(
        "engorda",
        {}
    )

    clima = payload.get(
        "clima",
        {}
    )

    financeiro = payload.get(
        "financeiro",
        {}
    )

    esg = payload.get(
        "esg",
        {}
    )

    # =====================================================
    # REBANHO
    # =====================================================

    score_biologico = float(
        rebanho.get(
            "score_biologico",
            85
        )
    )

    sanidade = float(
        rebanho.get(
            "sanidade",
            80
        )
    )

    pressao = float(
        rebanho.get(
            "pressao",
            40
        )
    )

    # =====================================================
    # ENGORDA
    # =====================================================

    gmd = float(
        engorda.get(
            "gmd",
            1.2
        )
    )

    margem = float(
        engorda.get(
            "margem",
            12
        )
    )

    risco_engorda = float(
        engorda.get(
            "risco",
            30
        )
    )

    # =====================================================
    # CLIMA
    # =====================================================

    temperatura = float(
        clima.get(
            "temperatura",
            28
        )
    )

    umidade = float(
        clima.get(
            "umidade",
            65
        )
    )

    # =====================================================
    # FINANCEIRO
    # =====================================================

    caixa = float(
        financeiro.get(
            "caixa",
            100000
        )
    )

    margem_liquida = float(
        financeiro.get(
            "margem_liquida",
            15
        )
    )

    # =====================================================
    # ESG
    # =====================================================

    risco_ambiental = float(
        esg.get(
            "risco_ambiental",
            20
        )
    )

    compliance = float(
        esg.get(
            "compliance",
            92
        )
    )

    # =====================================================
    # MOTOR π
    # =====================================================

    score_pi = (
        (
            score_biologico
            +
            sanidade
            +
            gmd * 40
            +
            margem
            +
            compliance
        )
        /
        5
    )

    # =====================================================
    # RISCO GLOBAL
    # =====================================================

    risco_global = "BAIXO"

    if temperatura > 36:

        risco_global = "MODERADO"

    if pressao > 75:

        risco_global = "ALTO"

    if risco_ambiental > 70:

        risco_global = "CRITICO"

    # =====================================================
    # GOVERNANÇA
    # =====================================================

    governanca = "ESTAVEL"

    if compliance < 70:

        governanca = "ATENCAO"

    if compliance < 50:

        governanca = "CRITICA"

    # =====================================================
    # ADVISORY
    # =====================================================

    advisory = []

    if temperatura > 36:

        advisory.append(
            "Estresse térmico elevado."
        )

    if gmd < 1:

        advisory.append(
            "Ganho médio diário abaixo do ideal."
        )

    if margem < 10:

        advisory.append(
            "Margem operacional reduzida."
        )

    if risco_ambiental > 70:

        advisory.append(
            "Risco ESG crítico."
        )

    if not advisory:

        advisory.append(
            "Operação estabilizada."
        )

    # =====================================================
    # DECISÃO
    # =====================================================

    decisao = "MANTER OPERACAO"

    if risco_global == "ALTO":

        decisao = "REDUZIR PRESSAO OPERACIONAL"

    if risco_global == "CRITICO":

        decisao = "INTERVENCAO IMEDIATA"

    # =====================================================
    # OUTPUT
    # =====================================================

    return {

        "runtime":
            "PAI_AI_CORE",

        "runtime_status":
            "ONLINE",

        "timestamp":
            datetime.utcnow().isoformat(),

        "governanca":
            governanca,

        "score_pi":
            round(
                score_pi,
                2
            ),

        "risco_global":
            risco_global,

        "decisao":
            decisao,

        "executivo":
            "Centro cognitivo operacional ativo.",

        "tatico":
            "Motores correlacionados em tempo real.",

        "estrategico":
            "Governança biofinanceira estabilizada.",

        "advisory":
            advisory,

        "engines": {

            "rebanho_ai":
                "ONLINE",

            "engorda_ai":
                "ONLINE",

            "climate_ai":
                "ONLINE",

            "cfo_ai":
                "ONLINE",

            "esg_ai":
                "ONLINE",
        },

        "equacoes": {

            "equacao_y":
                "ATIVA",

            "equacao_z":
                "ATIVA",

            "equacao_x":
                "ATIVA",

            "triangulo_360":
                "ATIVO",
        },
    }