import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { AlertCircle, Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { token } = res.data;
      if (!token) throw new Error('Auth token missing');
      login(token);
      localStorage.setItem('token', token);
      navigate(redirect);
    } catch (err) {
      if (err.response) {
        const s = err.response.status;
        if (s === 400) setError('Please verify your email and password format.');
        else if (s === 401) setError('Incorrect email or password.');
        else setError(err.response.data?.error || 'Authentication failed. Try again.');
      } else {
        setError('Network error. Could not connect to server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-slate-50 dark:bg-[#0A0F1E]">
      <div className="w-full max-w-md">

        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo iconOnly />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tracking-tight">
            Sign in to Whistleblower
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Access your secure dashboard to file and track reports.
          </p>
        </div>

        {/* Redirect Alert */}
        {searchParams.get('redirect') === '/report' && (
          <div className="mb-6 p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl flex items-start gap-3 text-sky-800 dark:text-sky-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Authentication Required:</strong> Please sign in or create an account to securely file your complaint.
            </p>
          </div>
        )}

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8">

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email" name="email" type="email" required
                  value={form.email} onChange={handleChange}
                  placeholder="example@secure.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password" name="password" type={showPwd ? 'text' : 'password'} required
                  value={form.password} onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>



            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center space-y-2 text-xs">
            <p className="text-slate-500 dark:text-slate-400">
              New to Whistleblower?{' '}
              <Link
                to={searchParams.get('redirect') ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'}
                className="text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 font-semibold"
              >
                Create an account
              </Link>
            </p>
            <p>
              <Link to="/scores" className="text-slate-400 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                View public credibility index
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
