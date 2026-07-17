class TypeInferenceMotor:
    observes = ["dados_brutos", "formato", "tipo_fornecido"]

    def execute(self, center):
        tipo_fornecido = center.read("tipo_fornecido", "auto")
        if tipo_fornecido != "auto":
            if center.read("tipo") != tipo_fornecido:
                center.publish("tipo", tipo_fornecido, confidence=1.0, source="type_inference")
            return

        dados = center.read("dados_brutos")
        formato = center.read("formato", "csv")
        if not dados:
            return

        tipo = self._inferir(dados, formato)
        if center.read("tipo") != tipo:
            center.publish("tipo", tipo, confidence=0.98, source="type_inference")

    def _inferir(self, dados_brutos, formato: str) -> str:
        cabecalho = []
        if formato == "csv":
            if isinstance(dados_brutos, dict) and dados_brutos.get("linhas"):
                linhas = dados_brutos["linhas"]
                separador = dados_brutos.get("separador", ",")
                cabecalho = [c.strip().lower() for c in linhas[0].split(separador)]
        elif formato == "excel":
            if isinstance(dados_brutos, list) and dados_brutos:
                cabecalho = [c.lower() for c in dados_brutos[0].keys()]
        else:
            return "financeiro"

        colunas = set(cabecalho)
        if {"brinco", "lote", "sexo", "raca", "peso_entrada"}.issubset(colunas):
            return "rebanho"
        if {"piquete", "area_ha", "lotacao_ua", "forragem"}.issubset(colunas):
            return "pastagem"
        if {"lote", "peso_inicial", "peso_atual", "gmd"}.issubset(colunas):
            return "engorda"
        return "financeiro"
