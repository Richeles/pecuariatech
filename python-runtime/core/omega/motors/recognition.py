class RecognitionMotor:
    observes = ["dados_brutos"]
    def execute(self, center):
        dados = center.read("dados_brutos")
        if not dados or not isinstance(dados, list):
            return
        formato = center.read("formato", "unknown")
        filename = center.read("filename", "")
        doc_type = "spreadsheet" if formato == "excel" else "unknown"
        origin = "unknown"
        if dados and isinstance(dados, list) and dados:
            sample = str(dados[0]).lower()
            if "sicredi" in sample or "sicredi" in filename.lower():
                origin = "Sicredi"
            elif "banco do brasil" in sample:
                origin = "Banco do Brasil"
        if center.read("recognition.document_type") != doc_type:
            center.publish("recognition.document_type", doc_type, confidence=0.90, source="recognition")
        if center.read("recognition.origin") != origin:
            center.publish("recognition.origin", origin, confidence=0.85, source="recognition")
