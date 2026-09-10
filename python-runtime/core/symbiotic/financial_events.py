from __future__ import annotations

import copy
import hashlib
import json
from typing import Any, Dict

from .boot import SymbioticBoot
from .esr_triangular import ESRAutonomoTriangular


def _assinatura(valor: Any) -> str:
    try:
        bruto = json.dumps(
            valor,
            sort_keys=True,
            default=str,
            ensure_ascii=False,
        )
    except Exception:
        bruto = str(valor)

    return hashlib.sha256(bruto.encode("utf-8")).hexdigest()


def observar_evento_financeiro(
    user_id: str,
    evento: str,
    payload: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Observação ESR de eventos financeiros/comerciais.

    Não autoriza pagamento.
    Não altera assinatura.
    Não valida Mercado Pago.
    Não persiste dados comerciais.

    Apenas observa e registra o evento no ESR existente.
    """

    eixo = SymbioticBoot.from_request(str(user_id))
    eixo.boot()

    triangulo = ESRAutonomoTriangular(eixo)

    payload_seguro = copy.deepcopy(payload)
    payload_seguro["event"] = evento

    sequence = eixo.begin_operation(
        module="financeiro",
        operation=evento,
        payload=payload_seguro,
    )

    antes = _assinatura(payload_seguro)
    depois_payload = copy.deepcopy(payload_seguro)
    depois = _assinatura(depois_payload)

    eixo.observe_motor(
        sequence=sequence,
        module="financeiro",
        before=antes,
        after=depois,
        changed=antes != depois,
        error=None,
    )

    espelho = triangulo.espelhar(
        estado_antes=payload_seguro,
        estado_depois=depois_payload,
    )

    convergencia = eixo.finalize_operation(
        sequence=sequence,
        final_signature=depois,
        validation_score=1.0,
    )

    return {
        "ok": True,
        "event": evento,
        "module": "financeiro",
        "sequence": sequence,
        "esr": convergencia,
        "espelho": espelho,
    }
