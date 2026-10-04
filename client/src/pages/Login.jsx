import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogIn, Eye, EyeOff,
  Sparkles, CheckCircle2
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

  return (
    <div className="auth-split-layout">
      {/* Left Brand / Cyber Education Hero Side */}
      <div className="auth-brand-side">
        {/* Ambient decorative glow orbs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(45, 212, 191, 0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '380px', height: '380px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Logo & Platform Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2.5rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              }}
            >
              <PrismaLogo size={36} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#ffffff', letterSpacing: '-0.02em' }}>Prisma</div>
              <div style={{ fontSize: '0.72rem', color: '#2dd4bf', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em' }}>
                AI CYBER INTERVENTION PLATFORM
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              background: 'rgba(45, 212, 191, 0.15)',
              border: '1px solid rgba(45, 212, 191, 0.35)',
              color: '#a7f3d0',
              fontSize: '0.78rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              letterSpacing: '0.02em',
            }}
          >
            <Sparkles size={13} color="#34d399" /> Free & Private for University Students
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
              fontWeight: 800,
              lineHeight: 1.18,
              marginBottom: '1.25rem',
              color: '#ffffff',
              letterSpacing: '-0.03em',
            }}
          >
            Stand strong against online harassment.
          </h2>

          <p
            style={{
              color: '#e2e8f0',
              lineHeight: 1.75,
              fontSize: '1.02rem',
              maxWidth: '480px',
              marginBottom: '2.5rem',
              fontWeight: 400,
            }}
          >
            Prisma equips university students with behavioral strategies, empowering scenarios, and personalized AI-guided modules to foster safe digital spaces.
          </p>

          {/* Modern Glass Feature Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '480px' }}>
            <div className="auth-feature-pill">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'rgba(45, 212, 191, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2dd4bf',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>Diagnostic Pre-Assessment</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: 2 }}>Maps your baseline attitude, peer norms & intervention confidence</div>
              </div>
            </div>

            <div className="auth-feature-pill">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>Personalized Interactive Lessons</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: 2 }}>Scenario simulations, de-escalation drills & bite-sized guides</div>
              </div>
            </div>

            <div className="auth-feature-pill">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'rgba(167, 139, 250, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c4b5fd',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>Measurable Skill Growth</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: 2 }}>Compare your growth with verified post-intervention analytics</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            paddingTop: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem',
            color: '#94a3b8',
          }}
        >
          <span>Theory of Planned Behavior (TPB)</span>
          <span>End-to-End Encrypted</span>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-form-side">
        <div className="auth-card-modern">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Sign in to continue your learning journey.
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
              Sign In
            </Button>
          </form>

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
