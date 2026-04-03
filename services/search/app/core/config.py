import os


def get_bool_env(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://product-service:8001")

QUERY_PARSER_LLM_ENABLED = get_bool_env("QUERY_PARSER_LLM_ENABLED", False)
QUERY_PARSER_LLM_MODEL = os.getenv(
    "QUERY_PARSER_LLM_MODEL",
    os.getenv("LLM_ENRICHMENT_MODEL", os.getenv("MODEL", os.getenv("OPENAI_MODEL", "gpt-4o-mini"))),
)
QUERY_PARSER_LLM_BASE_URL = (
    os.getenv("QUERY_PARSER_LLM_BASE_URL", "").strip()
    or os.getenv("LLM_ENRICHMENT_BASE_URL", "").strip()
    or os.getenv("BASE_URL", "").strip()
    or os.getenv("OPENAI_BASE_URL", "").strip()
    or None
)
QUERY_PARSER_LLM_API_KEY = (
    os.getenv("QUERY_PARSER_LLM_API_KEY", "").strip()
    or os.getenv("LLM_ENRICHMENT_API_KEY", "").strip()
    or os.getenv("API_KEY", "").strip()
    or os.getenv("OPENAI_API_KEY", "").strip()
)
QUERY_PARSER_LLM_TIMEOUT = float(os.getenv("QUERY_PARSER_LLM_TIMEOUT", "15"))
