/* ============================================================
   BILLSZIP — FIRST-TIME ADVOCATE 13-STEP INTERACTIVE ONBOARDING TOUR
   Guides first-time users step-by-step through EVERY button, card,
   calculator widget, activity feed, and registry table.
   ============================================================ */

(function() {
  const TOUR_STEPS = [
    {
      target: "#btnBuildBoc",
      title: "1. '+ Build Bill of Costs' Button",
      text: "Click this button to launch the statutory Bill of Costs Builder. Select court levels (Schedule 6 High Court, Schedule 5 Subordinate), enter claim values, and build itemized court attendances and pleadings drawings.",
      position: "bottom"
    },
    {
      target: "#btnFeeNotes",
      title: "2. 'Fee Notes' Registry Button",
      text: "Click here to open the complete Fee Notes Registry table (fee-notes.html). View all generated bills of costs, draft invoices, taxation notices, and change payment statuses inline (Draft, Pending, Paid, Overdue).",
      position: "bottom"
    },
    {
      target: "#btnWorkLog",
      title: "3. '+ Work Log' Button (Time Logger)",
      text: "Click this button to open the 'Add New Work' popup modal. Use this to record court attendances, affidavit drawings, perusals, or disbursements on the fly. Includes strict input error handling.",
      position: "bottom"
    },
    {
      target: "#btnRegisterClient",
      title: "4. '+ Register Client' Button (Real-Time)",
      text: "Click here to open the real-time client registration popup modal. Onboard new Corporate / Institutional or Individual clients with KRA PIN, email, and WhatsApp phone number in real-time.",
      position: "bottom"
    },
    {
      target: "#cardActiveMatters",
      title: "5. 'Active Matters & Cases' Metric Card",
      text: "This card tracks the total count of active court litigations, arbitrations, and conveyancing matters currently handled by your law firm.",
      position: "bottom"
    },
    {
      target: "#cardRegisteredClients",
      title: "6. 'Registered Clients' Metric Card",
      text: "Displays the total number of onboarded corporate and individual clients in your practice database.",
      position: "bottom"
    },
    {
      target: "#cardUncollectedFees",
      title: "7. 'Uncollected / Pending Fees' Metric Card",
      text: "Tracks your firm's pending taxation fee notes and uncollected legal bills awaiting settlement (e.g. Seyani v Green Hills Kshs 30,820,193.28).",
      position: "bottom"
    },
    {
      target: "#cardUnbilledWip",
      title: "8. 'Work in Progress (Unbilled WIP)' Metric Card",
      text: "Tracks accrued unbilled work entries, court attendances, and perusals ready to be converted into formal fee notes.",
      position: "bottom"
    },
    {
      target: "#widgetScaleCalc",
      title: "9. Live Scale Calculator Widget (LN 64/1962)",
      text: "Evaluates statutory instruction fees under Schedule 6 (High Court & Arbitration), Schedule 5 (Subordinate Court), or Schedule 1 (Conveyancing) and 1/3 Getting-Up fees in real-time.",
      position: "top"
    },
    {
      target: "#btnConvertBoc",
      title: "10. 'Convert into Full Bill of Costs →' Button",
      text: "Clicking this button transfers your calculated statutory scale figures directly into the Bill of Costs builder with 1 click.",
      position: "top"
    },
    {
      target: "#widgetActivityFeed",
      title: "11. Recent Law Firm Activity Feed",
      text: "Displays real-time vector activity logs for generated bills of costs, filed taxation notices, and newly registered legal matters.",
      position: "top"
    },
    {
      target: "#tableActiveMatters",
      title: "12. Active Legal Matters Registry Table",
      text: "Lists active matters with Cause References, Court Forums, Claim Values, and Eye 👁️ action buttons that open dedicated 360° Case File Hubs (matter-detail.html).",
      position: "top"
    },
    {
      target: "#tableRecentBills",
      title: "13. Recent Bills & Fee Notes Registry Table",
      text: "Lists recent fee notes with Ref Nos (BOC-2026-SEYANI), Client Names, Amounts, and Eye 👁️ action buttons that open pristine paper canvas documents (fee-note-detail.html).",
      position: "top"
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
      width: 360px;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      color: #0F172A;
      font-family: var(--font-body);
      z-index: 10000;
      display: none;
    `;

    box.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-size:10.5px; font-weight:700; color:#D97706; text-transform:uppercase; letter-spacing:0.5px;" id="tourStepBadge">STEP 1 OF 13</span>
        <button onclick="window.BILLSZIP_TOUR.stop()" style="background:none; border:none; color:#64748B; cursor:pointer; font-size:14px; font-weight:700;">✕</button>
      </div>
      <h3 style="font-family:var(--font-brand); font-size:15px; font-weight:800; color:#0F172A; margin-bottom:6px;" id="tourTitle">Title</h3>
      <p style="font-size:12px; color:#475569; line-height:1.55; margin-bottom:16px;" id="tourText">Text description...</p>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <button class="btn-text" id="tourBackBtn" onclick="window.BILLSZIP_TOUR.back()">← Back</button>
        <div style="display:flex; gap:8px;">
          <button class="btn-pill secondary" onclick="window.BILLSZIP_TOUR.stop()" style="font-size:11px;">Skip Tour</button>
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
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const rect = targetEl.getBoundingClientRect();
      let top = rect.bottom + 12;
      let left = rect.left + (rect.width / 2) - 180;

      if (left < 16) left = 16;
      if (left + 360 > window.innerWidth - 16) left = window.innerWidth - 376;
      if (top + 200 > window.innerHeight - 16) top = rect.top - 210;

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

  window.addEventListener("load", function() {
    if (!localStorage.getItem("BILLSZIP_TOUR_COMPLETED") && window.location.pathname.includes("home.html")) {
      setTimeout(() => window.BILLSZIP_TOUR.start(), 1000);
    }
  });
})();
