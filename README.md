# 🏛️ Jan Samadhan Portal

> **A Full-Stack Civic Accountability Platform — Built with the MERN Stack**
>
> *"Code is the easy part. Architecture is the hard part."*

---

## 📖 Table of Contents

1. [What is this project?](#-what-is-this-project)
2. [The Core Idea — The 'Aha!' Moment](#-the-core-idea--the-aha-moment)
3. [How the App Works — User Flows](#-how-the-app-works--user-flows)
4. [Project Architecture](#-project-architecture)
5. [Full Folder Structure](#-full-folder-structure)
6. [Tech Stack — Every Tool Explained](#-tech-stack--every-tool-explained)
7. [Learning Roadmap — Tools by Phase](#-learning-roadmap--tools-by-phase)
8. [Data Models — What Gets Stored](#-data-models--what-gets-stored)
9. [API Contract — How Frontend Talks to Backend](#-api-contract--how-frontend-talks-to-backend)
10. [Environment Variables](#-environment-variables)
11. [Step-by-Step Setup Guide](#-step-by-step-setup-guide-start-from-zero)
12. [Critical Architecture Decisions](#-critical-architecture-decisions)
13. [The Credibility Score Algorithm](#-the-credibility-score-algorithm)
14. [Feature Roadmap](#-feature-roadmap)

---

## 🤔 What is this project?

Jan Samadhan (meaning "People's Resolution") is a **civic grievance and accountability platform** for Indian citizens.

The problem it solves: If a drain is blocked, a road has a pothole, or a streetlight has been broken for months — right now, there is **nowhere to go**. Existing government portals accept complaints and then go silent. Citizens have no way to know if their complaint was seen, assigned, or simply ignored.

Jan Samadhan fixes this with **three things**:

1. **Report** — Citizens file issues with a photo, location, and description. They get a unique tracking token.
2. **Track** — Citizens use that token to follow their complaint through a live status timeline.
3. **Score** — Every resolution (or lack of one) updates a **public credibility score** for each government department. Slow departments get a low score. This score is visible to everyone.

---

## 💡 The Core Idea — The 'Aha!' Moment

The single most important and original feature of this project is the **Public Credibility Score**.

Most grievance portals just store complaints. We do something different: we **rank government departments** based on their real performance — how fast they resolve issues, what percentage they actually close. This score is displayed on a public dashboard anyone can visit without logging in.

This creates accountability through transparency. A department with a score of 34/100 visible to the public has a reason to improve that wasn't there before.

```
Score = (Resolution Rate × 70%) + (Speed Score × 30%)

Resolution Rate = Resolved Issues / Total Issues × 100
Speed Score     = max(0, 100 - (Average Days to Resolve × 5))
```

A department that resolves everything in 1 day gets close to 100. A department that resolves 50% of issues in 30 days gets around 20.

---

## 🔄 How the App Works — User Flows

There are three types of users in this system:

### Citizen (General Public)
```
Register with phone/email
        ↓
Login → get JWT token stored in browser
        ↓
Fill "Report Issue" form (description + photo + location + department)
        ↓
Backend saves issue to MongoDB, returns a unique token e.g. TOK882931
        ↓
Citizen visits "Track Status" page → enters token → sees live timeline
        ↓
Receives email notification whenever status changes
```

### Admin (Your Teammate — Plays Authority Role)
```
Login with admin credentials
        ↓
Sees all submitted issues in a protected dashboard
        ↓
Clicks an issue → updates status: Submitted → Assigned → In Progress → Resolved
        ↓
Adds officer notes (e.g. "Field team dispatched to MG Road")
        ↓
System automatically updates credibility score for that department
```

### Public Visitor (No Login Required)
```
Visits /dashboard
        ↓
Sees live department credibility scores and rankings
        ↓
Can see total issues filed, resolved, pending, and average resolution time
```

---

## 🏗️ Project Architecture

This is a **decoupled MERN application**. The frontend and backend are completely separate programs that communicate via a REST API. Think of them as two different employees:

- **The React Frontend** is the face of the office — it only handles what the user sees and interacts with. It never talks to the database directly.
- **The Express Backend** is the back office — it handles all logic, security, and database operations. It never renders HTML.
- **MongoDB Atlas** is the filing cabinet — it stores all the data as JSON-like documents.

```
[ User's Browser ]
       ↕  HTTP Requests (JSON)
[ React App — port 5173 ]
       ↕  Axios API calls (with JWT in header)
[ Express Server — port 5000 ]
       ↕  Mongoose queries
[ MongoDB Atlas — cloud database ]
       ↕  Cloudinary (for photos)
[ Cloudinary CDN ]
```

**Why separate?** Because this is how real production apps are built. Your React app can later become a mobile app, and the same backend API works without any changes.

---

## 📂 Full Folder Structure

```
jan-samadhan/
│
├── client/                          # React Application (Vite)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Axios instance with base URL + JWT header
│   │   ├── components/              # Reusable UI pieces
│   │   │   ├── Navbar.jsx
│   │   │   ├── IssueCard.jsx
│   │   │   ├── StatusTimeline.jsx
│   │   │   └── DeptScoreChart.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Stores login state across the whole app
│   │   ├── pages/                   # One file per route/page
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ReportIssue.jsx      # The complaint form
│   │   │   ├── TrackStatus.jsx      # Token lookup + timeline
│   │   │   ├── Dashboard.jsx        # Public credibility scores
│   │   │   ├── AdminPanel.jsx       # Protected — admin only
│   │   │   └── Financial.jsx        # Government fund notices
│   │   ├── App.jsx                  # Router setup
│   │   └── main.jsx                 # React entry point
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Node.js / Express API
│   ├── controllers/                 # Business logic (keeps routes clean)
│   │   ├── authController.js        # register, login
│   │   ├── issueController.js       # create, getByToken, updateStatus
│   │   └── statsController.js       # credibility score calculations
│   ├── middleware/
│   │   ├── verifyJWT.js             # Checks JWT on protected routes
│   │   └── isAdmin.js               # Checks user role === 'admin'
│   ├── models/
│   │   ├── User.js                  # Mongoose schema for citizens/admins
│   │   └── Issue.js                 # Mongoose schema for complaints
│   ├── routes/
│   │   ├── auth.js                  # POST /api/auth/register, /login
│   │   ├── issues.js                # POST/GET /api/issues
│   │   └── stats.js                 # GET /api/stats
│   ├── utils/
│   │   └── scoreCalculator.js       # The credibility score algorithm
│   └── app.js                       # Express entry point
│
├── .env                             # Secret keys — NEVER commit this to GitHub
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack — Every Tool Explained

Every tool has a reason. Nothing is added without purpose.

### Frontend

| Tool | What it does | Why we use it |
|------|-------------|---------------|
| **React.js (Vite)** | Builds the UI as reusable components | Industry standard. Vite makes it fast to start |
| **React Router DOM** | Handles page navigation (`/dashboard`, `/report`) | Without this, React has only one page |
| **Tailwind CSS** | Utility-first CSS classes for styling | Write styles directly in JSX, no separate CSS files |
| **Axios** | Makes HTTP requests from React to Express | Cleaner than `fetch`, easy to add JWT headers globally |
| **Context API** | Shares login state across all components | Avoids passing props through 10 components to get user info |
| **Chart.js** | Renders the department score charts | Simple, free, great-looking bar and doughnut charts |

### Backend

| Tool | What it does | Why we use it |
|------|-------------|---------------|
| **Node.js** | Runs JavaScript on the server | Same language as frontend — one language for everything |
| **Express.js** | Creates the API routes | The most popular Node.js framework |
| **Mongoose** | Defines schemas and talks to MongoDB | Makes MongoDB structured and predictable |
| **JSON Web Tokens (JWT)** | Secure authentication | Stateless — perfect for decoupled React + Express setup |
| **bcrypt** | Hashes passwords before storing | Never store plain text passwords |
| **CORS** | Allows React (port 5173) to call Express (port 5000) | Without this, the browser blocks all API calls |
| **dotenv** | Loads secret keys from `.env` file | Keeps API keys out of your code |
| **Morgan** | Logs every HTTP request in the terminal | Debugging — you can see every request hitting your server |
| **Helmet.js** | Sets security HTTP headers | Protects against common web vulnerabilities |
| **express-rate-limit** | Limits repeated requests | Prevents abuse of your API |
| **Multer** | Handles file uploads (photos) | Middleware that processes `multipart/form-data` |

### Services & Cloud

| Tool | What it does | Why we use it |
|------|-------------|---------------|
| **MongoDB Atlas** | Cloud-hosted NoSQL database | Free tier, no setup, works from anywhere |
| **Cloudinary** | Stores uploaded complaint photos | Free tier, returns a URL you save in MongoDB |
| **Nodemailer** | Sends emails (status change alerts) | Free, works with Gmail |
| **Twilio** | Sends SMS / OTP verification | Free tier for ~1000 SMS/month |

### Later Phases

| Tool | Phase | Purpose |
|------|-------|---------|
| **Socket.io** | Phase 3 | Real-time status updates without page refresh |
| **Claude API** | Phase 3 | Power the AI chatbot and auto-summarize financial notices |
| **MongoDB Atlas Search** | Phase 3 | Full-text search across complaints |
| **Jest** | Phase 4 | Automated testing for your API routes |
| **Railway / Render** | Phase 4 | Free deployment for the backend |
| **Vercel** | Phase 4 | Free deployment for the React frontend |

---

## 📈 Learning Roadmap — Tools by Phase

Build in this exact order. Each phase depends on the previous one.

```
PHASE 1 — Foundation (Make the app real)
─────────────────────────────────────────
Mongoose → express-session → bcrypt
"Without these three, nothing is saved and nobody is authenticated."

PHASE 2 — Communication (Connect to the world)
───────────────────────────────────────────────
Nodemailer → Twilio → Cloudinary + Multer → Google Maps API
"Status change emails. Phone OTP. Photo uploads. Location tagging."

PHASE 3 — Intelligence (Make it smart)
───────────────────────────────────────
Claude API → MongoDB Atlas Search → Chart.js → Socket.io
"AI chatbot. Keyword search. Live charts. Real-time updates."

PHASE 4 — Production (Ship it)
───────────────────────────────
dotenv → Helmet → express-rate-limit → Morgan → Jest → Railway/Vercel
"Security, logging, testing, and deployment."
```

---

## 🗃️ Data Models — What Gets Stored

### User Model (`server/models/User.js`)

```javascript
{
  fullName:      String,           // "Priya Sharma"
  phone:         String,           // "9876543210" — primary identity
  email:         String,
  aadhaarLast4:  String,           // Only last 4 digits. NEVER store full Aadhaar.
  passwordHash:  String,           // bcrypt hash — never plain text
  role:          "citizen" | "admin",
  createdAt:     Date
}
```

### Issue Model (`server/models/Issue.js`)

```javascript
{
  token:         String,           // "TOK882931" — unique, given to citizen
  citizenId:     ObjectId,         // Reference to User who filed it
  description:   String,           // "Large pothole on MG Road near bus stop"
  department:    String,           // "Roads" | "Water" | "Sanitation" | "Electricity" | "Health" | "Education"
  location:      String,           // "MG Road, near Central Bus Stand, Lucknow"
  photoUrl:      String,           // Cloudinary URL
  status:        String,           // "Submitted" | "Assigned" | "In Progress" | "Resolved"
  officerNotes:  String,           // Admin can add notes: "Field team dispatched"
  createdAt:     Date,
  resolvedAt:    Date              // Set when status → "Resolved", used for score calculation
}
```

---

## 📡 API Contract — How Frontend Talks to Backend

All routes are prefixed with `/api`. All request/response bodies are JSON.

### Auth Routes

| Method | Route | What it does | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/auth/register` | Create new citizen account | No |
| POST | `/api/auth/login` | Login, returns JWT token | No |

### Issue Routes

| Method | Route | What it does | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/issues` | File a new complaint | Yes (citizen) |
| GET | `/api/issues/:token` | Get issue by token | No |
| PATCH | `/api/issues/:id/status` | Update issue status | Yes (admin) |
| GET | `/api/issues` | Get all issues | Yes (admin) |

### Stats Routes

| Method | Route | What it does | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/stats` | Get all department credibility scores | No |

### Example: Filing an Issue

**Request** — `POST /api/issues`
```json
{
  "description": "Large pothole on MG Road near bus stop",
  "department": "Roads",
  "location": "MG Road, Central Bus Stand, Lucknow",
  "photoUrl": "https://res.cloudinary.com/your-cloud/image/upload/abc.jpg"
}
```
Header: `Authorization: Bearer <your_jwt_token>`

**Response** — `201 Created`
```json
{
  "success": true,
  "token": "TOK882931",
  "message": "Issue filed successfully. Use your token to track progress."
}
```

### Example: Credibility Score Response

**Request** — `GET /api/stats`

**Response** — `200 OK`
```json
{
  "departments": [
    {
      "name": "Roads",
      "totalIssues": 420,
      "resolved": 310,
      "avgResolutionDays": 4.2,
      "score": 72
    },
    {
      "name": "Water",
      "totalIssues": 180,
      "resolved": 165,
      "avgResolutionDays": 2.1,
      "score": 91
    }
  ]
}
```

---

## 🔐 Environment Variables

Create a `.env` file in the `server/` folder. **Never commit this file to GitHub** — add it to `.gitignore`.

```env
# Database
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.mongodb.net/jansamadhan

# Authentication
JWT_SECRET=pick_a_long_random_string_here_minimum_32_characters

# Cloudinary (photo storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer via Gmail)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password   # Use an App Password, not your real Gmail password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE=+1234567890

# Server
PORT=5000
CLIENT_URL=http://localhost:5173     # React app URL — needed for CORS
```

---

## 🚀 Step-by-Step Setup Guide (Start from Zero)

### Prerequisites — Install these first
- Node.js v18+ — [nodejs.org](https://nodejs.org)
- Git — [git-scm.com](https://git-scm.com)
- A MongoDB Atlas account — [mongodb.com/atlas](https://mongodb.com/atlas) (free)
- A code editor — VS Code recommended

---

### Phase 1: Backend Foundation

**Step 1 — Create the project folder**
```bash
mkdir jan-samadhan
cd jan-samadhan
mkdir server client
```

**Step 2 — Initialize the backend**
```bash
cd server
npm init -y
npm install express mongoose dotenv cors jsonwebtoken bcrypt morgan helmet express-rate-limit multer
```

**Step 3 — Create `server/app.js`**
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));                              // Logs every request in terminal
app.use(cors({ origin: process.env.CLIENT_URL })); // Only allow your React app
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB error:', err));

// Routes (add these as you build them)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/stats', require('./routes/stats'));

app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});
```

**Step 4 — Create your Mongoose models** (see Data Models section above)

**Step 5 — Build the first working route: `POST /api/issues`**

When this route saves a document to MongoDB and returns a token, your backend core is working.

---

### Phase 2: Frontend Foundation

**Step 1 — Initialize React with Vite**
```bash
cd ../client
npm create vite@latest . -- --template react
npm install
```

**Step 2 — Install dependencies**
```bash
npm install react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 3 — Configure Tailwind**

In `tailwind.config.js`:
```javascript
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
```

In `src/index.css`, replace everything with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 4 — Create your Axios instance (`src/api/axios.js`)**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

**Step 5 — Set up React Router in `src/App.jsx`**
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportIssue from './pages/ReportIssue';
import TrackStatus from './pages/TrackStatus';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/track" element={<TrackStatus />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

### Phase 3: Connect Them Together

The moment of truth — make React talk to Express.

**In `src/pages/ReportIssue.jsx`:**
```jsx
import api from '../api/axios';

const handleSubmit = async (formData) => {
  try {
    const response = await api.post('/issues', formData);
    setToken(response.data.token);   // Show the token to the citizen
  } catch (error) {
    console.error(error.response.data.message);
  }
};
```

When this works — a form submission creates a real document in MongoDB Atlas — your MERN stack is connected end to end.

---

## ⚙️ Critical Architecture Decisions

These decisions affect the whole project. Understand them before writing code.

### 1. JWT over Sessions
Since React and Express are separate apps (different ports), traditional cookie-based sessions don't work cleanly. Instead:
- On login, the server signs a JWT with `JWT_SECRET` and returns it
- React stores it in `localStorage`
- Every subsequent request attaches it in the `Authorization` header: `Bearer <token>`
- The server verifies it with `verifyJWT` middleware — no database lookup needed

### 2. CORS is Mandatory
```javascript
// server/app.js
app.use(cors({ origin: 'http://localhost:5173' }));
```
Without this one line, every Axios call from React will be blocked by the browser with a CORS error. In production, change this to your actual Vercel URL.

### 3. Never Store Sensitive Data in the Frontend
- JWT goes in `localStorage` — accessible to your JS code
- Never store full Aadhaar numbers, passwords, or private keys in React state or localStorage
- API keys and database URLs live only in the server's `.env` file

### 4. Always Handle Loading States in React
```jsx
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setIsLoading(true);
  try {
    const res = await api.get('/stats');
    setData(res.data);
  } catch (err) {
    setError('Failed to load data');
  } finally {
    setIsLoading(false);
  }
};
```
Every API call can fail or be slow. Always show a loading indicator and handle errors.

### 5. Stateless Backend
The Express server should never "remember" the user between requests. Every request must carry its JWT. This means the backend can be restarted anytime without losing session data.

---

## 🧮 The Credibility Score Algorithm

This is the heart of the project. Lives in `server/utils/scoreCalculator.js`.

```javascript
const Issue = require('../models/Issue');

async function getDepartmentScore(department) {
  const total    = await Issue.countDocuments({ department });
  const resolved = await Issue.countDocuments({ department, status: 'Resolved' });

  const avgResult = await Issue.aggregate([
    { $match: { department, status: 'Resolved', resolvedAt: { $exists: true } } },
    { $project: {
        days: { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 86400000] }
    }},
    { $group: { _id: null, avg: { $avg: '$days' } } }
  ]);

  if (total === 0) return 0;

  const resolutionRate = (resolved / total) * 100;
  const avgDays        = avgResult[0]?.avg ?? 30;
  const speedScore     = Math.max(0, 100 - (avgDays * 5));

  // 70% weight on resolution rate, 30% on speed
  return Math.round((resolutionRate * 0.7) + (speedScore * 0.3));
}
```

This function is called by `GET /api/stats` for each department. The result is what feeds the public dashboard chart.

---

## 🗺️ Feature Roadmap

### ✅ MVP (Build First)
- [ ] User registration and login with JWT
- [ ] File a complaint (text + photo via Cloudinary)
- [ ] Unique token generation per complaint
- [ ] Track status by token
- [ ] Admin panel to update issue status
- [ ] Public credibility score dashboard

### 🔜 Version 2
- [ ] Email notification on status change (Nodemailer)
- [ ] Phone OTP verification (Twilio)
- [ ] Google Maps integration for location tagging
- [ ] Search issues by keyword (Atlas Search)

### 🔮 Version 3
- [ ] Real-time status updates without page refresh (Socket.io)
- [ ] AI chatbot for citizen assistance (Claude API)
- [ ] AI-generated summaries of financial notices (Claude API)
- [ ] Mobile-responsive PWA

### 🚀 Production
- [ ] Deploy backend to Railway or Render
- [ ] Deploy frontend to Vercel
- [ ] Set up environment variables on hosting platform
- [ ] Add rate limiting and security headers (already in stack)
- [ ] Write API tests with Jest

---

## 👥 Team
@the_evil_lord - handling everything from nothing .
---

## 📄 License

This project is for educational and civic purposes.

---

*Built with the mission: A city where every complaint leads to action, where departments learn from data, and where citizens trust the system.*
