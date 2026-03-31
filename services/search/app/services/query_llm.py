import json
import logging
from typing import Any, Dict, List

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None

from ..core.config import (
    QUERY_PARSER_LLM_API_KEY,
    QUERY_PARSER_LLM_BASE_URL,
    QUERY_PARSER_LLM_ENABLED,
    QUERY_PARSER_LLM_MODEL,
    QUERY_PARSER_LLM_TIMEOUT,
)

logger = logging.getLogger("search-service.query-llm")


def build_query_parser_prompt(query: str, categories: List[str]) -> str:
    return (
        "Parse this ecommerce search query into structured JSON. "
        "Return JSON only with keys: query, terms, operator, category, min_price, max_price, sort, intent, search_type. "
        "Use operator OR for requests like 'phone and laptop' when the user wants either kind of item in the result set. "
        "Use operator AND only when the same product must satisfy multiple attributes. "
        "terms must be a list of important search nouns or phrases. "
        "sort must be one of null, price_asc, price_desc. "
        "intent must be one of search, multi_product_search, browse. "
        "search_type should be hybrid.\n\n"
        f"Available categories: {json.dumps(categories, ensure_ascii=True)}\n"
        f"Query: {json.dumps(query, ensure_ascii=True)}"
    )


class QueryLLMParser:
    def __init__(self):
        self.enabled = QUERY_PARSER_LLM_ENABLED
        self.client = None

        if OpenAI is None:
            logger.warning("OpenAI SDK not installed; query LLM parser disabled.")
            return

        api_key = QUERY_PARSER_LLM_API_KEY or "not-needed-for-local-openai-compatible-servers"
        self.client = OpenAI(
            api_key=api_key,
            base_url=QUERY_PARSER_LLM_BASE_URL,
            timeout=QUERY_PARSER_LLM_TIMEOUT,
        )

    def parse(self, query: str, categories: List[str]) -> Dict[str, Any] | None:
        if not self.enabled or self.client is None:
            return None

        messages = [
            {
                "role": "system",
                "content": (
                    "You are an ecommerce query parser. "
                    "Return strict JSON only. "
                    "Do not answer conversationally."
                ),
            },
            {
                "role": "user",
                "content": build_query_parser_prompt(query, categories),
            },
        ]

        last_error = None
        for use_structured_output in (True, False):
            try:
                request_args = {
                    "model": QUERY_PARSER_LLM_MODEL,
                    "temperature": 0,
                    "messages": messages,
                }
                if use_structured_output:
                    request_args["response_format"] = {"type": "json_object"}

                response = self.client.chat.completions.create(**request_args)
                content = response.choices[0].message.content or "{}"
                return json.loads(content)
            except Exception as exc:
                last_error = exc
                if use_structured_output:
                    logger.info("Structured query output unsupported; retrying plain chat completion.")
                    continue
                logger.warning("LLM query parsing failed: %s", exc)
                return None

        if last_error is not None:
            logger.warning("LLM query parsing failed: %s", last_error)
        return None


query_llm_parser = QueryLLMParser()
