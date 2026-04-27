import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// AuthContext (global storage)
//    ↓
// AuthProvider (wraps whole app)
//    ↓
// Any component → useAuth() → gets user, login, logout

// “I am creating a global box where auth data will live”
const AuthContext = createContext(null);

// Helper: safely decode token from localStorage 
const getUserFromStorage = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = jwtDecode(token);

    // checks if token expired
    if (decoded.exp * 1000 < Date.now()) {
      // If expired → force logout
      localStorage.removeItem('token');
      return null;
    }

    return decoded; // { id, role, name, email, iat, exp }
  } catch {
    localStorage.removeItem('token');
    return null;
  }
};

// ─── Provider ──────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUserFromStorage);
  const login = (token) => {
    localStorage.setItem('token', token);
    setUser(jwtDecode(token));
  };

  // logout function   Clears everything → user becomes logged out
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}




export const useAuth = () => useContext(AuthContext);
