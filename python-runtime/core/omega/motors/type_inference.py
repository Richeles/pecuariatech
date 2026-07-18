import logging

logger = logging.getLogger(__name__)

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
        logger.info(f"[TypeInference] Tipo inferido: {tipo}")
        if center.read("tipo") != tipo:
            center.publish("tipo", tipo, confidence=0.98, source="type_inference")

    def _inferir(self, dados_brutos, formato: str) -> str:
        cabecalho = []
        if formato == "csv":
            if isinstance(dados_brutos, dict) and dados_brutos.get("linhas"):
                linhas = dados_brutos["linhas"]
                separador = dados_brutos.get("separador", ",")
                cabecalho = [c.strip().lower() for c in linhas[0].split(separador)]
            else:
                logger.warning("[TypeInference] CSV sem linhas interpretáveis")
                return "financeiro"
        elif formato == "excel":
            if isinstance(dados_brutos, list) and dados_brutos:
                cabecalho = [c.lower() for c in dados_brutos[0].keys()]
        else:
            return "financeiro"

        logger.info(f"[TypeInference] Cabeçalho encontrado: {cabecalho}")

        # Verificação flexível: normaliza removendo acentos e espaços extras
        def normalizar(s):
            import unicodedata
            s = unicodedata.normalize('NFKD', s).encode('ASCII', 'ignore').decode('ASCII')
            return s.replace(" ", "")

        col_norm = [normalizar(c) for c in cabecalho]

        # Conjuntos de palavras-chave para cada domínio (normalizadas)
        pastagem_kw = ["piquete", "area_ha", "lotacao_ua", "forragem"]  # sem espaços e acentos
        rebanho_kw = ["brinco", "lote", "sexo", "raca", "peso_entrada"]
        engorda_kw = ["lote", "peso_inicial", "peso_atual", "gmd"]

        # Calcula quantos termos de cada domínio aparecem
        count_pastagem = sum(1 for kw in pastagem_kw if any(kw in col for col in col_norm))
        count_rebanho = sum(1 for kw in rebanho_kw if any(kw in col for col in col_norm))
        count_engorda = sum(1 for kw in engorda_kw if any(kw in col for col in col_norm))

        logger.info(f"[TypeInference] Match pastagem: {count_pastagem}/4, rebanho: {count_rebanho}/5, engorda: {count_engorda}/4")

        # Se ao menos 3 de 4 casarem para pastagem, assume pastagem
        if count_pastagem >= 3:
            return "pastagem"
        if count_rebanho >= 4:  # 4 de 5
            return "rebanho"
        if count_engorda >= 3:
            return "engorda"

        # Fallback: inspeciona a primeira linha de dados (se houver) para palavras-chave
        if formato == "csv" and isinstance(dados_brutos, dict) and dados_brutos.get("linhas"):
            if len(dados_brutos["linhas"]) > 1:
                primeira_linha = dados_brutos["linhas"][1].lower()
                if "piquete" in primeira_linha and "area" in primeira_linha:
                    logger.info("[TypeInference] Fallback: conteúdo sugere pastagem")
                    return "pastagem"
                if "brinco" in primeira_linha:
                    return "rebanho"
        elif formato == "excel" and isinstance(dados_brutos, list) and dados_brutos:
            sample = str(dados_brutos[0]).lower()
            if "piquete" in sample:
                return "pastagem"
            if "brinco" in sample:
                return "rebanho"

        return "financeiro"