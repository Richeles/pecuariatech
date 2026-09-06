from .contracts import SymbioticFact


class ConvergenceEngine:
    """Avalia convergência consolidada da operação."""

    def check(
        self,
        fact: SymbioticFact,
        validation_score: float = 0.0,
    ) -> bool:
        """
        Considera a operação convergida somente quando:
        - existe identidade;
        - existe assinatura final;
        - existem observações;
        - a validação do Ω atinge o mesmo limiar de sucesso
          utilizado pelo OmegaKernel.
        """
        return bool(
            fact.identity
            and fact.final_signature
            and fact.observations
            and validation_score >= 0.95
        )