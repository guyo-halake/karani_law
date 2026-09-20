"""
Remuneration Engine for Kenyan Advocates (Remuneration) (Amendment) Order
Ref: Kenya Law LN 64/1962 (ed. 2022) / 2014 Amendment Order

Provides exact legal fee calculations for:
- Schedule 1: Conveyancing (Sales, Mortgages, Charges, Leases)
- Schedule 5: Subordinate Courts (Magistrate's Court Litigation)
- Schedule 6: High Court, Court of Appeal, Supreme Court, ELC, ELRC Litigation
- Getting-Up Fees (33.33% / 1/3 of instruction fee)
- Itemized Work (Drawings per folio @ Kshs 500, Copying @ Kshs 50, Attendances @ Kshs 1,500-3,000/hr, Letters @ Kshs 300-500)
- Disbursements
- Value Added Tax (VAT 16%)
"""

import math
import json

VAT_RATE = 0.16

# Prescribed unit rates in Kshs
ITEM_RATES = {
    "drawing_folio": 500.0,       # Per folio of 100 words (drawing pleadings, affidavits, etc.)
    "copying_folio": 50.0,        # Per folio of 100 words (copying documents)
    "attendance_court_hr": 2500.0, # Per hour in court
    "attendance_office_hr": 1500.0,# Per hour in office conference
    "letter_formal": 500.0,       # Per formal demand letter / opinion letter
    "letter_ordinary": 300.0,     # Per ordinary letter
    "perusal_folio": 100.0        # Per folio perused
}

def calculate_high_court_instruction_fee(value: float, is_defendant: bool = False) -> dict:
    """
    Calculate Schedule 6 (High Court, Court of Appeal, ELC, ELRC) Instruction Fee based on claim value.
    Minimum instruction fee: Kshs 75,000 for Plaintiff / Kshs 50,000 for Defendant.
    Ad Valorem scale:
    - Up to Kshs 500,000: Kshs 45,000 (min 75,000 cap applied)
    - Kshs 500,001 - 1,000,000: Kshs 75,000
    - Kshs 1,000,001 - 5,000,000: Kshs 75,000 + 1.75% of excess over 1,000,000
    - Kshs 5,000,001 - 10,000,000: Kshs 145,000 + 1.5% of excess over 5,000,000
    - Kshs 10,000,001 - 20,000,000: Kshs 220,000 + 1.0% of excess over 10,000,000
    - Over Kshs 20,000,000: Kshs 320,000 + 0.75% of excess over 20,000,000
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

def calculate_subordinate_court_instruction_fee(value: float) -> dict:
    """
    Calculate Schedule 5 (Magistrate's Court) Instruction Fee based on claim value.
    Minimum instruction fee: Kshs 30,000.
    - Up to Kshs 100,000: Kshs 20,000 (min Kshs 30,000 floor)
    - Kshs 100,001 - 500,000: Kshs 30,000 + 5% of excess over 100,000
    - Kshs 500,001 - 1,000,000: Kshs 50,000 + 3% of excess over 500,000
    - Over Kshs 1,000,000: Kshs 65,000 + 2% of excess over 1,000,000
    """
    val = max(0.0, float(value))
    min_fee = 30000.0

    if val <= 100000:
        base_fee = 20000.0
        formula_desc = "Fixed scale fee for Magistrate Court value up to Kshs 100,000"
    elif val <= 500000:
        excess = val - 100000
        base_fee = 30000.0 + (excess * 0.05)
        formula_desc = f"Kshs 30,000 + 5% of excess over 100K (excess: Kshs {excess:,.2f})"
    elif val <= 1000000:
        excess = val - 500000
        base_fee = 50000.0 + (excess * 0.03)
        formula_desc = f"Kshs 50,000 + 3% of excess over 500K (excess: Kshs {excess:,.2f})"
    else:
        excess = val - 1000000
        base_fee = 65000.0 + (excess * 0.02)
        formula_desc = f"Kshs 65,000 + 2% of excess over 1M (excess: Kshs {excess:,.2f})"

    final_fee = max(base_fee, min_fee)
    return {
        "court": "Magistrate's Court / Subordinate Court",
        "schedule": "Schedule 5",
        "claim_value": val,
        "instruction_fee": round(final_fee, 2),
        "formula": formula_desc
    }

def calculate_conveyancing_instruction_fee(consideration: float, is_mortgage: bool = False) -> dict:
    """
    Calculate Schedule 1 Conveyancing Fee (Sales, Purchases, Mortgages).
    Minimum fee: Kshs 35,000.
    """
    val = max(0.0, float(consideration))
    min_fee = 35000.0

    if val <= 1000000:
        base_fee = max(val * 0.02, min_fee)
        formula_desc = "2% of consideration (min Kshs 35,000)"
    elif val <= 5000000:
        excess = val - 1000000
        base_fee = 35000.0 + (excess * 0.015)
        formula_desc = f"Kshs 35,000 + 1.5% of excess over 1M (excess: Kshs {excess:,.2f})"
    else:
        excess = val - 5000000
        base_fee = 95000.0 + (excess * 0.010)
        formula_desc = f"Kshs 95,000 + 1.0% of excess over 5M (excess: Kshs {excess:,.2f})"

    if is_mortgage:
        base_fee = base_fee * 0.90
        formula_desc += " (Mortgage/Charge scale rate)"

    final_fee = max(base_fee, min_fee)
    return {
        "court": "Non-Contentious / Conveyancing",
        "schedule": "Schedule 1",
        "consideration": val,
        "is_mortgage": is_mortgage,
        "instruction_fee": round(final_fee, 2),
        "formula": formula_desc
    }

def compute_bill_of_costs(data: dict) -> dict:
    """
    Computes a complete Bill of Costs and Finot document.
    """
    court_level = data.get("court_level", "High Court")
    claim_val = float(data.get("claim_value", 0.0))
    is_def = bool(data.get("is_defendant", False))
    include_getting_up = bool(data.get("include_getting_up_fee", True))

    if court_level == "Magistrate Court":
        inst_res = calculate_subordinate_court_instruction_fee(claim_val)
    elif court_level == "Conveyancing":
        inst_res = calculate_conveyancing_instruction_fee(claim_val)
    else:
        inst_res = calculate_high_court_instruction_fee(claim_val, is_def)

    instruction_fee = inst_res["instruction_fee"]
    getting_up_fee = round(instruction_fee / 3.0, 2) if include_getting_up else 0.0

    processed_items = []
    item_no = 1
    total_itemized_taxable_fees = 0.0
    total_disbursements = 0.0

    processed_items.append({
        "item_no": item_no,
        "date": data.get("instruction_date", "2026-01-01"),
        "particulars": f"Instructions to act ({inst_res['schedule']} - {court_level}). {inst_res['formula']}",
        "disbursement": 0.0,
        "taxable_fee": instruction_fee,
        "category": "instruction_fee"
    })
    item_no += 1

    if include_getting_up:
        processed_items.append({
            "item_no": item_no,
            "date": data.get("getting_up_date", "2026-01-15"),
            "particulars": "Getting-up fee (1/3 of Instruction Fee as matter proceeded to hearing/defense)",
            "disbursement": 0.0,
            "taxable_fee": getting_up_fee,
            "category": "getting_up_fee"
        })
        item_no += 1

    for item in data.get("items", []):
        itype = item.get("type", "other")
        qty = float(item.get("quantity", 1.0))
        amt = float(item.get("amount", 0.0))
        date_str = item.get("date", "—")
        particulars = item.get("particulars", "Work done")

        disb = 0.0
        taxable_fee = 0.0

        if itype == "disbursement":
            disb = amt if amt > 0 else qty
            total_disbursements += disb
        else:
            rate = ITEM_RATES.get(itype, 0.0)
            if rate > 0:
                taxable_fee = round(qty * rate, 2)
            else:
                taxable_fee = amt
            total_itemized_taxable_fees += taxable_fee

        processed_items.append({
            "item_no": item_no,
            "date": date_str,
            "particulars": particulars,
            "disbursement": round(disb, 2),
            "taxable_fee": round(taxable_fee, 2),
            "category": itype
        })
        item_no += 1

    total_taxable_fees = round(instruction_fee + getting_up_fee + total_itemized_taxable_fees, 2)
    vat_amount = round(total_taxable_fees * VAT_RATE, 2)
    grand_total = round(total_taxable_fees + total_disbursements + vat_amount, 2)

    return {
        "court_level": court_level,
        "schedule": inst_res["schedule"],
        "claim_value": claim_val,
        "instruction_fee_breakdown": inst_res,
        "getting_up_fee": getting_up_fee,
        "itemized_taxable_fees": round(total_itemized_taxable_fees, 2),
        "total_taxable_fees": total_taxable_fees,
        "total_disbursements": round(total_disbursements, 2),
        "vat_rate_pct": 16.0,
        "vat_amount": vat_amount,
        "grand_total": grand_total,
        "items": processed_items
    }

if __name__ == "__main__":
    sample_data = {
        "court_level": "High Court",
        "claim_value": 5000000.0,
        "is_defendant": False,
        "include_getting_up_fee": True,
        "instruction_date": "2026-01-10",
        "getting_up_date": "2026-02-01",
        "items": [
            {"date": "2026-01-12", "particulars": "Drawing Plaint (15 folios)", "type": "drawing_folio", "quantity": 15},
            {"date": "2026-01-12", "particulars": "Court filing fees paid to Judiciary", "type": "disbursement", "amount": 12500.0},
            {"date": "2026-01-15", "particulars": "Formal Demand Letter to Defendant", "type": "letter_formal", "quantity": 1},
            {"date": "2026-02-10", "particulars": "Attendance in High Court for hearing (3 hrs)", "type": "attendance_court_hr", "quantity": 3.0}
        ]
    }
    result = compute_bill_of_costs(sample_data)
    print(json.dumps(result, indent=2))
