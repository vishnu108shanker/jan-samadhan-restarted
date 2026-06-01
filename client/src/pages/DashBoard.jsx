import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE = {
  'Submitted':   'bg-blue-100 text-blue-700',
  'Assigned':    'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-orange-100 text-orange-700',
  'Resolved':    'bg-green-100 text-green-700',
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
        // GET /api/issues/mine — returns only issues filed by the logged-in citizen
        const res = await api.get('/issues/mine');
        setIssues(res.data.issues);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          setError('Failed to load your issues. Please refresh.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchIssues();
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <nav className="bg-white border-b border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">J</span>
          </div>
          <span className="font-bold text-gray-800">Jan Samadhan</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/scores" className="text-sm text-gray-500 hover:text-orange-500 transition">Public Scores</Link>
          <Link to="/report" className="text-sm text-gray-500 hover:text-orange-500 transition">Report Issue</Link>
          <Link to="/track" className="text-sm text-gray-500 hover:text-orange-500 transition">Track Issue</Link>
          {user?.role === 'admin' && <Link to="/admin" className="text-sm text-orange-600 font-medium hover:underline">Admin Panel</Link>}
          <button onClick={handleLogout} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm">Welcome back, <span className="font-medium text-orange-600">{user?.userId ? 'Citizen' : 'User'}</span>. Here are all your filed grievances.</p>
          </div>
          <Link to="/report" className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow transition">
            + File New Issue
          </Link>
        </div>

        {/* Stats Row */}
        {!loading && issues.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {['Submitted', 'Assigned', 'In Progress', 'Resolved'].map((s) => (
              <div key={s} className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-4 text-center">
                <p className="text-2xl font-bold text-gray-800">{issues.filter(i => i.status === s).length}</p>
                <p className="text-xs text-gray-500 mt-1">{s}</p>
              </div>
            ))}
          </div>
        )}

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
        ) : issues.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-3-3v6m9-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-gray-700 font-semibold text-lg mb-2">No grievances filed yet</h3>
            <p className="text-gray-400 text-sm mb-6">File your first complaint and track it right here.</p>
            <Link to="/report" className="inline-block px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition">
              File an Issue
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-semibold text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded">{issue.department}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[issue.status] || 'bg-gray-100 text-gray-600'}`}>{issue.status}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">{issue.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span>📍 {issue.location}</span>
                      <span>🗓 {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => navigate(`/track?token=${issue.token}`)}
                      className="text-xs font-medium text-orange-500 hover:text-orange-700 border border-orange-200 hover:border-orange-400 px-3 py-1.5 rounded-lg transition"
                    >
                      Track →
                    </button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <p className="text-xs text-gray-400">Token: <span className="font-mono text-gray-600">{issue.token}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
