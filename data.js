/* ============================================
   Billszip In-Memory Data Store & LocalStorage
   Contains Advocates Remuneration Order initial records,
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
  ]
};
