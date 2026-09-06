from typing import List, Optional

from .contracts import SymbioticFact, DeveloperPeak


class SymbioticMemory:
    """Memória em processo do ESR."""

    def __init__(self):
        self._facts: List[SymbioticFact] = []
        self._peaks: List[DeveloperPeak] = []

    def append(self, fact: SymbioticFact) -> None:
        self._facts.append(fact)

    def get(self, sequence: int) -> Optional[SymbioticFact]:
        for fact in self._facts:
            if fact.sequence == sequence:
                return fact
        return None

    def append_developer_peak(
        self,
        peak: DeveloperPeak,
    ) -> None:
        self._peaks.append(peak)

    def get_reference(self) -> str:
        if not self._facts:
            return "empty"

        last = self._facts[-1]
        return f"F{last.sequence}:{last.identity[:8]}"

    def restore(self, facts_data: List[dict]) -> None:
        # Restauração completa será implementada na etapa de persistência.
        return None