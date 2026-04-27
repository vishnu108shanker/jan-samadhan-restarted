# Jan Samadhan - Current Web App Structure & User Flow

This document outlines the current state of the Jan Samadhan web application, specifically detailing the application structure, the complete user journey, and proposed recommendations for the next phase of development.

---

## 1. Application Structure

The application follows a standard MERN (MongoDB, Express, React, Node.js) stack architecture with a clear separation of concerns.

### 🌐 Frontend (React + Vite + Tailwind CSS v4)
The frontend is built as a Single Page Application (SPA) utilizing `react-router-dom` for navigation. Global state is managed via React Context.

**Core Components:**
- **`App.jsx`**: The routing engine. It acts as the switchboard, utilizing `<ProtectedRoute>` and `<AdminRoute>` wrappers to enforce role-based access control. Unauthenticated users hitting the root `/` are redirected to `/login`, while authenticated users go to `/report` (citizens) or `/admin` (admins).
- **`AuthContext.jsx`**: The central nervous system for authentication. It holds the JWT token in `localStorage`, decodes the payload to extract the user's role and ID, and provides `login()` and `logout()` methods universally.
- **`axios.js` (API Interceptor)**: Automatically attaches the Bearer token to every outgoing request.

**Page Hierarchy:**
1. **`/login` & `/register`**: Public authentication pages.
2. **`/report`**: The primary citizen interface for submitting grievances (requires authentication).
3. **`/track`**: A public portal where anyone with a tracking token can view the live status of an issue.
4. **`/dashboard`**: A private citizen portal listing all grievances filed by the currently logged-in user.
5. **`/admin`**: A protected command center for administrators to view all platform issues, filter them, and update statuses/add notes.

### ⚙️ Backend (Node.js + Express + MongoDB Atlas)
The backend is a RESTful API designed to service the frontend securely.

**Core Architecture:**
- **`app.js`**: The entry point. Configures middleware (Helmet, Morgan, CORS, JSON body parser) and connects to MongoDB Atlas.
- **`middlewares/`**:
  - `verifyJWT.js`: Validates the token and attaches the user payload to `req.user`.
  - `isAdmin.js`: Ensures `req.user.role === 'admin'`.
- **`routes/` & `controllers/`**:
  - **Auth**: `/api/auth/register` (creates user, hashes password) & `/api/auth/login` (verifies password, signs JWT).
  - **Issues**:
    - `POST /create` (Citizen creates issue)
    - `GET /mine` (Citizen fetches their own issues)
    - `GET /:token` (Public tracking)
    - `GET /all` (Admin views all)
    - `PATCH /:id/status` (Admin updates issue)
- **`models/`**: Mongoose schemas for `User` and `Issue` (with robust enums for departments and statuses).

---

## 2. The User Flow (Current State)

The application caters to two distinct personas: **Citizens** and **Administrators**.

### 🧑‍🤝‍🧑 Citizen Flow

1. **Onboarding:**
   - A user visits the site and lands on `/login`.
   - If they don't have an account, they navigate to `/register`.
   - They provide their Full Name, Phone, Email, and a secure Password.
   - Upon clicking "Create Account", the system registers them, *automatically logs them in* behind the scenes, and redirects them to the grievance submission page.

2. **Filing a Grievance:**
   - On `/report`, the citizen fills out a streamlined form: Department (e.g., Water, Roads), Location, Description, and an optional Photo URL.
   - Upon submission, a large success screen appears displaying a **unique alphanumeric Tracking Token** (e.g., `JS-A1B2C3D4`).

3. **Tracking & Monitoring:**
   - **Direct Tracking:** The citizen can click "Track This Issue" from the success screen, taking them to `/track?token=...` where a visual progress stepper shows the issue is currently "Submitted".
   - **Dashboard View:** The citizen navigates to `/dashboard` ("My Issues"). Here, they see a statistical summary of their personal issues (e.g., 2 Submitted, 1 Resolved) and a list of all their historical complaints with direct tracking links.

### 👨‍💼 Administrator Flow

1. **Secure Access:**
   - The admin logs in at `/login` using designated admin credentials.
   - The system detects the `admin` role in the JWT payload and instantly redirects them to `/admin`.

2. **Triage & Management:**
   - The admin sees a comprehensive overview of the entire municipality's grievances. Top-level stat cards show total counts across the four statuses.
   - They can use dropdown filters to isolate issues (e.g., show only "Submitted" issues for the "Water" department).

3. **Taking Action:**
   - Each issue card has inline editing controls.
   - The admin changes the status from "Submitted" to "Assigned" or "In Progress".
   - They type a specific response in the "Officer Notes" field (e.g., "Field inspector dispatched to Ward 7").
   - Clicking "Save Changes" instantly updates the database.

4. **Closing the Loop:**
   - The citizen checking their `/track` page or `/dashboard` will immediately see the updated status and the official officer note.

---

## 3. Suggestions for Improvement & Next Steps

While the core functionality is robust and the Tailwind styling is modern, several key enhancements will elevate the platform from a functional MVP to a production-ready system.

### 🎨 User Experience (UX) Enhancements
- **Image Upload Integration:** Currently, users must provide a *URL* for photos. We need to integrate an AWS S3 bucket or Cloudinary so users can upload actual image files directly from their phone/computer.
- **Map Integration (Geolocation):** Instead of typing "Ward 7", integrate Google Maps or Mapbox API so citizens can drop a pin exactly where the pothole or leak is located.
- **Skeleton Loaders:** Replace the simple spinning SVG loaders with skeleton UI screens for a more polished perceived performance.

### 🔒 Security & Architecture
- **Refresh Tokens:** The current JWT expires in 1 hour. Implementing a refresh token mechanism will keep citizens logged in without compromising security.
- **Rate Limiting:** Protect the `/api/issues/create` and `/api/auth/login` routes with a rate limiter (e.g., `express-rate-limit`) to prevent spam submissions and brute-force attacks.
- **OAuth Integration:** Add "Login with Google" to lower the barrier to entry for citizens.

### 📊 Admin & Analytics
- **The Stats Route (`/api/stats`):** The backend has a `scoreCalculator.js` utility that is currently unused on the frontend. The next immediate step should be building an Analytics/Insights view in the Admin panel that ranks department performance based on resolution times.
- **Pagination & Infinite Scroll:** The `/admin` and `/dashboard` endpoints currently return *all* matching issues. This needs server-side pagination to ensure the app remains fast as the database grows to thousands of records.
- **Email/SMS Notifications:** Integrate Twilio or SendGrid. When an admin changes a status to "Resolved", the citizen should receive an automatic SMS or Email alert.

### 🧪 Developer Experience
- **Toast Notifications:** Replace native `alert()` calls or simple inline text errors with a robust toast notification library (like `react-toastify` or `sonner`) for slick success/error popups.
- **Form Validation:** While the server validates data, adding a library like `Zod` combined with `react-hook-form` on the frontend will provide instant, robust, as-you-type error checking.
