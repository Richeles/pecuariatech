FROM python:3.11-slim

WORKDIR /app

# Copiar o requirements.txt do subdiretório python-runtime
COPY python-runtime/requirements.txt .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo o código do python-runtime
COPY python-runtime/ .

# Expor a porta que o Render usa
EXPOSE 10000

# Comando para iniciar o servidor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]