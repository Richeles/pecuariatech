from typing import Any, Optional, Literal, List
from datetime import datetime


ModuleName = Literal[
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


class SymbioticFact:
    """Fato da trajetória, um por operação."""

    def __init__(
        self,
        sequence: int,
        identity: str,
        module: ModuleName,
        operation: str,
        payload: Any,
        state_signature: Optional[str] = None,
        predecessor: Optional[int] = None,
        timestamp: Optional[str] = None,
    ):
        self.sequence = sequence
        self.identity = identity
        self.module = module
        self.operation = operation
        self.payload = payload
        self.state_signature = state_signature
        self.predecessor = predecessor
        self.timestamp = timestamp or datetime.utcnow().isoformat()

        self.observations: List["SymbioticObservation"] = []
        self.final_signature: Optional[str] = None
        self.converged: bool = False
        self.angular_mark: Optional[int] = None

    def add_observation(self, obs: "SymbioticObservation") -> None:
        self.observations.append(obs)

    def to_dict(self) -> dict:
        return {
            "sequence": self.sequence,
            "identity": self.identity,
            "module": self.module,
            "operation": self.operation,
            "payload": self.payload,
            "state_signature": self.state_signature,
            "predecessor": self.predecessor,
            "timestamp": self.timestamp,
            "observations": [o.to_dict() for o in self.observations],
            "final_signature": self.final_signature,
            "converged": self.converged,
            "angular_mark": self.angular_mark,
        }


class SymbioticObservation:
    """Observação de um motor individual."""

    def __init__(
        self,
        sequence: int,
        module: ModuleName,
        before: str,
        after: str,
        changed: bool,
        error: Optional[Exception] = None,
    ):
        self.sequence = sequence
        self.module = module
        self.before = before
        self.after = after
        self.changed = changed
        self.error = error
        self.timestamp = datetime.utcnow().isoformat()

    def to_dict(self) -> dict:
        return {
            "sequence": self.sequence,
            "module": self.module,
            "before": self.before,
            "after": self.after,
            "changed": self.changed,
            "error": str(self.error) if self.error else None,
            "timestamp": self.timestamp,
        }


class DeveloperPeak:
    """Pico de diagnóstico interno."""

    def __init__(
        self,
        sequence: int,
        identity: str,
        module: ModuleName,
        operation: str,
        error_type: str,
        message: str,
        traceback: str,
        input_signature: Optional[str] = None,
        predecessor: Optional[int] = None,
    ):
        self.sequence = sequence
        self.identity = identity
        self.module = module
        self.operation = operation
        self.error_type = error_type
        self.message = message
        self.traceback = traceback
        self.input_signature = input_signature
        self.predecessor = predecessor
        self.timestamp = datetime.utcnow().isoformat()

    def to_dict(self) -> dict:
        return {
            "sequence": self.sequence,
            "identity": self.identity,
            "module": self.module,
            "operation": self.operation,
            "error_type": self.error_type,
            "message": self.message,
            "traceback": self.traceback,
            "input_signature": self.input_signature,
            "predecessor": self.predecessor,
            "timestamp": self.timestamp,
        }


class RegimeCursor:
    """Cursor de regência em memória."""

    def __init__(self, sequence: int = 0, revision: int = 0):
        self.sequence = sequence
        self.revision = revision

    def advance(self) -> None:
        self.sequence += 1

    def to_dict(self) -> dict:
        return {
            "sequence": self.sequence,
            "revision": self.revision,
        }