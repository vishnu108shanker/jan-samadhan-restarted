import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import {
  MapPin, Droplet, Trash2, Zap, Heart, GraduationCap,
  FileCheck, ChevronDown, Loader2, CheckCircle2, AlertTriangle,
  Clock, UserCheck, ShieldCheck, Filter, Search
} from 'lucide-react';

const DEPT_ICONS = {
  Roads: MapPin, Water: Droplet, Sanitation: Trash2,
  Electricity: Zap, Health: Heart, Education: GraduationCap,
};

const STATUS_OPTIONS = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

const STATUS_CONFIG = {
  Submitted:    { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',       dot: 'bg-slate-400',   icon: FileCheck  },
  Assigned:     { bg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500',  icon: UserCheck  },
  'In Progress':{ bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',     dot: 'bg-amber-500',   icon: Clock      },
  Resolved:     { bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', icon: ShieldCheck },
};

export default function AdminPanel() {
  const { showToast } = useToast();

  const [issues,     setIssues]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [filterStat, setFilterStat] = useState('');
  const [searchQ,    setSearchQ]    = useState('');
  const [edits,      setEdits]      = useState({});       // { [id]: { status, notes } }
  const [saving,     setSaving]     = useState({});       // { [id]: bool }
  const [successMsg, setSuccessMsg] = useState({});       // { [id]: string }

  useEffect(() => {
    api.get('/issues/all')
      .then(res => setIssues(res.data.issues || []))
      .catch(() => showToast('Failed to load reports.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const departments = [...new Set(issues.map(i => i.department))].sort();

  const filtered = issues.filter(i => {
    const matchDept = !filterDept || i.department === filterDept;
    const matchStat = !filterStat || i.status === filterStat;
    const matchQ    = !searchQ    ||
      i.token?.toLowerCase().includes(searchQ.toLowerCase()) ||
      i.description?.toLowerCase().includes(searchQ.toLowerCase()) ||
      i.location?.toLowerCase().includes(searchQ.toLowerCase());
    return matchDept && matchStat && matchQ;
  });

  const getEdit = (issue) => edits[issue._id] || { status: issue.status, notes: issue.officerNotes || '' };

  const handleEditChange = (id, field, value) => {
    setEdits(prev => ({ ...prev, [id]: { ...getEdit({ _id: id }), [field]: value } }));
  };

  const handleSave = async (issue) => {
    const edit = getEdit(issue);
    setSaving(prev => ({ ...prev, [issue._id]: true }));
    setSuccessMsg(prev => ({ ...prev, [issue._id]: '' }));
    try {
      const res = await api.patch(`/issues/${issue._id}/status`, {
        status: edit.status,
        officerNotes: edit.notes,
      });
      setIssues(prev => prev.map(i => i._id === issue._id ? res.data.issue : i));
      setEdits(prev => { const copy = { ...prev }; delete copy[issue._id]; return copy; });
      setSuccessMsg(prev => ({ ...prev, [issue._id]: 'Updated successfully.' }));
      showToast('Report status updated.', 'success');
      setTimeout(() => setSuccessMsg(prev => ({ ...prev, [issue._id]: '' })), 3000);
    } catch {
      showToast('Failed to update status. Try again.', 'error');
    } finally {
      setSaving(prev => ({ ...prev, [issue._id]: false }));
    }
  };

  const isDirty = (issue) => {
    const e = edits[issue._id];
    if (!e) return false;
    return e.status !== issue.status || e.notes !== (issue.officerNotes || '');
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tracking-tight">
            Institutional Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review live report files, assign investigators, and record resolution statements.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-600">
          <span className="font-mono font-bold text-slate-600 dark:text-slate-400">{issues.length}</span> total reports
          {filtered.length !== issues.length && (
            <span>· <span className="font-mono font-bold text-sky-500">{filtered.length}</span> filtered</span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap gap-3 items-center shadow-soft">
        {/* Search */}
        <div className="relative flex-grow min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search token, description, location..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 transition-all font-mono"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 appearance-none pr-7 transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={filterStat}
            onChange={e => setFilterStat(e.target.value)}
            className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 appearance-none pr-7 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>

        {(filterDept || filterStat || searchQ) && (
          <button
            onClick={() => { setFilterDept(''); setFilterStat(''); setSearchQ(''); }}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors px-2 py-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Report Cards */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-16 flex flex-col items-center gap-3 shadow-soft">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading report files...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-16 text-center shadow-soft">
          <Filter className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {issues.length === 0 ? 'No reports in the system yet.' : 'No reports match your current filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(issue => {
            const Icon        = DEPT_ICONS[issue.department] || FileCheck;
            const statusCfg   = STATUS_CONFIG[issue.status] || STATUS_CONFIG.Submitted;
            const StatusIcon  = statusCfg.icon;
            const edit        = getEdit(issue);
            const dirty       = isDirty(issue);
            const isSaving    = saving[issue._id];
            const successTxt  = successMsg[issue._id];

            return (
              <div
                key={issue._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-soft hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                {/* Top info row */}
                <div className="p-5 sm:p-6 flex flex-col md:flex-row gap-5 justify-between items-start">
                  <div className="space-y-2.5 flex-grow min-w-0">

                    {/* Token + status */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 tracking-widest bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                        #{issue.token}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${statusCfg.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {issue.status}
                      </span>
                    </div>

                    {/* Category + date */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-slate-400" /> {issue.department}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="flex items-center gap-1">
                        {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      {issue.location && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <span className="flex items-center gap-1 max-w-[220px] truncate">
                            <MapPin className="w-3 h-3 flex-shrink-0" /> {issue.location}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Description */}
                    {issue.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 max-w-xl">
                        {issue.description}
                      </p>
                    )}
                  </div>

                  {/* Photo thumbnail */}
                  {issue.photoUrl && (
                    <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                      <a href={issue.photoUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={issue.photoUrl}
                          alt="Incident Evidence"
                          width="80"
                          height="56"
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          onError={e => { e.target.onerror = null; e.target.parentNode.innerHTML = '<div class="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">No image</div>'; }}
                        />
                      </a>
                    </div>
                  )}
                </div>

                {/* Admin action row */}
                <div className="border-t border-slate-100 dark:border-slate-800 px-5 sm:px-6 py-4 bg-slate-50/60 dark:bg-slate-800/20 flex flex-col sm:flex-row gap-3 items-start sm:items-center">

                  {/* Status selector */}
                  <div className="relative">
                    <select
                      value={edit.status}
                      onChange={e => handleEditChange(issue._id, 'status', e.target.value)}
                      className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 appearance-none pr-7 transition-all cursor-pointer"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Notes input */}
                  <input
                    type="text"
                    value={edit.notes}
                    onChange={e => handleEditChange(issue._id, 'notes', e.target.value)}
                    placeholder="Investigator remarks / resolution notes..."
                    className="flex-grow text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 px-3 py-2 rounded-lg focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 transition-all"
                  />

                  {/* Save button */}
                  <button
                    onClick={() => handleSave(issue)}
                    disabled={!dirty || isSaving}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      dirty
                        ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Save
                  </button>

                  {/* Success confirmation */}
                  {successTxt && (
                    <span className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {successTxt}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
