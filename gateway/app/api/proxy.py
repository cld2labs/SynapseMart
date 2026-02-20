import logging
import httpx
from fastapi import APIRouter, Request, HTTPException
from ..core.config import PRODUCT_SERVICE_URL, SEARCH_SERVICE_URL

router = APIRouter()
logger = logging.getLogger("gateway.proxy")

# Global HTTP client initialized in main.py
client: httpx.AsyncClient = None

def set_client(c: httpx.AsyncClient):
    global client
    client = c

@router.get("/products")
async def list_products(request: Request):
    """Proxy to Product Service listing."""
    url = f"{PRODUCT_SERVICE_URL}/products?{request.query_params}"
    try:
        resp = await client.get(url)
        return resp.json()
    except Exception as e:
        logger.error(f"Product service error: {e}")
        raise HTTPException(status_code=503, detail="Product service unavailable")

@router.get("/categories")
async def get_categories():
    """Proxy to Product Service categories."""
    try:
        resp = await client.get(f"{PRODUCT_SERVICE_URL}/products/categories")
        return resp.json()
    except Exception as e:
        logger.error(f"Product service error: {e}")
        raise HTTPException(status_code=503, detail="Product service unavailable")

@router.post("/upload")
async def upload_proxy(request: Request):
    """Forward multipart CSV upload."""
    target_url = f"{PRODUCT_SERVICE_URL}/products/upload"
    try:
        headers = dict(request.headers)
        headers.pop("host", None)
        headers.pop("content-length", None)
        body = await request.body()
        resp = await client.post(target_url, content=body, headers=headers, timeout=60.0)
        return resp.json()
    except Exception as e:
        logger.error(f"Upload proxy error: {e}")
        raise HTTPException(status_code=503, detail="Upload service unavailable")

@router.get("/search")
async def search_proxy(request: Request):
    """Proxy to Search Service."""
    url = f"{SEARCH_SERVICE_URL}/search?{request.query_params}"
    try:
        resp = await client.get(url, timeout=15.0)
        return resp.json()
    except Exception as e:
        logger.error(f"Search service error: {e}")
        raise HTTPException(status_code=503, detail="Search service unavailable")

@router.delete("/products/clear")
async def clear_products():
    """Proxy to Product Service catalog wipe."""
    try:
        resp = await client.delete(f"{PRODUCT_SERVICE_URL}/products")
        return resp.json()
    except Exception as e:
        logger.error(f"Product service error: {e}")
        raise HTTPException(status_code=503, detail="Product service unavailable")
