import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  'Submitted':   'bg-blue-100 text-blue-700',
  'Assigned':    'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-orange-100 text-orange-700',
  'Resolved':    'bg-green-100 text-green-700',
};

const STATUS_STEPS = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

export default function TrackStatus() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [issue, setIssue] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-fetch if token came from URL param
  useEffect(() => {
    if (searchParams.get('token')) handleTrack();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) { setError('Please enter a tracking token.'); return; }
    setError('');
    setIssue(null);
    setLoading(true);
    try {
      const res = await api.get(`/issues/${trimmed}`);
      setIssue(res.data.issue);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No issue found with that token. Please check and try again.');
      } else if (err.request) {
        setError('No response from server. Check your connection.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const currentStep = issue ? STATUS_STEPS.indexOf(issue.status) : -1;

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
          {user ? (
            <>
              <Link to="/report" className="text-sm text-gray-500 hover:text-orange-500 transition">Report Issue</Link>
              <Link to="/dashboard" className="text-sm text-gray-500 hover:text-orange-500 transition">My Issues</Link>
              {user.role === 'admin' && <Link to="/admin" className="text-sm text-orange-600 font-medium">Admin</Link>}
              <button onClick={() => { logout(); navigate('/login'); }} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-500 hover:text-orange-500 transition">Login</Link>
              <Link to="/register" className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition">Register</Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Track Your Grievance</h1>
          <p className="text-gray-500 mt-1 text-sm">Enter the token you received when you filed your complaint.</p>
        </div>

        {/* Search */}
        <form onSubmit={handleTrack} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
          <label htmlFor="token" className="block text-sm font-medium text-gray-600 mb-2">Tracking Token</label>
          <div className="flex gap-3">
            <input
              id="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g. JS-A1B2C3D4"
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition text-gray-800 placeholder-gray-400 font-mono"
            />
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-lg transition flex items-center gap-2">
              {loading ? <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> : 'Track'}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </form>

        {/* Result */}
        {issue && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Status header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs font-medium uppercase tracking-wide">Tracking Token</p>
                  <p className="text-white font-mono font-bold text-lg">{issue.token}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${STATUS_COLORS[issue.status] || 'bg-gray-100 text-gray-700'}`}>
                  {issue.status}
                </span>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, idx) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${idx <= currentStep ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {idx < currentStep ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : idx + 1}
                      </div>
                      <span className={`text-xs mt-1 text-center ${idx <= currentStep ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>{step}</span>
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-5 ${idx < currentStep ? 'bg-orange-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Issue Details */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Department</p>
                  <p className="text-gray-800 font-semibold mt-1">{issue.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Location</p>
                  <p className="text-gray-800 font-semibold mt-1">{issue.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Filed On</p>
                  <p className="text-gray-800 font-semibold mt-1">{new Date(issue.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
                {issue.resolvedAt && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Resolved On</p>
                    <p className="text-green-700 font-semibold mt-1">{new Date(issue.resolvedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Description</p>
                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg px-4 py-3">{issue.description}</p>
              </div>
              {issue.officerNotes && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Officer Notes</p>
                  <p className="text-gray-700 text-sm leading-relaxed bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">{issue.officerNotes}</p>
                </div>
              )}
              {issue.photoUrl && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Photo Evidence</p>
                  <img src={issue.photoUrl} alt="Issue evidence" className="rounded-lg max-h-48 object-cover border border-gray-200" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
