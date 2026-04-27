import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportIssue from './pages/ReportIssue';
import TrackStatus from './pages/TrackStatus';
import Dashboard from './pages/DashBoard';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/report"    element={<ReportIssue />} />
        <Route path="/track"     element={<TrackStatus />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin"     element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}



// // 1. BrowserRouter (The Engine)
// Think of BrowserRouter as the Environment or the Context that enables navigation. It uses the HTML5 History API to keep your UI in sync with the URL.

// What it does: It wraps your entire application. Without this, none of the other routing components will work.

// In your control flow: It listens to the browser's address bar. When the URL changes (e.g., from /login to /report), it tells the components inside it to re-render.

// 2. Routes (The Switchboard)
// Routes acts as the Logic Layer that looks at all possible destinations and picks the best match.

// What it does: It examines the current URL and searches through its "children" (the individual Route components) to find the one that matches.

// In your control flow: In older versions of React Router, the app would sometimes try to render multiple routes at once. Routes ensures that only the single best match is rendered. It’s like a switch statement in JavaScript.

// 3. Route (The Destination)
// Route is the Mapping between a specific path and a specific component.

// What it does: It defines two main things:

// path: The URL string (e.g., /track).

// element: The React component to show when that path is active (e.g., <TrackIssue />).

// In your control flow: It tells the app: "If the user is at /report, show them the ReportIssue component."