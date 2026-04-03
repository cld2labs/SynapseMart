from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.config import LLM_ENRICHMENT_ENABLED
from ..core.database import get_db
from ..models.product import Product
from ..services.catalog import load_all_products_data, process_csv_upload, reindex_catalog, run_upload_job, start_upload_job
from ..services.jobs import upload_job_store

router = APIRouter()

@router.post("/upload")
async def upload_products(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Handle product CSV uploads."""
    try:
        upload_result = process_csv_upload(file, db)
        all_products_data = load_all_products_data(db)
        background_tasks.add_task(reindex_catalog)

        job = start_upload_job(upload_result["product_ids"])
        if job:
            background_tasks.add_task(run_upload_job, job["job_id"], upload_result["product_ids"])

        requires_enrichment_completion = bool(LLM_ENRICHMENT_ENABLED and job)

        return {
            "message": (
                (
                    f"Accepted {upload_result['added_count']} products for upload. "
                    "Search will unlock after LLM enrichment completes."
                )
                if requires_enrichment_completion
                else (
                    f"Accepted {upload_result['added_count']} products for upload. "
                    "Search is available immediately."
                )
            ),
            "count": upload_result["added_count"],
            "skipped": upload_result["skipped_count"],
            "total_products": len(all_products_data),
            "job": job,
            "llm_enrichment_enabled": LLM_ENRICHMENT_ENABLED,
            "requires_enrichment_completion": requires_enrichment_completion,
            "search_ready": not requires_enrichment_completion,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def list_products(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """List products with optional category filter."""
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    return query.offset(skip).limit(limit).all()

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """Return all unique product categories."""
    categories = db.query(Product.category).distinct().all()
    return [c[0] for c in categories if c[0]]

@router.delete("/")
def clear_catalog(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Wipe the product catalog."""
    count = db.query(Product).delete()
    db.commit()
    background_tasks.add_task(reindex_catalog)
    return {"message": f"Deleted {count} products"}


@router.get("/jobs/{job_id}")
def get_upload_job(job_id: str):
    job = upload_job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Upload job not found")
    return job
