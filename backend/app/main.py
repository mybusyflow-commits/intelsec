from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.v1.router import api_router
import app.services.modules  # Register all detection modules


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the live monitoring simulator on startup
    from app.api.v1.system import live_event_loop
    task = asyncio.create_task(live_event_loop())
    yield
    task.cancel()


import asyncio

app = FastAPI(
    title="Intellirity",
    description="AI Security Platform — Protecting AI systems from threats",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Serve the built frontend design (Vite dist) when present, else legacy static dir
import os

FRONTEND_DIST = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "dist")
)
static_dir = os.path.join(os.path.dirname(__file__), "static")

frontend_dir = FRONTEND_DIST if os.path.isdir(FRONTEND_DIST) else static_dir
if os.path.isdir(os.path.join(frontend_dir, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dir, "assets")), name="assets")
else:
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
async def root():
    index_path = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Intellirity API", "docs": "/docs", "health": "/health"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "intellirity"}


@app.get("/favicon.png")
async def favicon_png():
    p = os.path.join(frontend_dir, "favicon.png")
    if os.path.exists(p):
        return FileResponse(p, media_type="image/png")
    raise HTTPException(status_code=404, detail="favicon not found")


@app.get("/favicon.ico")
async def favicon_ico():
    p = os.path.join(frontend_dir, "favicon.png")
    if os.path.exists(p):
        return FileResponse(p, media_type="image/png")
    raise HTTPException(status_code=404, detail="favicon not found")


@app.get("/logo.png")
async def logo_png():
    p = os.path.join(frontend_dir, "logo.png")
    if os.path.exists(p):
        return FileResponse(p, media_type="image/png")
    raise HTTPException(status_code=404, detail="logo not found")


@app.get("/app/{path:path}")
async def serve_app(path: str):
    index_path = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"error": "Not found"}
