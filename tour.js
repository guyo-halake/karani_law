/* ============================================================
   BILLSZIP — FIRST-TIME USER INTERACTIVE ONBOARDING TOUR ENGINE
   Guides advocates step-by-step through key controls, scale calculator,
   matters, fee note builder, and practice management actions.
   ============================================================ */

(function() {
  const TOUR_STEPS = [
    {
      target: ".welcome-section",
      title: "Welcome to Advocates Practice Management!",
      text: "This is your executive dashboard greeting area. Use the action buttons on the far right end to quickly build bills of costs, view fee notes, log work, or onboard new clients in real-time.",
      position: "bottom"
    },
    {
      target: ".stat-grid",
      title: "Actionable Legal Practice Metrics",
      text: "Track 4 high-level KPIs: Active Matters, Registered Clients, Uncollected Taxation Fees (Seyani v Green Hills), and Accrued Unbilled Work in Progress (WIP).",
      position: "bottom"
    },
    {
      target: ".calc-card",
      title: "Live Statutory Scale Calculator (LN 64/1962)",
      text: "Calculate statutory Schedule 6 (High Court & Arbitration), Schedule 5 (Subordinate Court), or Schedule 1 (Conveyancing) instruction fees and 1/3 getting-up fees in real-time, then convert directly into a full Bill of Costs!",
      position: "top"
    },
    {
      target: ".bottom-tables-grid",
      title: "Active Legal Matters & Recent Bills Registry",
      text: "View live cause titles, claim subject values, status badges, and click the Eye 👁️ icon to open dedicated 360-degree Case Hubs or Pristine Paper Fee Notes.",
      position: "top"
    },
    {
      target: ".topbar-controls",
      title: "Advocate Profile & Firm Settings",
      text: "Access your Advocate Profile (LSK Roll No, personal details) and Law Firm Practice Settings (KRA PIN, letterhead seal, bank settlement details).",
      position: "bottom"
    }
  ];

  let currentStep = 0;
  let overlayEl = null;

  function createTourElements() {
    if (document.getElementById("tourOverlay")) return;

    overlayEl = document.createElement("div");
    overlayEl.id = "tourOverlay";
    overlayEl.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(2px);
      z-index: 9999;
      display: none;
    `;

    const box = document.createElement("div");
    box.id = "tourCard";
    box.style.cssText = `
      position: fixed;
      width: 340px;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      color: #0F172A;
      font-family: var(--font-body);
      z-index: 10000;
      display: none;
    `;

    box.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-size:10px; font-weight:700; color:#D97706; text-transform:uppercase; letter-spacing:0.5px;" id="tourStepBadge">STEP 1 OF 5</span>
        <button onclick="window.BILLSZIP_TOUR.stop()" style="background:none; border:none; color:#64748B; cursor:pointer; font-size:14px; font-weight:700;">✕</button>
      </div>
      <h3 style="font-family:var(--font-brand); font-size:15px; font-weight:800; color:#0F172A; margin-bottom:6px;" id="tourTitle">Title</h3>
      <p style="font-size:12px; color:#475569; line-height:1.55; margin-bottom:16px;" id="tourText">Text description...</p>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <button class="btn-text" id="tourBackBtn" onclick="window.BILLSZIP_TOUR.back()">← Back</button>
        <div style="display:flex; gap:8px;">
          <button class="btn-pill secondary" onclick="window.BILLSZIP_TOUR.stop()" style="font-size:11px;">Skip</button>
          <button class="btn-pill primary" id="tourNextBtn" onclick="window.BILLSZIP_TOUR.next()" style="font-size:11px;">Next →</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlayEl);
    document.body.appendChild(box);
  }

  function renderStep(index) {
    const step = TOUR_STEPS[index];
    if (!step) return;

    const card = document.getElementById("tourCard");
    const badge = document.getElementById("tourStepBadge");
    const title = document.getElementById("tourTitle");
    const text = document.getElementById("tourText");
    const backBtn = document.getElementById("tourBackBtn");
    const nextBtn = document.getElementById("tourNextBtn");

    badge.innerText = `STEP ${index + 1} OF ${TOUR_STEPS.length}`;
    title.innerText = step.title;
    text.innerText = step.text;

    backBtn.style.visibility = index === 0 ? "hidden" : "visible";
    nextBtn.innerText = index === TOUR_STEPS.length - 1 ? "Finish Tour ✓" : "Next →";

    const targetEl = document.querySelector(step.target);
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      let top = rect.bottom + 12;
      let left = rect.left + (rect.width / 2) - 170;

      if (left < 16) left = 16;
      if (left + 340 > window.innerWidth - 16) left = window.innerWidth - 356;
      if (top + 180 > window.innerHeight - 16) top = rect.top - 190;

      card.style.top = `${Math.max(16, top)}px`;
      card.style.left = `${Math.max(16, left)}px`;
    } else {
      card.style.top = "20%";
      card.style.left = "50%";
      card.style.transform = "translateX(-50%)";
    }
  }

  window.BILLSZIP_TOUR = {
    start: function() {
      createTourElements();
      currentStep = 0;
      document.getElementById("tourOverlay").style.display = "block";
      document.getElementById("tourCard").style.display = "block";
      renderStep(currentStep);
    },
    next: function() {
      if (currentStep < TOUR_STEPS.length - 1) {
        currentStep++;
        renderStep(currentStep);
      } else {
        this.stop();
      }
    },
    back: function() {
      if (currentStep > 0) {
        currentStep--;
        renderStep(currentStep);
      }
    },
    stop: function() {
      const overlay = document.getElementById("tourOverlay");
      const card = document.getElementById("tourCard");
      if (overlay) overlay.style.display = "none";
      if (card) card.style.display = "none";
      localStorage.setItem("BILLSZIP_TOUR_COMPLETED", "true");
    }
  };

  // Auto-start for first-time visitors after 1 second
  window.addEventListener("load", function() {
    if (!localStorage.getItem("BILLSZIP_TOUR_COMPLETED") && window.location.pathname.includes("home.html")) {
      setTimeout(() => window.BILLSZIP_TOUR.start(), 1000);
    }
  });
})();
