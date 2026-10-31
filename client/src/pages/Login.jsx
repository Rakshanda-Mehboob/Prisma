import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMessage] = useState(location.state?.message || '');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(form.email.trim(), form.password);
      // Redirect to onboarding if profile not yet completed
      if (!userData?.has_profile) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail
          .map((d) => d.msg || `${d.loc?.slice(-1)[0]}: invalid input`)
          .join(', ');
        setError(messages || 'Validation error. Please check your inputs.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else if (!err.response) {
        setError('Cannot connect to backend server. Please verify the backend is running on http://localhost:8000.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout activeTab="login">
      {/* Alert Banners */}
      {infoMessage && (
        <div className="auth-alert auth-alert-success" role="status">
          <CheckCircle2 size={16} className="auth-alert-icon" />
          <span>{infoMessage}</span>
        </div>
      )}

      {error && (
        <div className="auth-alert auth-alert-danger" role="alert">
          <AlertCircle size={16} className="auth-alert-icon" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} id="login-form" className="auth-form" noValidate>
        {/*
          TODO: Switch label to "Enter SAP ID", placeholder to "e.g. 1234567",
          and enable 7-digit counter (0/7) when backend supports SAP ID login.
        */}
        <div className="auth-form-group">
          <div className="auth-input-label-row">
            <label className="auth-input-label-left" htmlFor="email">
              <GraduationCap size={15} aria-hidden="true" />
              <span>University Email</span>
            </label>
            <span className="auth-input-counter" title="Email format">
              {form.email ? `${form.email.length} chars` : 'e.g. @riphah.edu.pk'}
            </span>
          </div>

          <div className="auth-input-wrapper">
            <input
              id="email"
              type="email"
              name="email"
              className="auth-text-input"
              placeholder="e.g. student@riphah.edu.pk"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              autoFocus
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="auth-form-group">
          <div className="auth-input-label-row">
            <label className="auth-input-label-left" htmlFor="password">
              <Lock size={15} aria-hidden="true" />
              <span>Password</span>
            </label>
          </div>

          <div className="auth-input-wrapper">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              name="password"
              className="auth-text-input auth-password-input"
              placeholder="••••••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPass(!showPass)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot password row */}
        <div className="auth-remember-row">
          <label className="auth-remember-label" htmlFor="remember-me">
            <input
              type="checkbox"
              id="remember-me"
              className="auth-checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me</span>
          </label>

          <Link to="/forgot-password" className="auth-forgot-link">
            Forgot password?
          </Link>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          id="login-submit"
          className="auth-primary-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="auth-btn-spinner" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <LogIn size={18} aria-hidden="true" />
              <span>Log In to Session</span>
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
