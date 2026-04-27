import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', form);
       // Fix made to make it more robust - if token is missing or login fails, it will throw an error and show the error message instead of navigating to the report page without a token which would cause issues in subsequent API calls that require authentication
      // login(response.data.token); // stores token + decodes user into context

      const { token } = response.data;
      if (!token) throw new Error("Token missing");
      // login(token);

      // Optional upgrade (not required, but sharp)
      // Persist login:

// yaad kar ye login fuxn saala useAuth() se import hua hai , iska code udhar hai 
      login(token);
      localStorage.setItem("token", token);
      // And restore on app load.
       
      navigate('/report');
    } catch (err) {
      // setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      // Fix made to provide more specific error messages based on the type of error (network, server, validation, etc.) instead of a generic message for all errors. This will help users understand what went wrong and how to fix it (e.g., check credentials vs. try again later).
      if (err.response) {
        // Server responded with a status code (4xx, 5xx)
        const status = err.response.status;

        if (status === 400) {
          setError("Invalid input. Please check email and password format.");
        } else if (status === 401) {
          setError("Incorrect email or password.");
        } else if (status === 403) {
          setError("Access denied. You are not authorized.");
        } else if (status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(err.response.data?.error || "Unexpected server response.");
        }

      } else if (err.request) {
        // Request made but no response (network issue)
        setError("No response from server. Check your internet connection.");
      } else {
        // Something else happened
        setError("Something went wrong. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl shadow-lg mb-4">
            <span className="text-white text-2xl font-bold">J</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Jan Samadhan</h1>
          <p className="text-gray-500 mt-1">Sign in to your citizen account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Login</h2>

          {/* Error banner */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="ramesh@email.com"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-orange-500 font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Govt. of India · Jan Samadhan Grievance Portal
        </p>
      </div>
    </div>
  );
}
