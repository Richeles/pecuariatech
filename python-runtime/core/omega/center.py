import hashlib
import json
from collections import defaultdict, deque
from typing import Any, Dict, List, Optional
from .fact import Fact
from .resolver import ConflictResolver

class OmegaCenter:
    def __init__(self):
        self._facts: Dict[str, Fact] = {}
        self._history: List[Fact] = []
        self._observers: Dict[str, List[str]] = defaultdict(list)
        self._motors: Dict[str, Any] = {}
        self.resolver = ConflictResolver()
        self.changed_queue = deque()

    def register_motor(self, name: str, motor):
        self._motors[name] = motor
        for key in motor.observes:
            self._observers[key].append(name)

    def publish(self, key, value, level="operacional", confidence=1.0,
                source="unknown", evidence=None, dependencies=None, ttl=None):
        new_fact = Fact(key, value, level, confidence, source, evidence, dependencies, ttl)
        existing = self._facts.get(key)
        if existing:
            new_fact = self.resolver.resolve(existing, new_fact)
            if existing.value == new_fact.value and abs(existing.confidence - new_fact.confidence) < 0.0001:
                return existing
        self._facts[key] = new_fact
        self._history.append(new_fact)
        self.changed_queue.append(key)
        return new_fact

    def read(self, key, default=None):
        fact = self._facts.get(key)
        return fact.value if fact else default

    def read_fact(self, key):
        return self._facts.get(key)

    def pop_changed_key(self):
        if self.changed_queue:
            return self.changed_queue.popleft()
        return None

    def has_pending_changes(self):
        return len(self.changed_queue) > 0

    def get_observers_for_key(self, key):
        return self._observers.get(key, [])

    def get_motor(self, name):
        return self._motors.get(name)

    def snapshot(self):
        return {k: f.to_dict() for k, f in self._facts.items()}

    def state_signature(self):
        sig = {}
        for key, fact in self._facts.items():
            raw = json.dumps(fact.value, sort_keys=True, default=str)
            sig[key] = (hashlib.sha256(raw.encode()).hexdigest(), round(fact.confidence, 6))
        return sig
