import logging
import time

# Configure logging at the very beginning
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

import requests
from fastapi import FastAPI
from .api.routes import router
from .core.config import PRODUCT_SERVICE_URL
from .services.nlp_parser import nlp_parser
from .services.search_engine import search_engine

logger = logging.getLogger("search-service.startup")

app = FastAPI(title="SynapseMart Search Service")


def hydrate_index_from_product_service(retries: int = 5, delay_seconds: float = 2.0) -> None:
    for attempt in range(1, retries + 1):
        try:
            response = requests.get(f"{PRODUCT_SERVICE_URL}/products?skip=0&limit=10000", timeout=15)
            response.raise_for_status()
            products = response.json()

            if not isinstance(products, list):
                logger.warning("Startup hydration returned unexpected payload type: %s", type(products).__name__)
                return

            search_engine.build_index(products)
            categories = list({product.get("category", "") for product in products if product.get("category")})
            nlp_parser.set_categories(categories)
            logger.info("Hydrated search index with %s products on startup.", len(products))
            return
        except Exception as exc:
            logger.warning(
                "Search startup hydration attempt %s/%s failed: %s",
                attempt,
                retries,
                exc,
            )
            if attempt < retries:
                time.sleep(delay_seconds)

    logger.error("Search startup hydration failed after %s attempts; search index remains empty.", retries)


@app.on_event("startup")
def startup_event():
    hydrate_index_from_product_service()

# Include Routes
# We used /internal/index before, let's keep it consistent in the router or prefix it here.
app.include_router(router, prefix="/internal") # For indexing
app.include_router(router) # For public search

# Actually, let's just make it clear:
# One router for all, but maybe prefix it properly.
# The previous code had /internal/index and /search.
# Our routes.py defines /index and /search.

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8002)
