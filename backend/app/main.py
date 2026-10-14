import os
from dotenv import load_dotenv

# Load local backend environment variables
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Global rate limiter using client IP address
limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])

try:
    from app.api import remuneration, documents, health, email, auth_2fa, users, support, payments, messages, feenotes
except ModuleNotFoundError:
    from backend.app.api import remuneration, documents, health, email, auth_2fa, users, support, payments, messages, feenotes

app = FastAPI(
    title="Karani Law — Remuneration & Document Engine",
    description="Python FastAPI backend for Kenyan Advocates Remuneration Order calculations, taxation engines, 2FA OTP security, and legal file metadata processing.",
    version="1.1.0"
)

# Connect slowapi rate limiter to FastAPI state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS origins including local dev, Docker, Vercel, and Microsoft Azure
default_origins = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:80",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
    "https://kithinjiandco.vercel.app",
    "https://karanitest.vercel.app",
    "https://*.azurewebsites.net",
    "https://*.azurecontainerapps.io"
]
configured_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()]
all_origins = list(set(default_origins + configured_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=all_origins,
    allow_origin_regex=r"https://.*(azurewebsites\.net|azurecontainerapps\.io|vercel\.app)",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

app.include_router(health.router)
app.include_router(remuneration.router)
app.include_router(documents.router)
app.include_router(email.router)
app.include_router(auth_2fa.router)
app.include_router(users.router)
app.include_router(support.router)
app.include_router(payments.router)
app.include_router(messages.router)
app.include_router(feenotes.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
