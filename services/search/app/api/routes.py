import logging
import requests
import traceback
from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from ..core.config import PRODUCT_SERVICE_URL
from ..services.search_engine import search_engine
from ..services.nlp_parser import nlp_parser

router = APIRouter()
logger = logging.getLogger("search-service.api")

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

@router.post("/upsert")
def upsert_index(products: List[Dict[str, Any]] = Body(...)):
    """Upsert changed products into the in-memory search indices."""
    try:
        logger.info(f"Upsert request for {len(products)} products")
        search_engine.upsert_products(products)

        all_categories = list({
            product.get('category', '')
            for product in search_engine.products
            if product.get('category')
        })
        nlp_parser.set_categories(all_categories)

        return {"message": f"Upserted {len(products)} products"}
    except Exception as e:
        logger.error(f"Partial indexing failed: {e}")
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
        query_terms = [str(term).lower() for term in parsed_query.get("terms", []) if str(term).strip()]
        operator = str(parsed_query.get("operator") or "OR").upper()
        
        for item in results:
            price = item.get("price", 0)
            if min_p is not None and price < min_p: continue
            if max_p is not None and price > max_p: continue
            haystack = " ".join(
                str(item.get(field, "") or "").lower()
                for field in ("name", "description", "short_description", "category", "search_text")
            )
            matched_term_count = sum(1 for term in query_terms if term and term in haystack)
            if query_terms and operator == "AND" and matched_term_count < len(query_terms):
                continue
            if len(query_terms) > 1 and operator == "OR" and matched_term_count == 0:
                continue
            if len(query_terms) > 1 and matched_term_count == 0 and item.get("score", 0) < 0.02:
                continue
            item["matched_terms"] = matched_term_count
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
