from typing import Optional
from dataclasses import dataclass

@dataclass
class DashboardDTOSchema:
    # Metadados
    user_id: str
    timestamp: str
    modo_operacao: str
    fonte_dados: str
    sincronizado_em: Optional[str]
    execution_ms: int
    schema_version: str
    api_version: str
    cache_hit: bool

    # Motor pi (operacional)
    roi: float
    margem: float
    ebitda: float
    gmd: float
    lotacao: float

    # Score pi (estrategico)
    score_pi: float

    # ICBC 360
    capital_score: float
    governanca: float
    esg: float
    rastreabilidade: float
    maturidade_digital: float
    compliance: float
    capital_intelectual: float
    risco_estrutural: str

    # ✅ NOVOS CAMPOS PARA REBANHO E PASTAGEM
    quantidade: float = 0
    peso_medio: float = 0
    area_total_ha: float = 0

    def to_dict(self) -> dict:
        return {k: v for k, v in self.__dict__.items()}