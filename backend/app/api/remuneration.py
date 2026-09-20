from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.engine.remuneration_engine import calculate_bill_of_costs, ITEM_RATES

router = APIRouter(prefix="/api/v1/remuneration", tags=["Remuneration Engine"])

class FolioItemRequest(BaseModel):
    description: str
    type: str = Field(default="drawing_folio", description="Type of legal item: drawing_folio, copying_folio, attendance_court_hr, letter_formal, etc.")
    qty: float = Field(default=1.0, ge=0.1)

class BillOfCostsRequest(BaseModel):
    claim_value: float = Field(..., ge=0.0, description="Value of claim or subject matter in Kshs")
    court_schedule: str = Field(default="schedule_6_high_court", description="schedule_6_high_court or schedule_5_magistrate")
    is_defendant: bool = False
    include_getting_up: bool = True
    items: Optional[List[FolioItemRequest]] = []
    disbursements: float = 0.0

@router.get("/rates")
def get_prescribed_rates():
    """Returns the legal prescribed unit rates for folios, attendances, and letters under the Remuneration Order."""
    return {"rates": ITEM_RATES, "vat_rate": 0.16}

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
            disbursements=req.disbursements
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
