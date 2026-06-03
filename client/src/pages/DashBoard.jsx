import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Droplet, 
  Trash2, 
  Zap, 
  Heart, 
  GraduationCap, 
  ChevronRight, 
  PlusCircle, 
  Calendar,
  AlertTriangle
} from 'lucide-react';

// Maps department string to Lucide icon
const DEPT_ICONS = {
  'Roads': MapPin,
  'Water': Droplet,
  'Sanitation': Trash2,
  'Electricity': Zap,
  'Health': Heart,
  'Education': GraduationCap
};

// Maps status to visual pill classes
const STATUS_STYLES = {
  'Submitted': {
    bg: 'bg-slate-100 text-slate-700 border-slate-200/50',
    dot: 'bg-slate-500'
  },
  'Assigned': {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    dot: 'bg-indigo-600'
  },
  'In Progress': {
    bg: 'bg-amber-50 text-amber-700 border-amber-100',
    dot: 'bg-amber-500'
  },
  'Resolved': {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    dot: 'bg-emerald-500'
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const res = await api.get('/issues/mine');
        setIssues(res.data.issues || []);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate('/login?redirect=/dashboard');
        } else {
          setError('Unable to load your reports. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchIssues();
  }, [user]);

  // Statistics counters
  const totalCount = issues.length;
  const submittedCount = issues.filter(i => i.status === 'Submitted').length;
  const assignedCount = issues.filter(i => i.status === 'Assigned' || i.status === 'In Progress').length;
  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      
      {/* Title Header Section */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-brand-slate tracking-tight">
            Whistleblower Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-brand-saffron">{user?.name || 'User'}</span>. Monitor and track your filed reports.
          </p>
        </div>
        <Link 
          to="/report" 
          className="inline-flex items-center justify-center gap-2 bg-brand-saffron hover:bg-brand-saffron-dark text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 shadow-sm text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          File New Report
        </Link>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-200/50 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Stats Block Row */}
      {!loading && totalCount > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Reports</span>
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black font-display text-brand-slate">{totalCount}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Submitted</span>
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black font-display text-slate-600">{submittedCount}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
            <div className="flex items-center justify-between mb-3 text-brand-saffron">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">In Action</span>
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <p className="text-3xl font-black font-display text-brand-slate">{assignedCount}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
            <div className="flex items-center justify-between mb-3 text-emerald-500">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolved</span>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black font-display text-emerald-600">{resolvedCount}</p>
          </div>

        </div>
      )}

      {/* Content Table/Grid Card */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-brand-saffron animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading your reports...</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 bg-brand-saffron/10 text-brand-saffron rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-slate-800 font-bold text-lg mb-2">No reports filed yet</h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            All your submitted issues and official updates will appear here. Submit your first institutional report to begin.
          </p>
          <Link 
            to="/report" 
            className="inline-flex items-center gap-2 bg-brand-saffron hover:bg-brand-saffron-dark text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-sm text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            File an Issue
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4.5">Report ID</th>
                  <th className="px-6 py-4.5">Date</th>
                  <th className="px-6 py-4.5">Category</th>
                  <th className="px-6 py-4.5">Subject Preview</th>
                  <th className="px-6 py-4.5">Status</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {issues.map((issue) => {
                  const Icon = DEPT_ICONS[issue.department] || FileText;
                  const style = STATUS_STYLES[issue.status] || STATUS_STYLES['Submitted'];
                  const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr 
                      key={issue._id}
                      onClick={() => navigate(`/track?token=${issue.token}`)}
                      className="hover:bg-slate-50/40 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4.5 font-mono font-bold text-slate-800 tracking-wider">
                        #{issue.token}
                      </td>
                      <td className="px-6 py-4.5 text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formattedDate}
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-2 font-semibold text-slate-700">
                          <Icon className="w-4 h-4 text-slate-400 group-hover:text-brand-saffron transition-colors" />
                          {issue.department}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 max-w-[240px] truncate text-slate-400">
                        {issue.description}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border ${style.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <button className="p-1.5 rounded-lg border border-transparent group-hover:border-slate-100 group-hover:bg-white text-slate-400 group-hover:text-brand-saffron transition-all duration-200">
                          <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 duration-200" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Micro-cards View */}
          <div className="md:hidden divide-y divide-slate-50">
            {issues.map((issue) => {
              const Icon = DEPT_ICONS[issue.department] || FileText;
              const style = STATUS_STYLES[issue.status] || STATUS_STYLES['Submitted'];
              const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div 
                  key={issue._id}
                  onClick={() => navigate(`/track?token=${issue.token}`)}
                  className="p-5 active:bg-slate-50 flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-2 flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-slate-800 tracking-wider text-sm">
                        #{issue.token}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${style.bg}`}>
                        <span className={`w-1 h-1 rounded-full ${style.dot}`}></span>
                        {issue.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{issue.department}</span>
                      <span className="text-slate-300 font-normal">|</span>
                      <span className="text-slate-400 font-normal flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 truncate max-w-sm">
                      {issue.description}
                    </p>
                  </div>

                  <div className="flex-shrink-0 self-center">
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
