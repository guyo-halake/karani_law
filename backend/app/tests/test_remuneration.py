import pytest
from app.engine.remuneration_engine import (
    calculate_high_court_instruction_fee,
    calculate_subordinate_court_instruction_fee,
    calculate_getting_up_fee,
    calculate_bill_of_costs
)

def test_high_court_instruction_fee_scales():
    # Value <= 500k -> base 45k, min 75k floor for plaintiff
    res1 = calculate_high_court_instruction_fee(300000)
    assert res1["instruction_fee"] == 75000.0

    # Value = 30,820,193.28 (Seyani Brothers Case)
    # Excess over 20M: 10,820,193.28 * 0.0075 = 81,151.45
    # Base = 320,000 + 81,151.45 = 401,151.45
    res2 = calculate_high_court_instruction_fee(30820193.28)
    assert res2["instruction_fee"] == 401151.45

def test_subordinate_court_instruction_fee():
    # Value = 350,000 -> 30,000 + 5% of 250k = 42,500
    res = calculate_subordinate_court_instruction_fee(350000)
    assert res["instruction_fee"] == 42500.0

def test_getting_up_fee():
    # 33.33% of 75,000 -> 25,000.0
    gup = calculate_getting_up_fee(75000)
    assert gup == 25000.0

def test_full_bill_of_costs_calculation():
    items = [
        {"type": "drawing_folio", "qty": 10, "description": "Drawing Plaint"}, # 10 * 500 = 5,000
        {"type": "copying_folio", "qty": 20, "description": "Copying Exhibits"}  # 20 * 50 = 1,000
    ]
    # Claim value = 2,000,000
    # Schedule 6: 75,000 + 1.75% of 1M = 92,500 instruction fee
    # Getting up: 92,500 / 3 = 30,833.33
    # Items: 6,000
    # Subtotal: 92,500 + 30,833.33 + 6,000 = 129,333.33
    # VAT 16%: 20,693.33
    # Disbursements: 5,000
    # Grand Total: 129,333.33 + 20,693.33 + 5,000 = 155,026.66
    res = calculate_bill_of_costs(
        claim_value=2000000,
        court_schedule="schedule_6_high_court",
        is_defendant=False,
        include_getting_up=True,
        item_folios=items,
        disbursements=5000.0
    )
    assert res["instruction_fee"] == 92500.0
    assert res["taxable_subtotal"] == 129333.33
    assert res["vat_amount"] == 20693.33
    assert res["grand_total"] == 155026.66
