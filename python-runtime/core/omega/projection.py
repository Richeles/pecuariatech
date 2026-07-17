class ProjectionEngine:
    def __init__(self, center):
        self.center = center

    def execute(self):
        facts = self.center.snapshot()
        return {
            "tipo": facts.get("tipo", {}).get("value", "financeiro"),
            "inseridos": facts.get("inseridos", {}).get("value", 0),
            "erros": facts.get("erros", {}).get("value", 0),
            "confianca": facts.get("validation.score", {}).get("value", 0),
            "fingerprint": facts.get("fingerprint", {}).get("value", ""),
            "persistence_status": facts.get("persistence.status", {}).get("value", "pending"),
        }
