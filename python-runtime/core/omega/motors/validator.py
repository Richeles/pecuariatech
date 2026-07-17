class ValidatorMotor:
    observes = ["canonical_model"]

    def execute(self, center):
        canonical = center.read("canonical_model")
        if not canonical:
            if center.read("validation.score") != 0.0:
                center.publish("validation.score", 0.0, confidence=1.0, source="validator")
            return

        errors = []
        for idx, rec in enumerate(canonical):
            # Identificador pode ser 'descricao', 'piquete', 'brinco' ou 'lote'
            identificador = rec.get("descricao") or rec.get("piquete") or rec.get("brinco") or rec.get("lote")
            if not identificador:
                errors.append(f"Linha {idx+1}: identificador ausente")
                continue
            # Valor principal (pode ser 'valor', 'area_ha', 'peso_entrada', etc.)
            valor_principal = rec.get("valor") or rec.get("area_ha") or rec.get("peso_entrada") or rec.get("peso_inicial")
            if valor_principal is not None and valor_principal <= 0:
                errors.append(f"Linha {idx+1}: valor inválido ({valor_principal})")
                continue

        score = 1.0 - len(errors) / max(len(canonical), 1)

        old_score = center.read("validation.score")
        if old_score != score:
            center.publish("validation.score", score, confidence=0.95, source="validator")

        old_errors = center.read("validation.errors")
        if old_errors != errors:
            center.publish("validation.errors", errors, confidence=1.0, source="validator")
