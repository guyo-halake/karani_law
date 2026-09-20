/* ============================================
   Billszip In-Memory Data Store & Supabase Real-Time Client
   Contains Advocates Remuneration Order records,
   Clients, Matters, Fee Notes, and Bills of Costs.
   ============================================ */

window.APP_DATA = {
  firm: {
    name: "Nyagah B. Kithinji & Co. Advocates",
    firmRegNo: "P.105/1992/2026",
    address: "Suite 4B, Mbaruk Road, Off Muchai Drive, Golf Course Estate",
    poBox: "P.O. Box 1992-00100, Nairobi",
    email: "info@nbkco-advocates.com",
    phone: "+254 (0)20 271 8890 / +254 722 000 111",
    kraPin: "P051123456Z",
    bankDetails: "KCB Bank Kenya Ltd | Kilimani Branch | A/C No: 1104889922 | Swift: KCBLKENX",
    user: {
      name: "V. Karani, Advocate",
      role: "Senior Partner & Advocate",
      lskNo: "P.105/9920",
      email: "vkarani@nbkco-advocates.com"
    }
  },

  clients: [
    { id: "c1", name: "Seyani Brothers & Co. (K) Limited", email: "info@seyani.co.ke", phone: "+254 720 100 200", matters: 2 },
    { id: "c2", name: "Dhanya Construction Kenya Limited", email: "legal@dhanyaconstruction.co.ke", phone: "+254 733 400 500", matters: 1 },
    { id: "c3", name: "Faraja Restaurant Limited", email: "finance@farajagroup.co.ke", phone: "+254 711 900 800", matters: 1 },
    { id: "c4", name: "Kamau & Waweru Family Trust", email: "trustees@kamauwaweru.or.ke", phone: "+254 722 555 444", matters: 1 }
  ],

  matters: [
    { id: "m1", clientId: "c1", title: "Seyani Brothers & Co. (K) Ltd v Greenhills Investment Ltd", forum: "Arbitration / High Court", causeNo: "HCCC No. E104 of 2025", status: "In Taxation", claimValue: 30820193.28 },
    { id: "m2", clientId: "c2", title: "Dhanya Construction Kenya Ltd v Sunil Shah", forum: "Arbitration", causeNo: "Arb. Cause No. 12 of 2025", status: "Open", claimValue: 3986663.93 },
    { id: "m3", clientId: "c3", title: "Faraja Restaurant — Commercial Lease Renewal Advisory", forum: "Non-contentious / Conveyancing", causeNo: "N/A", status: "Open", claimValue: 14500000.00 },
    { id: "m4", clientId: "c4", title: "Kamau & Waweru — Succession & Probate Estate Administration", forum: "High Court Family Division", causeNo: "Succ. Cause No. 889 of 2024", status: "Closed", claimValue: 8950000.00 }
  ],

  feeNotes: [
    { id: "fn1001", matterId: "m1", client: "Seyani Brothers & Co. (K) Limited", date: "2026-02-26", amount: 30820193.28, status: "pending", type: "Bill of Costs" },
    { id: "fn1002", matterId: "m2", client: "Dhanya Construction Kenya Limited", date: "2026-01-14", amount: 3986663.93, status: "paid", type: "Fee Note" },
    { id: "fn1003", matterId: "m3", client: "Faraja Restaurant Limited", date: "2026-03-02", amount: 145000.00, status: "draft", type: "Fee Note" },
    { id: "fn1004", matterId: "m4", client: "Kamau & Waweru Family Trust", date: "2025-11-18", amount: 89500.00, status: "overdue", type: "Fee Note" }
  ],

  folders: [
    { id: "f1", name: "Litigation & Arbitration Vault", path: "/Litigation" },
    { id: "f2", name: "Seyani v Greenhills (HCCC E104/2025)", parentId: "f1", path: "/Litigation/Seyani" },
    { id: "f3", name: "Dhanya v Sunil Shah (Arb 12/2025)", parentId: "f1", path: "/Litigation/Dhanya" },
    { id: "f4", name: "Conveyancing & Commercial Leases", path: "/Conveyancing" }
  ],

  documents: [
    { id: "d1", name: "26.02.2026 - BILL OF COSTS - Seyani v Green Hills.xlsx", folderId: "f2", size: "32.2 KB", version: 2, tags: ["taxation", "bill_of_costs", "high_court"], updated: "2026-02-26" },
    { id: "d2", name: "14.01.2026 - Bill of Costs - Dhanya v Sunil.xlsx", folderId: "f3", size: "27.0 KB", version: 1, tags: ["taxation", "arbitration"], updated: "2026-01-14" },
    { id: "d3", name: "HCCOMM E547 of 2024 - Main Suit - 88 Party Bill of Costs.xlsx", folderId: "f2", size: "13.9 KB", version: 3, tags: ["pleading", "commercial"], updated: "2026-03-01" }
  ]
};

/* ============================================
   Live Supabase Real-Time Project Credentials
   ============================================ */
window.SUPABASE_CONFIG = {
  url: "https://hhkbypvdwikxdlwivmrn.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoa2J5cHZkd2lreGRsd2l2bXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NTg2NTUsImV4cCI6MjEwNTAzNDY1NX0.WBtSdlFX-DFG_Rfaf_19GU7meTBSvDUTzkosft-hjlc"
};

window.LEXFLOW_API = {
  baseUrl: "/api/v1",
  
  async calculateRemuneration(payload) {
    try {
      const res = await fetch(`${this.baseUrl}/remuneration/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn("FastAPI backend offline, running browser fallback math", e);
    }
    // Fallback calculation using browser remuneration engine
    if (window.REMUNERATION && window.REMUNERATION.calculateBillOfCosts) {
      return window.REMUNERATION.calculateBillOfCosts(
        payload.claim_value,
        payload.court_schedule,
        payload.is_defendant,
        payload.include_getting_up,
        payload.items,
        payload.disbursements
      );
    }
    return null;
  }
};
