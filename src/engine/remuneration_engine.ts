/**
 * Remuneration Engine for Kenyan Advocates (Remuneration) (Amendment) Order
 * Ref: Kenya Law L.N. 64/1962 (ed. 2022) & 2014 Amendment Order
 */

export const VAT_RATE = 0.16;

export const ITEM_RATES: Record<string, number> = {
  drawing_folio: 500.0,        // Per folio of 100 words (drawing pleadings, affidavits, etc.)
  copying_folio: 50.0,         // Per folio of 100 words (copying documents)
  attendance_court_hr: 2500.0, // Per hour in court
  attendance_office_hr: 1500.0,// Per hour in office conference
  letter_formal: 500.0,        // Per formal demand letter / opinion letter
  letter_ordinary: 300.0,      // Per ordinary letter
  perusal_folio: 100.0         // Per folio perused
};

export interface InstructionFeeResult {
  court: string;
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
  items_total: number;
  taxable_subtotal: number;
  vat_amount: number;
  disbursements: number;
  grand_total: number;
  items: BillItem[];
}

export function calculate_high_court_instruction_fee(value: number, is_defendant: boolean = false): InstructionFeeResult {
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
    court: 'High Court / ELC / ELRC / Court of Appeal',
    schedule: 'Schedule 6',
    claim_value: val,
    is_defendant,
    raw_calculated_fee: Number(base_fee.toFixed(2)),
    minimum_prescribed_fee: min_fee,
    instruction_fee: Number(final_fee.toFixed(2)),
    formula: formula_desc
  };
}

export function calculate_subordinate_court_instruction_fee(value: number): InstructionFeeResult {
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
    court: "Subordinate / Magistrate's Court",
    schedule: 'Schedule 5',
    claim_value: val,
    raw_calculated_fee: Number(base_fee.toFixed(2)),
    minimum_prescribed_fee: min_fee,
    instruction_fee: Number(final_fee.toFixed(2)),
    formula: formula_desc
  };
}

export function calculate_getting_up_fee(instruction_fee: number): number {
  return Number((instruction_fee / 3.0).toFixed(2));
}

export function calculate_bill_of_costs(
  claim_value: number,
  court_schedule: string = 'schedule_6_high_court',
  is_defendant: boolean = false,
  include_getting_up: boolean = true,
  item_folios: BillItem[] = [],
  disbursements: number = 0.0
): BillOfCostsResult {
  let instr_data: InstructionFeeResult;
  if (court_schedule === 'schedule_5_magistrate') {
    instr_data = calculate_subordinate_court_instruction_fee(claim_value);
  } else {
    instr_data = calculate_high_court_instruction_fee(claim_value, is_defendant);
  }

  const instruction_fee = instr_data.instruction_fee;
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

  return {
    schedule: instr_data.schedule,
    formula: instr_data.formula,
    claim_value,
    instruction_fee,
    getting_up_fee,
    items_total: Number(items_total.toFixed(2)),
    taxable_subtotal: Number(taxable_subtotal.toFixed(2)),
    vat_amount,
    disbursements: Number(disbursements.toFixed(2)),
    grand_total,
    items: processed_items
  };
}
