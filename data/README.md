# Data Directory

## Structure

```
data/
├── uploads/      # Uploaded product files (CSV)
└── examples/     # Sample data files
    ├── products.csv
    └── products.json
```

**Note**: Database files (`.db`) are stored in service-specific directories and are excluded from version control.

## Uploads

**Location**: `data/uploads/`

Storage for uploaded product CSV files. Files are processed and ingested into the product database.

**Note**: Uploaded files are excluded from version control (see `.gitignore`).

## Sample Data

**Location**: `data/examples/`

Sample product data for testing:
- `products.csv` - CSV format example
- `products.json` - JSON format example

**Usage**:
```bash
# Upload via API
curl -X POST "http://localhost:8000/api/ingestion/upload" \
  -F "file=@data/examples/products.csv"

# Or via frontend
# http://localhost:3000/upload
```

## Data Persistence

Upload directory is mounted as a Docker volume in `docker-compose.yml` for data persistence.

## Cleaning Data

```bash
# Stop services first
docker-compose down

# Remove uploaded files (optional)
rm -rf data/uploads/*
```

**WARNING**: This will delete uploaded CSV files. Product data in the database will remain intact.





