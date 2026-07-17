import logging
from .center import OmegaCenter
from .runtime import OmegaRuntime
from .projection import ProjectionEngine

logger = logging.getLogger(__name__)

class OmegaKernel:
    def __init__(self):
        self.center = OmegaCenter()
        self.runtime = OmegaRuntime(self.center)
        self.projection = ProjectionEngine(self.center)

    def boot(self):
        self.runtime.register_default_motors()
        logger.info("Kernel Ω iniciado com Centro Cognitivo e Runtime orientado a eventos.")

    def processar(self, user_id: str, conteudo: bytes, formato: str, filename: str = "", **kwargs):
        self.center.publish("user_id", user_id, source="kernel")
        self.center.publish("conteudo", conteudo, source="kernel")
        self.center.publish("formato", formato, source="kernel")
        self.center.publish("filename", filename, source="kernel")
        self.center.publish("dados_brutos", kwargs.get("dados_brutos"), source="kernel")
        self.center.publish("tipo_fornecido", kwargs.get("tipo", "auto"), source="kernel")

        self.runtime.run()

        confidence = self.center.read("validation.score", 0.0)
        if confidence >= 0.95:
            self.center.publish("kernel.converged", True, level="executivo", confidence=1.0, source="kernel")
        else:
            self.center.publish("kernel.feedback", {"reprocess": True, "confidence": confidence},
                                level="tatico", confidence=1.0, source="kernel")

        projection_result = self.projection.execute()
        return {
            "projection": projection_result,
            "facts": self.center.snapshot(),
            "signature": self.center.state_signature(),
        }
