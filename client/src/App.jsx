import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login       from './pages/Login';
import Register    from './pages/Register';
import ReportIssue from './pages/ReportIssue';
import TrackStatus from './pages/TrackStatus';
import Dashboard   from './pages/DashBoard';
import AdminPanel  from './pages/AdminPanel';
import PublicScores from './pages/PublicScores';

// ─── Guards ──────────────────────────────────────────────────────────────────

/** Redirect to /login if not authenticated */
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/** Redirect to /report if authenticated but not admin */
function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/report" replace />;
  return children;
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Root → redirect based on auth state */}
        <Route
          path="/"
          element={
            user
              ? <Navigate to={user.role === 'admin' ? '/admin' : '/report'} replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* Public auth pages */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public tracker — no auth needed */}
        <Route path="/track" element={<TrackStatus />} />
        <Route path="/scores" element={<PublicScores />} />

        {/* Citizen-protected pages */}
        <Route
          path="/report"
          element={<ProtectedRoute><ReportIssue /></ProtectedRoute>}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />

        {/* Admin-only page */}
        <Route
          path="/admin"
          element={<AdminRoute><AdminPanel /></AdminRoute>}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}