import time
import uuid
from typing import Any, List, Dict

class Fact:
    def __init__(self, key: str, value: Any, level: str = "operacional",
                 confidence: float = 1.0, source: str = "unknown",
                 evidence: List[Dict] = None, dependencies: List[str] = None,
                 ttl: float = None):
        self.id = uuid.uuid4().hex[:8]
        self.key = key
        self.value = value
        self.level = level
        self.confidence = confidence
        self.source = source
        self.evidence = evidence or []
        self.dependencies = dependencies or []
        self.timestamp = time.time()
        self.ttl = ttl
        self.version = 1

    def to_dict(self):
        return {
            "id": self.id,
            "key": self.key,
            "value": self.value,
            "level": self.level,
            "confidence": self.confidence,
            "source": self.source,
            "evidence": self.evidence,
            "dependencies": self.dependencies,
            "timestamp": self.timestamp,
            "ttl": self.ttl,
            "version": self.version
        }
