import pytest
from app.engine.remuneration_engine import (
    calculate_schedule_6_high_court,
    calculate_high_court_instruction_fee,
    calculate_schedule_7_magistrate,
    calculate_subordinate_court_instruction_fee,
    calculate_schedule_1_conveyancing,
    calculate_schedule_2_leases,
    calculate_schedule_10_probate,
    calculate_getting_up_fee,
    calculate_drawing_pleading_fee,
    calculate_statutory_interest,
    check_one_sixth_taxed_off_rule,
    calculate_bill_of_costs
)

def test_seyani_brothers_statutory_benchmark():
    """
    Assert authentic statutory figures for Seyani Brothers case (Claim: KES 30,820,193.28)
    Defended (Schedule 6 Item 1(b)): KES 662,302.90
    Undefended (Schedule 6 Item 1(a)): KES 569,802.90
    """
    claim = 30820193.28
    
    # 1. Defended Suit (100% full trial)
    res_def = calculate_schedule_6_high_court(claim, case_disposition="full_trial")
    assert res_def["instruction_fee"] == 662302.90
    
    # 2. Undefended / Ex-Parte (Item 1(a))
    res_undef = calculate_schedule_6_high_court(claim, case_disposition="undefended")
    assert res_undef["instruction_fee"] == 569802.90

def test_litigation_disposition_toggles():
    """
    Verify statutory reductions under Schedule 6 Item 1(b):
    - Full trial: 100% (KES 662,302.90)
    - Early settlement prior to hearing confirmation: 85%
    - Summary determination without full trial: 75%
    """
    claim = 30820193.28
    base_fee = 662302.90
    
    # Early settlement (85%)
    res_settle = calculate_schedule_6_high_court(claim, case_disposition="early_settlement")
    expected_settle = round(base_fee * 0.85, 2)
    assert res_settle["instruction_fee"] == expected_settle
    
    # Summary determination (75%)
    res_summary = calculate_schedule_6_high_court(claim, case_disposition="summary_determination")
    expected_summary = round(base_fee * 0.75, 2)
    assert res_summary["instruction_fee"] == expected_summary

def test_statutory_minimum_floors():
    """Schedule 6 has mandatory floor of KES 75,000 for High Court litigation."""
    res_zero = calculate_schedule_6_high_court(0)
    assert res_zero["instruction_fee"] == 75000.0
    
    res_small = calculate_schedule_6_high_court(250000)
    assert res_small["instruction_fee"] == 75000.0

def test_magistrate_court_schedule_7():
    """Schedule 7: Subordinate Courts Higher Scale."""
    # 350,000 -> 30,000 + 5% of 250,000 = 42,500.0
    res = calculate_schedule_7_magistrate(350000)
    assert res["instruction_fee"] == 42500.0

def test_getting_up_fee():
    """Schedule 6 Item 2: Getting-up fee is exactly 1/3 (33.33%) of instruction fee."""
    gup = calculate_getting_up_fee(75000.0)
    assert gup == 25000.0

def test_advocate_client_uplift_part_b():
    """Part B provides +50% statutory uplift on instruction fees for Advocate & Client bills."""
    res = calculate_bill_of_costs(
        claim_value=500000,
        court_schedule="schedule_6_high_court",
        document_type="advocate_client",
        include_getting_up=False
    )
    # Base fee is 75,000 + 50% uplift (37,500) = 112,500.0
    assert res["instruction_fee"] == 112500.0

def test_manual_custom_instruction_fee_override():
    """Section 45 / Rule 22: Freedom to override instruction fee directly."""
    res = calculate_bill_of_costs(
        claim_value=50000000,
        custom_instruction_fee=250000.0,
        include_getting_up=True
    )
    assert res["instruction_fee"] == 250000.0
    assert res["getting_up_fee"] == round(250000.0 / 3.0, 2)

def test_statutory_pleadings_drawing_rates():
    """Schedule 6 Item 4(a): KES 1,100 for <= 4 folios + KES 150 per extra folio."""
    assert calculate_drawing_pleading_fee(3) == 1100.0
    assert calculate_drawing_pleading_fee(4) == 1100.0
    # 10 folios: 1,100 + (6 * 150) = 2,000.0
    assert calculate_drawing_pleading_fee(10) == 2000.0

def test_statutory_interest_and_taxation_rules():
    """Rule 7 (14% interest) & Rule 77 (1/6th penalty)."""
    # 100,000 at 14% p.a. for 6 months = 7,000.0
    interest = calculate_statutory_interest(100000.0, 6)
    assert interest == 7000.0
    
    # Bill of 600,000: 1/6th threshold is 100,000
    p1 = check_one_sixth_taxed_off_rule(600000.0, 120000.0)
    assert p1["is_penalty"] is True
    
    p2 = check_one_sixth_taxed_off_rule(600000.0, 80000.0)
    assert p2["is_penalty"] is False

def test_other_statutory_schedules():
    """Verify Schedules 1 (Conveyancing), 2 (Leases), 8 (BPRT), 9 (RRT), 10 (Probate), 11 (Tribunals)."""
    from app.engine.remuneration_engine import (
        calculate_schedule_8_bprt,
        calculate_schedule_9_rrt,
        calculate_schedule_11_tribunals,
        calculate_schedule_12_patents,
    )

    # Schedule 1 Conveyancing: 6M -> 100,000 + 1.5% of 1M = 115,000.0
    c_res = calculate_schedule_1_conveyancing(6000000)
    assert c_res["instruction_fee"] == 115000.0

    # Schedule 2 Leases: 600k annual rent -> 75,000 + 3% of 100,000 = 78,000.0
    l_res = calculate_schedule_2_leases(600000)
    assert l_res["instruction_fee"] == 78000.0

    # Schedule 10 Probate: 2M estate -> 45,000 + 2% of 1M = 65,000.0
    p_res = calculate_schedule_10_probate(2000000)
    assert p_res["instruction_fee"] == 65000.0

    # Schedule 8 BPRT Tribunal: 300k claim -> 35,000 + 2% of 50k = 36,000.0
    b_res = calculate_schedule_8_bprt(300000)
    assert b_res["instruction_fee"] == 36000.0

    # Schedule 9 RRT Tribunal: 60k claim -> 17,640 + 2% of 10k = 17,840.0
    r_res = calculate_schedule_9_rrt(60000)
    assert r_res["instruction_fee"] == 17840.0

    # Schedule 11 Tribunals: 2M claim -> 100,000 + 1% of 1M = 110,000.0
    t_res = calculate_schedule_11_tribunals(2000000)
    assert t_res["instruction_fee"] == 110000.0

    # Schedule 12 Patents Initial: KES 42,000
    pat_res = calculate_schedule_12_patents(0)
    assert pat_res["instruction_fee"] == 42000.0