from sqlalchemy import create_engine
from sqlalchemy import inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Ensure data directory exists (relative to the container root)
os.makedirs("data", exist_ok=True)

SQLITE_URL = "sqlite:///./data/products.db"

engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def ensure_schema():
    """Backfill additive columns for existing SQLite databases."""
    inspector = inspect(engine)
    if "products" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("products")}
    with engine.begin() as connection:
        if "short_description" not in existing_columns:
            connection.execute(text("ALTER TABLE products ADD COLUMN short_description VARCHAR"))
        if "search_text" not in existing_columns:
            connection.execute(text("ALTER TABLE products ADD COLUMN search_text VARCHAR"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
