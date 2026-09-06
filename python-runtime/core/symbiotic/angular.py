from typing import List, Dict, Optional

from .contracts import SymbioticFact


class AngularMarkEngine:
    """Gerencia os Marcos Angulares do ESR."""

    def __init__(self):
        self._marks: List[Dict] = []

    def mark(
        self,
        sequence: int,
        fact: SymbioticFact,
    ) -> int:
        mark = {
            "sequence": sequence,
            "module": fact.module,
            "operation": fact.operation,
            "timestamp": fact.timestamp,
        }

        self._marks.append(mark)

        return sequence

    def last_mark(self) -> Optional[Dict]:
        return self._marks[-1] if self._marks else None

    def restore(self, marks: List[Dict]) -> None:
        self._marks = marks