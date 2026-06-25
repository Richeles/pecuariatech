from dataclasses import dataclass
from datetime import datetime
import time
from contracts.dashboard_dto_schema import DashboardDTOSchema

@dataclass
class DashboardDTO:
    user_id: str
    roi: float
    margem: float
    ebitda: float
    gmd: float
    lotacao: float
    score_pi: float
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
    
    def to_schema(self, execution_ms: int, cache_hit: bool = False) -> DashboardDTOSchema:
        return DashboardDTOSchema(
            user_id=self.user_id,
            timestamp=datetime.utcnow().isoformat(),
            modo_operacao="real",
            fonte_dados="supabase",
            sincronizado_em=datetime.utcnow().isoformat(),
            execution_ms=execution_ms,
            schema_version="1.0.0",
            api_version="v1",
            cache_hit=cache_hit,
            roi=self.roi,
            margem=self.margem,
            ebitda=self.ebitda,
            gmd=self.gmd,
            lotacao=self.lotacao,
            score_pi=self.score_pi,
            capital_score=self.capital_score,
            governanca=self.governanca,
            esg=self.esg,
            rastreabilidade=self.rastreabilidade,
            maturidade_digital=self.maturidade_digital,
            compliance=self.compliance,
            capital_intelectual=self.capital_intelectual,
            risco_estrutural=self.risco_estrutural,
            # ✅ NOVOS CAMPOS NO SCHEMA
            quantidade=self.quantidade,
            peso_medio=self.peso_medio,
            area_total_ha=self.area_total_ha
        )