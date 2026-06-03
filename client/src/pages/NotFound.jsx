import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 bg-slate-50 dark:bg-[#0A0F1E]">
      <div className="text-center max-w-md">

        {/* Large 404 */}
        <div className="relative mb-8 select-none">
          <p className="text-[120px] sm:text-[160px] font-black font-display leading-none text-slate-100 dark:text-slate-800/70 tracking-tighter">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-sky-500/10 dark:bg-sky-500/8 border border-sky-500/20 rounded-2xl px-5 py-3">
              <p className="text-sky-600 dark:text-sky-400 font-bold font-display text-sm tracking-wider uppercase">
                Page Not Found
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mb-3">
          This route doesn't exist
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
          The page you're looking for has been moved, deleted, or never existed.
          Use the links below to get back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/track"
            className="inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors w-full sm:w-auto justify-center"
          >
            <Search className="w-4 h-4" />
            Track a Report
          </Link>
        </div>
      </div>
    </div>
  );
}
