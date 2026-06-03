import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Award, MapPin, Droplet, Trash2, Zap, Heart,
  GraduationCap, HelpCircle, ArrowRight, FileCheck, Loader2
} from 'lucide-react';

const DEPT_ICONS = {
  Roads: MapPin, Water: Droplet, Sanitation: Trash2,
  Electricity: Zap, Health: Heart, Education: GraduationCap,
};

function ScoreBar({ score }) {
  const color = score >= 75 ? 'bg-emerald-500' : score >= 45 ? 'bg-amber-500' : 'bg-red-500';
  const badge = score >= 75
    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
    : score >= 45
    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
    : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400';
  const label = score >= 75 ? 'Strong' : score >= 45 ? 'Average' : 'Critical';
  return { color, badge, label };
}

export default function PublicScores() {
  const { user } = useAuth();
  const [scores,  setScores]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get('/stats')
      .then(res => { if (res.data.success) setScores(res.data.stats || []); })
      .catch(() => setError('Unable to load credibility scores. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...scores].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tracking-tight">
          Credibility Index
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-xl">
          Automated performance scores calculated from real resolution data.
          Updated continuously as reports are resolved.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

        {/* Left — Scoreboard */}
        <div className="space-y-5">

          {/* Explainer card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-start gap-4 shadow-soft">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0">
              <Award className="w-4.5 h-4.5 text-sky-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">
                Institutional Transparency Board
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                The 0–100 score reflects each category's resolution performance.
                Higher scores indicate faster closure timelines and higher resolution rates.
                Scores shown only when real data is available.
              </p>
            </div>
          </div>

          {/* Scores list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-soft">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Category Performance Standings
              </h3>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center gap-3">
                <Loader2 className="w-7 h-7 text-sky-500 animate-spin" />
                <p className="text-sm text-slate-400 font-medium">Loading credibility data...</p>
              </div>
            ) : error ? (
              <div className="py-16 text-center text-red-500 dark:text-red-400 text-sm px-6">{error}</div>
            ) : sorted.length === 0 ? (
              <div className="py-20 text-center px-6">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No resolution data available yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                  Scores will appear automatically as reports are resolved.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {sorted.map((item, idx) => {
                  const Icon = DEPT_ICONS[item.department] || FileCheck;
                  const { color, badge, label } = ScoreBar({ score: item.score });
                  return (
                    <div
                      key={item.department}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Rank + icon + name */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="w-7 h-7 rounded-md bg-slate-800 dark:bg-slate-700 text-slate-200 text-xs font-bold font-mono flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-500/10 flex items-center justify-center transition-colors flex-shrink-0">
                          <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-sky-500 transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.department}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium uppercase tracking-wider">Institutional Category</p>
                        </div>
                      </div>

                      {/* Score bar + badge */}
                      <div className="flex items-center gap-4 sm:w-[45%]">
                        <div className="flex-grow">
                          <div className="flex justify-between text-xs font-semibold mb-1.5">
                            <span className="text-slate-400">Credibility Rating</span>
                            <span className="text-slate-700 dark:text-slate-300">{item.score}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${color} rounded-full transition-all duration-700`}
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                        <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-md ${badge}`}>
                          {label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Aside */}
        <aside className="space-y-5">

          {/* Score formula */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-soft">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-4">
              <HelpCircle className="w-3.5 h-3.5" /> Score Calculation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
              Scores are computed automatically on the server from live database statistics:
            </p>
            <ul className="space-y-4 text-xs">
              <li className="flex items-start gap-2.5">
                <span className="w-9 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0">70%</span>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Resolution Rate</p>
                  <p className="text-slate-400 dark:text-slate-600 mt-0.5 leading-relaxed">Ratio of resolved reports to total filed complaints in the category.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-9 h-6 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0">30%</span>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Resolution Speed</p>
                  <p className="text-slate-400 dark:text-slate-600 mt-0.5 leading-relaxed">Average timeframe to close files compared to a 30-day performance baseline.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-soft space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">Action Center</h3>
            <Link
              to={user ? '/report' : '/login?redirect=/report'}
              className="w-full inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-sm"
            >
              Submit a Complaint <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/track"
              className="w-full inline-flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2.5 rounded-lg text-xs transition-colors"
            >
              Track a Report
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
