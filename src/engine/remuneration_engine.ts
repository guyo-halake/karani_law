/**
 * Authentic Statutory Remuneration Engine for Kenyan Advocates
 * Governed by The Advocates (Remuneration) Order (Legal Notice 64 of 1962, as amended up to
 * L.N. 35 of 2014, L.N. 45 of 2014, L.N. 268 of 2017 & L.N. 221 of 2023).
 */

export const VAT_RATE = 0.16;
export const ANNUAL_INTEREST_RATE = 0.14; // Sec. 7 Statutory Interest 14% p.a.

export const ITEM_RATES: Record<string, number> = {
  drawing_pleading_base: 1100.0,       // First 4 folios or part thereof (Schedule 6 Item 4(a))
  drawing_pleading_extra_folio: 150.0, // Each additional folio over 4
  drawing_general_folio: 180.0,        // Schedule 6 Item 4(b) - other formal docs per folio
  drawing_bill_of_costs_folio: 180.0,  // Schedule 6 Item 4(c) - bill of costs per folio
  copying_folio: 25.0,                 // Schedule 6 Item 6 - copying per folio of 100 words
  attendance_formal_registry: 1100.0,  // Schedule 6 Item 7(a) - formal attendance
  attendance_court_hr: 2300.0,         // Schedule 6 Item 7(b) - ordinary court / conference per hr
  attendance_court_day: 10000.0,       // Schedule 6 Item 7(c) - extended hearing full day
  service_process_base: 1400.0,        // Schedule 6 Item 8 - process service within 3km
  service_process_per_km: 35.0,        // Schedule 6 Item 8 - excess mileage per km
  letter_formal: 500.0,                // Schedule 6 Item 5(a) - formal demand letter / opinion
  letter_ordinary: 300.0,              // Schedule 6 Item 5(b) - routine letter
  perusal_folio: 100.0,                // Schedule 6 Item 9 - perusal per folio
  drawing_folio: 1100.0,
  attendance_office_hr: 2300.0,
  bill_of_costs_folio: 180.0,
  search_registry: 1500.0,
  service_summons: 1400.0
};

export interface StatutoryScheduleDef {
  id: string;
  key: string;
  number: number;
  name: string;
  citation: string;
  category: string;
  description: string;
}

export const STATUTORY_SCHEDULES: StatutoryScheduleDef[] = [
  { id: 'sched_1', key: 'schedule_1_conveyancing', number: 1, name: 'Conveyancing: Sales, Purchases, Mortgages & Charges', citation: 'Schedule 1, L.N. 35/2014', category: 'Conveyancing', description: 'Sales, purchases, transfers, legal charges, and mortgages.' },
  { id: 'sched_2', key: 'schedule_2_leases', number: 2, name: 'Leases & Tenancy Agreements at a Rack Rent', citation: 'Schedule 2, L.N. 35/2014', category: 'Leases & Tenancies', description: 'Commercial and residential leases, agreements for lease, calculated on annual rent.' },
  { id: 'sched_3', key: 'schedule_3_companies', number: 3, name: 'Formation, Incorporation & Registration of Companies', citation: 'Schedule 3, L.N. 35/2014', category: 'Corporate & Commercial', description: 'Incorporation of companies with share capital, foreign companies (minimum KES 60,000).' },
  { id: 'sched_4', key: 'schedule_4_ip', number: 4, name: 'Trade Marks', citation: 'Schedule 4, L.N. 35/2014', category: 'Intellectual Property', description: 'Registration, oppositions, registered users, assignments, and renewals of trade marks.' },
  { id: 'sched_5', key: 'schedule_5_chattels', number: 5, name: 'Fees Not Otherwise Prescribed & Chattels Transfer', citation: 'Schedule 5, L.N. 35/2014', category: 'General & Securities', description: 'Non-contentious business, agreed hourly rates, formal opinions, debt collection scale, Chattels Transfer.' },
  { id: 'sched_6', key: 'schedule_6_high_court', number: 6, name: 'Costs of Proceedings in the High Court', citation: 'Schedule 6, L.N. 35/2014', category: 'Litigation', description: 'High Court, Environment & Land Court (ELC), Employment & Labour Relations Court (ELRC).' },
  { id: 'sched_7', key: 'schedule_7_magistrate', number: 7, name: 'Costs of Proceedings in Subordinate Courts', citation: 'Schedule 7, L.N. 45/2014', category: 'Litigation', description: 'Litigation in Subordinate / Resident Magistrate Courts across lower and higher scales.' },
  { id: 'sched_8', key: 'schedule_8_bprt', number: 8, name: 'Tribunal under Landlord & Tenant Act (Cap. 301 - BPRT)', citation: 'Schedule 8, L.N. 35/2014', category: 'Tribunals', description: 'Business Premises Rent Tribunal (BPRT) references, distress for rent, and possession claims.' },
  { id: 'sched_9', key: 'schedule_9_rrt', number: 9, name: 'Tribunals under Rent Restriction Act (Cap. 296 - RRT)', citation: 'Schedule 9, L.N. 35/2014', category: 'Tribunals', description: 'Rent Restriction Tribunal (RRT) residential tenancy disputes, repairs, and assessment proceedings.' },
  { id: 'sched_10', key: 'schedule_10_probate', number: 10, name: 'Probate and Administration', citation: 'Schedule 10, L.N. 35/2014', category: 'Probate & Estate', description: 'Grants of probate, letters of administration, resealing, testate and intestate distribution.' },
  { id: 'sched_11', key: 'schedule_11_tribunals', number: 11, name: 'Proceedings Before Tribunals Other Than Schedules 8 & 9', citation: 'Schedule 11, L.N. 35/2014', category: 'Tribunals', description: 'Co-operative Tribunal, Tax Appeals Tribunal (TAT), Political Parties Disputes Tribunal, Energy Tribunal.' },
  { id: 'sched_12', key: 'schedule_12_patents', number: 12, name: 'Patents, Utility Models and Industrial Designs', citation: 'Schedule 12, L.N. 35/2014', category: 'Intellectual Property', description: 'Registration of patents, utility models, industrial designs, KIPI proceedings, and Tribunal appeals.' }
];

export interface InstructionFeeResult {
  court_or_domain: string;
  schedule: string;
  claim_value: number;
  is_defendant?: boolean;
  raw_calculated_fee?: number;
  minimum_prescribed_fee: number;
  instruction_fee: number;
  formula: string;
  case_disposition?: string;
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
  apply_vat?: boolean;
  document_type?: string;
  case_disposition?: string;
  custom_instruction_fee?: number | null;
  vat_amount: number;
  disbursements: number;
  grand_total: number;
  interest_14_percent: number;
  months_overdue: number;
  grand_total_with_interest: number;
  items: BillItem[];
}
// ----------------------------------------------------------------------------
// ALL 12 STATUTORY SCHEDULE CALCULATORS
// ----------------------------------------------------------------------------

export function calculate_schedule_1_conveyancing(value: number, role: 'vendor' | 'purchaser' = 'purchaser'): InstructionFeeResult {
  const val = Math.max(0, Number(value) || 0);
  const min_fee = 35000;
  let base_fee = min_fee;
  let formula = '';

  if (val === 0) {
    formula = `Statutory minimum floor for non-monetary / unquantified property: KES ${min_fee.toLocaleString()}`;
  } else if (val <= 5000000) {
    base_fee = Math.max(min_fee, val * 0.02);
    formula = `First KES 5M at 2.0% (Calculated: KES ${(val * 0.02).toLocaleString()}, Floor: KES ${min_fee.toLocaleString()})`;
  } else if (val <= 10000000) {
    const excess = val - 5000000;
    base_fee = 100000 + excess * 0.015;
    formula = `KES 100,000 + 1.5% of excess over 5M (excess: KES ${excess.toLocaleString()})`;
  } else if (val <= 20000000) {
    const excess = val - 10000000;
    base_fee = 175000 + excess * 0.01;
    formula = `KES 175,000 + 1.0% of excess over 10M (excess: KES ${excess.toLocaleString()})`;
  } else {
    const excess = val - 20000000;
    base_fee = 275000 + excess * 0.0075;
    formula = `KES 275,000 + 0.75% of excess over 20M (excess: KES ${excess.toLocaleString()})`;
  }

  return {
    schedule: 'Schedule 1',
    court_or_domain: 'Conveyancing & Immovable Property',
    claim_value: val,
    instruction_fee: Math.round(base_fee * 100) / 100,
    minimum_prescribed_fee: min_fee,
    formula
  };
}

export function calculate_schedule_2_leases(annual_rent: number, is_perusing: boolean = false): InstructionFeeResult {
  const val = Math.max(0, Number(annual_rent) || 0);
  const min_fee = 20000;
  let base_fee = min_fee;
  let formula = '';

  if (val <= 500000) {
    base_fee = Math.max(min_fee, val * 0.15);
    formula = `Schedule 2: 15% of annual rent up to KES 500,000 (minimum KES ${min_fee.toLocaleString()})`;
  } else if (val <= 3000000) {
    const excess = val - 500000;
    base_fee = 75000 + excess * 0.03;
    formula = `Schedule 2: KES 75,000 + 3.0% of excess over 500k (excess: KES ${excess.toLocaleString()})`;
  } else {
    const excess = val - 3000000;
    base_fee = 150000 + excess * 0.01;
    formula = `Schedule 2: KES 150,000 + 1.0% of excess over 3M (excess: KES ${excess.toLocaleString()})`;
  }

  if (is_perusing) {
    base_fee = base_fee * 0.5;
    formula += ' [Perusing / Approving advocate: 50% under Item 2]';
  }

  return {
    schedule: 'Schedule 2',
    court_or_domain: 'Leases & Tenancy Agreements at a Rack Rent',
    claim_value: val,
    instruction_fee: Math.round(base_fee * 100) / 100,
    minimum_prescribed_fee: is_perusing ? min_fee * 0.5 : min_fee,
    formula
  };
}

export function calculate_schedule_3_companies(nominal_capital: number): InstructionFeeResult {
  const val = Math.max(0, Number(nominal_capital) || 0);
  const min_fee = 50000;
  let base_fee = min_fee;
  let formula = '';

  if (val <= 1000000) {
    formula = 'Nominal share capital up to KES 1,000,000 (Prescribed minimum KES 50,000)';
  } else {
    const excess = val - 1000000;
    base_fee = 50000 + excess * 0.01;
    formula = `KES 50,000 + 1.0% of excess over 1M (excess: KES ${excess.toLocaleString()})`;
  }

  return {
    schedule: 'Schedule 3',
    court_or_domain: 'Company Formation & Securities',
    claim_value: val,
    instruction_fee: Math.round(base_fee * 100) / 100,
    minimum_prescribed_fee: min_fee,
    formula
  };
}

export function calculate_schedule_4_ip(value: number = 0): InstructionFeeResult {
  const val = Math.max(0, Number(value) || 0);
  const min_fee = 40000;
  const base_fee = val <= 500000 ? min_fee : min_fee + (val - 500000) * 0.01;
  return {
    schedule: 'Schedule 4',
    court_or_domain: 'Trade Marks, Patents & Intellectual Property',
    claim_value: val,
    instruction_fee: Math.round(base_fee * 100) / 100,
    minimum_prescribed_fee: min_fee,
    formula: 'Statutory IP scale (Minimum KES 40,000)'
  };
}

export function calculate_schedule_5_chattels(value: number): InstructionFeeResult {
  const val = Math.max(0, Number(value) || 0);
  const min_fee = 20000;
  let base_fee = min_fee;
  let formula = '';

  if (val <= 500000) {
    formula = 'Movable property value up to KES 500,000 (Minimum KES 20,000)';
  } else {
    const excess = val - 500000;
    base_fee = 20000 + excess * 0.025;
    formula = `KES 20,000 + 2.5% of excess over 500k (excess: KES ${excess.toLocaleString()})`;
  }

  return {
    schedule: 'Schedule 5',
    court_or_domain: 'Chattels Transfer & Movable Property',
    claim_value: val,
    instruction_fee: Math.round(base_fee * 100) / 100,
    minimum_prescribed_fee: min_fee,
    formula
  };
}

export function calculate_schedule_6_high_court(
  value: number,
  case_disposition: string = 'full_trial',
  is_defendant: boolean = false
): InstructionFeeResult {
  const val = Math.max(0, Number(value) || 0);
  const is_undefended = case_disposition === 'undefended';
  const min_fee = 75000;
  let final_fee = min_fee;
  let formula = '';

  if (is_undefended) {
    let calc_fee = 45000;
    if (val <= 500000) {
      calc_fee = 45000;
      formula = 'Schedule 6 Item 1(a) Undefended up to 500k: KES 45,000 (Statutory floor KES 75,000 where plaint filed)';
    } else if (val <= 750000) {
      calc_fee = 56250;
      formula = 'Schedule 6 Item 1(a) Undefended 500k - 750k: KES 56,250 (Subject to minimum KES 75,000)';
    } else if (val <= 1000000) {
      calc_fee = 75000;
      formula = 'Schedule 6 Item 1(a) Undefended 750k - 1M: KES 75,000';
    } else if (val <= 20000000) {
      const excess = val - 1000000;
      calc_fee = 75000 + excess * 0.0175;
      formula = `Schedule 6 Item 1(a) Undefended: KES 75,000 + 1.75% of excess over 1M (excess: KES ${excess.toLocaleString()})`;
    } else {
      const excess = val - 20000000;
      calc_fee = 407500 + excess * 0.015;
      formula = `Schedule 6 Item 1(a) Undefended: KES 407,500 + 1.5% of excess over 20M (excess: KES ${excess.toLocaleString()})`;
    }
    final_fee = Math.max(min_fee, calc_fee);
  } else {
    let base_fee = 75000;
    if (val <= 500000) {
      base_fee = 75000;
      formula = 'Schedule 6 Item 1(b) Defended mandatory statutory floor: KES 75,000';
    } else if (val <= 750000) {
      base_fee = 90000;
      formula = 'Schedule 6 Item 1(b) Defended scale 500k - 750k: KES 90,000';
    } else if (val <= 1000000) {
      base_fee = 120000;
      formula = 'Schedule 6 Item 1(b) Defended scale 750k - 1M: KES 120,000';
    } else if (val <= 20000000) {
      const excess = val - 1000000;
      base_fee = 120000 + excess * 0.02;
      formula = `Schedule 6 Item 1(b) Defended: KES 120,000 + 2.0% of excess over 1M (excess: KES ${excess.toLocaleString()})`;
    } else {
      const excess = val - 20000000;
      base_fee = 500000 + excess * 0.015;
      formula = `Schedule 6 Item 1(b) Defended: KES 500,000 + 1.5% of excess over 20M (excess: KES ${excess.toLocaleString()})`;
    }

    base_fee = Math.round(base_fee * 100) / 100;
    if (case_disposition === 'early_settlement') {
      final_fee = Math.round(base_fee * 0.85 * 100) / 100;
      formula += ` -> Early settlement (85%): KES ${final_fee.toLocaleString()}`;
    } else if (case_disposition === 'summary_determination') {
      final_fee = Math.round(base_fee * 0.75 * 100) / 100;
      formula += ` -> Summary determination without trial (75%): KES ${final_fee.toLocaleString()}`;
    } else {
      final_fee = base_fee;
    }
    final_fee = Math.max(min_fee, final_fee);
  }

  return {
    schedule: 'Schedule 6',
    court_or_domain: 'High Court / ELRC / ELC Litigation',
    claim_value: val,
    is_defendant,
    case_disposition,
    instruction_fee: Math.round(final_fee * 100) / 100,
    minimum_prescribed_fee: min_fee,
    formula
  };
}

export function calculate_schedule_7_magistrate(value: number): InstructionFeeResult {
  const val = Math.max(0, Number(value) || 0);
  const min_fee = 30000;
  let base_fee = 20000;
  let formula = '';

  if (val <= 100000) {
    base_fee = 20000;
    formula = 'Schedule 7 Higher Scale up to 100k: KES 20,000 (Subject to minimum KES 30,000)';
  } else if (val <= 500000) {
    const excess = val - 100000;
    base_fee = 30000 + excess * 0.05;
    formula = `Schedule 7: KES 30,000 + 5.0% of excess over 100k (excess: KES ${excess.toLocaleString()})`;
  } else if (val <= 1000000) {
    const excess = val - 500000;
    base_fee = 50000 + excess * 0.03;
    formula = `Schedule 7: KES 50,000 + 3.0% of excess over 500k (excess: KES ${excess.toLocaleString()})`;
  } else {
    const excess = val - 1000000;
    base_fee = 65000 + excess * 0.02;
    formula = `Schedule 7: KES 65,000 + 2.0% of excess over 1M (excess: KES ${excess.toLocaleString()})`;
  }

  const final_fee = Math.max(min_fee, base_fee);
  return {
    schedule: 'Schedule 7',
    court_or_domain: "Subordinate / Magistrate's Court",
    claim_value: val,
    instruction_fee: Math.round(final_fee * 100) / 100,
    minimum_prescribed_fee: min_fee,
    formula
  };
}

export function calculate_schedule_8_bprt(value: number, lower_scale: boolean = false): InstructionFeeResult {
  const val = Math.max(0, Number(value) || 0);
  let base_fee = 5000;
  let formula = '';
  const min_fee = lower_scale ? 1293 : 5000;

  if (lower_scale) {
    if (val <= 10000) {
      base_fee = 1293;
      formula = 'Schedule 8 BPRT Lower Scale: Up to KES 10,000 = KES 1,293';
    } else if (val <= 20000) {
      base_fee = 2000;
      formula = 'Schedule 8 BPRT Lower Scale: KES 10,001 - 20,000 = KES 2,000';
    } else if (val <= 50000) {
      base_fee = 8000;
      formula = 'Schedule 8 BPRT Lower Scale: KES 20,001 - 50,000 = KES 8,000';
    } else if (val <= 100000) {
      base_fee = 15000;
      formula = 'Schedule 8 BPRT Lower Scale: KES 50,001 - 100,000 = KES 15,000';
    } else if (val <= 250000) {
      base_fee = 22500;
      formula = 'Schedule 8 BPRT Lower Scale: KES 100,001 - 250,000 = KES 22,500';
    } else {
      const excess = val - 250000;
      base_fee = 22500 + excess * 0.01;
      formula = `Schedule 8 BPRT Lower Scale: KES 22,500 + 1% of excess over 250k (excess: KES ${excess.toLocaleString()})`;
    }
  } else {
    if (val <= 10000) {
      base_fee = 5000;
      formula = 'Schedule 8 BPRT Higher Scale: Up to KES 10,000 = KES 5,000';
    } else if (val <= 20000) {
      base_fee = 8000;
      formula = 'Schedule 8 BPRT Higher Scale: KES 10,001 - 20,000 = KES 8,000';
    } else if (val <= 50000) {
      base_fee = 15000;
      formula = 'Schedule 8 BPRT Higher Scale: KES 20,001 - 50,000 = KES 15,000';
    } else if (val <= 100000) {
      base_fee = 22500;
      formula = 'Schedule 8 BPRT Higher Scale: KES 50,001 - 100,000 = KES 22,500';
    } else if (val <= 250000) {
      base_fee = 35000;
      formula = 'Schedule 8 BPRT Higher Scale: KES 100,001 - 250,000 = KES 35,000';
    } else {
      const excess = val - 250000;
      base_fee = 35000 + excess * 0.02;
      formula = `Schedule 8 BPRT Higher Scale: KES 35,000 + 2% of excess over 250k (excess: KES ${excess.toLocaleString()})`;
    }
  }

  return {
    schedule: 'Schedule 8',
    court_or_domain: 'Landlord & Tenant Tribunal (Cap. 301 - BPRT)',
    claim_value: val,
    instruction_fee: Math.round(base_fee * 100) / 100,
    minimum_prescribed_fee: min_fee,
    formula
  };
}

export function calculate_schedule_8_court_of_appeal(value: number): InstructionFeeResult {
  const hc = calculate_schedule_6_high_court(value, 'full_trial');
  const base_fee = Math.max(100000, hc.instruction_fee * 1.333333);
  return {
    schedule: 'Schedule 8 (Appellate)',
    court_or_domain: 'Court of Appeal Civil/Criminal Appeals',
    claim_value: Number(value) || 0,
    instruction_fee: Math.round(base_fee * 100) / 100,
    minimum_prescribed_fee: 100000,
    formula: 'Court of Appeal scale (High Court + 33.33% appeal factor, minimum KES 100,000)'
  };
}

export function calculate_schedule_9_rrt(value: number, lower_scale: boolean = false): InstructionFeeResult {
  const val = Math.max(0, Number(value) || 0);
  let base_fee = 2352;
  let formula = '';
  const min_fee = lower_scale ? 1293 : 2352;

  if (lower_scale) {
    if (val <= 1000) {
      base_fee = 1293;
      formula = 'Schedule 9 RRT Lower Scale: Up to KES 1,000 = KES 1,293';
    } else if (val <= 2000) {
      base_fee = 2117;
      formula = 'Schedule 9 RRT Lower Scale: KES 1,001 - 2,000 = KES 2,117';
    } else if (val <= 3500) {
      base_fee = 2499;
      formula = 'Schedule 9 RRT Lower Scale: KES 2,001 - 3,500 = KES 2,499';
    } else if (val <= 5000) {
      base_fee = 3528;
      formula = 'Schedule 9 RRT Lower Scale: KES 3,501 - 5,000 = KES 3,528';
    } else if (val <= 7500) {
      base_fee = 4704;
      formula = 'Schedule 9 RRT Lower Scale: KES 5,001 - 7,500 = KES 4,704';
    } else if (val <= 10000) {
      base_fee = 5880;
      formula = 'Schedule 9 RRT Lower Scale: KES 7,501 - 10,000 = KES 5,880';
    } else if (val <= 20000) {
      base_fee = 8820;
      formula = 'Schedule 9 RRT Lower Scale: KES 10,001 - 20,000 = KES 8,820';
    } else if (val <= 50000) {
      base_fee = 10290;
      formula = 'Schedule 9 RRT Lower Scale: KES 20,001 - 50,000 = KES 10,290';
    } else {
      const excess = val - 50000;
      base_fee = 10290 + excess * 0.01;
      formula = `Schedule 9 RRT Lower Scale: KES 10,290 + 1% of excess over 50k (excess: KES ${excess.toLocaleString()})`;
    }
  } else {
    if (val <= 1000) {
      base_fee = 2352;
      formula = 'Schedule 9 RRT Higher Scale: Up to KES 1,000 = KES 2,352';
    } else if (val <= 2000) {
      base_fee = 4116;
      formula = 'Schedule 9 RRT Higher Scale: KES 1,001 - 2,000 = KES 4,116';
    } else if (val <= 3500) {
      base_fee = 4998;
      formula = 'Schedule 9 RRT Higher Scale: KES 2,001 - 3,500 = KES 4,998';
    } else if (val <= 5000) {
      base_fee = 8232;
      formula = 'Schedule 9 RRT Higher Scale: KES 3,501 - 5,000 = KES 8,232';
    } else if (val <= 7500) {
      base_fee = 10584;
      formula = 'Schedule 9 RRT Higher Scale: KES 5,001 - 7,500 = KES 10,584';
    } else if (val <= 10000) {
      base_fee = 11760;
      formula = 'Schedule 9 RRT Higher Scale: KES 7,501 - 10,000 = KES 11,760';
    } else if (val <= 20000) {
      base_fee = 14700;
      formula = 'Schedule 9 RRT Higher Scale: KES 10,001 - 20,000 = KES 14,700';
    } else if (val <= 50000) {
      base_fee = 17640;
      formula = 'Schedule 9 RRT Higher Scale: KES 20,001 - 50,000 = KES 17,640';
    } else {
      const excess = val - 50000;
      base_fee = 17640 + excess * 0.02;
      formula = `Schedule 9 RRT Higher Scale: KES 17,640 + 2% of excess over 50k (excess: KES ${excess.toLocaleString()})`;
    }
  }

  return {
    schedule: 'Schedule 9',
    court_or_domain: 'Rent Restriction Tribunal (Cap. 296 - RRT)',
    claim_value: val,
    instruction_fee: Math.round(base_fee * 100) / 100,
    minimum_prescribed_fee: min_fee,
    formula
  };
}

export function calculate_schedule_9_supreme_court(value: number): InstructionFeeResult {
  const hc = calculate_schedule_6_high_court(value, 'full_trial');
  const base_fee = Math.max(150000, hc.instruction_fee * 1.50);
  return {
    schedule: 'Schedule 9 (Appellate)',
    court_or_domain: 'Supreme Court of Kenya',
    claim_value: Number(value) || 0,
    instruction_fee: Math.round(base_fee * 100) / 100,
    minimum_prescribed_fee: 150000,
    formula: 'Supreme Court scale (High Court x 1.5x complexity, minimum KES 150,000)'
  };
}

export function calculate_schedule_10_probate(estate_value: number, is_contested: boolean = false): InstructionFeeResult {
  const val = Math.max(0, Number(estate_value) || 0);
  const min_fee = 45000;
  let base_fee = min_fee;
  let formula = '';

  if (val <= 1000000) {
    base_fee = Math.max(min_fee, val * 0.05);
    formula = `Schedule 10: 5% of gross estate value up to KES 1M (minimum KES ${min_fee.toLocaleString()})`;
  } else {
    const excess = val - 1000000;
    base_fee = 50000 + excess * 0.01;
    formula = `Schedule 10: 5% on first KES 1M (KES 50,000) + 1% on excess over 1M (excess: KES ${excess.toLocaleString()})`;
  }

  if (is_contested) {
    base_fee = Math.max(base_fee * 2.0, 90000);
    formula += ' [Contested Grant: Not less than twice uncontested fee under Item 1(d)]';
  }

  return {
    schedule: 'Schedule 10',
    court_or_domain: 'Probate & Estate Administration',
    claim_value: val,
    instruction_fee: Math.round(base_fee * 100) / 100,
    minimum_prescribed_fee: is_contested ? 90000 : min_fee,
    formula
  };
}

export function calculate_schedule_11_tribunals(value: number, lower_scale: boolean = false): InstructionFeeResult {
  const val = Math.max(0, Number(value) || 0);
  let base_fee = 17640;
  let formula = '';
  const min_fee = lower_scale ? 8820 : 17640;

  if (val <= 50000) {
    base_fee = 17640;
    formula = 'Schedule 11: Up to KES 50,000 = KES 17,640';
  } else if (val <= 100000) {
    base_fee = 23520;
    formula = 'Schedule 11: KES 50,001 - 100,000 = KES 23,520';
  } else if (val <= 200000) {
    base_fee = 35280;
    formula = 'Schedule 11: KES 100,001 - 200,000 = KES 35,280';
  } else if (val <= 500000) {
    base_fee = 58800;
    formula = 'Schedule 11: KES 200,001 - 500,000 = KES 58,800';
  } else if (val <= 1000000) {
    base_fee = 100000;
    formula = 'Schedule 11: KES 500,001 - 1,000,000 = KES 100,000';
  } else if (val <= 20000000) {
    const excess = val - 1000000;
    base_fee = 100000 + excess * 0.01;
    formula = `Schedule 11: KES 100,000 + 1% of excess over 1M (excess: KES ${excess.toLocaleString()})`;
  } else if (val <= 250000000) {
    const excess = val - 20000000;
    base_fee = 290000 + excess * 0.005;
    formula = `Schedule 11: KES 290,000 + 0.5% of excess over 20M (excess: KES ${excess.toLocaleString()})`;
  } else {
    const excess = val - 250000000;
    base_fee = 1440000 + excess * 0.001;
    formula = `Schedule 11: KES 1,440,000 + 0.1% of excess over 250M (excess: KES ${excess.toLocaleString()})`;
  }

  if (lower_scale) {
    base_fee = base_fee * 0.5;
    formula += ' [Lower Scale: 50% under Item 8(b)]';
  }

  return {
    schedule: 'Schedule 11',
    court_or_domain: 'Tribunals (Other Than Sched 8 & 9 - TAT, Co-op, etc.)',
    claim_value: val,
    instruction_fee: Math.round(base_fee * 100) / 100,
    minimum_prescribed_fee: min_fee,
    formula
  };
}

export function calculate_schedule_12_patents(value: number = 0, is_contentious: boolean = false): InstructionFeeResult {
  const val = Math.max(0, Number(value) || 0);
  let base_fee = 42000;
  let formula = '';
  const min_fee = is_contentious ? 210000 : 42000;

  if (is_contentious) {
    base_fee = val > 0 ? Math.max(210000, val * 0.02) : 210000;
    formula = `Schedule 12 Item 10: Contentious IP Proceedings (Mandatory statutory minimum KES ${min_fee.toLocaleString()})`;
  } else {
    base_fee = 42000;
    formula = `Schedule 12 Item 1: Initial Patent / Design / Utility Model Application (Statutory fee KES ${min_fee.toLocaleString()})`;
  }

  return {
    schedule: 'Schedule 12',
    court_or_domain: 'Patents, Utility Models & Industrial Designs',
    claim_value: val,
    instruction_fee: Math.round(base_fee * 100) / 100,
    minimum_prescribed_fee: min_fee,
    formula
  };
}

export function calculate_schedule_12_general(value: number): InstructionFeeResult {
  return calculate_schedule_12_patents(value, true);
}

// Backward-compatibility aliases
export const calculate_schedule_2_debentures = (val: number) => calculate_schedule_3_companies(val);
export const calculate_schedule_3_probate = (val: number) => calculate_schedule_10_probate(val);
export const calculate_schedule_5_subordinate = (val: number) => calculate_schedule_7_magistrate(val);
export const calculate_schedule_7_secondary = () => calculate_schedule_7_magistrate(0);
export const calculate_schedule_8_tribunals = () => calculate_schedule_11_tribunals(0);
export const calculate_schedule_9_arbitration = (val: number) => calculate_schedule_12_general(val);
export const calculate_schedule_10_criminal = () => calculate_schedule_6_high_court(0, 'full_trial');
export const calculate_schedule_11_itemized = () => calculate_schedule_6_high_court(0, 'full_trial');
// ----------------------------------------------------------------------------
// STATUTORY RULES & MASTER BILL OF COSTS CALCULATION
// ----------------------------------------------------------------------------

export function calculate_getting_up_fee(instruction_fee: number): number {
  return Math.round((Number(instruction_fee) / 3) * 100) / 100;
}

export function calculate_statutory_interest(bill_amount: number, months_overdue: number): number {
  if (months_overdue <= 0) return 0.0;
  const yearly = Number(bill_amount) * ANNUAL_INTEREST_RATE;
  const interest = yearly * (Number(months_overdue) / 12.0);
  return Math.round(interest * 100) / 100;
}

export function check_one_sixth_taxed_off_rule(original_bill: number, taxed_off_amount: number, disbursements: number = 0): {
  is_penalty: boolean;
  is_disallowed: boolean;
  threshold_amount: number;
  allowable_threshold: number;
  taxed_off_amount: number;
  disallowed_percentage: number;
  message: string;
} {
  const taxable_base = Math.max(0, Number(original_bill) - Number(disbursements || 0));
  const threshold = Math.round((taxable_base / 6.0) * 100) / 100;
  const is_penalty = Number(taxed_off_amount) > threshold;
  const disallowed_percentage = taxable_base > 0 ? (Number(taxed_off_amount) / taxable_base) * 100 : 0;
  const message = is_penalty
    ? `Penalty applies under Rule 77: Taxed off amount (KES ${Number(taxed_off_amount).toLocaleString()}) exceeds 1/6th threshold (KES ${threshold.toLocaleString()}). Advocate pays taxation costs.`
    : `No penalty under Rule 77: Taxed off amount (KES ${Number(taxed_off_amount).toLocaleString()}) is within 1/6th threshold (KES ${threshold.toLocaleString()}). Opposing party/client pays taxation costs.`;
  return {
    is_penalty,
    is_disallowed: is_penalty,
    threshold_amount: threshold,
    allowable_threshold: threshold,
    taxed_off_amount: Number(taxed_off_amount),
    disallowed_percentage,
    message
  };
}

export function calculate_drawing_pleading_fee(folios: number): number {
  const f = Math.max(1, Number(folios) || 1);
  if (f <= 4) return 1100.0;
  return Math.round((1100.0 + (f - 4) * 150.0) * 100) / 100;
}

export function calculate_bill_of_costs(
  claim_value: number,
  court_schedule: string = 'schedule_6_high_court',
  is_defendant: boolean = false,
  include_getting_up: boolean = true,
  item_folios: BillItem[] = [],
  disbursements: number = 0,
  complexity_multiplier: number = 1.0,
  months_overdue: number = 0,
  apply_vat: boolean = true,
  document_type: string = 'party_party',
  custom_instruction_fee?: number | null,
  case_disposition: string = 'full_trial'
): BillOfCostsResult {
  const val = Math.max(0, Number(claim_value) || 0);
  const sched_key = (court_schedule || 'schedule_6_high_court').toLowerCase().replace(/-/g, '_');

  let instruction_fee = 75000;
  let formula_text = '';
  let schedule_label = court_schedule;

  if (custom_instruction_fee !== undefined && custom_instruction_fee !== null && Number(custom_instruction_fee) > 0) {
    instruction_fee = Math.round(Number(custom_instruction_fee) * 100) / 100;
    formula_text = `Manual / Agreed Instruction Fee Override (Section 45 / Rule 22): KES ${instruction_fee.toLocaleString()}`;
  } else {
    let res: InstructionFeeResult;
    if (sched_key.includes('12') || sched_key.includes('arbitrat')) {
      res = calculate_schedule_12_general(val);
    } else if (sched_key.includes('11') || sched_key.includes('tribunal')) {
      res = calculate_schedule_11_tribunals(val);
    } else if (sched_key.includes('10') || sched_key.includes('probate')) {
      res = calculate_schedule_10_probate(val);
    } else if (sched_key.includes('9') || sched_key.includes('supreme')) {
      res = calculate_schedule_9_supreme_court(val);
    } else if (sched_key.includes('8') || sched_key.includes('appeal')) {
      res = calculate_schedule_8_court_of_appeal(val);
    } else if (sched_key.includes('7') || sched_key.includes('magistrate') || sched_key.includes('subordinate') || (sched_key.includes('5') && sched_key.includes('magistrate'))) {
      res = calculate_schedule_7_magistrate(val);
    } else if (sched_key.includes('5') || sched_key.includes('chattel')) {
      res = calculate_schedule_5_chattels(val);
    } else if (sched_key.includes('4') || sched_key.includes('ip') || sched_key.includes('trademark')) {
      res = calculate_schedule_4_ip(val);
    } else if (sched_key.includes('3') || sched_key.includes('compan')) {
      res = calculate_schedule_3_companies(val);
    } else if (sched_key.includes('2') || sched_key.includes('lease')) {
      res = calculate_schedule_2_leases(val);
    } else if (sched_key.includes('1') || sched_key.includes('conveyanc')) {
      res = calculate_schedule_1_conveyancing(val, 'purchaser');
    } else {
      res = calculate_schedule_6_high_court(val, case_disposition, is_defendant);
    }

    instruction_fee = res.instruction_fee;
    formula_text = res.formula;
    schedule_label = res.schedule;
  }

  // Advocate & Client Statutory Uplift: Part B (+50%)
  if (document_type === 'advocate_client') {
    const uplift = Math.round(instruction_fee * 0.50 * 100) / 100;
    instruction_fee = Math.round((instruction_fee + uplift) * 100) / 100;
    formula_text += ` + 50% Advocate & Client statutory uplift under Part B (+KES ${uplift.toLocaleString()})`;
  }

  if (complexity_multiplier > 1.0) {
    instruction_fee = Math.round(instruction_fee * complexity_multiplier * 100) / 100;
    formula_text += ` [Complexity Multiplier: ${complexity_multiplier}x]`;
  }

  const getting_up_fee = include_getting_up ? calculate_getting_up_fee(instruction_fee) : 0;

  let items_total = 0;
  const processed_items: BillItem[] = [];

  if (item_folios && item_folios.length > 0) {
    for (const item of item_folios) {
      const itype = item.type || 'drawing_pleading_base';
      const qty = Math.max(0, Number(item.qty) || 1);
      const custom_rate = item.unit_rate;

      let subtotal = 0;
      let rate = 0;

      if (custom_rate !== undefined && Number(custom_rate) > 0) {
        rate = Number(custom_rate);
        subtotal = Math.round(qty * rate * 100) / 100;
      } else if (itype === 'drawing_pleading_base' || itype === 'drawing_folio' || itype === 'drawing_plaint') {
        subtotal = calculate_drawing_pleading_fee(qty);
        rate = qty > 0 ? Math.round((subtotal / qty) * 100) / 100 : 1100.0;
      } else {
        rate = ITEM_RATES[itype] || ITEM_RATES.drawing_general_folio || 180.0;
        subtotal = Math.round(qty * rate * 100) / 100;
      }

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

  const taxable_subtotal = Math.round((instruction_fee + getting_up_fee + items_total) * 100) / 100;
  const vat_amount = apply_vat ? Math.round(taxable_subtotal * VAT_RATE * 100) / 100 : 0;
  const grand_total = Math.round((taxable_subtotal + vat_amount + (Number(disbursements) || 0)) * 100) / 100;
  const interest_14 = calculate_statutory_interest(grand_total, months_overdue);

  return {
    schedule: schedule_label,
    formula: formula_text,
    claim_value: val,
    instruction_fee,
    getting_up_fee,
    complexity_multiplier,
    items_total: Math.round(items_total * 100) / 100,
    taxable_subtotal,
    apply_vat,
    document_type,
    case_disposition,
    custom_instruction_fee,
    vat_amount,
    disbursements: Number(disbursements) || 0,
    grand_total,
    interest_14_percent: interest_14,
    months_overdue,
    grand_total_with_interest: Math.round((grand_total + interest_14) * 100) / 100,
    items: processed_items
  };
}