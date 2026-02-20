import logging

# Configure logging at the very beginning
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.proxy import router as proxy_router, set_client
from .core.config import PRODUCT_SERVICE_URL, SEARCH_SERVICE_URL
logger = logging.getLogger("gateway")

app = FastAPI(title="SynapseMart API Gateway")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info(f"Gateway starting... Product:{PRODUCT_SERVICE_URL} Search:{SEARCH_SERVICE_URL}")
    # Initialize client here to ensure it's in the correct event loop
    global client
    client = httpx.AsyncClient(follow_redirects=True)
    set_client(client)

@app.on_event("shutdown")
async def shutdown_event():
    await client.aclose()
    logger.info("Gateway shutting down.")

@app.get("/health")
async def health():
    return {"status": "gateway_healthy"}

# Include Proxy Routes
app.include_router(proxy_router, prefix="/api", tags=["gateway"])

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
