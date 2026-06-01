import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = ['Roads', 'Water', 'Sanitation', 'Electricity', 'Health', 'Education'];

export default function ReportIssue() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [form, setForm] = useState({ description: '', department: '', location: '', photoUrl: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const payload = { description: form.description, department: form.department, location: form.location };
      if (form.photoUrl.trim()) payload.photoUrl = form.photoUrl.trim();
      const res = await api.post('/issues/create', payload);
      setResult(res.data.data);
    } catch (err) {
      if (err.response) {
        const s = err.response.status;
        if (s === 400) setError('Please fill in all required fields.');
        else if (s === 401) { setError('Session expired. Please log in again.'); logout(); navigate('/login'); }
        else setError(err.response.data?.error || 'Failed to submit issue.');
      } else if (err.request) {
        setError('No response from server. Check your connection.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
          <Link to="/track" className="text-sm text-gray-500 hover:text-orange-500 transition">Track Issue</Link>
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-orange-500 transition">My Issues</Link>
          {user?.role === 'admin' && <Link to="/admin" className="text-sm text-orange-600 font-medium hover:underline">Admin</Link>}
          <button onClick={() => { logout(); navigate('/login'); }} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">File a Grievance</h1>
          <p className="text-gray-500 mt-1 text-sm">Describe your issue clearly. You will receive a tracking token after submission.</p>
        </div>

        {result ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Issue Filed Successfully!</h2>
            <p className="text-gray-500 text-sm mb-6">Save your tracking token to check the status of your complaint.</p>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-orange-600 font-medium uppercase tracking-wide mb-1">Your Tracking Token</p>
              <p className="text-xl font-mono font-bold text-orange-700 break-all">{result.token}</p>
              <p className="text-xs text-gray-400 mt-2">Status: <span className="font-semibold text-gray-600">{result.status}</span></p>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => navigate(`/track?token=${result.token}`)} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition">Track This Issue</button>
              <button onClick={() => { setForm({ description: '', department: '', location: '', photoUrl: '' }); setResult(null); }} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition">File Another</button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {error && <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-600 mb-1">Department <span className="text-red-400">*</span></label>
                <select id="department" name="department" required value={form.department} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition text-gray-800 bg-white">
                  <option value="">Select a department...</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-600 mb-1">Location <span className="text-red-400">*</span></label>
                <input id="location" name="location" type="text" required value={form.location} onChange={handleChange} placeholder="e.g. Ward 12, Sector 5, Near Main Road" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition text-gray-800 placeholder-gray-400" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">Description <span className="text-red-400">*</span></label>
                <textarea id="description" name="description" required rows={5} value={form.description} onChange={handleChange} placeholder="Describe the problem in detail..." className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition text-gray-800 placeholder-gray-400 resize-none" />
              </div>
              <div>
                <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-600 mb-1">Photo URL <span className="text-gray-400 font-normal">(optional)</span></label>
                <input id="photoUrl" name="photoUrl" type="url" value={form.photoUrl} onChange={handleChange} placeholder="https://example.com/photo.jpg" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition text-gray-800 placeholder-gray-400" />
              </div>
              <button type="submit" disabled={loading} className="w-full mt-2 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2">
                {loading ? (<><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Submitting...</>) : 'Submit Grievance'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
