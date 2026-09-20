from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
@router.get("/api/v1/health")
def health_check():
    """Liveness check for Docker & AWS ECS / EC2 load balancers."""
    return {"status": "healthy", "service": "LexFlow Legal Engine", "version": "1.0.0"}
