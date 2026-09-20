export interface BillCalculationRequest {
  claim_value: number;
  court_schedule: string;
  is_defendant: boolean;
  include_getting_up: boolean;
  items: Array<{ description: string; type: string; qty: number }>;
  disbursements: number;
}

export interface BillCalculationResult {
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
}

export async function calculateLegalBill(req: BillCalculationRequest): Promise<BillCalculationResult> {
  try {
    const res = await fetch('/api/v1/remuneration/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    // API offline fallback logic matching Advocates Remuneration Order rules
  }

  const val = req.claim_value;
  let baseInstr = 75000;
  let formula = 'Schedule 6 High Court Ad Valorem Scale';

  if (req.court_schedule === 'schedule_1_conveyancing') {
    formula = 'Schedule 1 Conveyancing Scale (Sales, Purchases, Leases)';
    baseInstr = val <= 1000000 ? 35000 : 35000 + (val - 1000000) * 0.015;
  } else if (req.court_schedule === 'schedule_2_securities') {
    formula = 'Schedule 2 Security Documentation Scale (Debentures, Mortgages)';
    baseInstr = val <= 500000 ? 25000 : 25000 + (val - 500000) * 0.0125;
  } else if (req.court_schedule === 'schedule_3_company') {
    formula = 'Schedule 3 Commercial & Corporate Incorporation Scale';
    baseInstr = val <= 1000000 ? 50000 : 50000 + (val - 1000000) * 0.01;
  } else if (req.court_schedule === 'schedule_4_ip') {
    formula = 'Schedule 4 Intellectual Property Statutory Scale';
    baseInstr = 40000;
  } else if (req.court_schedule === 'schedule_5_magistrate') {
    formula = 'Schedule 5 Subordinate / Magistrate Court Scale';
    if (val <= 100000) baseInstr = 30000;
    else if (val <= 500000) baseInstr = 30000 + (val - 100000) * 0.05;
    else if (val <= 1000000) baseInstr = 50000 + (val - 500000) * 0.03;
    else baseInstr = 65000 + (val - 1000000) * 0.02;
  } else if (req.court_schedule === 'schedule_7_arbitration') {
    formula = 'Schedule 7 Arbitral Proceedings & Commercial Arbitration Scale';
    let hf = 75000;
    if (val <= 500000) hf = 75000;
    else if (val <= 1000000) hf = 75000;
    else if (val <= 5000000) hf = 75000 + (val - 1000000) * 0.0175;
    else if (val <= 10000000) hf = 145000 + (val - 5000000) * 0.015;
    else if (val <= 20000000) hf = 220000 + (val - 10000000) * 0.01;
    else hf = 320000 + (val - 20000000) * 0.0075;
    baseInstr = hf * 1.25; // 25% Arbitration complexity allowance
  } else if (req.court_schedule === 'schedule_8_general') {
    formula = 'Schedule 8 General / Non-Contentious Legal Scale';
    baseInstr = Math.max(20000, val * 0.02);
  } else {
    // Schedule 6 High Court
    formula = 'Schedule 6 High Court / ELC / ELRC Ad Valorem Scale';
    if (val <= 500000) baseInstr = 75000;
    else if (val <= 1000000) baseInstr = 75000;
    else if (val <= 5000000) baseInstr = 75000 + (val - 1000000) * 0.0175;
    else if (val <= 10000000) baseInstr = 145000 + (val - 5000000) * 0.015;
    else if (val <= 20000000) baseInstr = 220000 + (val - 10000000) * 0.01;
    else baseInstr = 320000 + (val - 20000000) * 0.0075;

    if (req.is_defendant) baseInstr = Math.max(50000, baseInstr * 0.85);
  }

  const instrFee = Math.round(baseInstr * 100) / 100;
  const gupFee = req.include_getting_up && (req.court_schedule === 'schedule_6_high_court' || req.court_schedule === 'schedule_7_arbitration')
    ? Math.round((instrFee / 3) * 100) / 100
    : 0;

  const itemRates: Record<string, number> = {
    drawing_folio: 500,
    copying_folio: 50,
    attendance_court: 2500,
    letter: 500,
  };

  let itemsSum = 0;
  req.items.forEach(it => {
    const rate = itemRates[it.type] || 500;
    itemsSum += it.qty * rate;
  });

  const taxableSubtotal = Math.round((instrFee + gupFee + itemsSum) * 100) / 100;
  const vat = Math.round(taxableSubtotal * 0.16 * 100) / 100;
  const grandTotal = Math.round((taxableSubtotal + vat + req.disbursements) * 100) / 100;

  return {
    schedule: req.court_schedule,
    formula,
    claim_value: val,
    instruction_fee: instrFee,
    getting_up_fee: gupFee,
    items_total: itemsSum,
    taxable_subtotal: taxableSubtotal,
    vat_amount: vat,
    disbursements: req.disbursements,
    grand_total: grandTotal,
  };
}
