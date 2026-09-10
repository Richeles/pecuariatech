import os

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from core.symbiotic.financial_events import observar_evento_financeiro


router = APIRouter(
    prefix="/api/esr",
    tags=["esr"],
)


class EventoFinanceiroRequest(BaseModel):
    user_id: str = Field(min_length=1)
    evento: str = Field(min_length=1)
    payload: dict = Field(default_factory=dict)


@router.post("/evento-financeiro")
async def evento_financeiro(
    body: EventoFinanceiroRequest,
    x_esr_internal_token: str | None = Header(default=None),
):
    expected_token = os.getenv("ESR_INTERNAL_TOKEN")

    if not expected_token:
        raise HTTPException(
            status_code=503,
            detail="ESR_INTERNAL_TOKEN nao configurado",
        )

    if x_esr_internal_token != expected_token:
        raise HTTPException(
            status_code=401,
            detail="ESR token invalido",
        )

    return observar_evento_financeiro(
        user_id=body.user_id,
        evento=body.evento,
        payload=body.payload,
    )
