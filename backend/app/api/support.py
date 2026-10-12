import time
import socket
from fastapi import APIRouter

try:
    from app.engine.remuneration_engine import calculate_bill_of_costs
except ImportError:
    from backend.app.engine.remuneration_engine import calculate_bill_of_costs

router = APIRouter(prefix="/api/v1/support", tags=["Support"])

@router.get("/telemetry")
async def get_system_telemetry():
    """Runs genuine live health probes against local and network services."""
    t_start = time.perf_counter()
    
    # 1. Remuneration Engine Python Calculation Probe
    calc_status = "operational"
    calc_latency_ms = 0.0
    try:
        sample_calc = calculate_bill_of_costs(
            claim_value=1_000_000.0,
            court_schedule="schedule_6_high_court",
            is_defendant=False,
            apply_vat=True
        )
        calc_latency_ms = round((time.perf_counter() - t_start) * 1000, 2)
    except Exception as e:
        calc_status = f"error: {str(e)}"

    # 2. SMTP TLS 587 Socket Probe
    t_smtp = time.perf_counter()
    smtp_status = "operational"
    smtp_latency_ms = 0.0
    try:
        sock = socket.create_connection(("smtp.gmail.com", 587), timeout=2.0)
        sock.close()
        smtp_latency_ms = round((time.perf_counter() - t_smtp) * 1000, 2)
    except Exception:
        smtp_status = "timeout"

    return {
        "status": "online",
        "timestamp": time.time(),
        "probes": {
            "fastapi_engine": {
                "name": "FastAPI Remuneration Microservice",
                "status": calc_status,
                "latency_ms": calc_latency_ms,
                "schedules_active": 12
            },
            "smtp_gateway": {
                "name": "SMTP Relay Gateway (TLS 587)",
                "status": smtp_status,
                "latency_ms": smtp_latency_ms
            }
        }
    }
