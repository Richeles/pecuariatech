import logging

logger = logging.getLogger(__name__)

class NormalizerMotor:
    observes = ["dados_brutos", "tipo", "formato"]

    def execute(self, center):
        dados = center.read("dados_brutos")
        tipo = center.read("tipo", "financeiro")
        formato = center.read("formato", "csv")
        if not dados:
            return

        canonical = self._normalizar(dados, formato, tipo)
        if canonical is not None:
            center.publish("canonical_model", canonical, confidence=0.95, source="normalizer")

    def _normalizar(self, dados_brutos, formato, tipo):
        # Usa os normalizadores reais do UniversalImporter (import local para evitar circular)
        from main import UniversalImporter

        if tipo == "pastagem":
            return UniversalImporter.normalizar_pastagem(dados_brutos, formato)
        elif tipo == "rebanho":
            return UniversalImporter.normalizar_rebanho(dados_brutos, formato)
        elif tipo == "engorda":
            return UniversalImporter.normalizar_engorda(dados_brutos, formato)
        else:
            return UniversalImporter.normalizar_financeiro(dados_brutos, formato)
