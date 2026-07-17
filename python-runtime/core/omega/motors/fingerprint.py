import hashlib
import json

class FingerprintMotor:
    observes = ["dados_brutos"]
    def execute(self, center):
        dados = center.read("dados_brutos")
        if not dados:
            return
        structure = {
            "formato": center.read("formato"),
            "colunas": list(dados[0].keys()) if dados else [],
            "row_count": len(dados)
        }
        raw = json.dumps(structure, sort_keys=True, default=str)
        fp = hashlib.sha256(raw.encode()).hexdigest()[:12]
        if center.read("fingerprint") != fp:
            center.publish("fingerprint", fp, confidence=1.0, source="fingerprint")
