import React, { useState, useEffect } from 'react';
import { 
  Calculator, Scale, Plus, Trash2, Printer, FileText, ListFilter, X, Check, 
  MessageCircle, Mail, Save, Download, Share2, Send, ChevronRight, 
  CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react';
import { calculateLegalBill, BillCalculationResult } from '../../services/api';
import { EXACT_FIRM_INFO, EXACT_FEE_NOTES, supabase, ExactFeeNoteRecord, saveFeeNotes, SystemUser } from '../../services/supabase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FeeNoteBuilderViewProps {
  initialNote?: ExactFeeNoteRecord | null;
  isPreview?: boolean;
  onNavigateToTab?: (tab: string) => void;
  currentUser?: SystemUser | null;
}

export const FeeNoteBuilderView: React.FC<FeeNoteBuilderViewProps> = ({
  initialNote,
  isPreview = false,
  onNavigateToTab,
  currentUser,
}) => {
  const [claimValue, setClaimValue] = useState<number | ''>(initialNote?.claimValue || '');
  const [courtSchedule, setCourtSchedule] = useState<string>(initialNote?.courtSchedule || "schedule_6_high_court");
  const [isDefendant, setIsDefendant] = useState(false);
  const [includeGettingUp, setIncludeGettingUp] = useState(true);
  const [disbursements, setDisbursements] = useState<number | ''>('');

  // Client Details
  const [clientName, setClientName] = useState(initialNote?.clientName || '');
  
  // Court & Parties Details (Dynamic Header)
  const [forumName, setForumName] = useState(initialNote?.forumName || 'REPUBLIC OF KENYA\\nIN THE MATTER OF THE ARBITRATION ACT 1995');
  const [matterTitle, setMatterTitle] = useState(initialNote?.matterTitle || 'IN THE MATTER OF AN ARBITRATION ON THE DISPUTE OVER THE CONTRACT...');
  const [claimantName, setClaimantName] = useState(initialNote?.claimantName || initialNote?.clientName || '');
  const [respondentName, setRespondentName] = useState(initialNote?.respondentName || '');
  const [judgeName, setJudgeName] = useState(initialNote?.judgeName || '[BEFORE ARCH. NEKOYE MASIBILI, MCIARB]');
  const [documentRef, setDocumentRef] = useState(() => {
    if (initialNote?.billNumber) return initialNote.billNumber;
    const yr = new Date().getFullYear().toString().slice(-2);
    const mo = String(new Date().getMonth() + 1).padStart(2, '0');
    const docNum = String(EXACT_FEE_NOTES.length + 1).padStart(3, '0');
    return `FN${yr}${mo}${docNum}`;
  });
  const [dateBilled, setDateBilled] = useState(new Date().toISOString().split('T')[0]);

  const [items, setItems] = useState<Array<{ description: string; unitRate: number }>>([]);
  const [extraExpenses, setExtraExpenses] = useState<Array<{ description: string; unitRate: number }>>([]);

  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemVal, setNewItemVal] = useState<number | ''>('');
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpVal, setNewExpVal] = useState<number | ''>('');

  // PDF Preview State
  const [showPdfModal, setShowPdfModal] = useState(isPreview);

  // Database Statutory Fees
  const [statutoryFees, setStatutoryFees] = useState<Array<{id: string, description: string, amount: number}>>([]);
  const [showStatutoryForm, setShowStatutoryForm] = useState(false);
  const [newStatDesc, setNewStatDesc] = useState('');
  const [newStatVal, setNewStatVal] = useState<number | ''>('');

  useEffect(() => {
    fetchStatutoryFees();
  }, []);

  const fetchStatutoryFees = async () => {
    try {
      const { data } = await supabase.from('statutory_fees').select('*');
      if (data) {
        setStatutoryFees(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStatutory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatDesc || !newStatVal) return;
    try {
      const { data, error } = await supabase.from('statutory_fees').insert({ description: newStatDesc, amount: newStatVal }).select();
      if (error) {
        alert('Could not save to database. It may not exist yet.');
      } else if (data && data[0]) {
        setStatutoryFees([...statutoryFees, data[0]]);
        setNewStatDesc('');
        setNewStatVal('');
        setShowStatutoryForm(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [result, setResult] = useState<BillCalculationResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!courtSchedule) {
      setResult(null);
      return;
    }

    calculateLegalBill({
      claim_value: typeof claimValue === 'number' ? claimValue : 0,
      court_schedule: courtSchedule,
      is_defendant: isDefendant,
      include_getting_up: includeGettingUp,
      items: items.map(i => ({ description: i.description, type: 'custom', qty: 1, unitRate: i.unitRate })),
      disbursements: extraExpenses.reduce((acc, curr) => acc + curr.unitRate, 0),
    }).then(res => setResult(res));
  }, [claimValue, courtSchedule, isDefendant, includeGettingUp, items, extraExpenses]);

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemDesc.trim() || !newItemVal) return;
    setItems([...items, { description: newItemDesc.trim(), unitRate: Number(newItemVal) }]);
    setNewItemDesc('');
    setNewItemVal('');
  };

  const handleCreateNewExp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpDesc.trim() || !newExpVal) return;
    setExtraExpenses([...extraExpenses, { description: newExpDesc.trim(), unitRate: Number(newExpVal) }]);
    setNewExpDesc('');
    setNewExpVal('');
  };

  const handleQuickAddStatutory = (desc: string, val: number) => {
    setItems([...items, { description: desc, unitRate: val }]);
  };

  const removeItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: string, val: any) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [field]: val };
    setItems(copy);
  };

  const removeExpRow = (index: number) => {
    setExtraExpenses(extraExpenses.filter((_, i) => i !== index));
  };

  const updateExpRow = (index: number, field: string, val: any) => {
    const copy = [...extraExpenses];
    copy[index] = { ...copy[index], [field]: val };
    setExtraExpenses(copy);
  };


  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareMode, setShareMode] = useState<'none' | 'email' | 'whatsapp'>('none');
  const [shareInput, setShareInput] = useState('');

  // Real-Time Action Feedback Toast State
  const [actionToast, setActionToast] = useState<{
    type: 'success' | 'error' | 'loading';
    message: string;
  } | null>(null);

  const triggerToast = (type: 'success' | 'error' | 'loading', message: string, autoDismiss = 4000) => {
    setActionToast({ type, message });
    if (autoDismiss > 0) {
      setTimeout(() => {
        setActionToast(prev => prev?.message === message ? null : prev);
      }, autoDismiss);
    }
  };

  // Unified Database & Storage Persistence Engine
  const persistNoteToDatabase = async (status: 'processed' | 'draft' = 'processed') => {
    const total = result?.grand_total || initialNote?.grandTotal || 0;
    const noteId = initialNote?.id || `fn-${Date.now()}`;
    
    const existingIndex = EXACT_FEE_NOTES.findIndex(fn => fn.billNumber === documentRef || fn.id === noteId);

    const savedRecord: ExactFeeNoteRecord = {
      id: noteId,
      billNumber: documentRef,
      matterId: initialNote?.matterId || "custom",
      matterTitle: matterTitle || initialNote?.matterTitle || "Bill of Costs",
      clientName: claimantName || clientName || initialNote?.clientName || "Client",
      claimantName: claimantName || initialNote?.claimantName || "",
      respondentName: respondentName || initialNote?.respondentName || "",
      judgeName: judgeName || initialNote?.judgeName || "",
      forumName: forumName || initialNote?.forumName || "",
      courtSchedule: courtSchedule || initialNote?.courtSchedule || "Schedule 6 — High Court / Court of Appeal",
      claimValue: typeof claimValue === 'number' ? claimValue : (initialNote?.claimValue || 0),
      instructionFee: result?.instruction_fee || initialNote?.instructionFee || 0,
      gettingUpFee: result?.getting_up_fee || initialNote?.gettingUpFee || 0,
      grandTotal: total,
      status: status,
      generatedByUser: currentUser?.fullName || initialNote?.generatedByUser || 'Karani Victor',
      generatedByUserId: currentUser?.id || initialNote?.generatedByUserId || 'usr-karani-001',
      createdAt: initialNote?.createdAt || new Date().toLocaleString(),
      pdfUrl: "",
      excelUrl: initialNote?.excelUrl || "",
      excelData: initialNote?.excelData && initialNote.excelData.length > 0 ? initialNote.excelData : undefined
    };

    if (existingIndex >= 0) {
      EXACT_FEE_NOTES[existingIndex] = savedRecord;
    } else {
      EXACT_FEE_NOTES.unshift(savedRecord);
    }
    saveFeeNotes();

    try {
      await supabase.from('fee_notes').upsert({
        bill_number: documentRef,
        court_schedule: savedRecord.courtSchedule,
        claim_value: savedRecord.claimValue,
        instruction_fee: savedRecord.instructionFee,
        getting_up_fee: savedRecord.gettingUpFee,
        grand_total: savedRecord.grandTotal,
        status: status,
        generated_by_user: savedRecord.generatedByUser
      });
    } catch (e) {
      // LocalStorage already saved
    }

    return savedRecord;
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await persistNoteToDatabase('draft');
      triggerToast('success', 'Draft Fee Note saved to database successfully!');
    } catch (err: any) {
      triggerToast('error', 'Failed to save draft: ' + (err?.message || 'Error occurred'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    try {
      await persistNoteToDatabase('processed');
      triggerToast('success', 'Fee Note saved to database successfully!');
    } catch (err: any) {
      triggerToast('error', 'Failed to save: ' + (err?.message || 'Error occurred'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintAndExport = async () => {
    await persistNoteToDatabase('processed');
    triggerToast('success', 'Fee note saved to database as processed!');
    setShowPdfModal(true);
  };

  // High-Fidelity Print Engine using isolated iframe (100% eliminates blank pages)
  const handlePrintPDF = async () => {
    triggerToast('loading', 'Preparing print preview in real time...', 0);
    try {
      await persistNoteToDatabase('processed');

      const element = document.getElementById('pdf-content');
      if (!element) {
        throw new Error('Fee note document element not found');
      }

      // Collect all active stylesheets and links
      const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => el.outerHTML)
        .join('\n');

      const printFrame = document.createElement('iframe');
      printFrame.setAttribute('style', 'position: fixed; left: -9999px; top: -9999px; width: 0; height: 0; border: 0;');
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentWindow?.document;
      if (!frameDoc) {
        throw new Error('Could not access print frame document');
      }

      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${documentRef} - Bill of Costs</title>
            <meta charset="utf-8">
            ${styleTags}
            <style>
              @page {
                size: A4 portrait;
                margin: 10mm 8mm;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #000000 !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              #pdf-content {
                width: 100% !important;
                max-width: none !important;
                min-height: auto !important;
                box-shadow: none !important;
                padding: 10px !important;
                margin: 0 !important;
                background: #ffffff !important;
              }
              table {
                width: 100% !important;
                border-collapse: collapse !important;
                background-color: #ffffff !important;
              }
              tr {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                background-color: #ffffff !important;
              }
              td, th {
                color: #000000 !important;
              }
              .no-print {
                display: none !important;
              }
            </style>
          </head>
          <body class="bg-white text-black">
            ${element.outerHTML}
          </body>
        </html>
      `);
      frameDoc.close();

      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
          triggerToast('success', 'Printed and saved to database successfully!');
        } catch (printErr: any) {
          triggerToast('error', 'Print failed: ' + (printErr?.message || 'Print dialog closed'));
        } finally {
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
          }, 3000);
        }
      }, 500);

    } catch (err: any) {
      console.error(err);
      triggerToast('error', 'Print failed: ' + (err?.message || 'Unknown error'));
    }
  };

  const executeShare = () => {
    if (!shareInput.trim()) return;
    const total = result?.grand_total || initialNote?.grandTotal || 0;
    if (shareMode === 'whatsapp') {
      const text = `Fee Note ${documentRef} generated for ${claimantName || clientName || 'Client'}. Grand Total: Kshs ${total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
      window.open(`https://wa.me/${shareInput.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    } else if (shareMode === 'email') {
      const subject = `Fee Note: ${documentRef}`;
      const body = `Please find attached the Fee Note for matter: ${matterTitle}.\n\nTotal Due: Kshs ${total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
      window.open(`mailto:${shareInput}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
    
    setShareMenuOpen(false);
    setShareMode('none');
    setShareInput('');
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Instant Native Vector PDF Download Engine
  const handleDownloadPDF = async () => {
    setIsExportingPdf(true);
    triggerToast('loading', 'Generating PDF file in real time...', 0);

    try {
      await persistNoteToDatabase('processed');

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();

      // 1. Executive Firm Letterhead
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(EXACT_FIRM_INFO.name, 14, 15);
      doc.setFontSize(7.5);
      doc.text('ADVOCATES OF THE HIGH COURT OF KENYA', 14, 19);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(EXACT_FIRM_INFO.address, pageWidth - 14, 13, { align: 'right' });
      doc.text(EXACT_FIRM_INFO.poBox, pageWidth - 14, 16.5, { align: 'right' });
      doc.text(`${EXACT_FIRM_INFO.phone} | ${EXACT_FIRM_INFO.email}`, pageWidth - 14, 20, { align: 'right' });

      doc.setDrawColor(0);
      doc.setLineWidth(0.4);
      doc.line(14, 22.5, pageWidth - 14, 22.5);

      // 2. Court Header & Jurisdiction
      let curY = 27;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      const forumLines = (forumName || 'REPUBLIC OF KENYA\\nIN THE MATTER OF THE ARBITRATION ACT 1995').split('\\n');
      forumLines.forEach(fl => {
        doc.text(fl, pageWidth / 2, curY, { align: 'center' });
        curY += 4;
      });

      // Matter Title
      if (matterTitle) {
        doc.setFontSize(8);
        doc.text(matterTitle, pageWidth / 2, curY, { align: 'center' });
        curY += 5;
      }

      // Parties Block
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(claimantName || clientName || 'Claimant', 16, curY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('CLAIMANT', pageWidth - 16, curY, { align: 'right' });
      curY += 3.5;
      doc.text('AND', pageWidth / 2, curY, { align: 'center' });
      curY += 3.5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(respondentName || 'Respondent', 16, curY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('RESPONDENT', pageWidth - 16, curY, { align: 'right' });
      curY += 5;

      // Judge / Arbitrator
      if (judgeName) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(judgeName, pageWidth / 2, curY, { align: 'center' });
        curY += 5;
      }

      // Title Block
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text("CLAIMANT'S PARTY AND PARTY BILL OF COSTS", pageWidth / 2, curY, { align: 'center' });
      curY += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`Pursuant to the Advocates (Remuneration) (Amendment) Order 2014 - ${(courtSchedule || 'Schedule 6').replace(/_/g, ' ')}`, pageWidth / 2, curY, { align: 'center' });
      curY += 4;

      // 3. Prepare Table Data
      const tableHead = [['DATE', 'ITEM NO.', 'PARTICULARS OF SERVICES RENDERED', 'AMOUNT CLAIMED', 'AMOUNT TAXED OFF']];
      const tableBody: any[] = [];

      if (initialNote?.excelData && initialNote.excelData.length > 0) {
        initialNote.excelData.forEach(row => {
          const rowText = (row || []).map((c: any) => String(c || '')).join(' ').trim().toUpperCase();
          if (
            rowText.includes('DATE+A3') ||
            (row[0] === 'DATE' && (row[1] === 'ITEM NO.' || row[1] === 'ITEM')) ||
            rowText.startsWith('REPUBLIC OF KENYA') ||
            rowText.startsWith("CLAIMANT'S PARTY AND PARTY BILL") ||
            rowText.startsWith("DATED AT NAIROBI") ||
            rowText.startsWith("DRAWN & FILED BY") ||
            rowText.startsWith("TO BE SERVED UPON") ||
            rowText.startsWith("TO BE FILED WITH")
          ) {
            return;
          }

          const isMainSection = ((typeof row[1] === 'string' && /^[A-Z]\.?$/.test(row[1].trim())) ||
                                (typeof row[0] === 'string' && /^[A-Z]\.?$/.test(row[0].trim()))) &&
                                !row[3];
          const isSubSection = typeof row[1] === 'string' && /^(i|ii|iii|iv|v|vi|vii|viii|ix|x)\.?$/i.test(row[1].trim()) && !row[3];
          const isTotalsRow = rowText.includes('SUB-TOTAL') || rowText.includes('VAT') || rowText.includes('GRAND TOTAL') || rowText.endsWith('TOTAL') || rowText.includes('PROFESSIONAL FEES');

          const amountClaimed = row[3] !== undefined && row[3] !== null && row[3] !== '' && !isNaN(Number(row[3])) ? Number(row[3]) : null;
          const amountTaxed = row[4] !== undefined && row[4] !== null && row[4] !== '' && !isNaN(Number(row[4])) ? Number(row[4]) : null;

          if (isTotalsRow) {
            const isGrand = rowText.includes('GRAND TOTAL') || rowText.endsWith('TOTAL');
            const totalVal = amountClaimed !== null ? amountClaimed : (row[1] && !isNaN(Number(row[1])) ? Number(row[1]) : (row[2] && !isNaN(Number(row[2])) ? Number(row[2]) : null));
            tableBody.push([
              { content: row[0] || '', styles: { fontStyle: 'bold' } },
              { content: row[1] || '', styles: { fontStyle: 'bold' } },
              { content: row[2] || row[0] || '', styles: { fontStyle: 'bold', halign: 'right' } },
              { content: totalVal !== null ? totalVal.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '', styles: { fontStyle: 'bold', halign: 'right' } },
              { content: '', styles: { fontStyle: 'bold' } }
            ]);
            return;
          }

          if (isMainSection) {
            tableBody.push([
              { content: row[0] || '', styles: { fontStyle: 'bold' } },
              { content: row[1] || '', styles: { fontStyle: 'bold', halign: 'center' } },
              { content: row[2] || '', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } }
            ]);
            return;
          }

          if (isSubSection) {
            tableBody.push([
              { content: row[0] || '', styles: { fontStyle: 'bold' } },
              { content: row[1] || '', styles: { fontStyle: 'bold', halign: 'center' } },
              { content: row[2] || '', colSpan: 3, styles: { fontStyle: 'bold' } }
            ]);
            return;
          }

          tableBody.push([
            { content: row[0] || '' },
            { content: row[1] || '', styles: { halign: 'center' } },
            { content: row[2] || '' },
            { content: amountClaimed !== null ? amountClaimed.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '', styles: { halign: 'right' } },
            { content: amountTaxed !== null ? amountTaxed.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '', styles: { halign: 'right' } }
          ]);
        });
      } else {
        tableBody.push([
          { content: dateBilled },
          { content: '1', styles: { halign: 'center', fontStyle: 'bold' } },
          { content: `Instruction Fees: Prosecution of Claimant's Claim against the Respondent. To receiving instructions to act on behalf of Claimant. Considering value of subject matter is Kshs ${(Number(claimValue) || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}.` },
          { content: (result?.instruction_fee || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
          { content: '' }
        ]);

        if ((result?.getting_up_fee || 0) > 0) {
          tableBody.push([
            { content: '' },
            { content: '2', styles: { halign: 'center', fontStyle: 'bold' } },
            { content: 'Getting up fees for trial (1/3 of Instruction Fee)' },
            { content: (result?.getting_up_fee || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
            { content: '' }
          ]);
        }

        items.forEach((it, idx) => {
          tableBody.push([
            { content: '' },
            { content: String(idx + 3), styles: { halign: 'center' } },
            { content: it.description },
            { content: (it.unitRate || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
            { content: '' }
          ]);
        });

        extraExpenses.forEach((exp, idx) => {
          tableBody.push([
            { content: '' },
            { content: String(items.length + 3 + idx), styles: { halign: 'center' } },
            { content: exp.description },
            { content: (exp.unitRate || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
            { content: '' }
          ]);
        });

        tableBody.push([
          { content: '', styles: { fontStyle: 'bold' } },
          { content: '', styles: { fontStyle: 'bold' } },
          { content: 'Sub-total (Party and Party Costs)', styles: { fontStyle: 'bold', halign: 'right' } },
          { content: (result?.taxable_subtotal || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 }), styles: { fontStyle: 'bold', halign: 'right' } },
          { content: '' }
        ]);

        tableBody.push([
          { content: '', styles: { fontStyle: 'bold' } },
          { content: '', styles: { fontStyle: 'bold' } },
          { content: 'VAT (16%)', styles: { fontStyle: 'bold', halign: 'right' } },
          { content: (result?.vat_amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 }), styles: { fontStyle: 'bold', halign: 'right' } },
          { content: '' }
        ]);

        tableBody.push([
          { content: '', styles: { fontStyle: 'bold' } },
          { content: '', styles: { fontStyle: 'bold' } },
          { content: 'GRAND TOTAL', styles: { fontStyle: 'bold', halign: 'right' } },
          { content: (result?.grand_total || initialNote?.grandTotal || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 }), styles: { fontStyle: 'bold', halign: 'right' } },
          { content: '' }
        ]);
      }

      // Generate AutoTable
      autoTable(doc, {
        startY: curY,
        head: tableHead,
        body: tableBody,
        theme: 'plain',
        styles: { font: 'helvetica', fontSize: 7, cellPadding: 1.5, lineWidth: 0.15, lineColor: 0 },
        headStyles: { fontStyle: 'bold', fillColor: [240, 240, 240], halign: 'center' },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 12, halign: 'center' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 28, halign: 'right' },
          4: { cellWidth: 24, halign: 'right' }
        },
        margin: { left: 14, right: 14, top: 14, bottom: 16 },
        didDrawPage: (data) => {
          const pageCount = (doc as any).getNumberOfPages ? (doc as any).getNumberOfPages() : (doc.internal.pages.length - 1);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
          doc.text(`Doc Ref: ${documentRef}`, 14, doc.internal.pageSize.getHeight() - 8);
        }
      });

      // 4. Trigger Real-Time Download
      doc.save(`${documentRef}.pdf`);
      triggerToast('success', 'Downloaded and saved to database successfully!');
    } catch (err: any) {
      console.error('Download error:', err);
      triggerToast('error', 'Download PDF failed: ' + (err?.message || 'Error occurred'));
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Real-Time Action Feedback Toast */}
      {actionToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-200 backdrop-blur-md transition-all">
          {actionToast.type === 'loading' && (
            <div className="flex items-center gap-2.5 text-blue-900 bg-blue-50/95 px-3 py-1 rounded-xl border border-blue-200">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
              <span>{actionToast.message}</span>
            </div>
          )}
          {actionToast.type === 'success' && (
            <div className="flex items-center gap-2.5 text-emerald-900 bg-emerald-50/95 px-3 py-1 rounded-xl border border-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionToast.message}</span>
            </div>
          )}
          {actionToast.type === 'error' && (
            <div className="flex items-center gap-2.5 text-rose-900 bg-rose-50/95 px-3 py-1 rounded-xl border border-rose-300">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{actionToast.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Modern Title Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-6 px-4 bg-white dark:bg-zinc-900 border-b border-[var(--border-color)] rounded-2xl shadow-sm mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="font-brand font-extrabold text-3xl text-[var(--text-main)] tracking-tight">
              Bill of Costs Builder
            </h1>
          </div>
          <p className="text-sm text-[var(--text-muted)] font-sans max-w-2xl">
            Draft, calculate, and export statutory fee notes in accordance with the Advocates (Remuneration) Order (Kenya Subsidiary Legislation LN 64/1962, ed. 2022).
          </p>
        </div>

        {/* View Fee Notes Navigation Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateToTab ? onNavigateToTab('feenotes') : null}
            className="btn-navy px-5 py-2.5 text-sm font-semibold flex items-center gap-2 shadow-md cursor-pointer rounded-xl"
          >
            <FileText className="w-4 h-4" /> View Fee Notes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scale Parameters & Itemized Work Container */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scale Parameters Card */}
          <div className="vercel-card p-6 space-y-4">
            <h3 className="font-brand font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-[var(--text-main)]" /> Prescribed Scale & Parameters
            </h3>

            {/* NEW: Court & Parties Information Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-b border-[var(--border-color)] pb-4 mb-4">
              <div className="sm:col-span-2 font-semibold text-[var(--text-main)] mb-1">1. Court & Matter Information</div>
              <div className="sm:col-span-2">
                <label className="block text-[var(--text-muted)] mb-1.5 font-semibold">Forum / Jurisdiction (e.g. Republic of Kenya, Arbitration Act)</label>
                <textarea
                  value={forumName}
                  onChange={(e) => setForumName(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-[var(--text-main)] font-sans focus:outline-none focus:border-[var(--text-main)] min-h-[60px]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[var(--text-muted)] mb-1.5 font-semibold">Matter Title / Dispute Details</label>
                <textarea
                  value={matterTitle}
                  onChange={(e) => setMatterTitle(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-[var(--text-main)] font-sans focus:outline-none focus:border-[var(--text-main)] min-h-[60px]"
                />
              </div>
              <div>
                <label className="block text-[var(--text-muted)] mb-1.5 font-semibold">Claimant / Plaintiff</label>
                <input
                  type="text"
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-[var(--text-main)] font-sans focus:outline-none focus:border-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block text-[var(--text-muted)] mb-1.5 font-semibold">Respondent / Defendant</label>
                <input
                  type="text"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-[var(--text-main)] font-sans focus:outline-none focus:border-[var(--text-main)]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[var(--text-muted)] mb-1.5 font-semibold">Judge / Arbitrator (e.g. [BEFORE HON. JUSTICE X])</label>
                <input
                  type="text"
                  value={judgeName}
                  onChange={(e) => setJudgeName(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-[var(--text-main)] font-sans focus:outline-none focus:border-[var(--text-main)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-b border-[var(--border-color)] pb-4 mb-4">
              <div className="sm:col-span-2 font-semibold text-[var(--text-main)] mb-1">2. Document Reference & Dates</div>
              <div className="sm:col-span-2">
                <label className="block text-[var(--text-muted)] mb-1.5 font-semibold">Billed To (Client / Company) - <i>Optional if same as Claimant</i></label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-[var(--text-main)] font-sans focus:outline-none focus:border-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block text-[var(--text-muted)] mb-1.5 font-semibold">Document Reference</label>
                <input
                  type="text"
                  value={documentRef}
                  onChange={(e) => setDocumentRef(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-[var(--text-main)] font-mono focus:outline-none focus:border-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block text-[var(--text-muted)] mb-1.5 font-semibold">Date Billed</label>
                <input
                  type="date"
                  value={dateBilled}
                  onChange={(e) => setDateBilled(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-[var(--text-main)] font-mono focus:outline-none focus:border-[var(--text-main)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2 font-semibold text-[var(--text-main)] mb-1">3. Calculation Parameters</div>
              <div className="sm:col-span-2">
                <label className="block text-[var(--text-muted)] mb-1.5 font-semibold">
                  Advocates Remuneration Schedule Picker
                </label>
                <select
                  value={courtSchedule}
                  onChange={(e) => setCourtSchedule(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-[var(--text-main)] font-sans focus:outline-none focus:border-[var(--text-main)] transition-colors"
                >
                  <option value="">Please pick a schedule...</option>
                  <option value="schedule_1_conveyancing">Schedule 1 — Conveyancing (Sales, Purchases & Leases)</option>
                  <option value="schedule_2_securities">Schedule 2 — Debentures, Mortgages & Security Charges</option>
                  <option value="schedule_3_company">Schedule 3 — Commercial Agreements & Company Incorporation</option>
                  <option value="schedule_4_ip">Schedule 4 — Intellectual Property (Trademarks & Patents)</option>
                  <option value="schedule_5_magistrate">Schedule 5 — Subordinate / Magistrate's Court Litigation</option>
                  <option value="schedule_6_high_court">Schedule 6 — High Court, Court of Appeal, ELC & ELRC Litigation</option>
                  <option value="schedule_7_arbitration">Schedule 7 — Arbitral Proceedings & Commercial Arbitration</option>
                  <option value="schedule_8_general">Schedule 8 — General & Non-Contentious Legal Business</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1.5 font-semibold">
                  Subject / Claim Value (Kshs)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[var(--text-muted)] font-mono">Kshs</span>
                  <input
                    type="number"
                    value={claimValue === '' ? '' : claimValue}
                    onChange={(e) => setClaimValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl pl-16 pr-3.5 py-2.5 text-[var(--text-main)] font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Disbursements removed from here, moved to its own card */}

              <div className="sm:col-span-2 space-y-2.5 pt-2 border-t border-[var(--border-color)]">
                <label className="flex items-center gap-2.5 text-[var(--text-main)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDefendant}
                    onChange={(e) => setIsDefendant(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border-color)] text-black dark:text-white focus:ring-0 cursor-pointer"
                  />
                  <span className="font-medium">Acting for Defendant / Respondent (15% reduction)</span>
                </label>

                <label className="flex items-center gap-2.5 text-[var(--text-main)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeGettingUp}
                    onChange={(e) => setIncludeGettingUp(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border-color)] text-black dark:text-white focus:ring-0 cursor-pointer"
                  />
                  <span className="font-medium">Include Getting-Up Fee (33.33% / 1/3 of Instruction Fee)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Itemized Work & Attendances Card (Smart Ledger) */}
          <div className="vercel-card p-6 space-y-4 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-brand font-bold text-xs text-[var(--text-main)] uppercase tracking-wider">
                  Itemized Work & Attendances
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Statutory Folio Charges & Attendances (LN 64/1962 ed. 2022)
                </p>
              </div>

              {/* Standard Statutory Fees Quick Dropdown */}
              <div className="relative group">
                <button
                  className="btn-outline px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Standard Statutory Fees
                </button>
                <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-10 max-h-60 overflow-y-auto">
                  {statutoryFees.length === 0 ? (
                    <div className="p-3 text-xs text-gray-500 text-center">Not in database. Add them below.</div>
                  ) : (
                    statutoryFees.map(fee => (
                      <button 
                        key={fee.id}
                        onClick={() => handleQuickAddStatutory(fee.description, fee.amount)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-zinc-700 flex justify-between border-b border-gray-100 dark:border-zinc-700 last:border-0"
                      >
                        <span className="font-sans truncate">{fee.description}</span>
                        <span className="font-brand font-semibold">Kshs {fee.amount.toLocaleString()}</span>
                      </button>
                    ))
                  )}
                  <div className="p-2 border-t border-gray-200 dark:border-zinc-700">
                    <button onClick={() => setShowStatutoryForm(!showStatutoryForm)} className="text-xs text-blue-500 font-semibold w-full text-center py-1 hover:underline">
                      + Add to Database
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form to add to DB */}
            {showStatutoryForm && (
              <form onSubmit={handleAddStatutory} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex gap-2 items-center">
                <input required type="text" placeholder="Description (e.g. Demand Letter)" value={newStatDesc} onChange={e => setNewStatDesc(e.target.value)} className="flex-1 text-xs px-2 py-1.5 rounded border focus:outline-none bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600"/>
                <input required type="number" placeholder="Value (Kshs)" value={newStatVal} onChange={e => setNewStatVal(e.target.value === '' ? '' : Number(e.target.value))} className="w-24 text-xs px-2 py-1.5 rounded border focus:outline-none bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 font-mono"/>
                <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-blue-700">Save to DB</button>
              </form>
            )}

            {/* Active Ledger Items List */}
            <div className="space-y-2 text-xs pt-2">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[var(--bg-subtle)] p-2 rounded-lg border border-[var(--border-color)] animate-fade-in group">
                  <input
                    type="text"
                    value={it.description}
                    onChange={(e) => updateItemRow(idx, 'description', e.target.value)}
                    className="flex-1 bg-transparent border-none text-[var(--text-main)] focus:outline-none px-2 font-sans text-[13px]"
                  />
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-gray-400 font-brand">Kshs</span>
                    <input
                      type="number"
                      value={it.unitRate}
                      onChange={(e) => updateItemRow(idx, 'unitRate', parseFloat(e.target.value) || 0)}
                      className="w-28 bg-transparent border-none text-[var(--text-main)] font-brand font-semibold text-right focus:outline-none px-2 py-1"
                    />
                  </div>
                  <button onClick={() => removeItemRow(idx)} className="p-1 text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Smart Ledger Entry Row */}
            <form onSubmit={handleCreateNewItem} className="flex items-center gap-2 p-2 border border-[var(--border-color)] rounded-lg bg-white dark:bg-zinc-900 shadow-sm focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white transition-all">
              <input
                type="text"
                placeholder="Describe the work done..."
                value={newItemDesc}
                onChange={e => setNewItemDesc(e.target.value)}
                className="flex-1 bg-transparent border-none text-[var(--text-main)] focus:outline-none px-2 font-sans text-[13px]"
              />
              <div className="relative border-l border-[var(--border-color)] pl-2">
                <span className="absolute left-4 top-1.5 text-gray-400 font-brand text-xs">Kshs</span>
                <input
                  type="number"
                  placeholder="Amount"
                  value={newItemVal}
                  onChange={e => setNewItemVal(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-28 bg-transparent border-none text-[var(--text-main)] font-brand font-semibold text-right focus:outline-none px-2 py-1 placeholder:font-sans placeholder:font-normal placeholder:text-xs"
                />
              </div>
              <button type="submit" className="bg-black dark:bg-white text-white dark:text-black p-1.5 rounded hover:opacity-80 transition-opacity">
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Extra Expenses (Disbursements) Card */}
          <div className="vercel-card p-6 space-y-4 relative">
            <h3 className="font-brand font-bold text-xs text-[var(--text-main)] uppercase tracking-wider">
              Third-Party & Extra Expenses
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Add out-of-pocket expenses paid on behalf of the client (Filing fees, Arbitrator, Courier, etc.)
            </p>

            {/* Active Expenses List */}
            <div className="space-y-2 text-xs pt-2">
              {extraExpenses.map((exp, idx) => (
                <div key={`exp-${idx}`} className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-lg border border-emerald-100 dark:border-emerald-800/30 animate-fade-in group">
                  <input
                    type="text"
                    value={exp.description}
                    onChange={(e) => updateExpRow(idx, 'description', e.target.value)}
                    className="flex-1 bg-transparent border-none text-emerald-900 dark:text-emerald-100 focus:outline-none px-2 font-sans text-[13px]"
                  />
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-emerald-400 font-brand">Kshs</span>
                    <input
                      type="number"
                      value={exp.unitRate}
                      onChange={(e) => updateExpRow(idx, 'unitRate', parseFloat(e.target.value) || 0)}
                      className="w-28 bg-transparent border-none text-emerald-900 dark:text-emerald-100 font-brand font-semibold text-right focus:outline-none px-2 py-1"
                    />
                  </div>
                  <button onClick={() => removeExpRow(idx)} className="p-1 text-emerald-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Smart Expense Entry Row */}
            <form onSubmit={handleCreateNewExp} className="flex items-center gap-2 p-2 border border-emerald-200 dark:border-emerald-800 rounded-lg bg-white dark:bg-zinc-900 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
              <input
                type="text"
                placeholder="Expense description..."
                value={newExpDesc}
                onChange={e => setNewExpDesc(e.target.value)}
                className="flex-1 bg-transparent border-none text-[var(--text-main)] focus:outline-none px-2 font-sans text-[13px]"
              />
              <div className="relative border-l border-emerald-200 dark:border-emerald-800 pl-2">
                <span className="absolute left-4 top-1.5 text-emerald-400 font-brand text-xs">Kshs</span>
                <input
                  type="number"
                  placeholder="Amount"
                  value={newExpVal}
                  onChange={e => setNewExpVal(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-28 bg-transparent border-none text-[var(--text-main)] font-brand font-semibold text-right focus:outline-none px-2 py-1 placeholder:font-sans placeholder:font-normal placeholder:text-xs"
                />
              </div>
              <button type="submit" className="bg-emerald-500 text-white p-1.5 rounded hover:bg-emerald-600 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </form>
            
            {extraExpenses.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-500 uppercase font-sans">Total Extra Expenses</span>
                <span className="font-brand font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  Kshs {extraExpenses.reduce((sum, e) => sum + e.unitRate, 0).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Live Real-Time Side Preview Card (Updates LIVE as Advocate edits) */}
        <div className="lg:col-span-1">
          {!courtSchedule ? (
            <div className="vercel-card p-6 text-center space-y-3">
              <Calculator className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
              <p className="text-xs text-[var(--text-muted)] font-medium">
                Please pick an Advocates Remuneration Order Schedule above to begin calculation.
              </p>
            </div>
          ) : result && (
            <div className="vercel-card p-6 space-y-5 sticky top-20">
              <div className="border-b border-[var(--border-color)] pb-3">
                <span className="font-brand font-bold text-xs text-[var(--text-main)] uppercase tracking-wider block">
                  Live Fee Note Preview
                </span>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-mono">{result.formula}</p>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                  <span className="text-[11px] text-[var(--text-muted)] font-sans">Instruction Fee</span>
                  <span className="text-[var(--text-main)] font-bold">Kshs {result.instruction_fee.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                  <span className="text-[11px] text-[var(--text-muted)] font-sans">Getting-Up Fee</span>
                  <span className="text-[var(--text-main)] font-bold">Kshs {result.getting_up_fee.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                  <span className="text-[11px] text-[var(--text-muted)] font-sans">Itemized Work Total</span>
                  <span className="text-[var(--text-main)] font-bold">Kshs {result.items_total.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                  <span className="text-[11px] text-[var(--text-muted)] font-sans">VAT (16%)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Kshs {result.vat_amount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                  <span className="text-[11px] text-[var(--text-muted)] font-sans">Disbursements</span>
                  <span className="text-[var(--text-main)] font-bold">Kshs {result.disbursements.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-color)] space-y-1">
                <span className="font-bold text-[11px] text-[var(--text-muted)] uppercase tracking-wider block font-sans">Grand Total</span>
                <p className="text-2xl font-extrabold text-[var(--text-main)] font-mono tracking-tight">
                  Kshs {result.grand_total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Action Buttons: Save Draft & Print/Export Bill */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="btn-outline w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={handlePrintAndExport}
                  className="btn-black w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Export
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Print & PDF Export Statement (Clean A4 Paper Format matching xx.pdf) */}
      {result && (
        <div className="hidden print:block print:p-0 bg-white text-black font-sans text-xs space-y-6 max-w-[210mm] mx-auto leading-normal">
          {/* Header Block matching xx.pdf */}
          <div className="flex justify-between items-start border-b-2 border-black pb-6">
            <div className="flex flex-col gap-3 w-1/2">
              {/* Firm Logo from Database */}
              {EXACT_FIRM_INFO.logoUrl ? (
                <img src={EXACT_FIRM_INFO.logoUrl} alt="Firm Logo" className="w-16 h-auto object-contain" />
              ) : (
                <div className="w-16 h-16 bg-black flex items-center justify-center text-white font-brand font-extrabold text-2xl">
                  {EXACT_FIRM_INFO.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="font-bold text-lg uppercase tracking-tight text-black font-brand">{EXACT_FIRM_INFO.name}</h1>
                <span className="text-[9px] font-bold text-gray-700 block uppercase tracking-widest font-brand mt-0.5">ADVOCATES OF THE HIGH COURT OF KENYA</span>
              </div>
            </div>
            <div className="text-right text-[11px] leading-loose text-black font-sans w-1/2 flex flex-col items-end justify-start">
              <p>{EXACT_FIRM_INFO.poBox}</p>
              <p>{EXACT_FIRM_INFO.phone}</p>
              <p>{EXACT_FIRM_INFO.email}</p>
              <p>{EXACT_FIRM_INFO.address}</p>
            </div>
          </div>

          {/* Client & Taxing Forum Ref */}
            <div className="grid grid-cols-2 gap-6 border-b border-black pb-4 text-xs font-sans">
              <div>
                <span className="font-bold block text-black text-[10px] uppercase tracking-wider">BILLED TO (CLIENT):</span>
                <p className="font-bold text-sm text-black font-brand">{clientName || claimantName || 'Client Name not provided'}</p>
              </div>
              <div className="text-right font-mono text-[11px] space-y-0.5">
                <p><strong className="font-bold">DOCUMENT REF:</strong> {documentRef}</p>
                <p><strong className="font-bold">DATE BILLED:</strong> {dateBilled}</p>
                <p><strong className="font-bold">SUBJECT CLAIM VALUE:</strong> Kshs {typeof claimValue === 'number' ? claimValue.toLocaleString('en-KE', { minimumFractionDigits: 2 }) : '0.00'}</p>
              </div>
            </div>

          {/* Re Line */}
          <div className="p-3 text-center border border-black rounded-none">
            <h2 className="font-bold text-sm uppercase text-black tracking-wide">RE: STATEMENT OF ADVOCATE'S BILL OF COSTS</h2>
            <p className="text-[11px] text-black italic">Drawn under Advocates (Remuneration) (Amendment) Order (LN 64/1962 ed. 2022)</p>
          </div>

          {/* Particulars Table without background fill */}
          <table className="w-full text-left border-collapse border border-black text-xs">
            <thead>
              <tr className="border-b border-black font-bold uppercase text-[10px]">
                <th className="p-2.5 border-r border-black w-12 text-center">ITEM</th>
                <th className="p-2.5 border-r border-black">PARTICULARS OF PROFESSIONAL SERVICES RENDERED</th>
                <th className="p-2.5 border-r border-black text-right w-28">DISB. (KSHS)</th>
                <th className="p-2.5 text-right w-36">LEGAL FEE (KSHS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black font-mono text-[11px]">
              <tr>
                <td className="p-2.5 border-r border-black text-center font-bold">1</td>
                <td className="p-2.5 border-r border-black font-sans">
                  <strong className="block font-bold">A. INSTRUCTION FEE</strong>
                  <span>Instruction Fee on Claim Value under {courtSchedule.replace(/_/g, ' ')}</span>
                </td>
                <td className="p-2.5 border-r border-black text-right">—</td>
                <td className="p-2.5 text-right font-bold">Kshs {result.instruction_fee.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
              </tr>

              {result.getting_up_fee > 0 && (
                <tr>
                  <td className="p-2.5 border-r border-black text-center font-bold">2</td>
                  <td className="p-2.5 border-r border-black font-sans">
                    <strong className="block font-bold">B. GETTING-UP FEE (1/3 RULE)</strong>
                    <span>Preparation for hearing & defense proceedings</span>
                  </td>
                  <td className="p-2.5 border-r border-black text-right">—</td>
                  <td className="p-2.5 text-right font-bold">Kshs {result.getting_up_fee.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                </tr>
              )}

              {items.map((it, i) => (
                <tr key={i}>
                  <td className="p-2.5 border-r border-black text-center">{i + 3}</td>
                  <td className="p-2.5 border-r border-black font-sans">{it.description}</td>
                  <td className="p-2.5 border-r border-black text-right">—</td>
                  <td className="p-2.5 text-right font-mono">Kshs {(it.unitRate || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}

              {extraExpenses.map((exp, i) => (
                <tr key={`exp-${i}`}>
                  <td className="p-2.5 border-r border-black text-center">{items.length + 3 + i}</td>
                  <td className="p-2.5 border-r border-black font-sans font-bold">{exp.description}</td>
                  <td className="p-2.5 border-r border-black text-right font-bold font-mono">Kshs {exp.unitRate.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                  <td className="p-2.5 text-right">—</td>
                </tr>
              ))}

              <tr className="font-bold border-t-2 border-black">
                <td colSpan={2} className="p-2.5 text-right font-sans uppercase">Subtotal Professional Legal Fees & VAT (16%):</td>
                <td className="p-2.5 text-right font-mono">Kshs {result.disbursements.toLocaleString()}</td>
                <td className="p-2.5 text-right font-mono">Kshs {result.taxable_subtotal.toLocaleString()}</td>
              </tr>
              <tr className="text-sm font-extrabold border-t-2 border-black">
                <td colSpan={2} className="p-3 text-right font-sans uppercase">GRAND TOTAL AMOUNT DUE (KSHS):</td>
                <td colSpan={2} className="p-3 text-right font-mono text-base">Kshs {result.grand_total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          {/* Bank Settlement & Signature Block matching xx.pdf */}
          <div className="pt-6 border-t border-black grid grid-cols-2 gap-8 text-xs">
            <div>
              <span className="font-bold block uppercase text-black text-[10px]">BANK SETTLEMENT DETAILS:</span>
              <p className="font-semibold text-black">{EXACT_FIRM_INFO.bankDetails}</p>
            </div>
            <div className="text-right space-y-6">
              <p>DATED at <strong className="uppercase">NAIROBI</strong> this {new Date().getDate()}th day of September, 2026.</p>
              <div className="pt-8 border-t border-black inline-block min-w-[220px] text-center">
                <strong className="block uppercase text-black font-bold">{EXACT_FIRM_INFO.name}</strong>
                <span className="text-[10px] text-black uppercase block">SIGNATURE & OFFICIAL STAMP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive PDF Viewer Modal (Full Screen & Responsive) */}
      {showPdfModal && (result || (initialNote?.excelData && initialNote.excelData.length > 0)) && (
        <div className="fixed inset-0 bg-slate-200/90 backdrop-blur-md z-[100] flex flex-col items-center overflow-y-auto print:bg-white print:block print:static print:inset-auto">
          <style>{`
            @media print {
              body * { visibility: hidden; }
              #pdf-print-wrapper, #pdf-print-wrapper * { visibility: visible; }
              #pdf-print-wrapper {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 0;
                margin: 0;
              }
              .no-print { display: none !important; }
            }
          `}</style>
          
          {/* Action Bar (Top floating bar in preview) */}
          <div className="fixed top-5 right-6 flex items-center gap-2.5 z-[110] no-print bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-gray-200">
            {/* Instant Print / Save as PDF */}
            <button
              onClick={handlePrintPDF}
              className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              title="Instant Print / Save as PDF (Crisp Vector)"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>

            {/* Fast Download */}
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPdf}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              title="Download PDF File"
            >
              <Download className="w-4 h-4" /> {isExportingPdf ? 'Exporting...' : 'Download PDF'}
            </button>

            {/* Share Container */}
            <div className="relative">
              <button
                onClick={() => {
                  setShareMenuOpen(!shareMenuOpen);
                  setShareMode('none');
                }}
                className={`p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer ${shareMenuOpen ? 'bg-gray-100' : 'bg-white'}`}
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Share Dropdown Popover */}
              {shareMenuOpen && (
                <div className="absolute top-12 right-0 bg-white rounded-xl shadow-2xl p-2 w-64 border border-gray-200">
                  {shareMode === 'none' ? (
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => setShareMode('email')}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-sm font-semibold"
                      >
                        <div className="flex items-center gap-3 text-gray-700">
                          <Mail className="w-4 h-4 text-blue-500" /> Email
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => setShareMode('whatsapp')}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-sm font-semibold"
                      >
                        <div className="flex items-center gap-3 text-gray-700">
                          <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <button 
                          onClick={() => setShareMode('none')}
                          className="p-1 hover:bg-gray-100 rounded-md"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-500 rotate-180" />
                        </button>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Share via {shareMode === 'email' ? 'Email' : 'WhatsApp'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type={shareMode === 'email' ? 'email' : 'tel'}
                          placeholder={shareMode === 'email' ? 'Enter email address' : 'Enter phone number'}
                          value={shareInput}
                          onChange={(e) => setShareInput(e.target.value)}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                          autoFocus
                          onKeyDown={(e) => { if(e.key === 'Enter') executeShare(); }}
                        />
                        <button
                          onClick={executeShare}
                          disabled={!shareInput.trim()}
                          className="bg-black text-white p-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex-shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowPdfModal(false);
                setShareMenuOpen(false);
                setShareMode('none');
              }}
              className="p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div id="pdf-print-wrapper" className="w-full flex justify-center p-4 sm:p-8 md:p-12 print:p-0 my-auto">
            {/* Document A4 Paper Sheet Body */}
            <div id="pdf-content" className="w-full max-w-4xl bg-white space-y-6 text-xs text-black p-8 sm:p-12 md:p-16 shadow-2xl rounded-sm font-sans leading-normal mx-auto print:shadow-none print:w-full print:max-w-none print:p-0">
              
              {/* Header Block matching xx.pdf */}
              <div className="flex justify-between items-start border-b-2 border-black pb-6">
                <div className="flex flex-col gap-3 w-1/2">
                  {/* Firm Logo from Database */}
                  {EXACT_FIRM_INFO.logoUrl ? (
                    <img src={EXACT_FIRM_INFO.logoUrl} alt="Firm Logo" className="w-16 h-auto object-contain" />
                  ) : (
                    <div className="w-16 h-16 bg-black flex items-center justify-center text-white font-brand font-extrabold text-2xl">
                      {EXACT_FIRM_INFO.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h1 className="font-bold text-lg uppercase tracking-tight text-black font-brand">{EXACT_FIRM_INFO.name}</h1>
                    <span className="text-[9px] font-bold text-gray-700 block uppercase tracking-widest font-brand mt-0.5">ADVOCATES OF THE HIGH COURT OF KENYA</span>
                  </div>
                </div>
                <div className="text-right text-[11px] leading-loose text-black font-sans w-1/2 flex flex-col items-end justify-start">
                  <p>{EXACT_FIRM_INFO.poBox}</p>
                  <p>{EXACT_FIRM_INFO.phone}</p>
                  <p>{EXACT_FIRM_INFO.email}</p>
                  <p>{EXACT_FIRM_INFO.address}</p>
                </div>
              </div>
              
              {/* Official Court Header */}
              <div className="text-center font-brand space-y-2 pb-6 pt-4">
                {forumName.split('\\n').map((line, i) => (
                  <h2 key={i} className={`uppercase text-sm font-bold ${i === 0 ? 'underline underline-offset-4' : ''}`}>{line}</h2>
                ))}
                
                {matterTitle && (
                  <div className="space-y-1 my-3">
                    <p className="uppercase text-[10px] font-semibold text-gray-500">AND</p>
                    <p className="uppercase text-sm font-bold">{matterTitle}</p>
                  </div>
                )}
                
                <div className="my-6">
                  <p className="uppercase text-[10px] font-semibold text-gray-500 mb-2">BETWEEN</p>
                  
                  <div className="flex justify-between items-end w-full px-12 pb-1 border-b border-black">
                    <span className="uppercase font-bold text-[13px]">{claimantName || clientName || 'Claimant Name'}</span>
                    <span className="uppercase text-[10px] font-bold text-gray-600">CLAIMANT</span>
                  </div>
                  
                  <p className="uppercase text-[10px] font-semibold text-gray-500 my-3">AND</p>
                  
                  <div className="flex justify-between items-end w-full px-12 pb-1 border-b border-black">
                    <span className="uppercase font-bold text-[13px]">{respondentName || 'Respondent Name'}</span>
                    <span className="uppercase text-[10px] font-bold text-gray-600">RESPONDENT</span>
                  </div>
                </div>
                
                <h3 className="uppercase text-sm font-bold mt-4">{judgeName}</h3>
              </div>

              {/* Title */}
              <div className="text-center font-bold font-brand space-y-1 pb-2 mt-4">
                <h2 className="uppercase text-sm underline font-black">CLAIMANT'S PARTY AND PARTY BILL OF COSTS</h2>
                <p className="text-xs font-sans font-normal text-gray-600">Pursuant to the Advocates (Remuneration) (Amendment) Order 2014 - {courtSchedule.replace(/_/g, ' ')}</p>
              </div>

              {/* Particulars Table */}
              <table className="w-full text-left border-collapse border border-black text-[11px] font-sans bg-white">
                <thead className="bg-white">
                  <tr className="border-b border-black font-bold uppercase text-[10px] bg-slate-50">
                    <th className="p-2 border-r border-black w-24">DATE</th>
                    <th className="p-2 border-r border-black w-16 text-center">ITEM NO.</th>
                    <th className="p-2 border-r border-black">PARTICULARS OF SERVICES RENDERED</th>
                    <th className="p-2 border-r border-black text-right w-28">AMOUNT CLAIMED</th>
                    <th className="p-2 text-right w-24">AMOUNT TAXED OFF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black bg-white">
                  {initialNote?.excelData && initialNote.excelData.length > 0 ? (
                    initialNote.excelData.map((row: any[], i: number) => {
                      const rowText = (row || []).map(c => String(c || '')).join(' ').trim().toUpperCase();
                      
                      // Skip raw headers or preamble duplicated from excel
                      if (
                        rowText.includes('DATE+A3') ||
                        (row[0] === 'DATE' && (row[1] === 'ITEM NO.' || row[1] === 'ITEM')) ||
                        rowText.startsWith('REPUBLIC OF KENYA') ||
                        rowText.startsWith("CLAIMANT'S PARTY AND PARTY BILL") ||
                        rowText.startsWith("DATED AT NAIROBI") ||
                        rowText.startsWith("DRAWN & FILED BY") ||
                        rowText.startsWith("TO BE SERVED UPON") ||
                        rowText.startsWith("TO BE FILED WITH")
                      ) {
                        return null;
                      }

                      // Check if main section header (e.g. 'A', 'B', 'C' without claimed amount)
                      const isMainSection = ((typeof row[1] === 'string' && /^[A-Z]\.?$/.test(row[1].trim())) ||
                                            (typeof row[0] === 'string' && /^[A-Z]\.?$/.test(row[0].trim()))) &&
                                            !row[3];
                      // Check if sub-section header (e.g. 'i', 'ii', 'iii' without claimed amount)
                      const isSubSection = typeof row[1] === 'string' && /^(i|ii|iii|iv|v|vi|vii|viii|ix|x)\.?$/i.test(row[1].trim()) && !row[3];

                      const isTotalsRow = rowText.includes('SUB-TOTAL') || rowText.includes('VAT') || rowText.includes('GRAND TOTAL') || rowText.endsWith('TOTAL') || rowText.includes('PROFESSIONAL FEES');

                      const amountClaimed = row[3] !== undefined && row[3] !== null && row[3] !== '' && !isNaN(Number(row[3])) ? Number(row[3]) : null;
                      const amountTaxed = row[4] !== undefined && row[4] !== null && row[4] !== '' && !isNaN(Number(row[4])) ? Number(row[4]) : null;

                      if (isTotalsRow) {
                        const isGrand = rowText.includes('GRAND TOTAL') || rowText.endsWith('TOTAL');
                        const totalVal = amountClaimed !== null ? amountClaimed : (row[1] && !isNaN(Number(row[1])) ? Number(row[1]) : (row[2] && !isNaN(Number(row[2])) ? Number(row[2]) : null));
                        return (
                          <tr key={`excel-${i}`} className={`bg-white text-black break-inside-avoid ${isGrand ? 'border-t-2 border-b-2 border-black font-bold text-xs' : 'border-t border-black font-semibold'}`}>
                            <td className="p-2 border-r border-black text-center bg-white text-black">{row[0] || ''}</td>
                            <td className="p-2 border-r border-black text-center bg-white text-black">{row[1] || ''}</td>
                            <td className="p-2 border-r border-black text-right uppercase font-bold pr-4 bg-white text-black">
                              {row[2] || row[0] || ''}
                            </td>
                            <td className="p-2 border-r border-black text-right font-mono font-bold bg-white text-black whitespace-nowrap">
                              {totalVal !== null ? totalVal.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                            </td>
                            <td className="p-2 text-right font-mono bg-white text-black"></td>
                          </tr>
                        );
                      }

                      if (isMainSection) {
                        return (
                          <tr key={`excel-${i}`} className="bg-slate-100 font-bold border-t border-b border-black break-inside-avoid">
                            <td className="p-2 border-r border-black text-center text-black font-mono text-[10px]">{row[0] || ''}</td>
                            <td className="p-2 border-r border-black text-center font-bold text-black">{row[1] || ''}</td>
                            <td colSpan={3} className="p-2 font-bold uppercase tracking-wide text-black bg-slate-100">
                              {row[2] || ''}
                            </td>
                          </tr>
                        );
                      }

                      if (isSubSection) {
                        return (
                          <tr key={`excel-${i}`} className="bg-slate-50 font-semibold border-t border-black break-inside-avoid">
                            <td className="p-2 border-r border-black text-center text-black font-mono text-[10px]">{row[0] || ''}</td>
                            <td className="p-2 border-r border-black text-center font-bold text-gray-700">{row[1] || ''}</td>
                            <td colSpan={3} className="p-2 font-semibold text-black bg-slate-50">
                              {row[2] || ''}
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={`excel-${i}`} className="break-inside-avoid bg-white text-black hover:bg-slate-50/50">
                          <td className="p-2 border-r border-black font-mono text-[10px] whitespace-nowrap bg-white text-black">{row[0] || ''}</td>
                          <td className="p-2 border-r border-black text-center font-bold bg-white text-black">{row[1] || ''}</td>
                          <td className="p-2 border-r border-black bg-white text-black">{row[2] || ''}</td>
                          <td className="p-2 border-r border-black text-right font-mono whitespace-nowrap bg-white text-black">
                            {amountClaimed !== null ? amountClaimed.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                          </td>
                          <td className="p-2 text-right font-mono whitespace-nowrap bg-white text-black">
                            {amountTaxed !== null ? amountTaxed.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <>
                  <tr className="break-inside-avoid">
                    <td className="p-2 border-r border-black">{dateBilled}</td>
                    <td className="p-2 border-r border-black text-center font-bold">1</td>
                    <td className="p-2 border-r border-black">
                      <strong className="block font-bold">Instruction Fees</strong>
                      <span>Prosecution of the Claimant's Claim against the Respondent. To receiving instructions to act on behalf of the Claimant to institute a dispute against the Respondent before an Arbitral Tribunal. Considering the value of the subject matter is Kshs. {typeof claimValue === 'number' ? claimValue.toLocaleString('en-KE', { minimumFractionDigits: 2 }) : '0.00'}.</span>
                    </td>
                    <td className="p-2 border-r border-black text-right">{(result?.instruction_fee || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right"></td>
                  </tr>

                  {(result?.getting_up_fee || 0) > 0 && (
                    <tr className="break-inside-avoid">
                      <td className="p-2 border-r border-black"></td>
                      <td className="p-2 border-r border-black text-center font-bold">2</td>
                      <td className="p-2 border-r border-black">
                        <span>Getting up fees for trial (1/3 of Instruction Fee)</span>
                      </td>
                      <td className="p-2 border-r border-black text-right">{(result?.getting_up_fee || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2 text-right"></td>
                    </tr>
                  )}

                  {items.map((it, i) => (
                    <tr key={i} className="break-inside-avoid">
                      <td className="p-2 border-r border-black"></td>
                      <td className="p-2 border-r border-black text-center font-bold font-brand">{i + 3}</td>
                      <td className="p-2 border-r border-black">{it.description}</td>
                      <td className="p-2 border-r border-black text-right font-brand">{(it.unitRate || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2 text-right"></td>
                    </tr>
                  ))}
                  
                  {extraExpenses.map((exp, i) => (
                    <tr key={`exp-${i}`} className="break-inside-avoid">
                      <td className="p-2 border-r border-black"></td>
                      <td className="p-2 border-r border-black text-center font-bold font-brand">{items.length + 3 + i}</td>
                      <td className="p-2 border-r border-black font-bold text-gray-800">{exp.description}</td>
                      <td className="p-2 border-r border-black text-right font-brand font-bold">{exp.unitRate.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2 text-right"></td>
                    </tr>
                  ))}

                  <tr className="font-bold border-t-2 border-black break-inside-avoid">
                    <td colSpan={3} className="p-2 text-right uppercase">Sub-total (Party and Party Costs):</td>
                    <td className="p-2 border-r border-black text-right">{(result?.taxable_subtotal || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right"></td>
                  </tr>
                  
                  <tr className="font-bold border-t border-black break-inside-avoid">
                    <td colSpan={3} className="p-2 text-right uppercase">VAT (16%):</td>
                    <td className="p-2 border-r border-black text-right">{(result?.vat_amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right"></td>
                  </tr>

                  <tr className="font-bold border-t-2 border-black text-sm break-inside-avoid">
                    <td colSpan={3} className="p-3 text-right uppercase">GRAND TOTAL:</td>
                    <td className="p-3 border-r border-black text-right">{(result?.grand_total || initialNote?.grandTotal || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right"></td>
                  </tr>
                  </>
                  )}
                </tbody>
              </table>

              {/* Bottom Signature Blocks */}
              <div className="pt-10 space-y-12 text-xs font-sans break-inside-avoid">
                <div className="flex items-end gap-2">
                  <strong>DATED</strong> at <strong>NAIROBI</strong> this 
                  <div className="border-b border-black w-20"></div> 
                  day of 
                  <div className="border-b border-black w-32"></div> 
                  2026
                </div>
                
                <div className="text-center pt-8">
                  <div className="border-b border-black w-72 mx-auto mb-2"></div>
                  <p className="font-bold uppercase font-brand">{EXACT_FIRM_INFO.name}</p>
                  <p className="font-bold uppercase text-[10px] text-gray-600 mt-1">ADVOCATES FOR THE CLAIMANT</p>
                </div>

                <div className="grid grid-cols-2 gap-16 pt-8 pb-10">
                  <div className="space-y-1">
                    <p className="font-bold underline uppercase mb-3 text-[11px]">DRAWN & FILED BY:</p>
                    <p className="font-bold font-brand text-sm">{EXACT_FIRM_INFO.name}</p>
                    <p>{EXACT_FIRM_INFO.address}</p>
                    <p>{EXACT_FIRM_INFO.poBox}</p>
                    <p className="font-bold uppercase mt-1">NAIROBI</p>
                    <p className="mt-3 text-gray-600">{EXACT_FIRM_INFO.email}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-bold underline uppercase mb-3 text-[11px]">TO BE SERVED UPON:</p>
                    <p className="font-bold font-brand text-sm">Owiti Otieno & Ragot Advocates</p>
                    <p>4th Avenue Towers 11th Floor</p>
                    <p>4th Ngong Avenue</p>
                    <p>P. O. Box 48305-00100</p>
                    <p className="font-bold uppercase mt-1">NAIROBI</p>
                    <p className="mt-3 text-gray-600">info@oorlaw.co.ke</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
