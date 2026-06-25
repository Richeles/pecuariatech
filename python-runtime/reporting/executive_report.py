def gerar_executive_report(dto: dict) -> str:
    texto = f"""
RELATORIO EXECUTIVO - PECUARIATECH
==================================
Fazenda: {dto.get('user_id', 'N/A')}
Data: {dto.get('timestamp', 'N/A')}

Score pi: {dto.get('score_pi', 0)}/100
Capital Score: {dto.get('capital_score', 0)}/100
Risco Estrutural: {dto.get('risco_estrutural', 'N/A')}

Indicadores Operacionais:
- ROI: {dto.get('roi', 0)}%
- Margem: {dto.get('margem', 0)}%
- EBITDA: R$ {dto.get('ebitda', 0)}
- GMD: {dto.get('gmd', 0)} kg/dia
- Lotacao: {dto.get('lotacao', 0)} UA/ha

ICBC 360:
- Governanca: {dto.get('governanca', 0)}
- ESG: {dto.get('esg', 0)}
- Rastreabilidade: {dto.get('rastreabilidade', 0)}
- Maturidade Digital: {dto.get('maturidade_digital', 0)}
- Compliance: {dto.get('compliance', 0)}
- Capital Intelectual: {dto.get('capital_intelectual', 0)}

Recomendacao:
{gerar_recomendacao(dto)}
"""
    return texto

def gerar_recomendacao(dto: dict) -> str:
    risco = dto.get('risco_estrutural', '')
    if risco == 'baixo':
        return "Operacao sustentavel. Manter estrategia atual e buscar otimizacoes."
    elif risco == 'moderado':
        return "Atencao: pressao estrutural. Recomenda-se revisao de alocacao de capital."
    else:
        return "Risco elevado. Acao imediata: isolar nucleos viaveis e reestruturar passivo."