import logging

# Configure logging at the very beginning
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from fastapi import FastAPI
from .core.database import engine, Base, ensure_schema
from .api.routes import router

# Initialize Database
Base.metadata.create_all(bind=engine)
ensure_schema()

app = FastAPI(title="SynapseMart Product Service")

# Include Routes
app.include_router(router, prefix="/products", tags=["products"])

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8001)
