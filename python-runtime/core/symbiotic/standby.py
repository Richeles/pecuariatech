class StandbyManager:
    """Standby explícito, sem inferência pela igualdade de estado."""

    def __init__(self):
        self._status = {}

    def status(self, identity: str) -> str:
        return self._status.get(identity, "active")

    def set_standby(self, identity: str) -> None:
        self._status[identity] = "standby"

    def set_active(self, identity: str) -> None:
        self._status[identity] = "active"