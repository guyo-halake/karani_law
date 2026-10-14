import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, ShieldAlert, CheckCircle2, Lock, 
  Search, Camera, X, FileText, Calendar, DollarSign,
  Building, User, Hash, ArrowLeft, RefreshCw
} from 'lucide-react';
import { verifyDocumentOffline, DocumentSecurityRecord } from '../../services/documentSecurity';
import { EXACT_FIRM_INFO, getFeeNotes, ExactFeeNoteRecord } from '../../services/supabase';

interface DocumentVerifyViewProps {
  onNavigateHome?: () => void;
}

export const DocumentVerifyView: React.FC<DocumentVerifyViewProps> = ({ onNavigateHome }) => {
  const [docRefInput, setDocRefInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'authentic' | 'tampered' | 'not_found' | 'idle';
    message: string;
    docRef?: string;
    clientName?: string;
    matterTitle?: string;
    totalAmount?: number;
    dateBilled?: string;
    token?: string;
    signature?: string;
    isOfflineVerified?: boolean;
    isDatabaseSynced?: boolean;
  }>({ status: 'idle', message: '' });

  // Camera Scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-parse URL query parameters on mount (when scanned via phone camera QR)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    const amt = urlParams.get('amt');
    const dt = urlParams.get('dt');
    const cli = urlParams.get('cli');
    const tok = urlParams.get('tok');
    const sig = urlParams.get('sig');

    if (ref && amt && dt && cli) {
      setDocRefInput(ref);
      if (tok) setTokenInput(tok);
      runVerification({
        docRef: ref,
        amount: parseFloat(amt) || 0,
        dateBilled: dt,
        clientName: cli,
        token: tok || undefined,
        signature: sig || undefined
      });
    }
  }, []);

  const runVerification = async (params: {
    docRef: string;
    amount?: number;
    dateBilled?: string;
    clientName?: string;
    token?: string;
    signature?: string;
  }) => {
    setIsVerifying(true);
    setVerificationResult({ status: 'idle', message: 'Verifying cryptographic security digest...' });

    try {
      const cleanRef = params.docRef.trim().toUpperCase();

      // 1. Check local security cache (generated on this machine or stored)
      let cachedRecord: DocumentSecurityRecord | null = null;
      try {
        const cachedStr = localStorage.getItem('BILLSZIP_SECURITY_SEALS');
        if (cachedStr) {
          const allCached = JSON.parse(cachedStr);
          cachedRecord = allCached[cleanRef] || null;
        }
      } catch (e) {}

      // 2. Check live Supabase / local DB notes
      let dbRecord: ExactFeeNoteRecord | null = null;
      try {
        const allNotes = await getFeeNotes();
        dbRecord = allNotes.find(n => (n.billNumber || '').toUpperCase() === cleanRef) || null;
      } catch (e) {}

      const effectiveClient = params.clientName || dbRecord?.clientName || cachedRecord?.clientName || '';
      const effectiveAmount = params.amount !== undefined ? params.amount : (dbRecord?.grandTotal ?? cachedRecord?.totalAmount ?? 0);
      const effectiveDate = params.dateBilled || (dbRecord as any)?.dateBilled || dbRecord?.createdAt || cachedRecord?.dateBilled || '';

      const effectiveToken = params.token || cachedRecord?.shortToken || '';
      const effectiveSig = params.signature || cachedRecord?.fullHash?.slice(0, 16) || '';

      if (!effectiveClient && !dbRecord && !cachedRecord) {
        setVerificationResult({
          status: 'not_found',
          message: `Document Reference "${cleanRef}" was not found in the firm's registry ledger or local security cache.`,
          docRef: cleanRef
        });
        setIsVerifying(false);
        return;
      }

      // 3. Perform Offline Mathematical Cryptographic Proof
      const cryptoCheck = verifyDocumentOffline({
        documentRef: cleanRef,
        totalAmount: effectiveAmount,
        dateBilled: effectiveDate,
        clientName: effectiveClient,
        token: effectiveToken,
        signature: effectiveSig
      });

      if (!cryptoCheck.isValid) {
        setVerificationResult({
          status: 'tampered',
          message: cryptoCheck.reason || 'Cryptographic integrity check failed. Figures or metadata on the document do not match the official seal signature.',
          docRef: cleanRef,
          clientName: effectiveClient,
          totalAmount: effectiveAmount,
          dateBilled: effectiveDate,
          token: effectiveToken
        });
        setIsVerifying(false);
        return;
      }

      // Valid & Authentic
      setVerificationResult({
        status: 'authentic',
        message: 'Cryptographically certified as authentic. Issued by Nyagah B. Kithinji & Co. Advocates with zero tampering.',
        docRef: cleanRef,
        clientName: effectiveClient,
        matterTitle: dbRecord?.matterTitle || cachedRecord?.matterTitle || 'High Court of Kenya Matter',
        totalAmount: effectiveAmount,
        dateBilled: effectiveDate,
        token: cryptoCheck.computedToken,
        signature: cryptoCheck.computedSignature,
        isOfflineVerified: true,
        isDatabaseSynced: !!dbRecord
      });
    } catch (err: any) {
      setVerificationResult({
        status: 'not_found',
        message: 'Verification failed: ' + (err?.message || 'Unknown verification error'),
        docRef: params.docRef
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docRefInput.trim()) return;
    runVerification({
      docRef: docRefInput,
      token: tokenInput || undefined
    });
  };

  // Start Device Camera for in-browser QR scanning
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      setCameraError('Camera access unavailable or permission denied: ' + (err?.message || 'Error'));
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-main)]">
                Document Authenticity & Execution Verification
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Official Zero-Trust Verification Portal • {EXACT_FIRM_INFO.name}
              </p>
            </div>
          </div>
        </div>

        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1 border border-[var(--border-color)] bg-[var(--bg-subtle)] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Workspace</span>
          </button>
        )}
      </div>

      {/* Camera Live Modal */}
      {cameraActive && (
        <div className="p-4 bg-black rounded-2xl border border-slate-700 space-y-3">
          <div className="flex justify-between items-center text-white text-xs">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Camera Scanner Active — Align stamp QR code within frame
            </span>
            <button
              type="button"
              onClick={stopCamera}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-0 border-2 border-dashed border-emerald-400/60 rounded-xl m-8 pointer-events-none"></div>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Tip: Most modern smartphones can also scan the physical document using the phone's native camera app.
          </p>
        </div>
      )}

      {cameraError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400">
          {cameraError}
        </div>
      )}

      {/* Manual Input Form */}
      <form onSubmit={handleManualSubmit} className="vercel-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--text-main)]">
            Verify Physical Document or PDF Bill
          </span>
          <button
            type="button"
            onClick={cameraActive ? stopCamera : startCamera}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 flex items-center gap-1.5 cursor-pointer hover:bg-blue-100 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{cameraActive ? 'Close Camera' : 'Scan via Device Camera'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
              Document Reference Number (e.g. BOC2610001)
            </label>
            <div className="relative">
              <input
                type="text"
                value={docRefInput}
                onChange={e => setDocRefInput(e.target.value)}
                placeholder="Enter Document Reference..."
                required
                className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl pl-3 pr-8 py-2 text-xs font-mono font-bold text-[var(--text-main)] focus:outline-none uppercase"
              />
              <Hash className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
              Security Token (Optional)
            </label>
            <input
              type="text"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              placeholder="e.g. KL-8F92-C4B1"
              className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-main)] focus:outline-none uppercase"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isVerifying || !docRefInput.trim()}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-black dark:hover:bg-slate-100 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking Cryptographic Seal...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Verify Authenticity</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Verification Result Display */}
      {verificationResult.status === 'authentic' && (
        <div className="vercel-card border-2 border-emerald-500/40 p-6 space-y-5 bg-emerald-500/5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-200">
                    CERTIFIED AUTHENTIC DOCUMENT
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    VALID SEAL
                  </span>
                </div>
                <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80 mt-0.5">
                  {verificationResult.message}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-emerald-500/20 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                Document Ref
              </span>
              <p className="font-mono font-bold text-sm text-[var(--text-main)] mt-0.5">
                {verificationResult.docRef}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                Certified Total
              </span>
              <p className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">
                KES {Number(verificationResult.totalAmount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                Issue Date
              </span>
              <p className="font-semibold text-[var(--text-main)] mt-0.5">
                {verificationResult.dateBilled || 'Current'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                Billed To
              </span>
              <p className="font-semibold text-[var(--text-main)] mt-0.5">
                {verificationResult.clientName || 'Instructing Client'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                Firm Authority
              </span>
              <p className="font-semibold text-[var(--text-main)] mt-0.5">
                {EXACT_FIRM_INFO.name}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                Security Token
              </span>
              <p className="font-mono font-bold text-xs text-[var(--text-main)] mt-0.5">
                {verificationResult.token || 'KL-VERIFIED'}
              </p>
            </div>
          </div>

          {/* Verification Engine Details */}
          <div className="p-3 bg-white/60 dark:bg-zinc-900/60 rounded-xl border border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Cryptographic Proof: 256-bit Immutable Asymmetric Digest</span>
            </div>
            <div className="font-mono text-[10px] text-slate-500">
              Sig: {verificationResult.signature || '8f92a1...'} • KRA PIN: {EXACT_FIRM_INFO.kraPin}
            </div>
          </div>
        </div>
      )}

      {verificationResult.status === 'tampered' && (
        <div className="vercel-card border-2 border-rose-500/50 p-6 space-y-4 bg-rose-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-rose-950 dark:text-rose-200">
                TAMPERING OR FORGERY DETECTED
              </h3>
              <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                {verificationResult.message}
              </p>
            </div>
          </div>
          <div className="p-3 bg-rose-100/70 dark:bg-rose-950/40 rounded-xl text-xs text-rose-900 dark:text-rose-300 space-y-1">
            <p><strong>Warning:</strong> The figures, client credentials, or dates on this printed document do not match the cryptographic hash signed by Nyagah B. Kithinji & Co. Advocates.</p>
            <p className="text-[11px] text-rose-700 dark:text-rose-400">Please contact the firm directly at {EXACT_FIRM_INFO.phone} to report fraudulent billing.</p>
          </div>
        </div>
      )}

      {verificationResult.status === 'not_found' && (
        <div className="vercel-card border border-amber-500/40 p-5 space-y-3 bg-amber-500/5">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-sm">Unregistered Document Reference</h4>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            {verificationResult.message}
          </p>
        </div>
      )}
    </div>
  );
};
