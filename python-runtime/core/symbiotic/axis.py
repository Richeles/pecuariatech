import logging
from typing import Optional

from .contracts import (
    SymbioticFact,
    SymbioticObservation,
    DeveloperPeak,
    RegimeCursor,
    ModuleName,
)
from .memory import SymbioticMemory
from .convergence import ConvergenceEngine
from .angular import AngularMarkEngine
from .standby import StandbyManager
from .registry import ModuleRegistry


logger = logging.getLogger(__name__)


class SymbioticAxis:
    """Regente principal do Eixo Simbiótico."""

    def __init__(self, identity: str, persist_store=None):
        self.identity = identity
        self.cursor = RegimeCursor()
        self.memory = SymbioticMemory()
        self.convergence = ConvergenceEngine()
        self.angular = AngularMarkEngine()
        self.standby = StandbyManager()
        self.registry = ModuleRegistry()
        self.persist_store = persist_store
        self._current_fact: Optional[SymbioticFact] = None

        if self.persist_store:
            self._restore_from_store()

    def boot(self) -> None:
        modules = [
            "recognition",
            "semantic",
            "statistical",
            "fingerprint",
            "layout",
            "type_inference",
            "normalizer",
            "validator",
            "persistence",
            "learning",
            "rebanho",
            "pastagem",
            "financeiro",
            "cfo",
            "nura",
            "engorda",
            "importador",
        ]

        for module in modules:
            self.registry.register(module)

        logger.info(
            "ESR booted for identity %s",
            self.identity,
        )

    def begin_operation(
        self,
        module: ModuleName,
        operation: str,
        payload=None,
    ) -> int:
        """Inicia uma operação e avança a sequência."""
        self.cursor.advance()

        fact = SymbioticFact(
            sequence=self.cursor.sequence,
            identity=self.identity,
            module=module,
            operation=operation,
            payload=payload,
            predecessor=(
                self.cursor.sequence - 1
                if self.cursor.sequence > 0
                else None
            ),
        )

        self.memory.append(fact)
        self._current_fact = fact

        if self.persist_store:
            self.persist_store.save_fact(fact)

        return self.cursor.sequence

    def observe_motor(
        self,
        sequence: int,
        module: ModuleName,
        before: str,
        after: str,
        changed: bool,
        error: Optional[Exception] = None,
    ) -> None:
        """Registra observação sem controlar o scheduler do Ω."""

        if (
            not self._current_fact
            or self._current_fact.sequence != sequence
        ):
            logger.warning(
                "Observation without active fact for sequence %s",
                sequence,
            )
            return

        observation = SymbioticObservation(
            sequence=sequence,
            module=module,
            before=before,
            after=after,
            changed=changed,
            error=error,
        )

        self._current_fact.add_observation(observation)

        if error:
            import traceback

            peak = DeveloperPeak(
                sequence=sequence,
                identity=self.identity,
                module=module,
                operation="execute",
                error_type=type(error).__name__,
                message=str(error),
                traceback=traceback.format_exc(),
                input_signature=before,
                predecessor=self._current_fact.predecessor,
            )

            self.memory.append_developer_peak(peak)

            if self.persist_store:
                self.persist_store.save_developer_peak(peak)

        if changed:
            self.cursor.revision += 1

    def finalize_operation(
        self,
        sequence: int,
        final_signature: str,
        validation_score: float = 0.0,
    ) -> dict:
        """Finaliza uma operação e avalia convergência consolidada."""

        if (
            not self._current_fact
            or self._current_fact.sequence != sequence
        ):
            logger.warning(
                "Finalize called for unknown sequence %s",
                sequence,
            )
            return {}

        fact = self._current_fact
        fact.final_signature = final_signature

        fact.converged = self.convergence.check(fact, validation_score)

        if fact.converged:
            mark = self.angular.mark(sequence, fact)
            fact.angular_mark = mark

        if self.persist_store:
            self.persist_store.update_fact(fact)

        result = {
            "sequence": sequence,
            "converged": fact.converged,
            "angular_mark": fact.angular_mark,
            "standby": self.standby.status(self.identity),
        }

        self._current_fact = None

        return result

    def get_projection(self) -> dict:
        """Projeção sanitizada para integração posterior."""
        return {
            "sequence": self.cursor.sequence,
            "revision": self.cursor.revision,
            "standby": self.standby.status(self.identity),
            "last_angular": self.angular.last_mark(),
            "memory_ref": self.memory.get_reference(),
        }

    def _restore_from_store(self) -> None:
        data = self.persist_store.load_state(self.identity)

        if data:
            self.cursor.sequence = data.get(
                "sequence",
                0,
            )

            self.cursor.revision = data.get(
                "revision",
                0,
            )

            self.memory.restore(
                data.get("memory", [])
            )

            self.angular.restore(
                data.get("angular_marks", [])
            )