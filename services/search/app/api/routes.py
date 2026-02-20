import logging
import requests
import os
import traceback
from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from ..services.search_engine import search_engine
from ..services.nlp_parser import nlp_parser

router = APIRouter()
logger = logging.getLogger("search-service.api")

PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://product-service:8001")

@router.post("/index")
def build_index(products: List[Dict[str, Any]] = Body(...)):
    """Update searching indices."""
    try:
        logger.info(f"Indexing request for {len(products)} products")
        search_engine.build_index(products)
        
        categories = list(set(p.get('category', '') for p in products if p.get('category')))
        nlp_parser.set_categories(categories)
        
        return {"message": f"Indexed {len(products)} products"}
    except Exception as e:
        logger.error(f"Indexing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
def search(q: str, limit: int = 20):
    """Execute hybrid search."""
    try:
        # Lazy-load categories
        if not nlp_parser.categories:
            try:
                resp = requests.get(f"{PRODUCT_SERVICE_URL}/products/categories", timeout=5)
                if resp.status_code == 200:
                    nlp_parser.set_categories(resp.json())
            except Exception as e:
                logger.warning(f"Could not lazy-load categories: {e}")

        parsed_query = nlp_parser.parse_query(q)
        results = search_engine.search(parsed_query["query"], 
                                      category_hint=parsed_query["category"], 
                                      top_k=limit * 5)
        
        # Filter & Sort
        final_results = []
        min_p = parsed_query.get("min_price")
        max_p = parsed_query.get("max_price")
        
        for item in results:
            price = item.get("price", 0)
            if min_p is not None and price < min_p: continue
            if max_p is not None and price > max_p: continue
            final_results.append(item)
            
        if parsed_query.get("sort") == "price_asc":
            final_results.sort(key=lambda x: x['price'])
        elif parsed_query.get("sort") == "price_desc":
            final_results.sort(key=lambda x: x['price'], reverse=True)
            
        return {
            "query": q,
            "parsed_filters": parsed_query,
            "results": final_results[:limit]
        }
    except Exception as e:
        logger.error(f"Search failed: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Search engine internal error")
