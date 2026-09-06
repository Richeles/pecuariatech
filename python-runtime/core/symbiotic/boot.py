import logging

from .axis import SymbioticAxis
from .supabase_store import SupabaseStore


logger = logging.getLogger(__name__)


class SymbioticBoot:
    """Boot do ESR; persistência permanece desativada nesta etapa."""

    @staticmethod
    def initialize(
        identity: str = "default",
        use_supabase: bool = False,
    ) -> SymbioticAxis:

        store = None

        if use_supabase:
            try:
                store = SupabaseStore()
            except Exception:
                logger.warning(
                    "Supabase store unavailable"
                )

        return SymbioticAxis(
            identity=identity,
            persist_store=store,
        )

    @staticmethod
    def from_request(
        identity: str,
    ) -> SymbioticAxis:
        return SymbioticBoot.initialize(
            identity=identity,
            use_supabase=False,
        )