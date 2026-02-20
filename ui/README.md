# SynapseMart Frontend

React + Vite frontend for the marketplace.

## Setup

### Development
```bash
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

### Production (Docker)
The frontend is automatically built and served via Nginx when using Docker Compose.

## Pages

- `/` - Home page with getting started guide
- `/search` - Product search with hybrid AI search
- `/upload` - Product CSV upload interface
- `/settings` - Database statistics and management

## Components

- `ProductCard` - Product display card
- `ProductList` - Product grid layout
- `ProductUpload` - File upload for product ingestion
- `TechHighlights` - Technology features showcase
- `WorkflowSummary` - Backend architecture overview

## API Integration

All API calls are in `src/services/api.js`. The frontend uses relative paths in production (via Nginx proxy) and explicit URLs in development.
