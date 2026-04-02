import os


def get_bool_env(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


SEARCH_SERVICE_URL = os.getenv("SEARCH_SERVICE_URL", "http://search-service:8002")

LLM_ENRICHMENT_ENABLED = get_bool_env("LLM_ENRICHMENT_ENABLED", False)
LLM_ENRICHMENT_MODEL = os.getenv(
    "LLM_ENRICHMENT_MODEL",
    os.getenv("MODEL", os.getenv("OPENAI_MODEL", "gpt-4o-mini")),
)
LLM_ENRICHMENT_BASE_URL = (
    os.getenv("LLM_ENRICHMENT_BASE_URL", "").strip()
    or os.getenv("BASE_URL", "").strip()
    or os.getenv("OPENAI_BASE_URL", "").strip()
    or None
)
LLM_ENRICHMENT_API_KEY = (
    os.getenv("LLM_ENRICHMENT_API_KEY", "").strip()
    or os.getenv("API_KEY", "").strip()
    or os.getenv("OPENAI_API_KEY", "").strip()
)
LLM_ENRICHMENT_TIMEOUT = float(os.getenv("LLM_ENRICHMENT_TIMEOUT", "20"))
LLM_ENRICHMENT_BATCH_SIZE = max(1, int(os.getenv("LLM_ENRICHMENT_BATCH_SIZE", "8")))
LLM_ENRICHMENT_MAX_BATCH_CHARS = max(500, int(os.getenv("LLM_ENRICHMENT_MAX_BATCH_CHARS", "6000")))
BACKGROUND_ENRICHMENT_JOB_SIZE = max(1, int(os.getenv("BACKGROUND_ENRICHMENT_JOB_SIZE", "4")))
