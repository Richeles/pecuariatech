import copy
import json
from typing import Any, Callable, Dict

from .esr_autonomo import ESRAutonomo


class ESRAutonomoTriangular:
    """
    Triangulo Simbiotico Espelhado.

    Camada complementar ao ESRAutonomo.

    Nao substitui:
        - SymbioticAxis
        - ESRAutonomo
        - OmegaRuntime
        - OmegaKernel

    Vertices:
        ANTECIPAR
        OBSERVAR
        ADAPTAR

    Centro:
        CONVERGENCIA

    Espelho:
        estado antes <-> estado depois

    Semantica:
        mudou = houve transformacao
        divergente = houve transformacao
        inconsistente = incompatibilidade estrutural real
    """

    def __init__(self, esr_base):
        self.esr = esr_base
        self.autonomo = ESRAutonomo(esr_base)

        self.estado_triangular: Dict[str, Any] = {
            "antecipacao": None,
            "observacao": None,
            "adaptacao": None,
            "convergencia": None,
        }

        self.espelho: Dict[str, Any] = {
            "antes": None,
            "depois": None,
            "mudou": False,
            "divergente": False,
            "inconsistente": False,
        }

    # =========================================================
    # SERIALIZACAO SEGURA
    # =========================================================

    @staticmethod
    def _assinatura(valor: Any) -> str:
        if isinstance(valor, str):
            return valor

        try:
            return json.dumps(
                valor,
                sort_keys=True,
                default=str,
                ensure_ascii=False,
            )
        except Exception:
            return str(valor)

    # =========================================================
    # CLASSIFICACAO ESTRUTURAL
    # =========================================================

    @staticmethod
    def _classe_estrutural(valor: Any) -> str:
        if isinstance(valor, dict):
            return "mapping"

        if isinstance(valor, (list, tuple, set)):
            return "sequence"

        if valor is None:
            return "null"

        if isinstance(valor, (str, int, float, bool)):
            return "scalar"

        return "object"

    @classmethod
    def _estruturalmente_compativel(
        cls,
        antes: Any,
        depois: Any,
    ) -> bool:
        return (
            cls._classe_estrutural(antes)
            == cls._classe_estrutural(depois)
        )

    # =========================================================
    # VERTICE 1 — ANTECIPAR
    # =========================================================

    def antecipar(
        self,
        module: str,
        operation: str,
        payload: Dict[str, Any],
    ) -> Dict[str, Any]:

        payload_seguro = copy.deepcopy(payload)

        chave = (
            str(getattr(self.esr, "identity", "default")),
            module,
        )

        memoria_existente = (
            chave in self.autonomo.memoria_cognitiva
        )

        contexto = {
            "module": module,
            "operation": operation,
            "payload": copy.deepcopy(payload_seguro),
            "memoria_existente": memoria_existente,
        }

        self.estado_triangular["antecipacao"] = copy.deepcopy(
            contexto
        )

        return contexto

    # =========================================================
    # VERTICE 2 — OBSERVAR
    # =========================================================

    def observar(
        self,
        resultado: Any,
        tentativa: int,
        recuperado: bool,
    ) -> Dict[str, Any]:

        observacao = {
            "tentativa": tentativa,
            "recuperado": recuperado,
            "sucesso": True,
            "resultado": copy.deepcopy(resultado),
        }

        self.estado_triangular["observacao"] = copy.deepcopy(
            observacao
        )

        return observacao

    # =========================================================
    # VERTICE 3 — ADAPTAR
    # =========================================================

    def adaptar(
        self,
        payload: Dict[str, Any],
        tentativa: int,
        recuperado: bool,
    ) -> Dict[str, Any]:

        payload_adaptado = copy.deepcopy(payload)

        if recuperado:
            payload_adaptado["esr_triangular_modo"] = "adaptado"
            payload_adaptado["esr_triangular_tentativa"] = tentativa
        else:
            payload_adaptado["esr_triangular_modo"] = "direto"
            payload_adaptado["esr_triangular_tentativa"] = tentativa

        adaptacao = {
            "aplicada": recuperado,
            "tentativa": tentativa,
            "payload": payload_adaptado,
        }

        self.estado_triangular["adaptacao"] = copy.deepcopy(
            adaptacao
        )

        return adaptacao

    # =========================================================
    # ESPELHO — SEMANTICA CORRIGIDA
    # =========================================================

    def espelhar(
        self,
        estado_antes: Any,
        estado_depois: Any,
    ) -> Dict[str, Any]:

        assinatura_antes = self._assinatura(estado_antes)
        assinatura_depois = self._assinatura(estado_depois)

        mudou = assinatura_antes != assinatura_depois

        # Uma transformacao normal nao e, por si so,
        # uma inconsistencia.
        divergente = mudou

        estruturalmente_compativel = (
            self._estruturalmente_compativel(
                estado_antes,
                estado_depois,
            )
        )

        inconsistente = not estruturalmente_compativel

        resultado = {
            "antes": assinatura_antes,
            "depois": assinatura_depois,
            "mudou": mudou,
            "divergente": divergente,
            "estruturalmente_compativel": (
                estruturalmente_compativel
            ),
            "inconsistente": inconsistente,
        }

        self.espelho = copy.deepcopy(resultado)

        return resultado

    # =========================================================
    # CENTRO — CONVERGENCIA
    # =========================================================

    def convergir(
        self,
        resultado_esr: Dict[str, Any],
    ) -> Dict[str, Any]:

        esr = resultado_esr.get("esr", {})

        convergencia = {
            "convergido": bool(
                esr.get("converged", False)
            ),
            "sequence": esr.get("sequence"),
            "angular_mark": esr.get("angular_mark"),
            "standby": esr.get("standby"),
            "espelho_consistente": not self.espelho.get(
                "inconsistente",
                False,
            ),
            "espelho_mudou": bool(
                self.espelho.get("mudou", False)
            ),
        }

        self.estado_triangular["convergencia"] = copy.deepcopy(
            convergencia
        )

        return convergencia

    # =========================================================
    # EXECUCAO TRIANGULAR ESPELHADA
    # =========================================================

    def executar(
        self,
        funcao_motor: Callable[[Dict[str, Any]], Any],
        module: str,
        operation: str,
        payload: Dict[str, Any],
        max_tentativas: int = 3,
    ) -> Dict[str, Any]:

        payload_original = copy.deepcopy(payload)

        estado_antes = copy.deepcopy(payload_original)

        # -----------------------------------------------------
        # ANTECIPAR
        # -----------------------------------------------------

        antecipacao = self.antecipar(
            module=module,
            operation=operation,
            payload=payload_original,
        )

        # -----------------------------------------------------
        # EXECUCAO DO ESRAUTONOMO
        # -----------------------------------------------------

        resultado = self.autonomo.executar_com_resiliencia(
            funcao_motor=funcao_motor,
            module=module,
            operation=operation,
            payload=payload_original,
            max_tentativas=max_tentativas,
        )

        # -----------------------------------------------------
        # OBSERVAR
        # -----------------------------------------------------

        observacao = self.observar(
            resultado=resultado.get("resultado"),
            tentativa=resultado.get("tentativa", 0),
            recuperado=resultado.get("recuperado", False),
        )

        # -----------------------------------------------------
        # ADAPTAR
        # -----------------------------------------------------

        adaptacao = self.adaptar(
            payload=payload_original,
            tentativa=resultado.get("tentativa", 0),
            recuperado=resultado.get("recuperado", False),
        )

        # -----------------------------------------------------
        # ESPELHO
        # -----------------------------------------------------

        estado_depois = copy.deepcopy(
            resultado.get("resultado")
        )

        espelho = self.espelhar(
            estado_antes=estado_antes,
            estado_depois=estado_depois,
        )

        # -----------------------------------------------------
        # CONVERGENCIA
        # -----------------------------------------------------

        convergencia = self.convergir(resultado)

        # -----------------------------------------------------
        # INTEGRIDADE DO PAYLOAD ORIGINAL
        # -----------------------------------------------------

        if payload != payload_original:
            raise RuntimeError(
                "Integridade violada: payload original alterado."
            )

        return {
            "triangulo": {
                "antecipar": antecipacao,
                "observar": observacao,
                "adaptar": adaptacao,
                "espelho": espelho,
                "convergencia": convergencia,
            },
            "resultado": resultado,
        }