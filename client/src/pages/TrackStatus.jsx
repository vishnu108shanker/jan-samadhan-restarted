import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Search, MapPin, Calendar, Clock, CheckCircle2,
  AlertTriangle, ArrowRight, Clipboard, ShieldCheck,
  UserCheck, Check, Paperclip, Loader2
} from 'lucide-react';

const STATUS_STEPS = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

const STATUS_DETAILS = {
  Submitted:    { title: 'Report Registered',     desc: 'Your report has been received and added to the institutional registry queue.',         icon: Clipboard,    color: 'text-slate-500'  },
  Assigned:     { title: 'Investigator Assigned',  desc: 'An investigator has been assigned and will begin reviewing your complaint.',            icon: UserCheck,    color: 'text-indigo-500' },
  'In Progress':{ title: 'Under Investigation',    desc: 'Active investigation is in progress. Teams have been dispatched to the reported site.', icon: Clock,        color: 'text-amber-500'  },
  Resolved:     { title: 'Report Resolved',        desc: 'The investigation is complete. The file has been closed by the assigned investigator.',   icon: ShieldCheck,  color: 'text-emerald-500'},
};

const STATUS_BADGE = {
  Submitted:    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  Assigned:     'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300',
  'In Progress':'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
  Resolved:     'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300',
};

export default function TrackStatus() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken]   = useState(searchParams.get('token') || '');
  const [issue, setIssue]   = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get('token');
    if (q) { setToken(q); fetchIssue(q); }
  }, [searchParams]);

  const fetchIssue = async (t) => {
    if (!t?.trim()) { setError('Please enter a Report ID.'); return; }
    setError(''); setIssue(null); setLoading(true);
    try {
      const res = await api.get(`/issues/${t.trim()}`);
      if (res.data.success) setIssue(res.data.issue);
    } catch (err) {
      if (err.response?.status === 404)
        setError('No report found with this ID. Please verify and try again.');
      else setError('Unable to reach server. Check your network connection.');
    } finally { setLoading(false); }
  };

  const handleSearch = e => {
    e.preventDefault();
    if (token.trim()) navigate(`/track?token=${encodeURIComponent(token.trim())}`);
  };

  const currentStep = issue ? STATUS_STEPS.indexOf(issue.status) : -1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tracking-tight">
          Track Complaint Status
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Verify the real-time investigation timeline of any report using its unique token.
        </p>
      </div>

      {/* Search Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6 shadow-soft">
        <form onSubmit={handleSearch} className="space-y-3">
          <label htmlFor="token" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Report Reference Token
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="token" type="text" value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="e.g. WB-849202 (case sensitive)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm font-mono tracking-wider focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lookup Report'}
            </button>
          </div>
          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {error}
            </p>
          )}
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-soft">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Fetching report record...</p>
        </div>
      )}

      {/* Results */}
      {issue && (
        <div className="space-y-5">

          {/* Status Banner */}
          <div className="bg-[#0A0F1E] dark:bg-slate-900 border border-slate-700 dark:border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/8 rounded-full filter blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Reference Token</p>
                <p className="font-mono font-bold text-lg text-slate-100 tracking-widest">#{issue.token}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-slate-400">Current Status:</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-md ${STATUS_BADGE[issue.status] || STATUS_BADGE.Submitted}`}>
                  {issue.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Left — Details */}
            <div className="space-y-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-soft">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                  Report Details
                </h3>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Category</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{issue.department}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Location</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 flex items-start gap-1.5 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    {issue.location}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Filed On</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {issue.resolvedAt && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Resolved On</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {new Date(issue.resolvedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>

              {/* Photo Evidence */}
              {issue.photoUrl && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-soft">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Paperclip className="w-3.5 h-3.5" /> Evidence
                  </h3>
                  <div className="rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
                    <img
                      src={issue.photoUrl}
                      alt="Incident Evidence"
                      className="w-full object-cover max-h-44 hover:scale-105 transition-transform duration-300"
                      onError={e => { e.target.onerror = null; e.target.parentNode.innerHTML = '<div class="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800">Image unavailable</div>'; }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right — Timeline + Notes */}
            <div className="md:col-span-2 space-y-5">

              {/* Timeline */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 mb-6">
                  Investigation Timeline
                </h3>
                <div className="relative pl-7 ml-2.5 space-y-7 border-l border-slate-100 dark:border-slate-800">
                  {STATUS_STEPS.map((step, idx) => {
                    const isActive    = idx <= currentStep;
                    const isCompleted = idx < currentStep;
                    const isCurrent   = issue.status === step;
                    const detail      = STATUS_DETAILS[step];
                    const StepIcon    = detail.icon;
                    return (
                      <div key={step} className="relative">
                        {/* Bullet */}
                        <div className={`absolute -left-[35px] top-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? 'bg-sky-500 border-sky-500 text-white ring-4 ring-sky-500/10'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600'
                        }`}>
                          {isCompleted
                            ? <Check className="w-3.5 h-3.5" />
                            : <span className="text-[10px] font-bold">{idx + 1}</span>
                          }
                        </div>
                        {/* Content */}
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className={`text-sm font-semibold font-display ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-300 dark:text-slate-600'}`}>
                              {detail.title}
                            </h4>
                            {isCurrent && (
                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-sky-500 bg-sky-500/10 px-1.5 py-0.5 rounded animate-pulse">
                                Live
                              </span>
                            )}
                          </div>
                          <p className={`text-xs leading-relaxed ${isActive ? 'text-slate-500 dark:text-slate-400' : 'text-slate-300 dark:text-slate-700'}`}>
                            {detail.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Investigator Notes */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  Investigator Remarks
                </h3>
                {issue.officerNotes ? (
                  <div className="border-l-2 border-sky-500 pl-4 py-1">
                    <p className="text-[10px] font-bold text-sky-500 uppercase tracking-wider mb-1.5">
                      Assigned Investigator Statement
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      "{issue.officerNotes}"
                    </p>
                  </div>
                ) : (
                  <div className="p-5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-center text-xs text-slate-400 dark:text-slate-600">
                    No investigator remarks have been added yet. Notes will appear here once the investigation begins.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
