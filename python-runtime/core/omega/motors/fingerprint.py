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
            "row_count": 0,
            "colunas": []
        }
        # Trata formato CSV (dict com 'linhas')
        if isinstance(dados, dict) and "linhas" in dados:
            structure["row_count"] = len(dados["linhas"])
            if dados["linhas"]:
                separador = dados.get("separador", ",")
                structure["colunas"] = dados["linhas"][0].split(separador)
        # Trata formato Excel/JSON (lista de dicts)
        elif isinstance(dados, list) and dados:
            structure["row_count"] = len(dados)
            structure["colunas"] = list(dados[0].keys())
            
        raw = json.dumps(structure, sort_keys=True, default=str)
        fp = hashlib.sha256(raw.encode()).hexdigest()[:12]
        if center.read("fingerprint") != fp:
            center.publish("fingerprint", fp, confidence=1.0, source="fingerprint")