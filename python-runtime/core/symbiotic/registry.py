from typing import Set

from .contracts import ModuleName


class ModuleRegistry:
    """Registro de módulos; não substitui o scheduler do Ω."""

    def __init__(self):
        self._modules: Set[ModuleName] = set()

    def register(self, name: ModuleName) -> None:
        self._modules.add(name)

    def list(self) -> Set[ModuleName]:
        return set(self._modules)

    def is_registered(self, name: ModuleName) -> bool:
        return name in self._modules