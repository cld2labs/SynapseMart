import json
import logging
from typing import Dict, List

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover - exercised in local envs without service deps
    OpenAI = None

from ..core.config import (
    LLM_ENRICHMENT_API_KEY,
    LLM_ENRICHMENT_BATCH_SIZE,
    LLM_ENRICHMENT_BASE_URL,
    LLM_ENRICHMENT_ENABLED,
    LLM_ENRICHMENT_MAX_BATCH_CHARS,
    LLM_ENRICHMENT_MODEL,
    LLM_ENRICHMENT_TIMEOUT,
)

logger = logging.getLogger("product-service.llm-enrichment")


def build_enrichment_prompt(product: Dict[str, object]) -> str:
    return (
        "Create a concise ecommerce short description using only the provided fields. "
        "Do not invent specifications, features, brands, materials, dimensions, ratings, or claims. "
        "If a field is missing, omit it naturally. Return valid JSON with one key: short_description.\n\n"
        f"Product data:\n{json.dumps(product, ensure_ascii=True)}"
    )


def build_batch_enrichment_prompt(products: List[Dict[str, object]]) -> str:
    return (
        "Create concise ecommerce short descriptions using only the provided fields. "
        "Do not invent specifications, features, brands, materials, dimensions, ratings, or claims. "
        "If a field is missing, omit it naturally. Return valid JSON with one key: items. "
        "items must be an array matching the input order, and each element must be an object with one key: short_description.\n\n"
        f"Products data:\n{json.dumps(products, ensure_ascii=True)}"
    )


class ProductLLMEnricher:
    def __init__(self):
        self.enabled = LLM_ENRICHMENT_ENABLED
        self.client = None
        self.batch_size = LLM_ENRICHMENT_BATCH_SIZE
        self.max_batch_chars = LLM_ENRICHMENT_MAX_BATCH_CHARS

        if OpenAI is None:
            logger.warning("OpenAI SDK not installed; LLM enrichment disabled.")
            return

        api_key = LLM_ENRICHMENT_API_KEY or "not-needed-for-local-openai-compatible-servers"
        self.client = OpenAI(
            api_key=api_key,
            base_url=LLM_ENRICHMENT_BASE_URL,
            timeout=LLM_ENRICHMENT_TIMEOUT,
        )

    def _call_chat_completion(self, messages: List[Dict[str, str]]) -> Dict[str, object]:
        last_error = None
        for use_structured_output in (True, False):
            try:
                request_args = {
                    "model": LLM_ENRICHMENT_MODEL,
                    "temperature": 0.2,
                    "messages": messages,
                }
                if use_structured_output:
                    request_args["response_format"] = {"type": "json_object"}

                response = self.client.chat.completions.create(**request_args)
                content = response.choices[0].message.content or ""
                try:
                    return json.loads(content or "{}")
                except json.JSONDecodeError:
                    return {"raw_content": content.strip()}
            except Exception as exc:
                last_error = exc
                if use_structured_output:
                    logger.info("Structured output unsupported; retrying plain chat completion.")
                    continue
                raise

        if last_error is not None:
            raise last_error
        return {}

    def _normalize_batch_result(self, data: Dict[str, object], expected_count: int) -> List[str | None]:
        items = data.get("items")
        if not isinstance(items, list) or len(items) != expected_count:
            raise ValueError(f"Invalid batch enrichment result size: expected {expected_count}, got {len(items) if isinstance(items, list) else 'non-list'}")

        results: List[str | None] = []
        for item in items:
            if isinstance(item, dict):
                short_description = str(item.get("short_description", "")).strip()
            else:
                short_description = ""
            results.append(short_description or None)
        return results

    def _enrich_batch_once(self, products: List[Dict[str, object]]) -> List[str | None]:
        messages = [
            {
                "role": "system",
                "content": (
                    "You rewrite product catalog rows into short, searchable descriptions. "
                    "Stay factual and only use details present in the input. "
                    "Return JSON only."
                ),
            },
            {
                "role": "user",
                "content": build_batch_enrichment_prompt(products),
            },
        ]

        data = self._call_chat_completion(messages)
        if "raw_content" in data:
            return [str(data["raw_content"]).strip() or None]
        return self._normalize_batch_result(data, len(products))

    def _split_batches(self, products: List[Dict[str, object]]) -> List[List[Dict[str, object]]]:
        batches: List[List[Dict[str, object]]] = []
        current_batch: List[Dict[str, object]] = []
        current_chars = 0

        for product in products:
            serialized = json.dumps(product, ensure_ascii=True)
            item_chars = len(serialized)

            if item_chars > self.max_batch_chars:
                if current_batch:
                    batches.append(current_batch)
                    current_batch = []
                    current_chars = 0
                batches.append([product])
                continue

            next_size = len(current_batch) + 1
            next_chars = current_chars + item_chars
            if current_batch and (next_size > self.batch_size or next_chars > self.max_batch_chars):
                batches.append(current_batch)
                current_batch = [product]
                current_chars = item_chars
            else:
                current_batch.append(product)
                current_chars = next_chars

        if current_batch:
            batches.append(current_batch)
        return batches

    def enrich_many(self, products: List[Dict[str, object]]) -> List[str | None]:
        if not self.enabled or self.client is None:
            return [None] * len(products)
        if not products:
            return []

        results: List[str | None] = []
        for batch in self._split_batches(products):
            try:
                batch_results = self._enrich_batch_once(batch)
                if len(batch_results) != len(batch):
                    raise ValueError("Batch result length mismatch")
            except Exception as exc:
                logger.warning(
                    "Batch enrichment failed for %s products; retrying smaller batches: %s",
                    len(batch),
                    exc,
                )
                if len(batch) == 1:
                    batch_results = [None]
                else:
                    midpoint = len(batch) // 2
                    batch_results = self.enrich_many(batch[:midpoint]) + self.enrich_many(batch[midpoint:])
            results.extend(batch_results)

        return results

    def enrich(self, product: Dict[str, object]) -> str | None:
        return self.enrich_many([product])[0]


llm_enricher = ProductLLMEnricher()
