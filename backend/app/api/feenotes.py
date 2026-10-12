import os
import json
from typing import Optional, List, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1/feenotes", tags=["Fee Notes & Bills of Costs"])

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
FEENOTES_FILE = os.path.join(DATA_DIR, "feenotes.json")

# Default authoritative seeded firm fee notes
INITIAL_FEE_NOTES = [
    {
        "id": "fn-001",
        "billNumber": "BOC-2026-SEYANI-001",
        "matterId": "seyani",
        "matterTitle": "Seyani Brothers & Co. (K) Ltd v Greenhills Investment Ltd",
        "clientName": "Seyani Brothers & Co. (K) Limited",
        "claimantName": "Seyani Brothers & Co. (K) Limited",
        "respondentName": "Greenhills Investment Limited",
        "judgeName": "Hon. Justice D. S. Majanja",
        "forumName": "High Court Commercial & Admiralty Division (Milimani)",
        "courtSchedule": "Schedule 6 — High Court / Court of Appeal",
        "claimValue": 221268881.47,
        "instructionFee": 18500000.00,
        "gettingUpFee": 6166666.67,
        "grandTotal": 30820193.28,
        "status": "processed",
        "approvalStatus": "approved",
        "generatedByUser": "Karani Victor (Senior Partner)",
        "generatedByUserId": "usr-karani-admin",
        "createdAt": "2026-02-26 10:45 AM",
        "pdfUrl": "/vault/26.02.2026_BILL_OF_COSTS_Seyani.pdf",
        "excelUrl": "/vault/26.02.2026_BILL_OF_COSTS_Seyani.xlsx",
        "firmId": "firm-001"
    },
    {
        "id": "fn-002",
        "billNumber": "BOC-2026-DHANYA-003",
        "matterId": "dhanya",
        "matterTitle": "Dhanya Construction Kenya Ltd v Sunil Shah",
        "clientName": "Dhanya Construction Kenya Limited",
        "claimantName": "Dhanya Construction Kenya Limited",
        "respondentName": "Sunil Shah",
        "judgeName": "Sole Arbitrator Eng. Patrick Kimani",
        "forumName": "Nairobi Centre for International Arbitration (NCIA)",
        "courtSchedule": "Schedule 7 — Arbitral Proceedings",
        "claimValue": 3986663.93,
        "instructionFee": 320000.00,
        "gettingUpFee": 106666.67,
        "grandTotal": 3986663.93,
        "status": "processed",
        "approvalStatus": "approved",
        "generatedByUser": "Karani Victor (Senior Partner)",
        "generatedByUserId": "usr-karani-admin",
        "createdAt": "2026-01-14 02:15 PM",
        "pdfUrl": "/vault/14.01.2026_Bill_of_Costs_Dhanya.pdf",
        "excelUrl": "/vault/14.01.2026_Bill_of_Costs_Dhanya.xlsx",
        "firmId": "firm-001"
    },
    {
        "id": "fn-003",
        "billNumber": "BOC-2026-ZHENJIAN-002",
        "matterId": "hccomm",
        "matterTitle": "Zhenjian Chengjian Construction Africa Ltd v Eighty Eight Nairobi Ltd",
        "clientName": "Eighty Eight Nairobi Limited",
        "claimantName": "Zhenjian Chengjian Construction Africa Ltd",
        "respondentName": "Eighty Eight Nairobi Limited",
        "judgeName": "Hon. Lady Justice F. Muchemi",
        "forumName": "High Court Commercial Division (Milimani)",
        "courtSchedule": "Schedule 6 — High Court Commercial",
        "claimValue": 405594.00,
        "instructionFee": 75000.00,
        "gettingUpFee": 25000.00,
        "grandTotal": 405594.00,
        "status": "processed",
        "approvalStatus": "approved",
        "generatedByUser": "Nyagah Kithinji (Senior Associate)",
        "generatedByUserId": "usr-advocate-002",
        "createdAt": "2026-03-01 11:20 AM",
        "pdfUrl": "/vault/HCCOMM_E547_Main_Suit_Bill.pdf",
        "excelUrl": "/vault/HCCOMM_E547_Main_Suit_Bill.xlsx",
        "firmId": "firm-001"
    },
    {
        "id": "fn-draft-004",
        "billNumber": "BOC-2026-DRAFT-004",
        "matterId": "seyani",
        "matterTitle": "Seyani Brothers Commercial Lease Taxation Advisory",
        "clientName": "Seyani Brothers & Co. (K) Limited",
        "courtSchedule": "Schedule 1 — Conveyancing & Leases",
        "claimValue": 14500000.00,
        "instructionFee": 217500.00,
        "gettingUpFee": 0.00,
        "grandTotal": 252300.00,
        "status": "draft",
        "approvalStatus": "pending",
        "generatedByUser": "Karani Victor (Senior Partner)",
        "generatedByUserId": "usr-karani-admin",
        "createdAt": "2026-03-18 04:50 PM",
        "pdfUrl": "",
        "excelUrl": "",
        "firmId": "firm-001"
    },
    {
        "id": "fn-draft-005",
        "billNumber": "BOC-2026-DRAFT-005",
        "matterId": "dhanya",
        "matterTitle": "Dhanya Construction Arbitrator Fee Taxation Ledger",
        "clientName": "Dhanya Construction Kenya Limited",
        "courtSchedule": "Schedule 7 — Arbitration",
        "claimValue": 8500000.00,
        "instructionFee": 145000.00,
        "gettingUpFee": 48333.33,
        "grandTotal": 224266.66,
        "status": "draft",
        "approvalStatus": "pending",
        "generatedByUser": "Razak Wako (P3L Developer)",
        "generatedByUserId": "usr-p3l-admin",
        "createdAt": "2026-03-19 09:10 AM",
        "pdfUrl": "",
        "excelUrl": "",
        "firmId": "firm-001"
    }
]

def load_feenotes() -> List[dict]:
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(FEENOTES_FILE):
        with open(FEENOTES_FILE, "w", encoding="utf-8") as f:
            json.dump(INITIAL_FEE_NOTES, f, indent=2)
        return INITIAL_FEE_NOTES
    try:
        with open(FEENOTES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            return INITIAL_FEE_NOTES
    except Exception:
        return INITIAL_FEE_NOTES

def save_feenotes(notes: List[dict]):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(FEENOTES_FILE, "w", encoding="utf-8") as f:
        json.dump(notes, f, indent=2)

class FeeNoteSchema(BaseModel):
    id: Optional[str] = None
    billNumber: str
    matterId: Optional[str] = ""
    matterTitle: Optional[str] = "Bill of Costs"
    clientName: Optional[str] = "Client"
    claimantName: Optional[str] = ""
    respondentName: Optional[str] = ""
    judgeName: Optional[str] = ""
    forumName: Optional[str] = ""
    courtSchedule: Optional[str] = ""
    claimValue: float = 0.0
    instructionFee: float = 0.0
    gettingUpFee: float = 0.0
    grandTotal: float = 0.0
    status: str = "processed"
    approvalStatus: Optional[str] = None
    generatedByUser: Optional[str] = "Advocate"
    generatedByUserId: Optional[str] = ""
    createdAt: Optional[str] = None
    pdfUrl: Optional[str] = ""
    excelUrl: Optional[str] = ""
    excelData: Optional[Any] = None
    firmId: Optional[str] = "firm-001"

@router.get("", response_model=List[dict])
def list_fee_notes(
    firm_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None
):
    notes = load_feenotes()
    filtered = notes
    if firm_id and firm_id != "firm-001":
        filtered = [n for n in filtered if n.get("firmId") == firm_id or not n.get("firmId")]
    if status:
        filtered = [n for n in filtered if n.get("status") == status]
    if search:
        s = search.lower()
        filtered = [
            n for n in filtered
            if s in n.get("billNumber", "").lower()
            or s in n.get("matterTitle", "").lower()
            or s in n.get("clientName", "").lower()
        ]
    return filtered

@router.post("")
def create_or_update_fee_note(payload: FeeNoteSchema):
    notes = load_feenotes()
    note_dict = payload.dict()
    
    # Ensure ID
    if not note_dict.get("id"):
        note_dict["id"] = f"fn-{int(os.urandom(4).hex(), 16)}"
    
    # Ensure createdAt
    if not note_dict.get("createdAt"):
        import datetime
        note_dict["createdAt"] = datetime.datetime.now().strftime("%Y-%m-%d %I:%M %p")
        
    # Check existing by billNumber or id
    idx = -1
    for i, n in enumerate(notes):
        if n.get("billNumber") == note_dict["billNumber"] or n.get("id") == note_dict["id"]:
            idx = i
            break
            
    if idx >= 0:
        notes[idx] = note_dict
    else:
        notes.insert(0, note_dict)
        
    save_feenotes(notes)
    return {"success": True, "note": note_dict}

@router.get("/{note_id}")
def get_fee_note(note_id: str):
    notes = load_feenotes()
    for n in notes:
        if n.get("id") == note_id or n.get("billNumber") == note_id:
            return n
    raise HTTPException(status_code=404, detail="Fee note not found")

@router.delete("/{note_id}")
def delete_fee_note(note_id: str):
    notes = load_feenotes()
    new_notes = [n for n in notes if n.get("id") != note_id and n.get("billNumber") != note_id]
    if len(new_notes) == len(notes):
        raise HTTPException(status_code=404, detail="Fee note not found")
    save_feenotes(new_notes)
    return {"success": True, "deleted_id": note_id}
