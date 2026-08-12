# Intellirity - AI Security Platform

## Getting Started

1. Copy `.env.example` to `.env` and fill in your Clerk keys
2. Run `docker-compose up --build`
3. Frontend: http://localhost:5173
4. Backend API: http://localhost:8000
5. API Docs: http://localhost:8000/docs

## Project Structure

```
intellirity/
├── backend/          # FastAPI backend
│   └── app/
│       ├── api/      # API routes
│       ├── core/     # Config, security, dependencies
│       ├── db/       # Database setup
│       ├── models/   # SQLAlchemy models
│       ├── schemas/  # Pydantic schemas
│       └── services/ # Business logic
├── frontend/         # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── services/
└── docker-compose.yml
```
