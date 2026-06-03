import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  FileText, Clock, CheckCircle2, AlertCircle,
  MapPin, Droplet, Trash2, Zap, Heart, GraduationCap,
  ChevronRight, PlusCircle, Calendar, Loader2, AlertTriangle
} from 'lucide-react';

const DEPT_ICONS = {
  Roads: MapPin, Water: Droplet, Sanitation: Trash2,
  Electricity: Zap, Health: Heart, Education: GraduationCap,
};

const STATUS_CONFIG = {
  Submitted:   { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',   dot: 'bg-slate-400' },
  Assigned:    { bg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
  'In Progress':{ bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',  dot: 'bg-amber-500' },
  Resolved:    { bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
};

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{label}</p>
      <p className={`text-3xl font-extrabold font-display ${color}`}>{value}</p>
    </div>
  );
}

export default function MyDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    api.get('/issues/mine')
      .then(res => setIssues(res.data.issues || []))
      .catch(err => {
        if (err.response?.status === 401) { logout(); navigate('/login?redirect=/dashboard'); }
        else setError('Unable to load your submissions. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const total      = issues.length;
  const submitted  = issues.filter(i => i.status === 'Submitted').length;
  const active     = issues.filter(i => i.status === 'Assigned' || i.status === 'In Progress').length;
  const resolved   = issues.filter(i => i.status === 'Resolved').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tracking-tight">
            My Submissions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Logged in as{' '}
            <span className="font-semibold text-sky-500 dark:text-sky-400">{user?.name || 'User'}</span>.
            {' '}All submissions are end-to-end encrypted.
          </p>
        </div>
        <Link
          to="/report"
          className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          New Complaint
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stats */}
      {!loading && total > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Filed"         value={total}     color="text-slate-900 dark:text-slate-100" />
          <StatCard label="Pending Review"       value={submitted} color="text-slate-600 dark:text-slate-300" />
          <StatCard label="Under Investigation"  value={active}    color="text-amber-600 dark:text-amber-400" />
          <StatCard label="Resolved"             value={resolved}  color="text-emerald-600 dark:text-emerald-400" />
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading your submissions...</p>
        </div>

      ) : issues.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-14 text-center">
          <div className="w-14 h-14 rounded-xl bg-sky-500/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-sky-500" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">No complaints filed yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">
            Begin a secure complaint using the button above. All submissions are anonymous by default.
          </p>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Submit your first complaint
          </Link>
        </div>

      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-soft">

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Report ID</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Submitted On</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {issues.map(issue => {
                  const Icon  = DEPT_ICONS[issue.department] || FileText;
                  const style = STATUS_CONFIG[issue.status] || STATUS_CONFIG.Submitted;
                  const date  = new Date(issue.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  });
                  return (
                    <tr
                      key={issue._id}
                      onClick={() => navigate(`/track?token=${issue.token}`)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono font-semibold text-slate-700 dark:text-slate-200 text-xs tracking-widest">
                        #{issue.token}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 transition-colors" />
                          {issue.department}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {date}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold ${style.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-sky-500 transition-colors ml-auto" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked cards */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {issues.map(issue => {
              const Icon  = DEPT_ICONS[issue.department] || FileText;
              const style = STATUS_CONFIG[issue.status] || STATUS_CONFIG.Submitted;
              const date  = new Date(issue.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
              });
              return (
                <div
                  key={issue._id}
                  onClick={() => navigate(`/track?token=${issue.token}`)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-widest">
                        #{issue.token}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${style.bg}`}>
                        <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                        {issue.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Icon className="w-3 h-3" />
                      <span>{issue.department}</span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span>{date}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
