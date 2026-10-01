from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
try:
    from app.api import remuneration, documents, health, email, auth_2fa
except ModuleNotFoundError:
    from backend.app.api import remuneration, documents, health, email, auth_2fa

app = FastAPI(
    title="LexFlow Legal Remuneration & Document Engine",
    description="Python FastAPI backend for Kenyan Advocates Remuneration Order calculations, taxation engines, 2FA OTP security, and legal file metadata processing.",
    version="1.0.0"
)

# Enable CORS for frontend SPA
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(remuneration.router)
app.include_router(documents.router)
app.include_router(email.router)
app.include_router(auth_2fa.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
