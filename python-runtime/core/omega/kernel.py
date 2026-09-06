import logging

from .center import OmegaCenter
from .runtime import OmegaRuntime
from .projection import ProjectionEngine
from core.symbiotic.boot import SymbioticBoot


logger = logging.getLogger(__name__)


class OmegaKernel:
    def __init__(self):
        self.center = OmegaCenter()

        # ESR: camada de observação/regência.
        # Não substitui o OmegaCenter nem o OmegaRuntime.
        self.axis = SymbioticBoot.initialize(
            identity="default",
            use_supabase=False,
        )
        self.axis.boot()

        self.runtime = OmegaRuntime(
            self.center,
            axis=self.axis,
        )

        self.projection = ProjectionEngine(self.center)

    def boot(self):
        self.runtime.register_default_motors()

        logger.info(
            "Kernel Ω iniciado com ESR e Runtime orientado a eventos."
        )

    def processar(
        self,
        user_id: str,
        conteudo: bytes,
        formato: str,
        filename: str = "",
        **kwargs,
    ):
        # =================================================
        # ESR: identidade da operação
        # =================================================
        if self.axis.identity != user_id:
            self.axis = SymbioticBoot.from_request(user_id)
            self.axis.boot()

            # Atualiza a referência utilizada pelo Runtime.
            self.runtime.axis = self.axis

        sequence = self.axis.begin_operation(
            module="importador",
            operation="processar",
            payload={
                "user_id": user_id,
                "formato": formato,
                "filename": filename,
                "tipo": kwargs.get("tipo", "auto"),
            },
        )

        # =================================================
        # Ω ORIGINAL — Center
        # =================================================
        self.center.publish(
            "user_id",
            user_id,
            source="kernel",
        )

        self.center.publish(
            "conteudo",
            conteudo,
            source="kernel",
        )

        self.center.publish(
            "formato",
            formato,
            source="kernel",
        )

        self.center.publish(
            "filename",
            filename,
            source="kernel",
        )

        self.center.publish(
            "dados_brutos",
            kwargs.get("dados_brutos"),
            source="kernel",
        )

        self.center.publish(
            "tipo_fornecido",
            kwargs.get("tipo", "auto"),
            source="kernel",
        )

        # =================================================
        # Ω ORIGINAL — Runtime
        # =================================================
        self.runtime.run()

        # =================================================
        # Ω ORIGINAL — convergência
        # =================================================
        confidence = self.center.read(
            "validation.score",
            0.0,
        )

        if confidence >= 0.95:
            self.center.publish(
                "kernel.converged",
                True,
                level="executivo",
                confidence=1.0,
                source="kernel",
            )
        else:
            self.center.publish(
                "kernel.feedback",
                {
                    "reprocess": True,
                    "confidence": confidence,
                },
                level="tatico",
                confidence=1.0,
                source="kernel",
            )

        # =================================================
        # ESR — finalização consolidada
        # =================================================
        final_signature = self.center.state_signature()

        esr_result = self.axis.finalize_operation(
            sequence,
            final_signature,
            validation_score=confidence,
        )

        # =================================================
        # Ω ORIGINAL — projeção
        # =================================================
        projection_result = self.projection.execute()

        return {
            "projection": projection_result,
            "facts": self.center.snapshot(),
            "signature": self.center.state_signature(),
            "esr": esr_result,
        }
