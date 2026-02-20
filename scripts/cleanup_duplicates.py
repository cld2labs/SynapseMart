import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import func

# Add apis folder to path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "apis"))

from app.core.config import settings
from app.models.product import Product

def cleanup_duplicates():
    # Setup DB connection directly using settings
    engine = create_engine(settings.SQLITE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("Checking for duplicates...")
        
        # Find duplicates by name
        # We want to keep the one with the lowest ID (first inserted)
        subquery = db.query(
            Product.name,
            func.min(Product.id).label('min_id')
        ).group_by(Product.name).subquery()

        # Find IDs that match the name but are NOT the min_id
        duplicates = db.query(Product).join(
            subquery, 
            Product.name == subquery.c.name
        ).filter(
            Product.id != subquery.c.min_id
        ).all()
        
        count = len(duplicates)
        if count == 0:
            print("No duplicates found.")
            return

        print(f"Found {count} duplicates. Removing...")
        
        for prod in duplicates:
            # print(f"Deleting duplicate: {prod.name} (ID: {prod.id})")
            db.delete(prod)
            
        db.commit()
        print(f"Successfully removed {count} duplicates.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_duplicates()
