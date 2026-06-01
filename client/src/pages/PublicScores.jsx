import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function PublicScores() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/stats');
        setScores(response.data.stats || []);
      } catch (err) {
        setError('Unable to load credibility scores. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <nav className="bg-white border-b border-gray-100 shadow-sm px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">J</span>
          </div>
          <div>
            <p className="font-bold text-gray-800">Jan Samadhan</p>
            <p className="text-xs text-gray-500">Public Credibility Dashboard</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link to="/track" className="text-gray-500 hover:text-orange-500 transition">Track Issue</Link>
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin" className="text-orange-600 font-medium hover:underline">Admin Panel</Link>
              ) : (
                <>
                  <Link to="/report" className="text-gray-500 hover:text-orange-500 transition">Report Issue</Link>
                  <Link to="/dashboard" className="text-gray-500 hover:text-orange-500 transition">My Issues</Link>
                </>
              )}
              <button onClick={() => { logout(); navigate('/login'); }} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-500 hover:text-orange-500 transition">Login</Link>
              <Link to="/register" className="text-orange-600 font-medium hover:underline">Register</Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Public Credibility Scores</h1>
          <p className="text-gray-500 mt-2">This page shows how each department is performing based on issue resolution speed and completion rate.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">What this score means</p>
                  <h2 className="text-xl font-semibold text-gray-800">Transparency for citizens</h2>
                </div>
                <div className="rounded-full bg-orange-50 text-orange-700 px-4 py-2 text-xs font-semibold">0-100 scale</div>
              </div>
              <p className="text-sm leading-6 text-gray-600">Scores combine resolution rate and average response speed to highlight which departments are resolving complaints fastest. A higher score means better reliability and faster action.</p>
            </div>

            <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">Latest update</p>
                  <h2 className="text-xl font-semibold text-gray-800">Live department ranking</h2>
                </div>
                <span className="text-xs text-gray-400">Updated on page load</span>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100 pb-2">
                  <span>Department</span>
                  <span className="text-center">Credibility</span>
                  <span className="text-right">Status</span>
                </div>
                {loading ? (
                  <div className="py-16 text-center text-gray-500">Loading scores...</div>
                ) : error ? (
                  <div className="py-16 text-center text-red-600">{error}</div>
                ) : sortedScores.length === 0 ? (
                  <div className="py-16 text-center text-gray-500">No data available yet.</div>
                ) : (
                  sortedScores.map((item, index) => (
                    <div key={item.department} className="grid grid-cols-3 gap-4 items-center rounded-2xl bg-gray-50 px-4 py-4">
                      <div className="font-semibold text-gray-800">{item.department}</div>
                      <div className="text-center">
                        <span className="text-lg font-bold text-gray-900">{item.score}</span>
                        <p className="text-[11px] text-gray-500">/100</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${item.score >= 75 ? 'bg-emerald-100 text-emerald-700' : item.score >= 45 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {item.score >= 75 ? 'Strong' : item.score >= 45 ? 'Average' : 'Needs improvement'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">How the score is calculated</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3"><span className="font-semibold text-orange-500">70%</span> Resolution rate</li>
                <li className="flex gap-3"><span className="font-semibold text-orange-500">30%</span> Average resolution speed</li>
                <li className="text-gray-500">A department with many closed issues and fast action earns the highest score.</li>
              </ul>
            </div>

            <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Get started</h3>
              <div className="space-y-3">
                <Link to="/track" className="block rounded-xl bg-orange-500 px-4 py-3 text-center text-white font-semibold">Track an issue</Link>
                <Link to="/register" className="block rounded-xl border border-orange-200 px-4 py-3 text-center text-orange-600 font-semibold">Register as citizen</Link>
                <Link to="/login" className="block rounded-xl border border-gray-200 px-4 py-3 text-center text-gray-700 font-semibold">Login</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
