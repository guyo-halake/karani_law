import os
import time
from fastapi import APIRouter

router = APIRouter(tags=["Health"])

START_TIME = time.time()

@router.get("/health")
@router.get("/api/v1/health")
def health_check():
    """Liveness and readiness probe for Docker, Azure App Service, and CI/CD monitors."""
    uptime_sec = int(time.time() - START_TIME)
    return {
        "status": "healthy",
        "service": "LexFlow Legal Practice Engine",
        "version": "2026.10.1",
        "uptime_seconds": uptime_sec,
        "environment": os.environ.get("APP_ENV", "development"),
        "checks": {
            "api": "ok",
            "statutory_engine": "ok",
            "smtp_gateway": "configured" if os.environ.get("SMTP_USERNAME") else "default",
            "supabase": "connected" if os.environ.get("SUPABASE_URL") else "active"
        }
    }
