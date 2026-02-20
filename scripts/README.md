# Utility Scripts

This directory contains utility scripts for managing the SynapseMart application.

## Available Scripts

### seed_data.py
Seeds the database with sample product data.

```bash
# Via Docker
docker-compose exec product-service python scripts/seed_data.py

# Directly
cd services/product
python scripts/seed_data.py
```

### upload_products.py
Bulk upload products from CSV files.

```bash
cd services/product
python scripts/upload_products.py path/to/products.csv
```

### cleanup_duplicates.py
Removes duplicate products from the database.

```bash
cd services/product
python scripts/cleanup_duplicates.py
```


## Adding Custom Scripts

Place utility scripts here for:
- Database migrations
- Data import/export
- Cleanup operations
- Monitoring
- Testing

Example:
```python
# scripts/custom_script.py
import sys
sys.path.insert(0, '../apis')
from database.database import SessionLocal

# Your script logic here
```

Run via Docker:
```bash
docker-compose exec backend python scripts/custom_script.py
```





