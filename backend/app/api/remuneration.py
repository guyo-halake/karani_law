from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

try:
    from app.engine.remuneration_engine import (
        calculate_bill_of_costs,
        STATUTORY_ITEM_RATES,
        STATUTORY_SCHEDULES,
        STATUTORY_RULES,
        get_statutory_db_data
    )
except ModuleNotFoundError:
    from backend.app.engine.remuneration_engine import (
        calculate_bill_of_costs,
        STATUTORY_ITEM_RATES,
        STATUTORY_SCHEDULES,
        STATUTORY_RULES,
        get_statutory_db_data
    )

router = APIRouter(prefix="/api/v1/remuneration", tags=["Remuneration Engine"])

class FolioItemRequest(BaseModel):
    description: str
    type: str = Field(default="drawing_pleading_base", description="drawing_pleading_base, drawing_general_folio, copying_folio, attendance_court_hr, letter_formal, custom, etc.")
    qty: float = Field(default=1.0, ge=0.0)
    unitRate: Optional[float] = None
    unit_rate: Optional[float] = None

class BillOfCostsRequest(BaseModel):
    claim_value: float = Field(default=0.0, ge=0.0, description="Value of claim or subject matter in Kshs")
    court_schedule: str = Field(default="schedule_6_high_court", description="One of the 12 statutory schedules")
    is_defendant: bool = False
    include_getting_up: bool = True
    items: Optional[List[FolioItemRequest]] = []
    disbursements: float = 0.0
    complexity_multiplier: float = 1.0
    months_overdue: int = 0
    apply_vat: bool = True
    document_type: str = "party_party"
    custom_instruction_fee: Optional[float] = None
    case_disposition: str = "full_trial"

@router.get("/schedules")
def get_statutory_schedules():
    """Returns details for all 12 statutory schedules under the Remuneration Order."""
    db_data = get_statutory_db_data()
    return {
        "success": True,
        "schedules": db_data.get("schedules", STATUTORY_SCHEDULES),
        "source": db_data.get("source", "embedded")
    }

@router.get("/rates")
def get_prescribed_rates():
    """Returns legal prescribed unit rates for folios, attendances, and letters under the Remuneration Order."""
    db_data = get_statutory_db_data()
    return {
        "success": True,
        "rates": db_data.get("rates", STATUTORY_ITEM_RATES),
        "vat_rate": 0.16,
        "source": db_data.get("source", "embedded")
    }

@router.get("/rules")
def get_statutory_rules():
    """Returns statutory rules including Rule 7 (interest), Rule 77 (1/6th rule), and Part B (+50% uplift)."""
    db_data = get_statutory_db_data()
    return {
        "success": True,
        "rules": db_data.get("rules", STATUTORY_RULES),
        "source": db_data.get("source", "embedded")
    }

@router.post("/calculate")
def calculate_legal_fees(req: BillOfCostsRequest):
    """Calculates Advocates Remuneration Order instruction fees, getting-up fees, itemized folios, VAT, and grand total."""
    try:
        item_list = [item.model_dump() for item in req.items] if req.items else []
        result = calculate_bill_of_costs(
            claim_value=req.claim_value,
            court_schedule=req.court_schedule,
            is_defendant=req.is_defendant,
            include_getting_up=req.include_getting_up,
            item_folios=item_list,
            disbursements=req.disbursements,
            complexity_multiplier=req.complexity_multiplier,
            months_overdue=req.months_overdue,
            apply_vat=req.apply_vat,
            document_type=req.document_type,
            custom_instruction_fee=req.custom_instruction_fee,
            case_disposition=req.case_disposition
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))