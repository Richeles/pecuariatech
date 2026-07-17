class SemanticMotor:
    observes = ["recognition.document_type"]
    def execute(self, center):
        entities = ["RECEITA", "DESPESA"]
        if center.read("semantic.entities") != entities:
            center.publish("semantic.entities", entities, confidence=0.90, source="semantic")
