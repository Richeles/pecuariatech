import logging
from datetime import datetime
from supabase_client import supabase

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
        BATCH_SIZE = 100

        # Insere em lotes para evitar timeout
        for i in range(0, len(canonical), BATCH_SIZE):
            batch = canonical[i:i + BATCH_SIZE]
            payload = []
            for registro in batch:
                payload.append({
                    "user_id": user_id,
                    **registro,
                    "criado_em": datetime.now().isoformat()
                })
            try:
                supabase.table(table).insert(payload).execute()
                inseridos += len(batch)
            except Exception as e:
                logger.exception(f"Erro no lote {i}: {e}")
                # Fallback: tenta inserir um a um no lote problemático
                for registro in batch:
                    try:
                        supabase.table(table).insert({
                            "user_id": user_id,
                            **registro,
                            "criado_em": datetime.now().isoformat()
                        }).execute()
                        inseridos += 1
                    except Exception as e2:
                        logger.exception(f"Falha individual: {e2}")
                        erros += 1

        center.publish("inseridos", inseridos, confidence=1.0, source="persistence")
        center.publish("erros", erros, confidence=1.0, source="persistence")
        center.publish("persistence.status", "done", confidence=1.0, source="persistence")