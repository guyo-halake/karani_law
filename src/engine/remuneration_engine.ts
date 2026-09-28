/**
 * Complete Statutory Remuneration Engine for Kenyan Advocates (Remuneration) (Amendment) Order
 * Ref: Kenya Law L.N. 64/1962 (ed. 2022) & L.N. 35/2014 Amendment Order
 */

export const VAT_RATE = 0.16;
export const ANNUAL_INTEREST_RATE = 0.14; // Sec. 7 Statutory Interest 14% p.a.

export const ITEM_RATES: Record<string, number> = {
  drawing_folio: 500.0,         // Per folio of 100 words (drawing pleadings, affidavits, plaints, etc.)
  copying_folio: 50.0,          // Per folio of 100 words (copying documents for court/parties)
  attendance_court_hr: 2500.0,  // Per hour in court
  attendance_office_hr: 1500.0, // Per hour in office consultation
  letter_formal: 500.0,         // Per formal demand letter / opinion letter
  letter_ordinary: 300.0,       // Per ordinary letter
  perusal_folio: 100.0,         // Per folio perused
  search_registry: 1500.0,      // Land or Companies registry search
  service_summons: 1000.0,      // Service of court process
  bill_of_costs_folio: 500.0   // Drawing Bill of Costs per folio
};

export interface InstructionFeeResult {
  court_or_domain: string;
  schedule: string;
  claim_value: number;
  is_defendant?: boolean;
  raw_calculated_fee: number;
  minimum_prescribed_fee: number;
  instruction_fee: number;
  formula: string;
}

export interface BillItem {
  description: string;
  type: string;
  qty: number;
  unit_rate?: number;
  subtotal?: number;
}

export interface BillOfCostsResult {
  schedule: string;
  formula: string;
  claim_value: number;
  instruction_fee: number;
  getting_up_fee: number;
  complexity_multiplier: number;
  items_total: number;
  taxable_subtotal: number;
  vat_amount: number;
  disbursements: number;
  grand_total: number;
  interest_14_percent: number;
  months_overdue: number;
  grand_total_with_interest: number;
  items: BillItem[];
}

/**
 * Schedule 1 — Conveyancing & Sales of Immovable Property
 */
export function calculate_schedule_1_conveyancing(value: number, role: 'vendor' | 'purchaser' = 'purchaser'): InstructionFeeResult {
  const val = Math.max(0.0, value);
  const min_fee = 35000.0;
  let base_fee = 0;
  let formula_desc = '';

  if (val <= 1000000) {
    base_fee = 35000.0;
    formula_desc = 'Fixed minimum for value up to Kshs 1,000,000';
  } else if (val <= 5000000) {
    const excess = val - 1000000;
    base_fee = 35000.0 + (excess * 0.02);
    formula_desc = `Kshs 35,000 + 2.0% of excess over 1M (excess: Kshs ${excess.toLocaleString()})`;
  } else if (val <= 10000000) {
    const excess = val - 5000000;
    base_fee = 115000.0 + (excess * 0.015);
    formula_desc = `Kshs 115,000 + 1.5% of excess over 5M (excess: Kshs ${excess.toLocaleString()})`;
  } else if (val <= 20000000) {
    const excess = val - 10000000;
    base_fee = 190000.0 + (excess * 0.010);
    formula_desc = `Kshs 190,000 + 1.0% of excess over 10M (excess: Kshs ${excess.toLocaleString()})`;
  } else {
    const excess = val - 20000000;
    base_fee = 290000.0 + (excess * 0.0075);
    formula_desc = `Kshs 290,000 + 0.75% of excess over 20M (excess: Kshs ${excess.toLocaleString()})`;
  }

  let final_fee = Math.max(base_fee, min_fee);
  if (role === 'vendor') {
    final_fee = final_fee * 0.75;
  }

  return {
    court_or_domain: `Schedule 1: Conveyancing (${role === 'purchaser' ? 'Purchaser' : 'Vendor'})`,
    schedule: 'Schedule 1',
    claim_value: val,
    raw_calculated_fee: Number(base_fee.toFixed(2)),
    minimum_prescribed_fee: min_fee,
    instruction_fee: Number(final_fee.toFixed(2)),
    formula: formula_desc
  };
}

/**
 * Schedule 2 — Debentures, Mortgages & Corporate Security Charges
 */
export function calculate_schedule_2_debentures(value: number, role: 'lender' | 'borrower' = 'lender'): InstructionFeeResult {
  const val = Math.max(0.0, value);
  const min_fee = 50000.0;
  let base_fee = 0;
  let formula_desc = '';

  if (val <= 1000000) {
    base_fee = 50000.0;
    formula_desc = 'Fixed minimum for value up to Kshs 1,000,000';
  } else if (val <= 10000000) {
    const excess = val - 1000000;
    base_fee = 50000.0 + (excess * 0.015);
    formula_desc = `Kshs 50,000 + 1.5% of excess over 1M (excess: Kshs ${excess.toLocaleString()})`;
  } else {
    const excess = val - 10000000;
    base_fee = 185000.0 + (excess * 0.010);
    formula_desc = `Kshs 185,000 + 1.0% of excess over 10M (excess: Kshs ${excess.toLocaleString()})`;
  }

  let final_fee = Math.max(base_fee, min_fee);
  if (role === 'borrower') {
    final_fee = final_fee * 0.50; // Borrower scale is 50% of Lender scale
  }

  return {
    court_or_domain: `Schedule 2: Debentures/Mortgages (${role === 'lender' ? 'Lender' : 'Borrower'})`,
    schedule: 'Schedule 2',
    claim_value: val,
    raw_calculated_fee: Number(base_fee.toFixed(2)),
    minimum_prescribed_fee: min_fee,
    instruction_fee: Number(final_fee.toFixed(2)),
    formula: formula_desc
  };
}

/**
 * Schedule 3 — Probate & Estate Administration
 */
export function calculate_schedule_3_probate(gross_estate_value: number): InstructionFeeResult {
  const val = Math.max(0.0, gross_estate_value);
  const min_fee = 40000.0;
  let base_fee = 0;
  let formula_desc = '';

  if (val <= 500000) {
    base_fee = 40000.0;
    formula_desc = 'Fixed scale for gross estate value up to Kshs 500,000';
  } else if (val <= 5000000) {
    const excess = val - 500000;
    base_fee = 40000.0 + (excess * 0.025);
    formula_desc = `Kshs 40,000 + 2.5% of excess over 500k (excess: Kshs ${excess.toLocaleString()})`;
  } else {
    const excess = val - 5000000;
    base_fee = 152500.0 + (excess * 0.015);
    formula_desc = `Kshs 152,500 + 1.5% of excess over 5M (excess: Kshs ${excess.toLocaleString()})`;
  }

  const final_fee = Math.max(base_fee, min_fee);
  return {
    court_or_domain: 'Schedule 3: Probate & Estate Administration',
    schedule: 'Schedule 3',
    claim_value: val,
    raw_calculated_fee: Number(base_fee.toFixed(2)),
    minimum_prescribed_fee: min_fee,
    instruction_fee: Number(final_fee.toFixed(2)),
    formula: formula_desc
  };
}

/**
 * Schedule 4 — Trademarks, Patents, Designs
 */
export function calculate_schedule_4_ip(ip_service: 'trademark_reg' | 'opposition' | 'assignment'): InstructionFeeResult {
  let fee = 25000.0;
  let desc = 'Trademark Registration Application (per class)';
  
  if (ip_service === 'opposition') {
    fee = 45000.0;
    desc = 'Filing Notice of Opposition';
  } else if (ip_service === 'assignment') {
    fee = 20000.0;
    desc = 'Assignment / Transfer of Registration';
  }

  return {
    court_or_domain: 'Schedule 4: Trademarks & IP',
    schedule: 'Schedule 4',
    claim_value: fee,
    raw_calculated_fee: fee,
    minimum_prescribed_fee: fee,
    instruction_fee: fee,
    formula: desc
  };
}

/**
 * Schedule 5 — Subordinate (Magistrate's) Court Litigation
 */
export function calculate_schedule_5_subordinate(value: number): InstructionFeeResult {
  const val = Math.max(0.0, value);
  const min_fee = 30000.0;
  let base_fee = 0;
  let formula_desc = '';

  if (val <= 100000) {
    base_fee = 20000.0;
    formula_desc = 'Fixed scale fee for Magistrate Court value up to Kshs 100,000';
  } else if (val <= 500000) {
    const excess = val - 100000;
    base_fee = 30000.0 + (excess * 0.05);
    formula_desc = `Kshs 30,000 + 5% of excess over 100k (excess: Kshs ${excess.toLocaleString()})`;
  } else if (val <= 1000000) {
    const excess = val - 500000;
    base_fee = 50000.0 + (excess * 0.03);
    formula_desc = `Kshs 50,000 + 3% of excess over 500k (excess: Kshs ${excess.toLocaleString()})`;
  } else {
    const excess = val - 1000000;
    base_fee = 65000.0 + (excess * 0.02);
    formula_desc = `Kshs 65,000 + 2% of excess over 1M (excess: Kshs ${excess.toLocaleString()})`;
  }

  const final_fee = Math.max(base_fee, min_fee);
  return {
    court_or_domain: "Schedule 5: Magistrate's Court",
    schedule: 'Schedule 5',
    claim_value: val,
    raw_calculated_fee: Number(base_fee.toFixed(2)),
    minimum_prescribed_fee: min_fee,
    instruction_fee: Number(final_fee.toFixed(2)),
    formula: formula_desc
  };
}

/**
 * Schedule 6 — Superior Courts (High Court, ELC, ELRC, Court of Appeal, Supreme Court)
 */
export function calculate_schedule_6_high_court(value: number, is_defendant: boolean = false): InstructionFeeResult {
  const min_fee = is_defendant ? 50000.0 : 75000.0;
  const val = Math.max(0.0, value);
  let base_fee = 0;
  let formula_desc = '';

  if (val <= 500000) {
    base_fee = 45000.0;
    formula_desc = 'Fixed scale fee for value up to Kshs 500,000';
  } else if (val <= 1000000) {
    base_fee = 75000.0;
    formula_desc = 'Fixed scale fee for value Kshs 500,001 - 1,000,000';
  } else if (val <= 5000000) {
    const excess = val - 1000000;
    base_fee = 75000.0 + (excess * 0.0175);
    formula_desc = `Kshs 75,000 + 1.75% of excess over 1M (excess: Kshs ${excess.toLocaleString()})`;
  } else if (val <= 10000000) {
    const excess = val - 5000000;
    base_fee = 145000.0 + (excess * 0.015);
    formula_desc = `Kshs 145,000 + 1.5% of excess over 5M (excess: Kshs ${excess.toLocaleString()})`;
  } else if (val <= 20000000) {
    const excess = val - 10000000;
    base_fee = 220000.0 + (excess * 0.010);
    formula_desc = `Kshs 220,000 + 1.0% of excess over 10M (excess: Kshs ${excess.toLocaleString()})`;
  } else {
    const excess = val - 20000000;
    base_fee = 320000.0 + (excess * 0.0075);
    formula_desc = `Kshs 320,000 + 0.75% of excess over 20M (excess: Kshs ${excess.toLocaleString()})`;
  }

  let final_fee = Math.max(base_fee, min_fee);
  if (is_defendant) {
    final_fee = final_fee * 0.85;
    final_fee = Math.max(final_fee, min_fee);
  }

  return {
    court_or_domain: `Schedule 6: Superior Courts (${is_defendant ? 'Defendant' : 'Plaintiff'})`,
    schedule: 'Schedule 6',
    claim_value: val,
    is_defendant,
    raw_calculated_fee: Number(base_fee.toFixed(2)),
    minimum_prescribed_fee: min_fee,
    instruction_fee: Number(final_fee.toFixed(2)),
    formula: formula_desc
  };
}

/**
 * Schedule 7 — Subordinate Courts Secondary Scale
 */
export function calculate_schedule_7_secondary(): InstructionFeeResult {
  return {
    court_or_domain: 'Schedule 7: Secondary Scale',
    schedule: 'Schedule 7',
    claim_value: 0,
    raw_calculated_fee: 15000.0,
    minimum_prescribed_fee: 15000.0,
    instruction_fee: 15000.0,
    formula: 'Base fee for uncontested applications / default judgments'
  };
}

/**
 * Schedule 8 — Rent & Business Tribunals
 */
export function calculate_schedule_8_tribunals(): InstructionFeeResult {
  return {
    court_or_domain: 'Schedule 8: Tribunals',
    schedule: 'Schedule 8',
    claim_value: 0,
    raw_calculated_fee: 25000.0,
    minimum_prescribed_fee: 25000.0,
    instruction_fee: 25000.0,
    formula: 'Base tribunal assessment fee'
  };
}

/**
 * Schedule 9 — Arbitrations
 */
export function calculate_schedule_9_arbitration(value: number): InstructionFeeResult {
  const result = calculate_schedule_6_high_court(value, false);
  return {
    ...result,
    court_or_domain: 'Schedule 9: Arbitration (High Court Scale)',
    schedule: 'Schedule 9'
  };
}

/**
 * Schedule 10 — Criminal Proceedings
 */
export function calculate_schedule_10_criminal(): InstructionFeeResult {
  return {
    court_or_domain: 'Schedule 10: Criminal Proceedings',
    schedule: 'Schedule 10',
    claim_value: 0,
    raw_calculated_fee: 50000.0,
    minimum_prescribed_fee: 50000.0,
    instruction_fee: 50000.0,
    formula: 'Minimum Criminal Retainer Fee'
  };
}

/**
 * Schedule 11 — Itemized Folio Scale (Base Placeholder)
 */
export function calculate_schedule_11_itemized(): InstructionFeeResult {
  return {
    court_or_domain: 'Schedule 11: Itemized Folios',
    schedule: 'Schedule 11',
    claim_value: 0,
    raw_calculated_fee: 500.0,
    minimum_prescribed_fee: 500.0,
    instruction_fee: 500.0,
    formula: 'Per Folio Base Rate'
  };
}

/**
 * Getting-Up Fee (33.33% of Instruction Fee)
 */
export function calculate_getting_up_fee(instruction_fee: number): number {
  return Number((instruction_fee / 3.0).toFixed(2));
}

/**
 * Section 7 Statutory Interest Calculation (14% p.a.)
 */
export function calculate_statutory_interest(bill_amount: number, months_overdue: number): number {
  if (months_overdue <= 0) return 0;
  const yearly = bill_amount * ANNUAL_INTEREST_RATE;
  const interest = yearly * (months_overdue / 12.0);
  return Number(interest.toFixed(2));
}

/**
 * Section 77 One-Sixth (1/6th) Taxed-Off Penalty Evaluation
 */
export function check_one_sixth_taxed_off_rule(original_bill: number, taxed_off_amount: number): {
  is_penalty: boolean;
  threshold_amount: number;
  message: string;
} {
  const threshold = Number((original_bill / 6.0).toFixed(2));
  const is_penalty = taxed_off_amount > threshold;

  return {
    is_penalty,
    threshold_amount: threshold,
    message: is_penalty
      ? `PENALTY WARNING (Sec. 77): Taxed off amount (Kshs ${taxed_off_amount.toLocaleString()}) exceeds 1/6th threshold (Kshs ${threshold.toLocaleString()}). Advocate must pay the costs of taxation.`
      : `COMPLIANT (Sec. 77): Taxed off amount (Kshs ${taxed_off_amount.toLocaleString()}) is within 1/6th limit (Kshs ${threshold.toLocaleString()}).`
  };
}

/**
 * Multi-Schedule Universal Bill of Costs Computation
 */
export function calculate_bill_of_costs(
  claim_value: number,
  court_schedule: string = 'schedule_6_high_court',
  is_defendant: boolean = false,
  include_getting_up: boolean = true,
  item_folios: BillItem[] = [],
  disbursements: number = 0.0,
  complexity_multiplier: number = 1.0,
  months_overdue: number = 0
): BillOfCostsResult {
  let instr_data: InstructionFeeResult;

  if (court_schedule === 'schedule_5_subordinate') {
    instr_data = calculate_schedule_5_subordinate(claim_value);
  } else if (court_schedule === 'schedule_1_conveyancing') {
    instr_data = calculate_schedule_1_conveyancing(claim_value, 'purchaser');
  } else if (court_schedule === 'schedule_3_probate') {
    instr_data = calculate_schedule_3_probate(claim_value);
  } else {
    instr_data = calculate_schedule_6_high_court(claim_value, is_defendant);
  }

  let instruction_fee = instr_data.instruction_fee;
  if (complexity_multiplier > 1.0) {
    instruction_fee = Number((instruction_fee * complexity_multiplier).toFixed(2));
  }

  const getting_up_fee = include_getting_up ? calculate_getting_up_fee(instruction_fee) : 0.0;

  let items_total = 0.0;
  const processed_items: BillItem[] = [];
  if (item_folios && item_folios.length > 0) {
    for (const item of item_folios) {
      const itype = item.type || 'drawing_folio';
      const qty = item.qty || 1.0;
      const rate = ITEM_RATES[itype] ?? ITEM_RATES.drawing_folio;
      const subtotal = Number((qty * rate).toFixed(2));
      items_total += subtotal;
      processed_items.push({
        description: item.description || 'Legal Work',
        type: itype,
        qty,
        unit_rate: rate,
        subtotal
      });
    }
  }

  const taxable_subtotal = instruction_fee + getting_up_fee + items_total;
  const vat_amount = Number((taxable_subtotal * VAT_RATE).toFixed(2));
  const grand_total = Number((taxable_subtotal + vat_amount + disbursements).toFixed(2));
  const interest_14 = calculate_statutory_interest(grand_total, months_overdue);

  return {
    schedule: instr_data.schedule,
    formula: instr_data.formula + (complexity_multiplier > 1.0 ? ` (Includes ${complexity_multiplier}x Complexity Multiplier)` : ''),
    claim_value,
    instruction_fee,
    getting_up_fee,
    complexity_multiplier,
    items_total: Number(items_total.toFixed(2)),
    taxable_subtotal: Number(taxable_subtotal.toFixed(2)),
    vat_amount,
    disbursements: Number(disbursements.toFixed(2)),
    grand_total,
    interest_14_percent: interest_14,
    months_overdue,
    grand_total_with_interest: Number((grand_total + interest_14).toFixed(2)),
    items: processed_items
  };
}
