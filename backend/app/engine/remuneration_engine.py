"""
Authentic Statutory Remuneration Engine for Kenyan Advocates
Governed by The Advocates (Remuneration) Order (Legal Notice 64 of 1962, as amended up to
L.N. 35 of 2014, L.N. 45 of 2014, L.N. 268 of 2017 & L.N. 221 of 2023).
"""

import os
import math
from typing import Dict, Any, List, Optional

VAT_RATE = 0.16
ANNUAL_INTEREST_RATE = 0.14

# Statutory Prescribed Item Rates under Schedule 6 and General Scales
STATUTORY_ITEM_RATES: Dict[str, float] = {
    "drawing_pleading_base": 1100.0,       # First 4 folios or part thereof (Schedule 6 Item 4(a))
    "drawing_pleading_extra_folio": 150.0, # Each additional folio over 4
    "drawing_general_folio": 180.0,        # Schedule 6 Item 4(b) - other formal docs per folio
    "drawing_bill_of_costs_folio": 180.0,  # Schedule 6 Item 4(c) - bill of costs per folio
    "copying_folio": 25.0,                 # Schedule 6 Item 6 - copying per folio of 100 words
    "attendance_formal_registry": 1100.0,  # Schedule 6 Item 7(a) - formal attendance
    "attendance_court_hr": 2300.0,         # Schedule 6 Item 7(b) - ordinary court / conference per hr
    "attendance_court_day": 10000.0,       # Schedule 6 Item 7(c) - extended hearing full day
    "service_process_base": 1400.0,        # Schedule 6 Item 8 - process service within 3km
    "service_process_per_km": 35.0,        # Schedule 6 Item 8 - excess mileage per km
    "letter_formal": 500.0,                # Schedule 6 Item 5(a) - formal demand letter / opinion
    "letter_ordinary": 300.0,              # Schedule 6 Item 5(b) - routine letter
    "perusal_folio": 100.0,                # Schedule 6 Item 9 - perusal per folio
    "drawing_folio": 1100.0,
    "attendance_office_hr": 2300.0,
    "bill_of_costs_folio": 180.0,
    "search_registry": 1500.0,
    "service_summons": 1400.0
}

ITEM_RATES = STATUTORY_ITEM_RATES

STATUTORY_SCHEDULES: List[Dict[str, Any]] = [
    {"id": "sched_1", "key": "schedule_1_conveyancing", "number": 1, "name": "Conveyancing: Sales, Purchases, Mortgages & Charges", "citation": "Schedule 1, L.N. 35/2014", "category": "Conveyancing", "description": "Sales, purchases, transfers, legal charges, and mortgages."},
    {"id": "sched_2", "key": "schedule_2_leases", "number": 2, "name": "Leases & Tenancy Agreements at a Rack Rent", "citation": "Schedule 2, L.N. 35/2014", "category": "Leases & Tenancies", "description": "Commercial and residential leases, agreements for lease, calculated on annual rent."},
    {"id": "sched_3", "key": "schedule_3_companies", "number": 3, "name": "Formation, Incorporation & Registration of Companies", "citation": "Schedule 3, L.N. 35/2014", "category": "Corporate & Commercial", "description": "Incorporation of companies with share capital, foreign companies (minimum KES 60,000)."},
    {"id": "sched_4", "key": "schedule_4_ip", "number": 4, "name": "Trade Marks", "citation": "Schedule 4, L.N. 35/2014", "category": "Intellectual Property", "description": "Registration, oppositions, registered users, assignments, and renewals of trade marks."},
    {"id": "sched_5", "key": "schedule_5_chattels", "number": 5, "name": "Fees Not Otherwise Prescribed & Chattels Transfer", "citation": "Schedule 5, L.N. 35/2014", "category": "General & Securities", "description": "Non-contentious business, agreed hourly rates, formal opinions, debt collection scale, Chattels Transfer."},
    {"id": "sched_6", "key": "schedule_6_high_court", "number": 6, "name": "Costs of Proceedings in the High Court", "citation": "Schedule 6, L.N. 35/2014", "category": "Litigation", "description": "High Court, Environment & Land Court (ELC), Employment & Labour Relations Court (ELRC)."},
    {"id": "sched_7", "key": "schedule_7_magistrate", "number": 7, "name": "Costs of Proceedings in Subordinate Courts", "citation": "Schedule 7, L.N. 45/2014", "category": "Litigation", "description": "Litigation in Subordinate / Resident Magistrate Courts across lower and higher scales."},
    {"id": "sched_8", "key": "schedule_8_bprt", "number": 8, "name": "Tribunal under Landlord & Tenant Act (Cap. 301 - BPRT)", "citation": "Schedule 8, L.N. 35/2014", "category": "Tribunals", "description": "Business Premises Rent Tribunal (BPRT) references, distress for rent, and possession claims."},
    {"id": "sched_9", "key": "schedule_9_rrt", "number": 9, "name": "Tribunals under Rent Restriction Act (Cap. 296 - RRT)", "citation": "Schedule 9, L.N. 35/2014", "category": "Tribunals", "description": "Rent Restriction Tribunal (RRT) residential tenancy disputes, repairs, and assessment proceedings."},
    {"id": "sched_10", "key": "schedule_10_probate", "number": 10, "name": "Probate and Administration", "citation": "Schedule 10, L.N. 35/2014", "category": "Probate & Estate", "description": "Grants of probate, letters of administration, resealing, testate and intestate distribution."},
    {"id": "sched_11", "key": "schedule_11_tribunals", "number": 11, "name": "Proceedings Before Tribunals Other Than Schedules 8 & 9", "citation": "Schedule 11, L.N. 35/2014", "category": "Tribunals", "description": "Co-operative Tribunal, Tax Appeals Tribunal (TAT), Political Parties Disputes Tribunal, Energy Tribunal."},
    {"id": "sched_12", "key": "schedule_12_patents", "number": 12, "name": "Patents, Utility Models and Industrial Designs", "citation": "Schedule 12, L.N. 35/2014", "category": "Intellectual Property", "description": "Registration of patents, utility models, industrial designs, KIPI proceedings, and Tribunal appeals."}
]

STATUTORY_RULES: Dict[str, Dict[str, Any]] = {
    "rule_7": {"rule_number": "Rule 7", "name": "Statutory Interest on Advocate's Bill", "rate": 0.14, "description": "14% p.a. statutory interest chargeable after 30 days."},
    "rule_77": {"rule_number": "Rule 77", "name": "One-Sixth (1/6th) Taxation Penalty Threshold", "ratio": 1.0 / 6.0, "description": "If 1/6th or more taxed off, advocate pays taxation costs."},
    "part_b_uplift": {"rule_number": "Part B", "name": "Advocate & Client Statutory Uplift", "rate": 0.50, "description": "+50% statutory increase over party & party scale."},
    "getting_up_fee": {"rule_number": "Schedule 6 Item 2", "name": "Getting-Up Fee for Defended Hearing", "ratio": 1.0 / 3.0, "description": "One-third (1/3) of instruction fee for defended trial preparation."},
    "early_settlement": {"rule_number": "Schedule 6 Item 1(c)", "name": "Early Settlement Prior to Hearing Confirmation", "ratio": 0.85, "description": "85% of defended instruction fee."},
    "summary_determination": {"rule_number": "Schedule 6 Item 1(b) Prov.", "name": "Summary Determination Without Full Trial", "ratio": 0.75, "description": "75% of defended instruction fee."}
}

def get_statutory_db_data() -> Dict[str, Any]:
    return {"schedules": STATUTORY_SCHEDULES, "rates": STATUTORY_ITEM_RATES, "rules": STATUTORY_RULES, "source": "embedded_statutory_order"}
# -----------------------------------------------------------------------------
# STATUTORY INSTRUCTION FEE CALCULATORS FOR ALL 12 SCHEDULES
# -----------------------------------------------------------------------------

def calculate_schedule_1_conveyancing(value: float, role: str = "purchaser") -> Dict[str, Any]:
    val = max(0.0, float(value))
    min_fee = 35000.0 if role in ["purchaser", "vendor"] else 40000.0

    if val == 0.0:
        base_fee = min_fee
        formula = f"Statutory minimum floor for non-monetary / unquantified property: KES {min_fee:,.2f}"
    elif val <= 5000000:
        base_fee = max(min_fee, val * 0.02)
        formula = f"First KES 5M at 2.0% (Calculated: KES {val * 0.02:,.2f}, Floor: KES {min_fee:,.2f})"
    elif val <= 10000000:
        excess = val - 5000000
        base_fee = 100000.0 + (excess * 0.015)
        formula = f"KES 100,000 + 1.5% of excess over 5M (excess: KES {excess:,.2f})"
    elif val <= 20000000:
        excess = val - 10000000
        base_fee = 175000.0 + (excess * 0.010)
        formula = f"KES 175,000 + 1.0% of excess over 10M (excess: KES {excess:,.2f})"
    else:
        excess = val - 20000000
        base_fee = 275000.0 + (excess * 0.0075)
        formula = f"KES 275,000 + 0.75% of excess over 20M (excess: KES {excess:,.2f})"

    return {
        "schedule": "Schedule 1",
        "court_or_domain": "Conveyancing & Immovable Property",
        "claim_value": val,
        "instruction_fee": round(base_fee, 2),
        "minimum_prescribed_fee": min_fee,
        "formula": formula
    }

def calculate_schedule_2_leases(annual_rent: float, is_perusing: bool = False) -> Dict[str, Any]:
    val = max(0.0, float(annual_rent))
    min_fee = 20000.0

    if val <= 500000:
        base_fee = max(min_fee, val * 0.15) if val > 0 else min_fee
        formula = f"Schedule 2: 15% of annual rent up to KES 500,000 (minimum KES {min_fee:,.2f})"
    elif val <= 3000000:
        excess = val - 500000.0
        base_fee = 75000.0 + (excess * 0.03)
        formula = f"Schedule 2: KES 75,000 + 3.0% of excess over 500k (excess: KES {excess:,.2f})"
    else:
        excess = val - 3000000.0
        base_fee = 150000.0 + (excess * 0.01)
        formula = f"Schedule 2: KES 150,000 + 1.0% of excess over 3M (excess: KES {excess:,.2f})"

    if is_perusing:
        base_fee = base_fee * 0.50
        formula += " [Perusing / Approving advocate: 50% under Item 2]"

    return {
        "schedule": "Schedule 2",
        "court_or_domain": "Leases & Tenancy Agreements at a Rack Rent",
        "claim_value": val,
        "instruction_fee": round(base_fee, 2),
        "minimum_prescribed_fee": min_fee if not is_perusing else min_fee * 0.5,
        "formula": formula
    }

def calculate_schedule_3_companies(nominal_capital: float) -> Dict[str, Any]:
    val = max(0.0, float(nominal_capital))
    min_fee = 50000.0
    if val <= 1000000:
        base_fee = min_fee
        formula = "Nominal share capital up to KES 1,000,000 (Prescribed minimum KES 50,000)"
    else:
        excess = val - 1000000
        base_fee = 50000.0 + (excess * 0.01)
        formula = f"KES 50,000 + 1.0% of excess over 1M (excess: KES {excess:,.2f})"

    return {
        "schedule": "Schedule 3",
        "court_or_domain": "Company Formation & Securities",
        "claim_value": val,
        "instruction_fee": round(base_fee, 2),
        "minimum_prescribed_fee": min_fee,
        "formula": formula
    }

def calculate_schedule_4_ip(value: float = 0.0) -> Dict[str, Any]:
    min_fee = 40000.0
    val = max(0.0, float(value))
    base_fee = min_fee if val <= 500000 else min_fee + (val - 500000) * 0.01
    return {
        "schedule": "Schedule 4",
        "court_or_domain": "Trade Marks, Patents & Intellectual Property",
        "claim_value": val,
        "instruction_fee": round(base_fee, 2),
        "minimum_prescribed_fee": min_fee,
        "formula": "Statutory IP scale (Minimum KES 40,000)"
    }

def calculate_schedule_5_chattels(value: float) -> Dict[str, Any]:
    val = max(0.0, float(value))
    min_fee = 20000.0
    if val <= 500000:
        base_fee = min_fee
        formula = "Movable property value up to KES 500,000 (Minimum KES 20,000)"
    else:
        excess = val - 500000
        base_fee = 20000.0 + (excess * 0.025)
        formula = f"KES 20,000 + 2.5% of excess over 500k (excess: KES {excess:,.2f})"

    return {
        "schedule": "Schedule 5",
        "court_or_domain": "Chattels Transfer & Movable Property",
        "claim_value": val,
        "instruction_fee": round(base_fee, 2),
        "minimum_prescribed_fee": min_fee,
        "formula": formula
    }

def calculate_schedule_6_high_court(
    value: float,
    case_disposition: str = "full_trial",
    is_defendant: bool = False
) -> Dict[str, Any]:
    val = max(0.0, float(value))
    is_undefended = (case_disposition == "undefended")

    if is_undefended:
        min_fee = 75000.0
        if val <= 500000:
            calc_fee = 45000.0
            formula = "Schedule 6 Item 1(a) Undefended up to 500k: KES 45,000 (Statutory floor KES 75,000 where plaint filed)"
        elif val <= 750000:
            calc_fee = 56250.0
            formula = "Schedule 6 Item 1(a) Undefended 500k - 750k: KES 56,250 (Subject to minimum KES 75,000)"
        elif val <= 1000000:
            calc_fee = 75000.0
            formula = "Schedule 6 Item 1(a) Undefended 750k - 1M: KES 75,000"
        elif val <= 20000000:
            excess = val - 1000000
            calc_fee = 75000.0 + (excess * 0.0175)
            formula = f"Schedule 6 Item 1(a) Undefended: KES 75,000 + 1.75% of excess over 1M (excess: KES {excess:,.2f})"
        else:
            excess = val - 20000000
            calc_fee = 407500.0 + (excess * 0.015)
            formula = f"Schedule 6 Item 1(a) Undefended: KES 407,500 + 1.5% of excess over 20M (excess: KES {excess:,.2f})"
        
        final_fee = max(min_fee, calc_fee)
    else:
        min_fee = 75000.0
        if val <= 500000:
            base_fee = 75000.0
            formula = "Schedule 6 Item 1(b) Defended mandatory statutory floor: KES 75,000"
        elif val <= 750000:
            base_fee = 90000.0
            formula = "Schedule 6 Item 1(b) Defended scale 500k - 750k: KES 90,000"
        elif val <= 1000000:
            base_fee = 120000.0
            formula = "Schedule 6 Item 1(b) Defended scale 750k - 1M: KES 120,000"
        elif val <= 20000000:
            excess = val - 1000000
            base_fee = 120000.0 + (excess * 0.02)
            formula = f"Schedule 6 Item 1(b) Defended: KES 120,000 + 2.0% of excess over 1M (excess: KES {excess:,.2f})"
        else:
            excess = val - 20000000
            base_fee = 500000.0 + (excess * 0.015)
            formula = f"Schedule 6 Item 1(b) Defended: KES 500,000 + 1.5% of excess over 20M (excess: KES {excess:,.2f})"

        base_fee = round(base_fee, 2)
        if case_disposition == "early_settlement":
            final_fee = round(base_fee * 0.85, 2)
            formula += f" -> Early settlement (85%): KES {final_fee:,.2f}"
        elif case_disposition == "summary_determination":
            final_fee = round(base_fee * 0.75, 2)
            formula += f" -> Summary determination without trial (75%): KES {final_fee:,.2f}"
        else:
            final_fee = base_fee

        final_fee = max(min_fee, final_fee)

    return {
        "schedule": "Schedule 6",
        "court_or_domain": "High Court / ELRC / ELC Litigation",
        "claim_value": val,
        "is_defendant": is_defendant,
        "case_disposition": case_disposition,
        "instruction_fee": round(final_fee, 2),
        "minimum_prescribed_fee": min_fee,
        "formula": formula
    }

def calculate_high_court_instruction_fee(value: float, is_defendant: bool = False) -> Dict[str, Any]:
    return calculate_schedule_6_high_court(value=value, case_disposition="full_trial", is_defendant=is_defendant)

def calculate_schedule_7_magistrate(value: float) -> Dict[str, Any]:
    val = max(0.0, float(value))
    min_fee = 30000.0

    if val <= 100000:
        base_fee = 20000.0
        formula = "Schedule 7 Higher Scale up to 100k: KES 20,000 (Subject to minimum KES 30,000)"
    elif val <= 500000:
        excess = val - 100000
        base_fee = 30000.0 + (excess * 0.05)
        formula = f"Schedule 7: KES 30,000 + 5.0% of excess over 100k (excess: KES {excess:,.2f})"
    elif val <= 1000000:
        excess = val - 500000
        base_fee = 50000.0 + (excess * 0.03)
        formula = f"Schedule 7: KES 50,000 + 3.0% of excess over 500k (excess: KES {excess:,.2f})"
    else:
        excess = val - 1000000
        base_fee = 65000.0 + (excess * 0.02)
        formula = f"Schedule 7: KES 65,000 + 2.0% of excess over 1M (excess: KES {excess:,.2f})"

    final_fee = max(min_fee, base_fee)
    return {
        "schedule": "Schedule 7",
        "court_or_domain": "Subordinate / Magistrate's Court",
        "claim_value": val,
        "instruction_fee": round(final_fee, 2),
        "minimum_prescribed_fee": min_fee,
        "formula": formula
    }

def calculate_subordinate_court_instruction_fee(value: float) -> Dict[str, Any]:
    return calculate_schedule_7_magistrate(value)

def calculate_schedule_8_bprt(value: float, lower_scale: bool = False) -> Dict[str, Any]:
    val = max(0.0, float(value))
    if lower_scale:
        if val <= 10000:
            base_fee = 1293.0
            formula = "Schedule 8 BPRT Lower Scale: Up to KES 10,000 = KES 1,293"
        elif val <= 20000:
            base_fee = 2000.0
            formula = "Schedule 8 BPRT Lower Scale: KES 10,001 - 20,000 = KES 2,000"
        elif val <= 50000:
            base_fee = 8000.0
            formula = "Schedule 8 BPRT Lower Scale: KES 20,001 - 50,000 = KES 8,000"
        elif val <= 100000:
            base_fee = 15000.0
            formula = "Schedule 8 BPRT Lower Scale: KES 50,001 - 100,000 = KES 15,000"
        elif val <= 250000:
            base_fee = 22500.0
            formula = "Schedule 8 BPRT Lower Scale: KES 100,001 - 250,000 = KES 22,500"
        else:
            excess = val - 250000.0
            base_fee = 22500.0 + (excess * 0.01)
            formula = f"Schedule 8 BPRT Lower Scale: KES 22,500 + 1% of excess over 250k (excess: KES {excess:,.2f})"
        min_fee = 1293.0
    else:
        if val <= 10000:
            base_fee = 5000.0
            formula = "Schedule 8 BPRT Higher Scale: Up to KES 10,000 = KES 5,000"
        elif val <= 20000:
            base_fee = 8000.0
            formula = "Schedule 8 BPRT Higher Scale: KES 10,001 - 20,000 = KES 8,000"
        elif val <= 50000:
            base_fee = 15000.0
            formula = "Schedule 8 BPRT Higher Scale: KES 20,001 - 50,000 = KES 15,000"
        elif val <= 100000:
            base_fee = 22500.0
            formula = "Schedule 8 BPRT Higher Scale: KES 50,001 - 100,000 = KES 22,500"
        elif val <= 250000:
            base_fee = 35000.0
            formula = "Schedule 8 BPRT Higher Scale: KES 100,001 - 250,000 = KES 35,000"
        else:
            excess = val - 250000.0
            base_fee = 35000.0 + (excess * 0.02)
            formula = f"Schedule 8 BPRT Higher Scale: KES 35,000 + 2% of excess over 250k (excess: KES {excess:,.2f})"
        min_fee = 5000.0

    return {
        "schedule": "Schedule 8",
        "court_or_domain": "Landlord & Tenant Tribunal (Cap. 301 - BPRT)",
        "claim_value": val,
        "instruction_fee": round(base_fee, 2),
        "minimum_prescribed_fee": min_fee,
        "formula": formula
    }

def calculate_schedule_8_court_of_appeal(value: float) -> Dict[str, Any]:
    hc = calculate_schedule_6_high_court(value, "full_trial")
    base_fee = max(100000.0, hc["instruction_fee"] * 1.333333)
    return {
        "schedule": "Schedule 8 (Appellate)",
        "court_or_domain": "Court of Appeal Civil/Criminal Appeals",
        "claim_value": float(value),
        "instruction_fee": round(base_fee, 2),
        "minimum_prescribed_fee": 100000.0,
        "formula": "Court of Appeal scale (High Court + 33.33% appeal factor, minimum KES 100,000)"
    }

def calculate_schedule_9_rrt(value: float, lower_scale: bool = False) -> Dict[str, Any]:
    val = max(0.0, float(value))
    if lower_scale:
        if val <= 1000:
            base_fee = 1293.0
            formula = "Schedule 9 RRT Lower Scale: Up to KES 1,000 = KES 1,293"
        elif val <= 2000:
            base_fee = 2117.0
            formula = "Schedule 9 RRT Lower Scale: KES 1,001 - 2,000 = KES 2,117"
        elif val <= 3500:
            base_fee = 2499.0
            formula = "Schedule 9 RRT Lower Scale: KES 2,001 - 3,500 = KES 2,499"
        elif val <= 5000:
            base_fee = 3528.0
            formula = "Schedule 9 RRT Lower Scale: KES 3,501 - 5,000 = KES 3,528"
        elif val <= 7500:
            base_fee = 4704.0
            formula = "Schedule 9 RRT Lower Scale: KES 5,001 - 7,500 = KES 4,704"
        elif val <= 10000:
            base_fee = 5880.0
            formula = "Schedule 9 RRT Lower Scale: KES 7,501 - 10,000 = KES 5,880"
        elif val <= 20000:
            base_fee = 8820.0
            formula = "Schedule 9 RRT Lower Scale: KES 10,001 - 20,000 = KES 8,820"
        elif val <= 50000:
            base_fee = 10290.0
            formula = "Schedule 9 RRT Lower Scale: KES 20,001 - 50,000 = KES 10,290"
        else:
            excess = val - 50000.0
            base_fee = 10290.0 + (excess * 0.01)
            formula = f"Schedule 9 RRT Lower Scale: KES 10,290 + 1% of excess over 50k (excess: KES {excess:,.2f})"
        min_fee = 1293.0
    else:
        if val <= 1000:
            base_fee = 2352.0
            formula = "Schedule 9 RRT Higher Scale: Up to KES 1,000 = KES 2,352"
        elif val <= 2000:
            base_fee = 4116.0
            formula = "Schedule 9 RRT Higher Scale: KES 1,001 - 2,000 = KES 4,116"
        elif val <= 3500:
            base_fee = 4998.0
            formula = "Schedule 9 RRT Higher Scale: KES 2,001 - 3,500 = KES 4,998"
        elif val <= 5000:
            base_fee = 8232.0
            formula = "Schedule 9 RRT Higher Scale: KES 3,501 - 5,000 = KES 8,232"
        elif val <= 7500:
            base_fee = 10584.0
            formula = "Schedule 9 RRT Higher Scale: KES 5,001 - 7,500 = KES 10,584"
        elif val <= 10000:
            base_fee = 11760.0
            formula = "Schedule 9 RRT Higher Scale: KES 7,501 - 10,000 = KES 11,760"
        elif val <= 20000:
            base_fee = 14700.0
            formula = "Schedule 9 RRT Higher Scale: KES 10,001 - 20,000 = KES 14,700"
        elif val <= 50000:
            base_fee = 17640.0
            formula = "Schedule 9 RRT Higher Scale: KES 20,001 - 50,000 = KES 17,640"
        else:
            excess = val - 50000.0
            base_fee = 17640.0 + (excess * 0.02)
            formula = f"Schedule 9 RRT Higher Scale: KES 17,640 + 2% of excess over 50k (excess: KES {excess:,.2f})"
        min_fee = 2352.0

    return {
        "schedule": "Schedule 9",
        "court_or_domain": "Rent Restriction Tribunal (Cap. 296 - RRT)",
        "claim_value": val,
        "instruction_fee": round(base_fee, 2),
        "minimum_prescribed_fee": min_fee,
        "formula": formula
    }

def calculate_schedule_9_supreme_court(value: float) -> Dict[str, Any]:
    hc = calculate_schedule_6_high_court(value, "full_trial")
    base_fee = max(150000.0, hc["instruction_fee"] * 1.50)
    return {
        "schedule": "Schedule 9 (Appellate)",
        "court_or_domain": "Supreme Court of Kenya",
        "claim_value": float(value),
        "instruction_fee": round(base_fee, 2),
        "minimum_prescribed_fee": 150000.0,
        "formula": "Supreme Court scale (High Court x 1.5x complexity, minimum KES 150,000)"
    }

def calculate_schedule_10_probate(estate_value: float, is_contested: bool = False) -> Dict[str, Any]:
    val = max(0.0, float(estate_value))
    min_fee = 45000.0

    if val <= 1000000:
        base_fee = min_fee
        formula = f"Schedule 10: Gross estate value up to KES 1M (minimum KES {min_fee:,.2f})"
    elif val <= 5000000:
        excess = val - 1000000.0
        base_fee = 45000.0 + (excess * 0.02)
        formula = f"Schedule 10: KES 45,000 + 2.0% of excess over 1M (excess: KES {excess:,.2f})"
    else:
        excess = val - 5000000.0
        base_fee = 125000.0 + (excess * 0.01)
        formula = f"Schedule 10: KES 125,000 + 1.0% of excess over 5M (excess: KES {excess:,.2f})"

    if is_contested:
        base_fee = max(base_fee * 2.0, 90000.0)
        formula += " [Contested Grant: Not less than twice uncontested fee under Item 1(d)]"

    return {
        "schedule": "Schedule 10",
        "court_or_domain": "Probate & Estate Administration",
        "claim_value": val,
        "instruction_fee": round(base_fee, 2),
        "minimum_prescribed_fee": min_fee if not is_contested else 90000.0,
        "formula": formula
    }


def calculate_schedule_11_tribunals(value: float, lower_scale: bool = False) -> Dict[str, Any]:
    val = max(0.0, float(value))
    if val <= 50000:
        base_fee = 17640.0
        formula = "Schedule 11: Up to KES 50,000 = KES 17,640"
    elif val <= 100000:
        base_fee = 23520.0
        formula = "Schedule 11: KES 50,001 - 100,000 = KES 23,520"
    elif val <= 200000:
        base_fee = 35280.0
        formula = "Schedule 11: KES 100,001 - 200,000 = KES 35,280"
    elif val <= 500000:
        base_fee = 58800.0
        formula = "Schedule 11: KES 200,001 - 500,000 = KES 58,800"
    elif val <= 1000000:
        base_fee = 100000.0
        formula = "Schedule 11: KES 500,001 - 1,000,000 = KES 100,000"
    elif val <= 20000000:
        excess = val - 1000000.0
        base_fee = 100000.0 + (excess * 0.01)
        formula = f"Schedule 11: KES 100,000 + 1% of excess over 1M (excess: KES {excess:,.2f})"
    elif val <= 250000000:
        excess = val - 20000000.0
        base_fee = 290000.0 + (excess * 0.005)
        formula = f"Schedule 11: KES 290,000 + 0.5% of excess over 20M (excess: KES {excess:,.2f})"
    else:
        excess = val - 250000000.0
        base_fee = 1440000.0 + (excess * 0.001)
        formula = f"Schedule 11: KES 1,440,000 + 0.1% of excess over 250M (excess: KES {excess:,.2f})"

    if lower_scale:
        base_fee = base_fee * 0.50
        formula += " [Lower Scale: 50% under Item 8(b)]"

    return {
        "schedule": "Schedule 11",
        "court_or_domain": "Tribunals (Other Than Sched 8 & 9 - TAT, Co-op, etc.)",
        "claim_value": val,
        "instruction_fee": round(base_fee, 2),
        "minimum_prescribed_fee": 17640.0 if not lower_scale else 8820.0,
        "formula": formula
    }

def calculate_schedule_12_patents(value: float = 0.0, is_contentious: bool = False) -> Dict[str, Any]:
    val = max(0.0, float(value))
    if is_contentious:
        min_fee = 210000.0
        base_fee = max(min_fee, val * 0.02) if val > 0 else min_fee
        formula = f"Schedule 12 Item 10: Contentious IP Proceedings (Mandatory statutory minimum KES {min_fee:,.2f})"
    else:
        min_fee = 42000.0
        base_fee = min_fee
        formula = f"Schedule 12 Item 1: Initial Patent / Design / Utility Model Application (Statutory fee KES {min_fee:,.2f})"

    return {
        "schedule": "Schedule 12",
        "court_or_domain": "Patents, Utility Models & Industrial Designs",
        "claim_value": val,
        "instruction_fee": round(base_fee, 2),
        "minimum_prescribed_fee": min_fee,
        "formula": formula
    }

def calculate_schedule_12_general(value: float) -> Dict[str, Any]:
    return calculate_schedule_12_patents(value, is_contentious=True)

def calculate_conveyancing_instruction_fee(value: float, role: str = "purchaser") -> Dict[str, Any]:
    return calculate_schedule_1_conveyancing(value, role)
# -----------------------------------------------------------------------------
# STATUTORY RULES FUNCTIONS
# -----------------------------------------------------------------------------

def calculate_getting_up_fee(instruction_fee: float) -> float:
    return round(float(instruction_fee) / 3.0, 2)

def calculate_statutory_interest(bill_amount: float, months_overdue: int) -> float:
    if months_overdue <= 0:
        return 0.0
    yearly = float(bill_amount) * ANNUAL_INTEREST_RATE
    interest = yearly * (float(months_overdue) / 12.0)
    return round(interest, 2)

def check_one_sixth_taxed_off_rule(original_bill: float, taxed_off_amount: float) -> Dict[str, Any]:
    threshold = round(float(original_bill) / 6.0, 2)
    is_penalty = float(taxed_off_amount) > threshold
    message = (
        f"Penalty applies under Rule 77: Taxed off amount (KES {float(taxed_off_amount):,.2f}) exceeds 1/6th threshold (KES {threshold:,.2f}). Advocate pays taxation costs."
        if is_penalty
        else f"No penalty under Rule 77: Taxed off amount (KES {float(taxed_off_amount):,.2f}) is within 1/6th threshold (KES {threshold:,.2f}). Opposing party/client pays taxation costs."
    )
    return {
        "is_penalty": is_penalty,
        "threshold_amount": threshold,
        "taxed_off_amount": float(taxed_off_amount),
        "message": message
    }

def calculate_drawing_pleading_fee(folios: float) -> float:
    f = max(1.0, float(folios))
    if f <= 4.0:
        return 1100.0
    extra = f - 4.0
    return round(1100.0 + (extra * 150.0), 2)


# -----------------------------------------------------------------------------
# MASTER COMPREHENSIVE BILL OF COSTS / FEE NOTE CALCULATION
# -----------------------------------------------------------------------------

def calculate_bill_of_costs(
    claim_value: float,
    court_schedule: str = "schedule_6_high_court",
    is_defendant: bool = False,
    include_getting_up: bool = True,
    item_folios: List[Dict[str, Any]] = None,
    disbursements: float = 0.0,
    complexity_multiplier: float = 1.0,
    months_overdue: int = 0,
    apply_vat: bool = True,
    document_type: str = "party_party",
    custom_instruction_fee: Optional[float] = None,
    case_disposition: str = "full_trial"
) -> Dict[str, Any]:
    val = max(0.0, float(claim_value))
    sched_key = court_schedule.lower().replace("-", "_")

    if custom_instruction_fee is not None and float(custom_instruction_fee) > 0:
        instruction_fee = round(float(custom_instruction_fee), 2)
        schedule_label = court_schedule
        formula_text = f"Manual / Agreed Instruction Fee Override (Section 45 / Rule 22): KES {instruction_fee:,.2f}"
    else:
        if "12" in sched_key or "patent" in sched_key or "arbitrat" in sched_key:
            res = calculate_schedule_12_patents(val, is_contentious=True)
        elif "11" in sched_key or "tribunals_other" in sched_key or "quasi" in sched_key:
            res = calculate_schedule_11_tribunals(val)
        elif "10" in sched_key or "probate" in sched_key or "estate" in sched_key or "succession" in sched_key:
            res = calculate_schedule_10_probate(val)
        elif "supreme" in sched_key:
            res = calculate_schedule_9_supreme_court(val)
        elif "9" in sched_key or "rrt" in sched_key or "rent_restrict" in sched_key:
            res = calculate_schedule_9_rrt(val)
        elif "appeal" in sched_key:
            res = calculate_schedule_8_court_of_appeal(val)
        elif "8" in sched_key or "bprt" in sched_key or "landlord" in sched_key:
            res = calculate_schedule_8_bprt(val)
        elif "7" in sched_key or "magistrate" in sched_key or "subordinate" in sched_key or ("sched_5" in sched_key and "magistrate" in sched_key):
            res = calculate_schedule_7_magistrate(val)
        elif "5" in sched_key or "chattel" in sched_key:
            res = calculate_schedule_5_chattels(val)
        elif "4" in sched_key or "ip" in sched_key or "trademark" in sched_key:
            res = calculate_schedule_4_ip(val)
        elif "3" in sched_key or "compan" in sched_key:
            res = calculate_schedule_3_companies(val)
        elif "2" in sched_key or "lease" in sched_key:
            res = calculate_schedule_2_leases(val)
        elif "1" in sched_key or "conveyanc" in sched_key:
            res = calculate_schedule_1_conveyancing(val, "purchaser")
        else:
            res = calculate_schedule_6_high_court(val, case_disposition=case_disposition, is_defendant=is_defendant)

        instruction_fee = res["instruction_fee"]
        formula_text = res["formula"]
        schedule_label = res["schedule"]

    # Advocate & Client Bill statutory uplift: +50% under Part B
    if document_type == "advocate_client":
        uplift = round(instruction_fee * 0.50, 2)
        instruction_fee = round(instruction_fee + uplift, 2)
        formula_text += f" + 50% Advocate & Client statutory uplift under Part B (+KES {uplift:,.2f})"

    if complexity_multiplier > 1.0:
        instruction_fee = round(instruction_fee * complexity_multiplier, 2)
        formula_text += f" [Complexity Multiplier: {complexity_multiplier}x]"

    getting_up_fee = calculate_getting_up_fee(instruction_fee) if include_getting_up else 0.0

    items_total = 0.0
    processed_items = []
    if item_folios:
        for item in item_folios:
            itype = item.get("type", "drawing_pleading_base")
            qty = float(item.get("qty", 1.0))
            custom_rate = item.get("unitRate") or item.get("unit_rate") or item.get("amount")
            
            if custom_rate is not None and float(custom_rate) > 0:
                rate = float(custom_rate)
                subtotal = round(qty * rate, 2)
            elif itype in ["drawing_pleading_base", "drawing_folio", "drawing_plaint"]:
                subtotal = calculate_drawing_pleading_fee(qty)
                rate = round(subtotal / qty, 2) if qty > 0 else 1100.0
            else:
                rate = STATUTORY_ITEM_RATES.get(itype, STATUTORY_ITEM_RATES.get("drawing_general_folio", 180.0))
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
    vat_amount = round(taxable_subtotal * VAT_RATE, 2) if apply_vat else 0.0
    grand_total = round(taxable_subtotal + vat_amount + float(disbursements), 2)
    interest_14 = calculate_statutory_interest(grand_total, months_overdue)

    return {
        "schedule": schedule_label,
        "formula": formula_text,
        "claim_value": val,
        "instruction_fee": instruction_fee,
        "getting_up_fee": getting_up_fee,
        "complexity_multiplier": complexity_multiplier,
        "items_total": round(items_total, 2),
        "taxable_subtotal": round(taxable_subtotal, 2),
        "apply_vat": apply_vat,
        "document_type": document_type,
        "case_disposition": case_disposition,
        "custom_instruction_fee": custom_instruction_fee,
        "vat_amount": vat_amount,
        "disbursements": round(float(disbursements), 2),
        "grand_total": grand_total,
        "interest_14_percent": interest_14,
        "months_overdue": months_overdue,
        "grand_total_with_interest": round(grand_total + interest_14, 2),
        "items": processed_items
    }

# Backward compatibility alias
calculate_statutory_bill_of_costs = calculate_bill_of_costs
