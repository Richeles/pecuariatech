from dataclasses import dataclass

@dataclass
class ICBCSchema:
    governanca: float          # 0-100 (peso 25%)
    esg: float                 # 0-100 (peso 20%)
    rastreabilidade: float     # 0-100 (peso 20%)
    maturidade_digital: float  # 0-100 (peso 15%)
    compliance: float          # 0-100 (peso 10%)
    capital_intelectual: float # 0-100 (peso 10%)
    capital_score: float       # 0-100 (total ponderado)
    risco_estrutural: str      # "baixo", "moderado", "alto"