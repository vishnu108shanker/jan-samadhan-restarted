import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

const STATUS_BADGE = {
  'Submitted':   'bg-blue-100 text-blue-700 border-blue-200',
  'Assigned':    'bg-yellow-100 text-yellow-700 border-yellow-200',
  'In Progress': 'bg-orange-100 text-orange-700 border-orange-200',
  'Resolved':    'bg-green-100 text-green-700 border-green-200',
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [issues, setIssues]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept, setFilterDept]   = useState('');
  const [updating, setUpdating]       = useState(null); // issue id being updated

  // Inline edit state per issue
  const [edits, setEdits] = useState({}); // { [id]: { status, officerNotes } }

  const fetchIssues = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/issues/all');
      setIssues(res.data.issues);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError('Failed to load issues. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/report'); return; }
    fetchIssues();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEditChange = (id, field, value) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleUpdate = async (issue) => {
    const patch = edits[issue._id];
    if (!patch || (!patch.status && patch.officerNotes === undefined)) return;

    setUpdating(issue._id);
    try {
      const payload = {};
      if (patch.status) payload.status = patch.status;
      if (patch.officerNotes !== undefined) payload.officerNotes = patch.officerNotes;

      const res = await api.patch(`/issues/${issue._id}/status`, payload);
      setIssues((prev) => prev.map((i) => (i._id === issue._id ? res.data.issue : i)));
      setEdits((prev) => { const copy = { ...prev }; delete copy[issue._id]; return copy; });
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const departments = [...new Set(issues.map((i) => i.department))].sort();

  const filtered = issues.filter((i) => {
    const matchStatus = filterStatus ? i.status === filterStatus : true;
    const matchDept   = filterDept   ? i.department === filterDept : true;
    return matchStatus && matchDept;
  });

  const stats = STATUSES.map((s) => ({ label: s, count: issues.filter((i) => i.status === s).length }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">J</span>
          </div>
          <div>
            <span className="font-bold text-gray-800">Jan Samadhan</span>
            <span className="ml-2 text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/scores" className="text-sm text-gray-500 hover:text-orange-500 transition">Public Scores</Link>
          <Link to="/track" className="text-sm text-gray-500 hover:text-orange-500 transition">Public Tracker</Link>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage all citizen grievances and update their resolution status.</p>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, count }) => (
              <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-4 text-center cursor-pointer hover:border-orange-300 transition" onClick={() => setFilterStatus(filterStatus === label ? '' : label)}>
                <p className="text-3xl font-bold text-gray-800">{count}</p>
                <p className={`text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-block border ${STATUS_BADGE[label] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 mb-6 flex flex-wrap gap-4 items-center">
          <span className="text-sm font-medium text-gray-500">Filter by:</span>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700">
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700">
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {(filterStatus || filterDept) && (
            <button onClick={() => { setFilterStatus(''); setFilterDept(''); }} className="text-xs text-orange-500 hover:underline font-medium">Clear Filters</button>
          )}
          <span className="ml-auto text-xs text-gray-400">{filtered.length} of {issues.length} issues</span>
          <button onClick={fetchIssues} className="text-xs text-gray-500 hover:text-orange-500 border border-gray-200 px-3 py-1.5 rounded-lg transition">↻ Refresh</button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-8 w-8 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
            No issues match the current filters.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((issue) => {
              const edit = edits[issue._id] || {};
              const currentStatus = edit.status || issue.status;
              const currentNotes  = edit.officerNotes !== undefined ? edit.officerNotes : (issue.officerNotes || '');
              const isDirty = edit.status || edit.officerNotes !== undefined;

              return (
                <div key={issue._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Issue header */}
                  <div className="px-6 py-4 flex flex-wrap items-start gap-4 border-b border-gray-50">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{issue.department}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[issue.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{issue.status}</span>
                        <span className="text-xs text-gray-400 font-mono">#{issue.token}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{issue.description}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                        <span>📍 {issue.location}</span>
                        <span>🗓 {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        {issue.resolvedAt && <span className="text-green-600">✅ Resolved {new Date(issue.resolvedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Admin action row */}
                  <div className="px-6 py-4 bg-gray-50 flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Update Status</label>
                      <select
                        value={currentStatus}
                        onChange={(e) => handleEditChange(issue._id, 'status', e.target.value)}
                        className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 min-w-48">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Officer Notes</label>
                      <input
                        type="text"
                        value={currentNotes}
                        onChange={(e) => handleEditChange(issue._id, 'officerNotes', e.target.value)}
                        placeholder="Add resolution notes..."
                        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700 placeholder-gray-400"
                      />
                    </div>
                    <button
                      onClick={() => handleUpdate(issue)}
                      disabled={!isDirty || updating === issue._id}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-2 ${isDirty ? 'bg-orange-500 hover:bg-orange-600 text-white shadow' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      {updating === issue._id ? (
                        <><svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Saving...</>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
