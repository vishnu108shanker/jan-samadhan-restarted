import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Shield, ExternalLink } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-[#0A0F1E] border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Logo />
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              A secure, strictly confidential platform for submitting and tracking institutional complaints.
              All reports are encrypted and handled with full investigator accountability.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-600">
              <Shield className="w-3.5 h-3.5 text-sky-500" />
              <span>256-bit encrypted submissions</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/report" className="text-slate-600 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                  Submit a Complaint
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-slate-600 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                  Track Report Status
                </Link>
              </li>
              <li>
                <Link to="/scores" className="text-slate-600 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                  Credibility Index
                </Link>
              </li>
            </ul>
          </div>

          {/* Access */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Access
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="text-slate-600 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                  Investigator Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-600 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-600 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100 dark:border-slate-800/70 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400 dark:text-slate-600">
          <span>© {year} Whistleblower. All rights reserved.</span>
          <span className="text-slate-400 dark:text-slate-500">
            Powered by{' '}
            <a href="https://github.com/vishnu108shanker/Whistleblower/tree/main" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-400 hover:underline transition-colors font-medium">
              @the_evil_lord
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
