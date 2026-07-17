import logging
from datetime import datetime
from supabase_client import supabase  # ajuste o import conforme seu projeto

logger = logging.getLogger(__name__)

class PersistenceMotor:
    observes = ["canonical_model", "tipo", "user_id"]

    def execute(self, center):
        canonical = center.read("canonical_model")
        tipo = center.read("tipo", "financeiro")
        user_id = center.read("user_id")

        if not canonical or not user_id:
            return
        if center.read("persistence.status") == "done":
            return

        table_map = {
            "financeiro": "movimentacoes",
            "rebanho": "animais",
            "pastagem": "pastagens",
            "engorda": "lotes_engorda",
        }
        table = table_map.get(tipo, "movimentacoes")

        inseridos = 0
        erros = 0
        for registro in canonical:
            try:
                payload = {"user_id": user_id, **registro, "criado_em": datetime.now().isoformat()}
                supabase.table(table).insert(payload).execute()
                inseridos += 1
            except Exception as e:
                logger.exception(f"Erro ao inserir em {table}: {e}")
                erros += 1

        center.publish("inseridos", inseridos, confidence=1.0, source="persistence")
        center.publish("erros", erros, confidence=1.0, source="persistence")
        center.publish("persistence.status", "done", confidence=1.0, source="persistence")
