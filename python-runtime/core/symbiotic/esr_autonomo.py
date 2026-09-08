import copy
import json
from typing import Any, Callable, Dict


class ESRAutonomo:
    """
    Orquestrador de resiliencia do ESR.

    Camada aditiva sobre um SymbioticAxis existente.
    Nao substitui:
        - begin_operation()
        - observe_motor()
        - finalize_operation()

    Triangulo Espelhado:
        ANTECIPAR -> OBSERVAR -> ADAPTAR -> CONVERGIR
    """

    def __init__(self, esr_base):
        self.esr = esr_base

        # Memoria local do orquestrador.
        # A chave inclui identidade para evitar mistura entre usuarios.
        self.memoria_cognitiva: Dict[
            tuple[str, str],
            Dict[str, Any],
        ] = {}

    def _chave_memoria(self, module: str) -> tuple[str, str]:
        identidade = str(
            getattr(self.esr, "identity", "default")
        )

        return identidade, module

    def _carregar_memoria(
        self,
        module: str,
        payload: Dict[str, Any],
    ) -> Dict[str, Any]:

        payload_atual = copy.deepcopy(payload)

        memoria = self.memoria_cognitiva.get(
            self._chave_memoria(module)
        )

        if memoria:
            payload_atual.update(
                copy.deepcopy(memoria)
            )

        return payload_atual

    def _registrar_memoria(
        self,
        module: str,
        dados: Dict[str, Any],
    ) -> None:

        self.memoria_cognitiva[
            self._chave_memoria(module)
        ] = copy.deepcopy(dados)

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

    def executar_com_resiliencia(
        self,
        funcao_motor: Callable[[Dict[str, Any]], Any],
        module: str,
        operation: str,
        payload: Dict[str, Any],
        max_tentativas: int = 3,
    ) -> Any:

        if max_tentativas < 1:
            raise ValueError(
                "max_tentativas deve ser >= 1"
            )

        # =====================================================
        # TRIANGULO ESPELHADO — ANTECIPACAO
        # =====================================================

        payload_original = copy.deepcopy(payload)

        payload_atual = self._carregar_memoria(
            module,
            payload_original,
        )

        # Uma unica sequencia para toda a operacao.
        sequence_id = self.esr.begin_operation(
            module=module,
            operation=operation,
            payload=copy.deepcopy(payload_atual),
        )

        ultimo_erro = None

        # =====================================================
        # OBSERVACAO + ADAPTACAO
        # =====================================================

        for tentativa in range(1, max_tentativas + 1):

            estado_anterior = self._assinatura(
                payload_atual
            )

            try:
                resultado = funcao_motor(
                    payload_atual
                )

                estado_posterior = self._assinatura(
                    resultado
                )

                # Registra sucesso no Axis existente.
                self.esr.observe_motor(
                    sequence=sequence_id,
                    module=module,
                    before=estado_anterior,
                    after=estado_posterior,
                    changed=True,
                    error=None,
                )

                # =================================================
                # CONVERGENCIA
                # =================================================

                final_signature = (
                    "sucesso_adaptado"
                    if tentativa > 1
                    else "sucesso_direto"
                )

                final_result = self.esr.finalize_operation(
                    sequence_id,
                    final_signature,
                    validation_score=1.0,
                )

                # Aprende somente depois do sucesso.
                if tentativa > 1:
                    self._registrar_memoria(
                        module,
                        {
                            "ultimo_modo": "adaptado",
                            "tentativa_sucesso": tentativa,
                        },
                    )

                # O payload original nunca e alterado.
                if payload != payload_original:
                    raise RuntimeError(
                        "Integridade violada: "
                        "payload original foi alterado."
                    )

                return {
                    "resultado": resultado,
                    "esr": final_result,
                    "tentativa": tentativa,
                    "recuperado": tentativa > 1,
                }

            except Exception as erro:

                ultimo_erro = erro

                # Registra a falha no Axis existente.
                self.esr.observe_motor(
                    sequence=sequence_id,
                    module=module,
                    before=estado_anterior,
                    after="falha",
                    changed=False,
                    error=erro,
                )

                # =================================================
                # AUTOCURA SEGURA
                # =================================================
                #
                # Nao desativa validacao.
                # Nao usa bypass.
                # Nao altera o payload original.
                #
                payload_atual = copy.deepcopy(
                    payload_atual
                )

                payload_atual["esr_modo_seguro"] = True
                payload_atual["esr_tentativa"] = tentativa

        # =====================================================
        # FALHA CRITICA
        # =====================================================

        self.esr.finalize_operation(
            sequence_id,
            "colapso_operacional",
            validation_score=0.0,
        )

        raise RuntimeError(
            "Eixo Simbiotico: limite de autocura atingido "
            f"({max_tentativas} tentativas)."
        ) from ultimo_erro
