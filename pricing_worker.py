import time
import requests
from datetime import datetime

# 🔥 ALTERE AQUI CONFORME AMBIENTE
API_URL = "http://localhost:3333/api/cron/pricing"
# API_URL = "https://www.pecuariatech.com/api/cron/pricing"

INTERVAL = 10  # 🔥 10 segundos

def executar():
    try:
        r = requests.get(API_URL, timeout=5)

        if r.status_code == 200:
            print(f"[{datetime.now()}] ✅ OK:", r.json())
        else:
            print(f"[{datetime.now()}] ⚠️ ERRO HTTP:", r.status_code)

    except Exception as e:
        print(f"[{datetime.now()}] ❌ ERRO CONEXÃO:", e)


if __name__ == "__main__":
    print("🚀 IA PRICING ATIVA (loop 10s)")

    while True:
        executar()
        time.sleep(INTERVAL)