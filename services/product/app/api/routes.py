from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..models.product import Product
from ..services.catalog import process_csv_upload, trigger_indexing

router = APIRouter()

@router.post("/upload")
async def upload_products(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Handle product CSV uploads."""
    try:
        added_count, skipped_count = process_csv_upload(file, db)
        
        # Prepare data for search indexing
        all_products = db.query(Product).all()
        products_data = [{
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "category": p.category,
            "price": p.price,
            "currency": p.currency,
            "stock_quantity": p.stock_quantity,
            "seller_name": p.seller_name,
            "image_url": p.image_url
        } for p in all_products]
        
        background_tasks.add_task(trigger_indexing, products_data)
        
        return {
            "message": f"Processed {added_count} products",
            "count": added_count,
            "skipped": skipped_count,
            "total_products": len(all_products)
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
    background_tasks.add_task(trigger_indexing, [])
    return {"message": f"Deleted {count} products"}
