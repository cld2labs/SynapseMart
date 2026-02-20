# Tests

This directory contains verification scripts for the SynapseMart application.

## Integration Tests
These tests require the services to be running (via Docker Compose).

- **`test_microservices.py`**: Tests the complete microservices architecture including gateway, product service, and search service.
- **`test_upload.py`**: Verifies the product CSV upload functionality.
- **`test_search_logic.py`**: Tests the hybrid search engine and NLP parsing.

## Usage

1. Start all services:
   ```bash
   docker-compose up -d
   ```

2. Run tests from the project root:
   ```bash
   python tests/test_microservices.py
   python tests/test_upload.py
   python tests/test_search_logic.py
   ```
