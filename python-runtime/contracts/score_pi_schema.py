from dataclasses import dataclass

@dataclass
class ScorePiSchema:
    financeiro_score: float   # 0-100
    biologico_score: float    # 0-100
    operacional_score: float  # 0-100
    sanidade_score: float     # 0-100
    esg_score: float          # 0-100
    governanca_score: float   # 0-100
    total: float              # 0-100 (pesado)