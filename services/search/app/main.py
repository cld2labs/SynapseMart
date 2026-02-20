import logging

# Configure logging at the very beginning
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from fastapi import FastAPI
from .api.routes import router

app = FastAPI(title="SynapseMart Search Service")

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
