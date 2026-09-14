from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, farmer, ai, intelligence, officer

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Crop Intelligence Platform for Bangladesh",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(farmer.router, prefix="/api/v1/farmer", tags=["Farmer"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI Core"])
app.include_router(intelligence.router, prefix="/api/v1/intelligence", tags=["Intelligence Services"])
app.include_router(officer.router, prefix="/api/v1/officer", tags=["Officer Portal"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.APP_NAME}
