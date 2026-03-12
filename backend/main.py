from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from database import engine, Base
from routers import auth_routes, profile_routes, dashboard_routes
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="KeyGhost API",
    description="Behavioural Biometric Authentication — Keystroke Dynamics",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", os.getenv("FRONTEND_URL", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(profile_routes.router, prefix="/api/profile", tags=["Profile"])
app.include_router(dashboard_routes.router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/")
async def root():
    return {"status": "KeyGhost API Running", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
