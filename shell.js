/* ============================================================
   App Shell Engine — Top Bar Header Navigation & Theme Switcher
   Features:
   - Official Kenyan Law Firm Seal Logo & Real Company Name
   - Top Bar Navigation Buttons (Home, Bill of Costs, Matters, Clients, Guide)
   - Rounded Pill "+ New Bill" Action Button
   - Scroll-activated compact header (hides center links on scroll)
   - Action Icons: Eye (View), Share (Native / WhatsApp / Email / Print), Delete
   - Theme Switcher (Dark Mode / Minimalist Light Mode toggle)
   - Advocate Profile Avatar with dropdown
   ============================================================ */

const TOP_ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 1 1-1v-9"/></svg>',
  boc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>',
  matters: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/></svg>',
  clients: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3"/><path d="M2.5 19c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5"/><circle cx="17" cy="8" r="2.4"/><path d="M15.5 14.2c2.3.3 4 1.9 4.6 4.3"/></svg>',
  guide: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1h-.2a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5v-.2a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
  vault: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>'
};

const TOP_NAV_ITEMS = [
  { id: "home", label: "Home", href: "home.html", icon: "home" },
  { id: "boc", label: "Bill of Costs", href: "bill-of-costs-builder.html", icon: "boc" },
  { id: "matters", label: "My Matters", href: "matters.html", icon: "matters" },
  { id: "clients", label: "My Clients", href: "clients.html", icon: "clients" },
  { id: "vault", label: "Excel/PDF Vault", href: "excel-vault.html", icon: "vault" },
  { id: "guide", label: "Remuneration Guide", href: "remuneration-guide.html", icon: "guide" }
];

function initTheme() {
  const savedTheme = localStorage.getItem("BILLSZIP_THEME") || "light";
  if (savedTheme === "dark") {
    document.body.classList.remove("light-theme");
  } else {
    document.body.classList.add("light-theme");
  }
}

function toggleTheme() {
  const isLight = document.body.classList.toggle("light-theme");
  localStorage.setItem("BILLSZIP_THEME", isLight ? "light" : "dark");
  const iconSpan = document.getElementById("themeIcon");
  if (iconSpan) {
    iconSpan.innerHTML = isLight ? TOP_ICONS.moon : TOP_ICONS.sun;
  }
}

function renderShell(opts) {
  initTheme();
  const firm = window.APP_DATA.firm;
  const isLight = document.body.classList.contains("light-theme");

  const navHtml = TOP_NAV_ITEMS.map(item => `
    <a class="top-nav-link ${item.id === opts.page ? 'active' : ''}" href="${item.href}">
      ${TOP_ICONS[item.icon]}
      <span>${item.label}</span>
    </a>`).join("");

  const topbarHtml = `
    <div class="app-container">
      <header class="main-topbar" id="mainTopbar">
        <!-- Seal Logo & Company Name -->
        <a class="topbar-brand" href="home.html">
          <img class="seal-logo" src="kenya_law_seal.jpg" alt="Kenyan Law Seal">
          <div class="firm-title">
            Nyagah B. Kithinji & Co.
            <span>Advocates & Legal Consultants</span>
          </div>
        </a>

        <!-- Top Navigation Links -->
        <nav class="top-nav-links">
          ${navHtml}
        </nav>

        <!-- Right Side Controls -->
        <div class="topbar-controls">
          <!-- Minimalist Rounded Pill + New Bill Button -->
          <a class="btn-pill primary" href="bill-of-costs-builder.html">
            ${TOP_ICONS.plus} New Bill
          </a>

          <!-- Theme Switcher Button -->
          <button class="icon-btn" onclick="toggleTheme()" title="Toggle Light/Dark Theme">
            <span id="themeIcon">${isLight ? TOP_ICONS.moon : TOP_ICONS.sun}</span>
          </button>

          <!-- Notification Bell Button -->
          <div style="position: relative;">
            <button class="icon-btn" onclick="toggleDropdown('notifMenu')" title="Notifications">
              ${TOP_ICONS.bell}
              <span class="badge-dot"></span>
            </button>

            <!-- Notifications Dropdown -->
            <div class="dropdown-menu" id="notifMenu" style="width: 280px; padding: 12px;">
              <div style="font-weight:700; font-size:12px; color:var(--ink-primary); border-bottom:var(--glass-border); padding-bottom:8px; margin-bottom:8px;">
                🔔 Notifications & Taxations
              </div>
              <div style="font-size:12px; color:var(--ink-secondary); margin-bottom:8px;">
                <strong>HCCC E104/2025:</strong> Taxation notice set for 24th Aug 2026.
              </div>
              <div style="font-size:12px; color:var(--ink-secondary);">
                <strong>Seyani Brothers:</strong> Bill of Costs draft saved successfully.
              </div>
            </div>
          </div>

          <!-- Advocate Profile Avatar Dropdown Trigger -->
          <div style="position: relative;">
            <div class="profile-trigger" onclick="toggleDropdown('profileMenu')">
              <img class="avatar-img" src="advocate_avatar.jpg" alt="V. Karani Advocate">
              <span class="adv-name">V. Karani</span>
              <span class="chevron">${TOP_ICONS.chevron}</span>
            </div>

            <!-- Profile Dropdown Popup -->
            <div class="dropdown-menu" id="profileMenu">
              <div style="padding: 12px 16px; border-bottom: var(--glass-border);">
                <div style="font-weight: 700; color: var(--ink-primary); font-size: 13px;">V. Karani, Advocate</div>
                <div style="font-size: 11px; color: var(--ink-muted); margin-top:2px;">LSK No: P.105/9920</div>
              </div>
              <a class="dropdown-item" href="profile.html">
                ${TOP_ICONS.user} My Advocate Profile
              </a>
              <a class="dropdown-item" href="settings.html">
                ${TOP_ICONS.settings} Law Firm Settings
              </a>
              <a class="dropdown-item" href="login.html" style="color: var(--accent-rose); border-top: var(--glass-border); margin-top: 4px; padding-top: 8px;">
                ${TOP_ICONS.logout} Sign Out
              </a>
            </div>
          </div>
        </div>
      </header>

      <main class="main-content" id="pageContent"></main>
    </div>
  `;

  document.getElementById("app").innerHTML = topbarHtml;

  // Scroll Event Listener to hide center top nav links on scroll down
  window.addEventListener("scroll", function() {
    const topbar = document.getElementById("mainTopbar");
    if (topbar) {
      if (window.scrollY > 40) {
        topbar.classList.add("scrolled");
      } else {
        topbar.classList.remove("scrolled");
      }
    }
  });

  // Close dropdowns on outside click
  document.addEventListener("click", function(e) {
    if (!e.target.closest(".profile-trigger") && !e.target.closest(".icon-btn")) {
      document.querySelectorAll(".dropdown-menu").forEach(d => d.classList.remove("show"));
    }
  });
}

function toggleDropdown(menuId) {
  const target = document.getElementById(menuId);
  const isOpen = target.classList.contains("show");
  document.querySelectorAll(".dropdown-menu").forEach(d => d.classList.remove("show"));
  if (!isOpen) {
    target.classList.add("show");
  }
}

// Global Share Modal (Native Share API or WhatsApp / Email / Print options)
window.openShareModal = function(title, docId) {
  const pageUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + 'fee-note-detail.html?id=' + docId;
  const shareText = `Bill of Costs & Fee Note Document (${docId.toUpperCase()}) — ${title}`;

  if (navigator.share) {
    navigator.share({
      title: shareText,
      text: shareText,
      url: pageUrl
    }).catch(err => {});
    return;
  }

  // Fallback modal dialog
  const modalHtml = `
    <div class="modal-backdrop" id="shareModal" onclick="if(event.target === this) closeShareModal()">
      <div class="modal-card">
        <h3 style="font-family:var(--font-brand); font-size:16px; color:var(--ink-primary); margin-bottom:12px;">
          🔗 Share Fee Note (${docId.toUpperCase()})
        </h3>
        <p style="font-size:12.5px; color:var(--ink-secondary); margin-bottom:16px;">${title}</p>
        
        <div style="display:flex; flex-direction:column; gap:10px;">
          <a class="btn secondary" href="https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + pageUrl)}" target="_blank">
            💬 Share via WhatsApp
          </a>
          <a class="btn secondary" href="mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(pageUrl)}" target="_blank">
            ✉️ Share via Email
          </a>
          <button class="btn secondary" onclick="navigator.clipboard.writeText('${pageUrl}'); alert('Document link copied to clipboard!'); closeShareModal();">
            📋 Copy Document Link
          </button>
          <button class="btn primary" onclick="window.location.href='fee-note-detail.html?id=${docId}'; closeShareModal();">
            🖨️ View & Print Document
          </button>
        </div>
        <button class="btn small secondary" onclick="closeShareModal()" style="margin-top:16px; width:100%;">Close</button>
      </div>
    </div>
  `;

  const existing = document.getElementById("shareModal");
  if (existing) existing.remove();

  document.body.insertAdjacentHTML("beforeend", modalHtml);
};

window.closeShareModal = function() {
  const m = document.getElementById("shareModal");
  if (m) m.remove();
};

window.deleteBillDoc = function(docId) {
  if (confirm(`Are you sure you want to delete Bill of Costs (${docId.toUpperCase()})?`)) {
    let drafts = JSON.parse(localStorage.getItem("BILLSZIP_BILLS_OF_COSTS") || "[]");
    drafts = drafts.filter(d => d.id !== docId);
    localStorage.setItem("BILLSZIP_BILLS_OF_COSTS", JSON.stringify(drafts));
    alert("Document deleted.");
    window.location.reload();
  }
};

function money(n) {
  return "Kshs " + Number(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusPill(status) {
  const labels = { paid: "Paid & Taxed", pending: "Pending Taxation", overdue: "Overdue", draft: "Draft" };
  return `<span class="status-pill ${status}"><span class="dot"></span>${labels[status] || status}</span>`;
}
