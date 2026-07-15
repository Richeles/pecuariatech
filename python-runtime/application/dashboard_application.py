import time
import asyncio
from equacao_y.financeiro_repository import obter_financeiro
from equacao_y.rebanho_repository import obter_rebanho
from equacao_y.pastagem_repository import obter_pastagem
from equacao_y.engorda_repository import obter_engorda
from equacao_y.sanidade_repository import obter_sanidade
from equacao_y.esg_repository import obter_esg
from equacao_y.governanca_repository import obter_governanca
from equacao_y.rastreabilidade_repository import obter_rastreabilidade
from equacao_y.maturidade_digital_repository import obter_maturidade_digital
from equacao_y.compliance_repository import obter_compliance
from equacao_y.capital_intelectual_repository import obter_capital_intelectual

from motor_pi.biologico import calcular_gmd
from motor_pi.operacional import calcular_lotacao
from motor_pi.score_pi import calcular_score_pi

from icbc.icbc import calcular_icbc
from dto.dashboard_dto import DashboardDTO

cache = {}

async def gerar_dashboard_dto(user_id: str) -> dict:
    start_time = time.time()

    print(f"[DTO] Iniciando para user_id: {user_id}")

    # Buscar dados das views (se vazias, retornam dicionários vazios)
    financeiro = await obter_financeiro(user_id) or {}
    rebanho = await obter_rebanho(user_id) or {}
    pastagem = await obter_pastagem(user_id) or {}
    engorda = await obter_engorda(user_id) or {}
    sanidade = await obter_sanidade(user_id) or {}
    esg = await obter_esg(user_id) or {}
    governanca = await obter_governanca(user_id) or {}
    rastreabilidade = await obter_rastreabilidade(user_id) or {}
    maturidade = await obter_maturidade_digital(user_id) or {}
    compliance = await obter_compliance(user_id) or {}
    capital = await obter_capital_intelectual(user_id) or {}

    print(f"[DTO] Rebanho: quantidade={rebanho.get('quantidade', 0)}, peso_medio={rebanho.get('peso_medio', 0)}")
    print(f"[DTO] Pastagem: area_total_ha={pastagem.get('area_total_ha', 0)}, lotacao_media={pastagem.get('lotacao_media', 0)}, lotacao_ponderada={pastagem.get('lotacao_ponderada', 0)}")

    # ============================================================
    # FINANCEIRO – TUDO ZERADO SE NÃO HOUVER DADOS
    # ============================================================
    receita_bruta = financeiro.get('receita_bruta', 0) or 0
    custo_operacional = financeiro.get('custo_operacional', 0) or 0
    lucro_liquido = financeiro.get('lucro_liquido', 0) or 0
    ebitda_val = financeiro.get('ebitda', 0) or 0

    if receita_bruta > 0:
        roi = (lucro_liquido / receita_bruta) * 100
        margem = ((receita_bruta - custo_operacional) / receita_bruta) * 100
    else:
        roi = 0.0
        margem = 0.0

    ebitda = ebitda_val

    print(f"[DTO] Financeiro: receita={receita_bruta}, custo={custo_operacional}, lucro={lucro_liquido}, roi={roi}, margem={margem}, ebitda={ebitda}")

    # ============================================================
    # GMD E LOTAÇÃO – USAM DADOS REAIS OU ZERO
    # ============================================================
    peso_final = engorda.get('peso_final_medio', 0) or 0
    peso_inicial = engorda.get('peso_inicial_medio', 0) or 0
    duracao = engorda.get('duracao_media', 0) or 0

    gmd = calcular_gmd(peso_final, peso_inicial, duracao) if (peso_final or peso_inicial or duracao) else 0.0

    quantidade = rebanho.get('quantidade', 0) or 0
    area_total = pastagem.get('area_total_ha', 0) or 0

    # Extrair lotação real da view (prioridade: ponderada > média)
    lotacao_ponderada = pastagem.get('lotacao_ponderada', 0) or 0
    lotacao_media = pastagem.get('lotacao_media', 0) or 0
    lotacao_real = lotacao_ponderada if lotacao_ponderada > 0 else (lotacao_media if lotacao_media > 0 else None)

    # Calcular lotação (passa a lotação real se disponível)
    lotacao = calcular_lotacao(quantidade, area_total, lotacao_real)

    # ============================================================
    # SCORE π – COMPONENTES ZERADOS SE NÃO HOUVER DADOS
    # ============================================================
    financeiro_score = (roi + margem) / 2 if (roi + margem) > 0 else 0.0
    biologico_score = min((gmd / 1.5) * 100, 100) if gmd > 0 else 0.0
    operacional_score = min((lotacao / 2.0) * 100, 100) if lotacao > 0 else 0.0
    sanidade_score = sanidade.get('score', 0) or 0
    esg_score = esg.get('score', 0) or 0
    governanca_score = governanca.get('score', 0) or 0

    score_pi = calcular_score_pi(
        financeiro_score, biologico_score, operacional_score,
        sanidade_score, esg_score, governanca_score
    ) if any([financeiro_score, biologico_score, operacional_score, sanidade_score, esg_score, governanca_score]) else 0.0

    # ============================================================
    # ICBC 360 – TODOS OS COMPONENTES ZERADOS POR PADRÃO
    # ============================================================
    icbc_result = await calcular_icbc(
        governanca_score,
        esg_score,
        rastreabilidade.get('score', 0) or 0,
        maturidade.get('score', 0) or 0,
        compliance.get('score', 0) or 0,
        capital.get('score', 0) or 0
    )

    if all(v == 0 for v in [
        governanca_score, esg_score,
        rastreabilidade.get('score', 0) or 0,
        maturidade.get('score', 0) or 0,
        compliance.get('score', 0) or 0,
        capital.get('score', 0) or 0
    ]):
        icbc_result = {
            'capital_score': 0.0,
            'governanca': 0.0,
            'esg': 0.0,
            'rastreabilidade': 0.0,
            'maturidade_digital': 0.0,
            'compliance': 0.0,
            'capital_intelectual': 0.0,
            'risco_estrutural': 'indisponivel'
        }

    # ============================================================
    # DTO – TODOS OS CAMPOS COM FALLBACK ZERO
    # ============================================================
    dto = DashboardDTO(
        user_id=user_id,
        roi=roi,
        margem=margem,
        ebitda=ebitda,
        gmd=gmd,
        lotacao=lotacao,
        score_pi=score_pi,
        capital_score=icbc_result.get('capital_score', 0.0),
        governanca=icbc_result.get('governanca', 0.0),
        esg=icbc_result.get('esg', 0.0),
        rastreabilidade=icbc_result.get('rastreabilidade', 0.0),
        maturidade_digital=icbc_result.get('maturidade_digital', 0.0),
        compliance=icbc_result.get('compliance', 0.0),
        capital_intelectual=icbc_result.get('capital_intelectual', 0.0),
        risco_estrutural=icbc_result.get('risco_estrutural', 'indisponivel'),
        quantidade=quantidade,
        peso_medio=rebanho.get('peso_medio', 0) or 0,
        area_total_ha=area_total,
    )

    print(f"[DTO] DTO final: quantidade={dto.quantidade}, peso_medio={dto.peso_medio}, area_total_ha={dto.area_total_ha}")
    print(f"[DTO] DTO final: roi={dto.roi}, gmd={dto.gmd}, score_pi={dto.score_pi}, lotacao={dto.lotacao}")

    execution_time = int((time.time() - start_time) * 1000)
    schema = dto.to_schema(execution_time, cache_hit=False)

    return schema.to_dict()