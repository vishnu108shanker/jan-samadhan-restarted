import { Outlet, Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { LogOut, ArrowLeft, ExternalLink } from 'lucide-react';

/** Public + Citizen layout — standard Navbar and Footer */
export function CitizenLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0A0F1E] transition-colors duration-200">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />

      {/* Sticky Quick Exit Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => window.location.replace('https://google.com')}
          className="group flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          title="Instantly leave this site"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">Quick Exit</span>
        </button>
      </div>
    </div>
  );
}

/** Admin layout — deep navy header, no public footer */
export function AdminLayout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-[#060D1A]">

      {/* Admin Header — Deep Navy */}
      <header className="bg-[#0A0F1E] border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">

            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Back to main portal"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="h-4 w-px bg-slate-800" />
              <Logo iconOnly />
              <div className="h-4 w-px bg-slate-800" />
              <span className="text-xs font-semibold tracking-widest uppercase text-sky-400 font-display">
                Admin Console
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-semibold text-slate-200 text-sm">{user?.name || 'Administrator'}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Root Access</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/40 bg-slate-900 hover:bg-rose-950/20 px-3 py-1.5 rounded-lg transition-all text-xs font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children || <Outlet />}
      </main>

      <footer className="bg-[#0A0F1E] border-t border-slate-800 py-4 text-center text-xs text-slate-600 space-y-1">
        <p>Whistleblower Admin Console &bull; Secured via JWT Authentication</p>
        <p>Powered by <a href="https://github.com/vishnu108shanker/Whistleblower/tree/main" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-400 hover:underline transition-colors">@the_evil_lord</a></p>
      </footer>
    </div>
  );
}
