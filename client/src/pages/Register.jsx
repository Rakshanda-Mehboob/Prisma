/**
 * pages/Register.jsx — Student registration page.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', cms_number: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedForm = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      cms_number: form.cms_number.trim(),
      password: form.password,
    };

    if (trimmedForm.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await authApi.register(trimmedForm);
      navigate('/login', { state: { message: 'Account created! Please sign in with your credentials.' } });
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        // Pydantic 422 validation errors are arrays of error objects
        const messages = detail.map((d) => d.msg || `${d.loc?.slice(-1)[0]}: invalid input`).join(', ');
        setError(messages || 'Validation failed. Please check your inputs.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else if (!err.response) {
        setError('Cannot connect to backend server. Please verify the backend is running on http://localhost:8000.');
      } else {
        setError('Registration failed. Please check your inputs and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🧠</div>
        </div>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the cyberbullying awareness program</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="full_name">Full Name</label>
            <input
              id="full_name" type="text" name="full_name"
              className="form-input" placeholder="e.g. Ayesha Khalil"
              value={form.full_name} onChange={handleChange} required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">University Email</label>
            <input
              id="reg-email" type="email" name="email"
              className="form-input" placeholder="you@riphah.edu.pk"
              value={form.email} onChange={handleChange} required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cms_number">CMS Number</label>
            <input
              id="cms_number" type="text" name="cms_number"
              className="form-input" placeholder="e.g. 2021-CS-001"
              value={form.cms_number} onChange={handleChange} required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password" type="password" name="password"
              className="form-input" placeholder="Min 6 characters"
              value={form.password} onChange={handleChange} required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit" id="register-submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...</>
            ) : (
              <><UserPlus size={16} /> Create Account</>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
