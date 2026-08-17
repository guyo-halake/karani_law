/**
 * Bills of Costs Library — Executive Law Firm Engine
 * Nyagah B. Kithinji & Co. Advocates
 * Clean SVG Vector Icons, Light Roboto & Inter Typography.
 */

(function() {
  'use strict';

  const DEFAULT_MATTERS = [
    {
      id: 'seyani',
      title: 'Seyani Brothers & Co. (K) Ltd v Greenhills Investment Ltd',
      applicant: 'Seyani Brothers & Co. (K) Ltd',
      applicantRole: 'Claimant',
      respondent: 'Greenhills Investment Ltd',
      respondentRole: 'Respondent',
      forum: 'Arbitration',
      status: 'Taxation Ready',
      statusClass: 'ready',
      caseNo: 'Under Arbitration Act 1995',
      filedBy: 'Nyagah B. Kithinji & Co. Advocates — for the Claimant',
      amount: 30820193.28,
      itemsCount: 250,
      url: 'case-seyani.html'
    },
    {
      id: 'hccomm',
      title: 'Zhenjian Chengjian Construction Africa Ltd v Eighty Eight Nairobi Ltd & Anor',
      applicant: 'Zhenjian Chengjian Construction',
      applicantRole: 'Plaintiff',
      respondent: 'Eighty Eight Nairobi Ltd & Anor',
      respondentRole: 'Defendants',
      forum: 'High Court — Commercial',
      status: 'Commercial Court',
      statusClass: 'court',
      caseNo: 'HCCOMM E547 of 2024',
      filedBy: 'Nyagah B. Kithinji & Co. Advocates — for Defendants',
      amount: 405594.00,
      itemsCount: 19,
      url: 'case-hccomm.html'
    },
    {
      id: 'dhanya',
      title: 'Dhanya Construction Kenya Ltd v Sunil Shah',
      applicant: 'Dhanya Construction Kenya Ltd',
      applicantRole: 'Claimant',
      respondent: 'Sunil Shah',
      respondentRole: 'Respondent',
      forum: 'Arbitration',
      status: 'Taxation Ready',
      statusClass: 'ready',
      caseNo: 'Under Arbitration Act 1995',
      filedBy: 'Nyagah B. Kithinji & Co. Advocates — for the Claimant',
      amount: 3986663.93,
      itemsCount: 226,
      url: 'case-dhanya.html'
    }
  ];

  const SVG_CSV = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
  const SVG_PDF = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';

  function getMatters() {
    try {
      const stored = localStorage.getItem('karani_matters');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return DEFAULT_MATTERS;
  }

  function saveMatters(matters) {
    try {
      localStorage.setItem('karani_matters', JSON.stringify(matters));
    } catch (e) {
      console.error('Failed to save matters:', e);
    }
  }

  function formatKshs(num) {
    return 'Kshs ' + Number(num || 0).toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function exportMatterCSV(matterId) {
    const matters = getMatters();
    const matter = matters.find(m => m.id === matterId);
    if (!matter) return;

    let csv = 'Field,Value\n';
    csv += `"Matter Title","${matter.title.replace(/"/g, '""')}"\n`;
    csv += `"Forum","${matter.forum.replace(/"/g, '""')}"\n`;
    csv += `"Case Number","${matter.caseNo.replace(/"/g, '""')}"\n`;
    csv += `"Filed By","${matter.filedBy.replace(/"/g, '""')}"\n`;
    csv += `"Item Count",${matter.itemsCount}\n`;
    csv += `"Amount Claimed (Kshs)",${matter.amount}\n`;

    downloadCSV(csv, matter.id + '_Summary_Report.csv');
  }

  // --- Dashboard Controller ---
  function initDashboard() {
    const gridContainer = document.getElementById('cardGridContainer');
    const listContainer = document.getElementById('docListContainer');
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    const iconViewBtns = document.querySelectorAll('.icon-btn-nav');

    if (!gridContainer && !listContainer) return;

    let currentView = localStorage.getItem('karani_view_mode') || 'grid';

    iconViewBtns.forEach(btn => {
      if (btn.dataset.view === currentView) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    function render() {
      const allMatters = getMatters();
      const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
      const activeFilter = filterSelect ? filterSelect.value : 'all';

      let filtered = allMatters.filter(m => {
        const matchesFilter = activeFilter === 'all' ||
          (activeFilter === 'arbitration' && m.forum.toLowerCase().includes('arbitration')) ||
          (activeFilter === 'highcourt' && m.forum.toLowerCase().includes('high court'));

        const matchesQuery = !query ||
          m.title.toLowerCase().includes(query) ||
          m.caseNo.toLowerCase().includes(query) ||
          m.filedBy.toLowerCase().includes(query) ||
          m.forum.toLowerCase().includes(query);

        return matchesFilter && matchesQuery;
      });

      filtered.sort((a, b) => b.amount - a.amount);

      if (currentView === 'grid') {
        if (gridContainer) gridContainer.style.display = 'grid';
        if (listContainer) listContainer.style.display = 'none';
      } else {
        if (gridContainer) gridContainer.style.display = 'none';
        if (listContainer) listContainer.style.display = 'block';
      }

      if (gridContainer) {
        if (filtered.length === 0) {
          gridContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">No legal matters found matching search.</div>';
        } else {
          gridContainer.innerHTML = filtered.map(m => `
            <div class="case-card" onclick="window.location.href='${m.url}'">
              <div class="card-top">
                <div class="badge-group">
                  <span class="forum-tag">${escapeHtml(m.forum)}</span>
                  <span class="status-pill ${m.statusClass || 'ready'}">${escapeHtml(m.status || 'Taxation Ready')}</span>
                </div>
                <span class="case-no">${escapeHtml(m.caseNo)}</span>
              </div>

              <h2>${escapeHtml(m.title)}</h2>

              <div class="party-breakdown">
                <div class="party-row">
                  <span class="party-name">${escapeHtml(m.applicant || m.title.split('v')[0] || 'Claimant')}</span>
                  <span class="party-role">${escapeHtml(m.applicantRole || 'Claimant')}</span>
                </div>
                <div class="party-row">
                  <span class="party-name">${escapeHtml(m.respondent || m.title.split('v')[1] || 'Respondent')}</span>
                  <span class="party-role">${escapeHtml(m.respondentRole || 'Respondent')}</span>
                </div>
              </div>

              <span class="filed-by">${escapeHtml(m.filedBy)}</span>

              <div class="stats">
                <div class="amount-block">
                  <span class="amount-label">Claimed Total</span>
                  <span class="amount">${formatKshs(m.amount)}</span>
                  <span class="items-tag">${m.itemsCount} itemised entries</span>
                </div>

                <div class="card-actions">
                  <button type="button" class="action-btn-secondary" onclick="event.stopPropagation(); exportMatterCSV('${m.id}')" title="Export CSV Summary">${SVG_CSV} CSV</button>
                  <a href="${m.url}#print" target="_blank" onclick="event.stopPropagation();" class="action-btn-secondary" title="Export PDF">${SVG_PDF} PDF</a>
                  <a href="${m.url}" class="action-btn-primary" title="Open Interactive Taxation Sheet">Open Bill &rarr;</a>
                </div>
              </div>
            </div>
          `).join('');
        }
      }

      if (listContainer) {
        if (filtered.length === 0) {
          listContainer.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">No legal matters found matching search.</div>';
        } else {
          listContainer.innerHTML = `
            <table class="doc-list-table">
              <thead>
                <tr>
                  <th>Forum & Status</th>
                  <th>Matter Title & Case No.</th>
                  <th>Filed By / Advocates</th>
                  <th class="num">Items</th>
                  <th class="num">Amount Claimed</th>
                  <th class="num">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(m => `
                  <tr class="doc-list-row" onclick="window.location.href='${m.url}'">
                    <td>
                      <span class="forum-tag">${escapeHtml(m.forum)}</span>
                      <div style="margin-top:4px;"><span class="status-pill ${m.statusClass || 'ready'}">${escapeHtml(m.status || 'Taxation Ready')}</span></div>
                    </td>
                    <td>
                      <div class="doc-title">${escapeHtml(m.title)}</div>
                      <div class="doc-caseno">${escapeHtml(m.caseNo)}</div>
                    </td>
                    <td class="doc-filedby">${escapeHtml(m.filedBy)}</td>
                    <td class="num font-mono">${m.itemsCount}</td>
                    <td class="num font-mono" style="font-weight:600;">${formatKshs(m.amount)}</td>
                    <td class="num" onclick="event.stopPropagation();">
                      <button type="button" class="action-btn-secondary" onclick="exportMatterCSV('${m.id}')" title="Export CSV">${SVG_CSV} CSV</button>
                      <a href="${m.url}#print" target="_blank" class="action-btn-secondary" title="Export PDF">${SVG_PDF} PDF</a>
                      <a href="${m.url}" class="action-btn-primary">Open Bill &rarr;</a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        }
      }
    }

    iconViewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        iconViewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentView = btn.dataset.view;
        localStorage.setItem('karani_view_mode', currentView);
        render();
      });
    });

    if (searchInput) searchInput.addEventListener('input', render);
    if (filterSelect) filterSelect.addEventListener('change', render);

    window.exportMatterCSV = exportMatterCSV;
    render();
  }

  // --- Left Hover Sidebar Dock Controllers ---
  function initHoverSidebar() {
    const sbExcel = document.getElementById('sbExcelBtn');
    const sbSettings = document.getElementById('sbSettingsBtn');

    const excelModal = document.getElementById('excelStorageModal');
    const closeExcel = document.getElementById('closeExcelStorage');

    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    const settingsForm = document.getElementById('settingsForm');

    if (sbExcel && excelModal) {
      sbExcel.addEventListener('click', (e) => {
        e.preventDefault();
        excelModal.classList.add('active');
      });
    }
    if (closeExcel && excelModal) {
      closeExcel.addEventListener('click', () => excelModal.classList.remove('active'));
      excelModal.addEventListener('click', (e) => { if (e.target === excelModal) excelModal.classList.remove('active'); });
    }

    if (sbSettings && settingsModal) {
      sbSettings.addEventListener('click', (e) => {
        e.preventDefault();
        settingsModal.classList.add('active');
      });
    }
    if (closeSettings && settingsModal) {
      closeSettings.addEventListener('click', () => settingsModal.classList.remove('active'));
      settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) settingsModal.classList.remove('active'); });
    }

    if (settingsForm && settingsModal) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Settings saved successfully!');
        settingsModal.classList.remove('active');
      });
    }
  }

  // --- Modal Controller ---
  function initModal() {
    const addBtn = document.getElementById('addMatterBtn');
    const modal = document.getElementById('matterModal');
    const closeModal = document.getElementById('closeModal');
    const manualForm = document.getElementById('createMatterForm');

    if (!addBtn || !modal) return;

    function open() { modal.classList.add('active'); }
    function close() { modal.classList.remove('active'); }

    addBtn.addEventListener('click', open);
    if (closeModal) closeModal.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    if (manualForm) {
      manualForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('mTitle').value.trim();
        const forum = document.getElementById('mForum').value.trim();
        const caseNo = document.getElementById('mCaseNo').value.trim();
        const filedBy = document.getElementById('mFiledBy').value.trim() || 'Nyagah B. Kithinji & Co. Advocates';
        const amount = parseFloat(document.getElementById('mAmount').value) || 0;
        const itemsCount = parseInt(document.getElementById('mItemsCount').value, 10) || 1;

        if (!title || !forum) return;

        const id = 'custom_' + Date.now();
        const parts = title.split(/ v | vs /i);
        const newMatter = {
          id: id,
          title: title,
          applicant: parts[0] || 'Claimant',
          applicantRole: 'Claimant',
          respondent: parts[1] || 'Respondent',
          respondentRole: 'Respondent',
          forum: forum,
          status: 'Taxation Ready',
          statusClass: 'ready',
          caseNo: caseNo || 'Case No. Pending',
          filedBy: filedBy,
          amount: amount,
          itemsCount: itemsCount,
          url: 'case-hccomm.html?matterId=' + id
        };

        const current = getMatters();
        current.unshift(newMatter);
        saveMatters(current);

        manualForm.reset();
        close();
        initDashboard();
      });
    }
  }

  // --- Detail Page Controller ---
  function initDetailPage() {
    const table = document.getElementById('billTable');
    if (!table) return;

    if (window.location.hash === '#print') {
      setTimeout(() => window.print(), 300);
    }

    const pageId = window.location.pathname.split('/').pop().replace('.html', '');
    const resetBtn = document.getElementById('resetBtn');
    const addItemBtn = document.getElementById('addItemBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');

    const savedDeductionsKey = 'deductions_' + pageId;
    let savedDeductions = {};
    try {
      savedDeductions = JSON.parse(localStorage.getItem(savedDeductionsKey)) || {};
    } catch(e) {}

    function bindRows() {
      const rows = table.querySelectorAll('tr.item-row');
      rows.forEach((row, idx) => {
        const input = row.querySelector('.taxed-input');
        if (input) {
          if (savedDeductions[idx] !== undefined && savedDeductions[idx] !== '') {
            input.value = savedDeductions[idx];
          }

          input.addEventListener('input', () => {
            savedDeductions[idx] = input.value;
            localStorage.setItem(savedDeductionsKey, JSON.stringify(savedDeductions));
            recalc();
          });
        }

        const particularsCell = row.querySelector('.particulars-cell');
        const dateCell = row.querySelector('.date-cell');
        const claimedCell = row.querySelector('.claimed-cell');

        [particularsCell, dateCell, claimedCell].forEach(cell => {
          if (cell && !cell.dataset.editableBound) {
            cell.dataset.editableBound = 'true';
            cell.title = 'Double click to edit cell content';
            cell.addEventListener('dblclick', function() {
              const origText = cell.textContent.trim().replace(/,/g, '');
              const newText = prompt('Edit cell text:', origText);
              if (newText !== null && newText !== origText) {
                cell.textContent = newText;
                if (cell === claimedCell) {
                  const val = parseFloat(newText) || 0;
                  row.setAttribute('data-claimed', val);
                  cell.textContent = val.toLocaleString('en-KE', {minimumFractionDigits:2, maximumFractionDigits:2});
                }
                recalc();
              }
            });
          }
        });
      });
    }

    function recalc() {
      const rows = table.querySelectorAll('tr.item-row');
      let totalTaxed = 0;
      let totalClaimed = 0;

      rows.forEach(row => {
        const claimedAttr = parseFloat(row.getAttribute('data-claimed')) || 0;
        totalClaimed += claimedAttr;

        const input = row.querySelector('.taxed-input');
        if (input) {
          const v = parseFloat(input.value);
          if (!isNaN(v) && v > 0) totalTaxed += v;
        }
      });

      const subEl = document.getElementById('subtotalTaxed');
      if (subEl) subEl.textContent = formatKshs(totalTaxed);

      let grandClaimed = totalClaimed;
      const grandClaimedEl = document.getElementById('grandClaimed');
      if (grandClaimedEl) {
        const textVal = grandClaimedEl.textContent.replace(/[^\d.]/g, '');
        if (textVal) grandClaimed = parseFloat(textVal);
      }

      const netGrand = grandClaimed - totalTaxed;
      const netEl = document.getElementById('grandNet');
      if (netEl) netEl.textContent = 'Net: ' + formatKshs(netGrand);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        table.querySelectorAll('.taxed-input').forEach(i => i.value = '');
        localStorage.removeItem(savedDeductionsKey);
        savedDeductions = {};
        recalc();
      });
    }

    if (addItemBtn) {
      addItemBtn.addEventListener('click', () => {
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr.item-row');
        const nextItemNo = rows.length + 1;

        const dateStr = new Date().toLocaleDateString('en-GB');
        const newTr = document.createElement('tr');
        newTr.className = 'item-row';
        newTr.setAttribute('data-claimed', '1000');
        newTr.innerHTML = `
          <td class="date-cell">${dateStr}</td>
          <td class="item-cell">${nextItemNo}</td>
          <td class="particulars-cell">New legal service item (Double click to edit)</td>
          <td class="amount-cell claimed-cell">1,000.00</td>
          <td class="amount-cell taxed-cell"><input type="number" class="taxed-input" min="0" step="0.01" data-row aria-label="Amount taxed off"></td>
        `;

        tbody.appendChild(newTr);
        bindRows();
        recalc();
      });
    }

    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => { window.print(); });
    }

    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const rows = table.querySelectorAll('tr.item-row');
        let csv = 'Date,Item #,Particulars of Service,Amount Claimed (Kshs),Amount Taxed Off (Kshs),Net Amount (Kshs)\n';

        rows.forEach(r => {
          const date = (r.querySelector('.date-cell')?.textContent || '').trim();
          const item = (r.querySelector('.item-cell')?.textContent || '').trim();
          const part = (r.querySelector('.particulars-cell')?.textContent || '').trim().replace(/"/g, '""');
          const claimed = parseFloat(r.getAttribute('data-claimed')) || 0;
          const taxedInput = r.querySelector('.taxed-input');
          const taxed = taxedInput ? (parseFloat(taxedInput.value) || 0) : 0;
          const net = claimed - taxed;

          csv += `"${date}","${item}","${part}",${claimed},${taxed},${net}\n`;
        });

        const caseTitleEl = document.querySelector('.title-block h1') || document.querySelector('h1');
        const titleText = caseTitleEl ? caseTitleEl.textContent.trim().replace(/[^a-zA-Z0-9]/g, '_') : 'Bill_of_Costs';
        downloadCSV(csv, titleText + '_Taxation_Export.csv');
      });
    }

    bindRows();
    recalc();
  }

  function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initHoverSidebar();
    initModal();
    initDetailPage();
  });

})();
