import logging
import os
import requests
import pandas as pd
import shutil
from typing import Dict, List
from sqlalchemy.orm import Session
from ..models.product import Product
from ..core.config import BACKGROUND_ENRICHMENT_JOB_SIZE, LLM_ENRICHMENT_ENABLED, SEARCH_SERVICE_URL
from ..core.database import SessionLocal
from .enrichment import build_search_text, build_short_description
from .llm_enrichment import llm_enricher
from .jobs import upload_job_store

logger = logging.getLogger("product-service.catalog")

def clean_text(value, default: str = "") -> str:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return default
    text = str(value).strip()
    return text if text else default

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


def trigger_partial_indexing(products_data: List[dict]):
    """Upsert only changed products into the Search Service indices."""
    try:
        logger.info(f"Triggering partial search index for {len(products_data)} products at {SEARCH_SERVICE_URL}")
        response = requests.post(f"{SEARCH_SERVICE_URL}/internal/upsert", json=products_data, timeout=15)
        if response.status_code == 200:
            logger.info("Partial search indexing triggered successfully.")
        else:
            logger.error(f"Search Service partial indexing failed: {response.status_code}")
    except Exception as e:
        logger.error(f"Failed to connect to Search Service for partial indexing: {e}")

def serialize_product(product: Product) -> Dict[str, object]:
    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "short_description": product.short_description,
        "search_text": product.search_text,
        "category": product.category,
        "price": product.price,
        "currency": product.currency,
        "stock_quantity": product.stock_quantity,
        "seller_name": product.seller_name,
        "image_url": product.image_url,
    }


def load_all_products_data(db: Session) -> List[Dict[str, object]]:
    return [serialize_product(product) for product in db.query(Product).all()]


def chunked(items: List[int], size: int) -> List[List[int]]:
    return [items[index:index + size] for index in range(0, len(items), size)]


def process_csv_upload(file, db: Session):
    """Save products from CSV with immediate fallback text for fast indexing."""
    # Ensure upload directory exists
    upload_dir = "data/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    df = pd.read_csv(file_path)
    added_count = 0
    skipped_count = 0
    added_product_ids: List[int] = []

    for _, row in df.iterrows():
        name = clean_text(row.get('name', ''))
        description = clean_text(row.get('description', ''))
        category = clean_text(row.get('category', 'General'), 'General')
        currency = clean_text(row.get('currency', 'USD'), 'USD')
        seller_name = clean_text(row.get('seller_name', 'Unknown'), 'Unknown')
        image_url = clean_text(row.get('image_url', ''), '') or None

        try:
            price = float(row.get('price', 0) or 0)
        except (TypeError, ValueError):
            price = 0.0

        try:
            stock_quantity = int(float(row.get('stock_quantity', 0) or 0))
        except (TypeError, ValueError):
            stock_quantity = 0

        existing = db.query(Product).filter(
            Product.name == name,
            Product.seller_name == seller_name
        ).first()
        
        if existing:
            skipped_count += 1
            continue

        short_description = build_short_description(
            name=name,
            description=description,
            category=category,
            price=price,
            currency=currency,
            stock_quantity=stock_quantity,
            seller_name=seller_name,
        )
        search_text = build_search_text(
            name=name,
            description=description,
            short_description=short_description,
            category=category,
            seller_name=seller_name,
            price=price,
            currency=currency,
            stock_quantity=stock_quantity,
        )

        product = Product(
            name=name,
            description=description,
            short_description=short_description,
            search_text=search_text,
            category=category,
            price=price,
            currency=currency,
            stock_quantity=stock_quantity,
            seller_name=seller_name,
            image_url=image_url,
        )
        db.add(product)
        db.flush()
        added_product_ids.append(product.id)
        added_count += 1

    db.commit()
    return {
        "added_count": added_count,
        "skipped_count": skipped_count,
        "product_ids": added_product_ids,
    }


def reindex_catalog():
    db = SessionLocal()
    try:
        trigger_indexing(load_all_products_data(db))
    finally:
        db.close()


def enrich_products_batch(product_ids: List[int]) -> List[Dict[str, object]]:
    db = SessionLocal()
    try:
        products = db.query(Product).filter(Product.id.in_(product_ids)).order_by(Product.id.asc()).all()
        if not products:
            return []

        llm_payloads = [
            {
                "name": product.name,
                "description": product.description,
                "category": product.category,
                "price": product.price,
                "currency": product.currency,
                "stock_quantity": product.stock_quantity,
                "seller_name": product.seller_name,
            }
            for product in products
        ]
        llm_descriptions = llm_enricher.enrich_many(llm_payloads)

        updated_products: List[Dict[str, object]] = []
        for product, llm_short_description in zip(products, llm_descriptions):
            if not llm_short_description:
                continue

            product.short_description = llm_short_description
            product.search_text = build_search_text(
                name=product.name,
                description=product.description or "",
                short_description=product.short_description,
                category=product.category or "",
                seller_name=product.seller_name or "",
                price=product.price or 0,
                currency=product.currency or "USD",
                stock_quantity=product.stock_quantity or 0,
            )
            updated_products.append(serialize_product(product))

        db.commit()
        return updated_products
    finally:
        db.close()


def start_upload_job(product_ids: List[int]) -> Dict[str, object] | None:
    if not product_ids or not LLM_ENRICHMENT_ENABLED:
        return None
    return upload_job_store.create(
        total_products=len(product_ids),
        batch_size=min(BACKGROUND_ENRICHMENT_JOB_SIZE, len(product_ids)),
    )


def run_upload_job(job_id: str, product_ids: List[int]):
    job = upload_job_store.get(job_id)
    if not job:
        return

    upload_job_store.update(job_id, status="running", error=None)
    for batch_ids in chunked(product_ids, BACKGROUND_ENRICHMENT_JOB_SIZE):
        try:
            updated_products = enrich_products_batch(batch_ids)
            if updated_products:
                trigger_partial_indexing(updated_products)
            upload_job_store.increment(
                job_id,
                processed_products=len(batch_ids),
                completed_batches=1,
            )
            logger.info(
                "Upload job %s processed batch of %s products (%s enriched).",
                job_id,
                len(batch_ids),
                len(updated_products),
            )
        except Exception as exc:
            logger.warning("Upload job %s failed batch %s: %s", job_id, batch_ids, exc)
            upload_job_store.increment(
                job_id,
                processed_products=len(batch_ids),
                failed_batches=1,
            )
            upload_job_store.update(job_id, status="running", error=str(exc))

    final_job = upload_job_store.get(job_id)
    if final_job and final_job.get("failed_batches"):
        upload_job_store.update(job_id, status="completed_with_errors")
    else:
        upload_job_store.update(job_id, status="completed", error=None)
