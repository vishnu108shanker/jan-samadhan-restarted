import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CheckCircle2, Copy, Check, ArrowRight, LayoutDashboard, AlertTriangle } from 'lucide-react';

export default function ReportSuccess() {
  const location = useLocation();
  const navigate  = useNavigate();
  const [copied, setCopied] = useState(false);

  const token = location.state?.token;
  if (!token) return <Navigate to="/" replace />;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* fallback silent */ }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-6 bg-slate-50 dark:bg-[#0A0F1E]">
      <div className="w-full max-w-md">

        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/8 flex items-center justify-center mx-auto mb-5 ring-8 ring-emerald-500/5">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tracking-tight">
            Report Lodged Successfully
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Your complaint has been encrypted and added to the registry.
            An investigator will be assigned automatically.
          </p>
        </div>

        {/* Token block */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card overflow-hidden mb-4">
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Report Token</p>
          </div>
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <p className="font-mono font-bold text-xl text-slate-900 dark:text-slate-100 tracking-widest">
              {token}
            </p>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                copied
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-sky-500/40 hover:text-sky-500 dark:hover:text-sky-400'
              }`}
            >
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 rounded-xl mb-6">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            <span className="font-bold block mb-0.5">Save this token now.</span>
            This is your only access key to track the investigation status.
            It cannot be recovered if lost. Screenshot or copy it before leaving this page.
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={() => navigate(`/track?token=${encodeURIComponent(token)}`)}
            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-lg text-sm transition-colors shadow-sm"
          >
            Track Live Status <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold py-3 rounded-lg text-sm transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
