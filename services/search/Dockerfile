FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --default-timeout=100 -r requirements.txt


COPY . .

RUN addgroup --system appgroup \
    && adduser --system --ingroup appgroup appuser \
    && mkdir -p /app/model_cache /app/logs \
    && chmod -R 775 /app \
    && chown -R appuser:appgroup /app

EXPOSE 8002

USER appuser

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
