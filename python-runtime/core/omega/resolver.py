class ConflictResolver:
    def resolve(self, existing, new):
        if new.confidence > existing.confidence:
            new.version = existing.version + 1
            new.evidence = existing.evidence + new.evidence
            new.dependencies = list(set(existing.dependencies + new.dependencies))
            return new
        if existing.value == new.value and abs(existing.confidence - new.confidence) < 0.0001:
            return existing
        existing.version += 1
        existing.evidence += new.evidence
        existing.dependencies = list(set(existing.dependencies + new.dependencies))
        return existing
