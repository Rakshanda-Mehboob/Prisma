import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogIn, Eye, EyeOff, Lock, AlertCircle,
  Sparkles, CheckCircle2, ArrowRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PrismaLogo from '../components/PrismaLogo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
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
      await login(form.email.trim(), form.password);
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail.map((d) => d.msg || `${d.loc?.slice(-1)[0]}: invalid input`).join(', ');
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

  const fillDemo = () => {
    setForm({
      email: 'demo@riphah.edu.pk',
      password: 'Password123!',
    });
  };

  return (
    <div className="auth-split-layout">
      {/* Left Brand / Cyber Illustration Side */}
      <div className="auth-brand-side">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'drop-shadow(0 0 16px var(--color-primary-glow))',
              }}
            >
              <PrismaLogo size={42} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>Prisma</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
                COGNITIVE CYBER DEFENSE
              </div>
            </div>
          </div>

          <Badge variant="cyan" icon={<Sparkles size={12} />} style={{ marginBottom: '1.25rem' }}>
            Zero-Trust Behavioral Audit
          </Badge>

          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1.25rem' }}>
            Intelligent Intervention Against Online Hostility.
          </h2>

          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '0.95rem', maxWidth: '440px' }}>
            Empowering university students and academic administrators to identify psychological vulnerability points and strengthen digital peer norms.
          </p>

          {/* Feature highlights */}
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success-light)' }}>
                <CheckCircle2 size={14} />
              </div>
              <span>Empirical Theory of Planned Behavior (TPB) Assessment</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success-light)' }}>
                <CheckCircle2 size={14} />
              </div>
              <span>AI-Personalized Micro-Intervention Learning Modules</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success-light)' }}>
                <CheckCircle2 size={14} />
              </div>
              <span>Pre vs. Post Quantifiable Behavioral Trajectory Tracking</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>
          <span>Faculty of Computing • Riphah</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>SEC_PROTO: TLS 1.3</span>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-form-side">
        <div className="auth-card-modern">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Sign in with your university credentials to continue your intervention track.
            </p>
          </div>

          {infoMessage && <div className="alert alert-success">{infoMessage}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} id="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                University Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="student@riphah.edu.pk"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>
                  Password
                </label>
                <span
                  onClick={() => alert('Please contact the campus system administrator or supervisor to reset your account password.')}
                  style={{ fontSize: '0.78rem', color: 'var(--color-accent)', cursor: 'pointer' }}
                >
                  Forgot password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-subtle)',
                    padding: 0,
                  }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              id="login-submit"
              variant="primary"
              size="lg"
              loading={loading}
              style={{ width: '100%', marginTop: '0.75rem' }}
              iconRight={<LogIn size={16} />}
            >
              Authenticate & Enter
            </Button>
          </form>

          {/* Quick 1-Click Demo Fill */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)' }}>
                Demo Student Account
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                demo@riphah.edu.pk / Demo1234!
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={fillDemo}>
              1-Click Fill
            </Button>
          </div>

          <div className="auth-footer">
            Don't have an enrolled account?{' '}
            <Link to="/register" className="auth-link">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
