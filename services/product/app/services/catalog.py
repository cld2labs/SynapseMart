import logging
import os
import requests
import pandas as pd
import shutil
from typing import List
from sqlalchemy.orm import Session
from ..models.product import Product

logger = logging.getLogger("product-service.catalog")
SEARCH_SERVICE_URL = os.getenv("SEARCH_SERVICE_URL", "http://search-service:8002")

def trigger_indexing(products_data: List[dict]):
    """Notify the Search Service to rebuild its index."""
    try:
        logger.info(f"Triggering search index for {len(products_data)} products at {SEARCH_SERVICE_URL}")
        # When running in Docker, search-service is the hostname
        response = requests.post(f"{SEARCH_SERVICE_URL}/internal/index", json=products_data, timeout=15)
        if response.status_code == 200:
            logger.info("Search indexing triggered successfully.")
        else:
            logger.error(f"Search Service indexing failed: {response.status_code}")
    except Exception as e:
        logger.error(f"Failed to connect to Search Service for indexing: {e}")

def process_csv_upload(file, db: Session):
    """Save products from CSV to DB, avoiding duplicates."""
    # Ensure upload directory exists
    upload_dir = "data/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    df = pd.read_csv(file_path)
    added_count = 0
    skipped_count = 0
    
    for _, row in df.iterrows():
        existing = db.query(Product).filter(
            Product.name == row.get('name', ''),
            Product.seller_name == row.get('seller_name', 'Unknown')
        ).first()
        
        if existing:
            skipped_count += 1
            continue

        product = Product(
            name=row.get('name', ''),
            description=row.get('description', ''),
            category=row.get('category', 'General'),
            price=float(row.get('price', 0)),
            currency=row.get('currency', 'USD'),
            stock_quantity=int(row.get('stock_quantity', 0)),
            seller_name=row.get('seller_name', 'Unknown'),
            image_url=row.get('image_url', None)
        )
        db.add(product)
        added_count += 1
        
    db.commit()
    return added_count, skipped_count
