import pandas as pd

class StatisticalMotor:
    observes = ["dados_brutos"]
    def execute(self, center):
        dados = center.read("dados_brutos")
        if not dados or not isinstance(dados, list):
            return
        df = pd.DataFrame(dados)
        stats = {}
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                stats[col] = {"mean": df[col].mean(), "std": df[col].std()}
        if center.read("statistics.profile") != stats:
            center.publish("statistics.profile", stats, confidence=0.95, source="statistical")
