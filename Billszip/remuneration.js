/* ============================================================
   Remuneration Engine for Kenyan Advocates (Browser JS)
   Ref: Advocates (Remuneration) (Amendment) Order (Kenya Law LN 64/1962 ed. 2022)
   ============================================================ */

window.REMUNERATION = (function() {
  const VAT_RATE = 0.16;

  const ITEM_RATES = {
    drawing_folio: 500.0,        // Per folio of 100 words
    copying_folio: 50.0,         // Per folio of 100 words
    attendance_court_hr: 2500.0,  // Per hour in court
    attendance_office_hr: 1500.0, // Per hour in office
    letter_formal: 500.0,        // Formal letter
    letter_ordinary: 300.0,      // Ordinary letter
    perusal_folio: 100.0         // Per folio perused
  };

  function calculateHighCourtInstructionFee(value, isDefendant = false) {
    const val = Math.max(0, Number(value) || 0);
    const minFee = isDefendant ? 50000.0 : 75000.0;
    let baseFee = 0;
    let formulaDesc = "";

    if (val <= 500000) {
      baseFee = 45000.0;
      formulaDesc = "Fixed scale fee for value up to Kshs 500,000";
    } else if (val <= 1000000) {
      baseFee = 75000.0;
      formulaDesc = "Fixed scale fee for value Kshs 500,001 - 1,000,000";
    } else if (val <= 5000000) {
      const excess = val - 1000000;
      baseFee = 75000.0 + (excess * 0.0175);
      formulaDesc = `Kshs 75,000 + 1.75% of excess over 1M (excess: ${formatMoney(excess)})`;
    } else if (val <= 10000000) {
      const excess = val - 5000000;
      baseFee = 145000.0 + (excess * 0.015);
      formulaDesc = `Kshs 145,000 + 1.5% of excess over 5M (excess: ${formatMoney(excess)})`;
    } else if (val <= 20000000) {
      const excess = val - 10000000;
      baseFee = 220000.0 + (excess * 0.010);
      formulaDesc = `Kshs 220,000 + 1.0% of excess over 10M (excess: ${formatMoney(excess)})`;
    } else {
      const excess = val - 20000000;
      baseFee = 320000.0 + (excess * 0.0075);
      formulaDesc = `Kshs 320,000 + 0.75% of excess over 20M (excess: ${formatMoney(excess)})`;
    }

    let finalFee = Math.max(baseFee, minFee);
    if (isDefendant) {
      finalFee = Math.max(finalFee * 0.85, minFee);
    }

    return {
      court: "High Court / ELC / ELRC / Court of Appeal",
      schedule: "Schedule 6",
      claimValue: val,
      isDefendant: isDefendant,
      instructionFee: Math.round(finalFee * 100) / 100,
      formula: formulaDesc
    };
  }

  function calculateSubordinateCourtInstructionFee(value) {
    const val = Math.max(0, Number(value) || 0);
    const minFee = 30000.0;
    let baseFee = 0;
    let formulaDesc = "";

    if (val <= 100000) {
      baseFee = 20000.0;
      formulaDesc = "Fixed scale fee for Magistrate Court value up to Kshs 100,000";
    } else if (val <= 500000) {
      const excess = val - 100000;
      baseFee = 30000.0 + (excess * 0.05);
      formulaDesc = `Kshs 30,000 + 5% of excess over 100K (excess: ${formatMoney(excess)})`;
    } else if (val <= 1000000) {
      const excess = val - 500000;
      baseFee = 50000.0 + (excess * 0.03);
      formulaDesc = `Kshs 50,000 + 3% of excess over 500K (excess: ${formatMoney(excess)})`;
    } else {
      const excess = val - 1000000;
      baseFee = 65000.0 + (excess * 0.02);
      formulaDesc = `Kshs 65,000 + 2% of excess over 1M (excess: ${formatMoney(excess)})`;
    }

    const finalFee = Math.max(baseFee, minFee);
    return {
      court: "Magistrate's Court / Subordinate Court",
      schedule: "Schedule 5",
      claimValue: val,
      instructionFee: Math.round(finalFee * 100) / 100,
      formula: formulaDesc
    };
  }

  function calculateConveyancingInstructionFee(value, isMortgage = false) {
    const val = Math.max(0, Number(value) || 0);
    const minFee = 35000.0;
    let baseFee = 0;
    let formulaDesc = "";

    if (val <= 1000000) {
      baseFee = Math.max(val * 0.02, minFee);
      formulaDesc = "2% of consideration (min Kshs 35,000)";
    } else if (val <= 5000000) {
      const excess = val - 1000000;
      baseFee = 35000.0 + (excess * 0.015);
      formulaDesc = `Kshs 35,000 + 1.5% of excess over 1M (excess: ${formatMoney(excess)})`;
    } else {
      const excess = val - 5000000;
      baseFee = 95000.0 + (excess * 0.010);
      formulaDesc = `Kshs 95,000 + 1.0% of excess over 5M (excess: ${formatMoney(excess)})`;
    }

    if (isMortgage) {
      baseFee = baseFee * 0.90;
      formulaDesc += " (Mortgage/Charge scale rate)";
    }

    const finalFee = Math.max(baseFee, minFee);
    return {
      court: "Non-Contentious / Conveyancing",
      schedule: "Schedule 1",
      claimValue: val,
      instructionFee: Math.round(finalFee * 100) / 100,
      formula: formulaDesc
    };
  }

  function computeBillOfCosts(data) {
    const courtLevel = data.courtLevel || "High Court";
    const claimVal = Number(data.claimValue) || 0;
    const isDef = Boolean(data.isDefendant);
    const includeGettingUp = Boolean(data.includeGettingUpFee !== false);

    let instRes;
    if (courtLevel === "Magistrate Court") {
      instRes = calculateSubordinateCourtInstructionFee(claimVal);
    } else if (courtLevel === "Conveyancing") {
      instRes = calculateConveyancingInstructionFee(claimVal, Boolean(data.isMortgage));
    } else {
      instRes = calculateHighCourtInstructionFee(claimVal, isDef);
    }

    const instructionFee = instRes.instructionFee;
    const gettingUpFee = includeGettingUp ? Math.round((instructionFee / 3.0) * 100) / 100 : 0.0;

    const processedItems = [];
    let itemNo = 1;
    let totalItemizedTaxableFees = 0.0;
    let totalDisbursements = 0.0;

    // Item 1: Instruction Fee
    processedItems.push({
      itemNo: itemNo++,
      date: data.instructionDate || new Date().toISOString().split("T")[0],
      particulars: `Instructions to act (${instRes.schedule} - ${courtLevel}). ${instRes.formula}`,
      disbursement: 0.0,
      taxableFee: instructionFee,
      category: "instruction_fee"
    });

    // Item 2: Getting Up Fee
    if (includeGettingUp) {
      processedItems.push({
        itemNo: itemNo++,
        date: data.gettingUpDate || new Date().toISOString().split("T")[0],
        particulars: "Getting-up fee (1/3 of Instruction Fee as matter proceeded to hearing/defense)",
        disbursement: 0.0,
        taxableFee: gettingUpFee,
        category: "getting_up_fee"
      });
    }

    // Custom items
    (data.items || []).forEach(item => {
      const itype = item.type || "other";
      const qty = Number(item.quantity) || 1;
      const amt = Number(item.amount) || 0;
      const dateStr = item.date || "—";
      const particulars = item.particulars || "Work done";

      let disb = 0.0;
      let taxableFee = 0.0;

      if (itype === "disbursement") {
        disb = amt > 0 ? amt : qty;
        totalDisbursements += disb;
      } else {
        const rate = ITEM_RATES[itype] || 0.0;
        taxableFee = rate > 0 ? Math.round(qty * rate * 100) / 100 : amt;
        totalItemizedTaxableFees += taxableFee;
      }

      processedItems.push({
        itemNo: itemNo++,
        date: dateStr,
        particulars: particulars,
        disbursement: Math.round(disb * 100) / 100,
        taxableFee: Math.round(taxableFee * 100) / 100,
        category: itype
      });
    });

    const totalTaxableFees = Math.round((instructionFee + gettingUpFee + totalItemizedTaxableFees) * 100) / 100;
    const vatAmount = Math.round((totalTaxableFees * VAT_RATE) * 100) / 100;
    const grandTotal = Math.round((totalTaxableFees + totalDisbursements + vatAmount) * 100) / 100;

    return {
      courtLevel,
      schedule: instRes.schedule,
      claimValue: claimVal,
      instructionBreakdown: instRes,
      gettingUpFee,
      itemizedTaxableFees: Math.round(totalItemizedTaxableFees * 100) / 100,
      totalTaxableFees,
      totalDisbursements: Math.round(totalDisbursements * 100) / 100,
      vatRatePct: 16.0,
      vatAmount,
      grandTotal,
      items: processedItems
    };
  }

  function formatMoney(n) {
    return "Kshs " + Number(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // LocalStorage Draft Persistence
  function getDrafts() {
    try {
      return JSON.parse(localStorage.getItem("BILLSZIP_BILLS_OF_COSTS") || "[]");
    } catch(e) { return []; }
  }

  function saveDraft(billData) {
    const drafts = getDrafts();
    if (!billData.id) billData.id = "boc_" + Date.now();
    billData.updatedAt = new Date().toISOString();
    const idx = drafts.findIndex(d => d.id === billData.id);
    if (idx >= 0) drafts[idx] = billData;
    else drafts.unshift(billData);
    localStorage.setItem("BILLSZIP_BILLS_OF_COSTS", JSON.stringify(drafts));
    return billData;
  }

  function getDraftById(id) {
    return getDrafts().find(d => d.id === id) || null;
  }

  return {
    calculateHighCourtInstructionFee,
    calculateSubordinateCourtInstructionFee,
    calculateConveyancingInstructionFee,
    computeBillOfCosts,
    formatMoney,
    getDrafts,
    saveDraft,
    getDraftById,
    ITEM_RATES
  };
})();
