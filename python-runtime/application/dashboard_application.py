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

from motor_pi.financeiro import calcular_roi, calcular_margem, calcular_ebitda
from motor_pi.biologico import calcular_gmd
from motor_pi.operacional import calcular_lotacao
from motor_pi.score_pi import calcular_score_pi

from icbc.icbc import calcular_icbc
from dto.dashboard_dto import DashboardDTO

cache = {}

async def gerar_dashboard_dto(user_id: str) -> dict:
    start_time = time.time()
    
    # 🔍 LOG TEMPORÁRIO: Início
    print(f"[DTO] Iniciando para user_id: {user_id}")
    
    # Buscar dados das views
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
    
    # 🔍 LOG TEMPORÁRIO: Dados brutos do Rebanho
    print(f"[DTO] Rebanho: quantidade={rebanho.get('quantidade', 0)}, peso_medio={rebanho.get('peso_medio', 0)}")
    print(f"[DTO] Pastagem: area_total_ha={pastagem.get('area_total_ha', 0)}")
    
    # 1. Cálculos do Motor π
    receita = financeiro.get('receita', 0)
    despesa = financeiro.get('despesa', 0)
    despesa_op = financeiro.get('despesa_operacional', 0)
    
    roi = calcular_roi(receita, despesa)
    margem = calcular_margem(receita, despesa)
    ebitda = calcular_ebitda(receita, despesa_op)
    
    gmd = calcular_gmd(
        engorda.get('peso_final_medio', 0),
        engorda.get('peso_inicial_medio', 0),
        engorda.get('duracao_media', 0)
    )
    
    lotacao = calcular_lotacao(
        rebanho.get('quantidade', 0),
        pastagem.get('area_total_ha', 0)
    )
    
    # Scores individuais para o Score π
    financeiro_score = (roi + margem) / 2 if (roi + margem) > 0 else 0
    biologico_score = min((gmd / 1.5) * 100, 100) if gmd > 0 else 0
    operacional_score = min((lotacao / 2.0) * 100, 100) if lotacao > 0 else 0
    sanidade_score = sanidade.get('score', 0) or 0
    esg_score = esg.get('score', 0) or 0
    governanca_score = governanca.get('score', 0) or 0
    
    score_pi = calcular_score_pi(
        financeiro_score, biologico_score, operacional_score,
        sanidade_score, esg_score, governanca_score
    )
    
    # 2. ICBC 360
    icbc_result = await calcular_icbc(
        governanca_score,
        esg_score,
        rastreabilidade.get('score', 0) or 0,
        maturidade.get('score', 0) or 0,
        compliance.get('score', 0) or 0,
        capital.get('score', 0) or 0
    )
    
    # 3. Montar DTO (COM CAMPOS EXTRAS)
    dto = DashboardDTO(
        user_id=user_id,
        roi=roi,
        margem=margem,
        ebitda=ebitda,
        gmd=gmd,
        lotacao=lotacao,
        score_pi=score_pi,
        capital_score=icbc_result['capital_score'],
        governanca=icbc_result['governanca'],
        esg=icbc_result['esg'],
        rastreabilidade=icbc_result['rastreabilidade'],
        maturidade_digital=icbc_result['maturidade_digital'],
        compliance=icbc_result['compliance'],
        capital_intelectual=icbc_result['capital_intelectual'],
        risco_estrutural=icbc_result['risco_estrutural'],
        # ✅ NOVOS CAMPOS PARA REBANHO E PASTAGEM
        quantidade=rebanho.get('quantidade', 0),
        peso_medio=rebanho.get('peso_medio', 0),
        area_total_ha=pastagem.get('area_total_ha', 0),
    )
    
    # 🔍 LOG TEMPORÁRIO: Dados finais do DTO
    print(f"[DTO] DTO final: quantidade={dto.quantidade}, peso_medio={dto.peso_medio}, area_total_ha={dto.area_total_ha}")
    print(f"[DTO] DTO final: roi={dto.roi}, gmd={dto.gmd}, score_pi={dto.score_pi}")
    
    execution_time = int((time.time() - start_time) * 1000)
    schema = dto.to_schema(execution_time, cache_hit=False)
    
    return schema.to_dict()