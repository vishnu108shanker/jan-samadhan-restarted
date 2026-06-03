import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { AlertCircle, User, Phone, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [form, setForm]       = useState({ fullName: '', phone: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      const loginRes = await api.post('/auth/login', { email: form.email, password: form.password });
      const { token } = loginRes.data;
      if (!token) throw new Error('Auto-login failed after registration.');
      login(token);
      localStorage.setItem('token', token);
      navigate(redirect);
    } catch (err) {
      if (err.response) {
        const s = err.response.status;
        if (s === 400) setError('All fields are required. Please review your inputs.');
        else if (s === 409) setError('This email or phone number is already registered.');
        else setError(err.response.data?.error || 'Registration failed. Try again.');
      } else {
        setError('Connection failure. Check your network.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all";
  const labelClass = "block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-slate-50 dark:bg-[#0A0F1E]">
      <div className="w-full max-w-sm">

        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo iconOnly />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tracking-tight">
            Create an Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Join Whistleblower to submit and track institutional reports.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card p-7">

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className={labelClass}>Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="fullName" name="fullName" type="text" required
                  value={form.fullName} onChange={handleChange}
                  placeholder="Full Name"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className={labelClass}>Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="phone" name="phone" type="tel" required
                  value={form.phone} onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className={inputClass}
                />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">
                Used only for report status notifications.
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClass}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email" name="email" type="email" required
                  value={form.email} onChange={handleChange}
                  placeholder="name@organisation.com"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password" name="password" type={showPwd ? 'text' : 'password'} required minLength={6}
                  value={form.password} onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className={`${inputClass} pr-10`}
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

            {/* Privacy note */}
            <div className="flex items-start gap-2 p-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-800/30 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-sky-700 dark:text-sky-400 leading-relaxed">
                Your account is never linked to your submissions unless you choose to disclose your identity.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
            <p className="text-slate-500 dark:text-slate-400">
              Already registered?{' '}
              <Link
                to={searchParams.get('redirect') ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}
                className="text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 font-semibold"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
