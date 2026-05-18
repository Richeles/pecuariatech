# =========================================================
# PecuariaTech
# Structural Risk Engine
# Runtime Enterprise
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

def calcular_risco(resumo, mensal):

    # =====================================================
    # DADOS BASE
    # =====================================================

    receita = to_number(
        resumo.get("receita_total")
    )

    custo = to_number(
        resumo.get("custo_total")
    )

    resultado = to_number(
        resumo.get("resultado_operacional")
    )

    margem = 0.0

    if receita > 0:

        margem = (
            resultado / receita
        ) * 100

    # =====================================================
    # MESES NEGATIVOS
    # =====================================================

    meses_negativos = 0

    for mes in mensal:

        resultado_mes = to_number(
            mes.get("resultado_operacional")
        )

        if resultado_mes < 0:
            meses_negativos += 1

    # =====================================================
    # SCORE BASE
    # =====================================================

    risco = "baixo"

    alertas = []

    score = 92

    # =====================================================
    # PRESSÃO DE CAIXA
    # =====================================================

    if margem < 15:

        risco = "medio"

        alertas.append(
            "Margem operacional comprimida."
        )

        score -= 25

    # =====================================================
    # DETERIORAÇÃO
    # =====================================================

    if meses_negativos >= 2:

        risco = "alto"

        alertas.append(
            "Fluxo operacional deteriorando."
        )

        score -= 35

    # =====================================================
    # CUSTO MAIOR QUE RECEITA
    # =====================================================

    if custo > receita:

        risco = "critico"

        alertas.append(
            "Estrutura consumindo mais capital do que produz."
        )

        score -= 40

    # =====================================================
    # SCORE FLOOR
    # =====================================================

    if score < 0:
        score = 0

    # =====================================================
    # ADVISORY
    # =====================================================

    advisory = []

    if risco == "baixo":

        advisory = [
            "Operação estruturalmente saudável.",
            "Conversão operacional estabilizada.",
            "Capital preservado dentro do ciclo.",
        ]

    elif risco == "medio":

        advisory = [
            "Monitorar pressão estrutural.",
            "Reavaliar sincronismo operacional.",
            "Ajustar eficiência de conversão.",
        ]

    elif risco == "alto":

        advisory = [
            "Operação entrando em deterioração.",
            "Fluxo estrutural perdeu estabilidade.",
            "Necessário reduzir pressão operacional.",
        ]

    elif risco == "critico":

        advisory = [
            "Estrutura em destruição de capital.",
            "Risco elevado de ruptura financeira.",
            "Necessária intervenção imediata.",
        ]

    # =====================================================
    # RESPONSE
    # =====================================================

    return {

        "risco": risco,

        "score_estrutural": score,

        "meses_negativos": meses_negativos,

        "margem_operacional": round(
            margem,
            2
        ),

        "receita": receita,

        "custo": custo,

        "resultado_operacional": resultado,

        "alertas": alertas,

        "advisory": advisory,
    }