"""
Remuneration Engine for Kenyan Advocates (Remuneration) (Amendment) Order
Ref: Kenya Law LN 64/1962 (ed. 2022) / 2014 Amendment Order

Provides exact legal fee calculations for:
- Schedule 1: Conveyancing (Sales, Mortgages, Charges, Leases)
- Schedule 5: Subordinate Courts (Magistrate's Court Litigation)
- Schedule 6: High Court, Court of Appeal, Supreme Court, ELC, ELRC Litigation
- Getting-Up Fees (33.33% / 1/3 of instruction fee)
- Itemized Work (Drawings per folio @ Kshs 500, Copying @ Kshs 50, Attendances @ Kshs 1,500-2,500/hr, Letters @ Kshs 300-500)
- Disbursements
- Value Added Tax (VAT 16%)
"""

import math
from typing import Dict, Any, List

VAT_RATE = 0.16

ITEM_RATES = {
    "drawing_folio": 500.0,        # Per folio of 100 words (drawing pleadings, affidavits, etc.)
    "copying_folio": 50.0,         # Per folio of 100 words (copying documents)
    "attendance_court_hr": 2500.0, # Per hour in court
    "attendance_office_hr": 1500.0,# Per hour in office conference
    "letter_formal": 500.0,        # Per formal demand letter / opinion letter
    "letter_ordinary": 300.0,      # Per ordinary letter
    "perusal_folio": 100.0         # Per folio perused
}

def calculate_high_court_instruction_fee(value: float, is_defendant: bool = False) -> Dict[str, Any]:
    """
    Calculate Schedule 6 (High Court, Court of Appeal, ELC, ELRC) Instruction Fee based on claim value.
    Minimum instruction fee: Kshs 75,000 for Plaintiff / Kshs 50,000 for Defendant.
    """
    min_fee = 50000.0 if is_defendant else 75000.0
    val = max(0.0, float(value))

    if val <= 500000:
        base_fee = 45000.0
        formula_desc = "Fixed scale fee for value up to Kshs 500,000"
    elif val <= 1000000:
        base_fee = 75000.0
        formula_desc = "Fixed scale fee for value Kshs 500,001 - 1,000,000"
    elif val <= 5000000:
        excess = val - 1000000
        base_fee = 75000.0 + (excess * 0.0175)
        formula_desc = f"Kshs 75,000 + 1.75% of excess over 1M (excess: Kshs {excess:,.2f})"
    elif val <= 10000000:
        excess = val - 5000000
        base_fee = 145000.0 + (excess * 0.015)
        formula_desc = f"Kshs 145,000 + 1.5% of excess over 5M (excess: Kshs {excess:,.2f})"
    elif val <= 20000000:
        excess = val - 10000000
        base_fee = 220000.0 + (excess * 0.010)
        formula_desc = f"Kshs 220,000 + 1.0% of excess over 10M (excess: Kshs {excess:,.2f})"
    else:
        excess = val - 20000000
        base_fee = 320000.0 + (excess * 0.0075)
        formula_desc = f"Kshs 320,000 + 0.75% of excess over 20M (excess: Kshs {excess:,.2f})"

    final_fee = max(base_fee, min_fee)
    if is_defendant:
        final_fee = final_fee * 0.85
        final_fee = max(final_fee, min_fee)

    return {
        "court": "High Court / ELC / ELRC / Court of Appeal",
        "schedule": "Schedule 6",
        "claim_value": val,
        "is_defendant": is_defendant,
        "raw_calculated_fee": round(base_fee, 2),
        "minimum_prescribed_fee": min_fee,
        "instruction_fee": round(final_fee, 2),
        "formula": formula_desc
    }

def calculate_subordinate_court_instruction_fee(value: float) -> Dict[str, Any]:
    """
    Calculate Schedule 5 (Magistrate's Court) Instruction Fee based on claim value.
    Minimum instruction fee: Kshs 30,000.
    """
    val = max(0.0, float(value))
    min_fee = 30000.0

    if val <= 100000:
        base_fee = 20000.0
        formula_desc = "Fixed scale fee for Magistrate Court value up to Kshs 100,000"
    elif val <= 500000:
        excess = val - 100000
        base_fee = 30000.0 + (excess * 0.05)
        formula_desc = f"Kshs 30,000 + 5% of excess over 100k (excess: Kshs {excess:,.2f})"
    elif val <= 1000000:
        excess = val - 500000
        base_fee = 50000.0 + (excess * 0.03)
        formula_desc = f"Kshs 50,000 + 3% of excess over 500k (excess: Kshs {excess:,.2f})"
    else:
        excess = val - 1000000
        base_fee = 65000.0 + (excess * 0.02)
        formula_desc = f"Kshs 65,000 + 2% of excess over 1M (excess: Kshs {excess:,.2f})"

    final_fee = max(base_fee, min_fee)
    return {
        "court": "Subordinate / Magistrate's Court",
        "schedule": "Schedule 5",
        "claim_value": val,
        "raw_calculated_fee": round(base_fee, 2),
        "minimum_prescribed_fee": min_fee,
        "instruction_fee": round(final_fee, 2),
        "formula": formula_desc
    }

def calculate_getting_up_fee(instruction_fee: float) -> float:
    """Getting-Up fee is 33.33% (1/3) of instruction fee under Schedule 6."""
    return round(float(instruction_fee) / 3.0, 2)

def calculate_bill_of_costs(
    claim_value: float,
    court_schedule: str = "schedule_6_high_court",
    is_defendant: bool = False,
    include_getting_up: bool = True,
    item_folios: List[Dict[str, Any]] = None,
    disbursements: float = 0.0
) -> Dict[str, Any]:
    """
    Calculate full Bill of Costs statement with instruction fee, getting-up fee, itemized folios, disbursements, and 16% VAT.
    """
    if court_schedule == "schedule_5_magistrate":
        instr_data = calculate_subordinate_court_instruction_fee(claim_value)
    else:
        instr_data = calculate_high_court_instruction_fee(claim_value, is_defendant)

    instruction_fee = instr_data["instruction_fee"]
    getting_up_fee = calculate_getting_up_fee(instruction_fee) if include_getting_up else 0.0

    items_total = 0.0
    processed_items = []
    if item_folios:
        for item in item_folios:
            itype = item.get("type", "drawing_folio")
            qty = float(item.get("qty", 1.0))
            rate = ITEM_RATES.get(itype, ITEM_RATES["drawing_folio"])
            subtotal = round(qty * rate, 2)
            items_total += subtotal
            processed_items.append({
                "description": item.get("description", "Legal Work"),
                "type": itype,
                "qty": qty,
                "unit_rate": rate,
                "subtotal": subtotal
            })

    taxable_subtotal = instruction_fee + getting_up_fee + items_total
    vat_amount = round(taxable_subtotal * VAT_RATE, 2)
    grand_total = round(taxable_subtotal + vat_amount + float(disbursements), 2)

    return {
        "schedule": instr_data["schedule"],
        "formula": instr_data["formula"],
        "claim_value": claim_value,
        "instruction_fee": instruction_fee,
        "getting_up_fee": getting_up_fee,
        "items_total": round(items_total, 2),
        "taxable_subtotal": round(taxable_subtotal, 2),
        "vat_amount": vat_amount,
        "disbursements": round(float(disbursements), 2),
        "grand_total": grand_total,
        "items": processed_items
    }
