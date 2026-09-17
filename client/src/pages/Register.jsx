import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import {
  UserPlus, Lock, CheckCircle2,
  Sparkles, Eye, EyeOff, AlertCircle, Building2, Home
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PrismaLogo from '../components/PrismaLogo';

const DEPARTMENTS = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Electrical Engineering',
  'Business Administration',
  'Psychology',
  'Education',
  'Medical Sciences',
  'Law',
  'Other',
];

const LIVING_SITUATIONS = [
  'University Hostel / On-Campus',
  'Home with Parents / Family',
  'Off-Campus Shared Accommodation',
  'Independent / Solo Apartment',
  'Other',
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    cms_number: '',
    password: '',
    department: '',
    living_situation: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score += 25;
    if (p.length >= 8) score += 25;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score += 25;
    if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) score += 25;
    return score;
  }, [form.password]);

  const strengthColor =
    passwordStrength <= 25 ? 'var(--color-danger)' :
      passwordStrength <= 50 ? 'var(--color-warning)' :
        passwordStrength <= 75 ? 'var(--color-accent)' : 'var(--color-success)';

  const strengthLabel =
    passwordStrength <= 25 ? 'Weak' :
      passwordStrength <= 50 ? 'Fair' :
        passwordStrength <= 75 ? 'Good' : 'Strong';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await authApi.register(form);
      navigate('/login', { state: { message: 'Account created! Please sign in.' } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Brand / Security Info Side */}
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
                ACADEMIC ENROLLMENT PORTAL
              </div>
            </div>
          </div>

          <Badge variant="primary" icon={<Sparkles size={12} />} style={{ marginBottom: '1.25rem' }}>
            Evidence-Based Peer Protection
          </Badge>

          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1.25rem' }}>
            Join the Anti-Cyberbullying Cohort.
          </h2>

          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '0.95rem', maxWidth: '440px' }}>
            Register your institutional profile to participate in diagnostic behavioral assessments, unlock tailored de-escalation modules, and track personal anti-bullying growth.
          </p>

          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              'Encrypted Student Records & Anonymized Analytics',
              'AI Scenario Personalization via Profile Context',
              'Completion Certification & Delta Reflection Report',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-light)', flexShrink: 0 }}>
                  <CheckCircle2 size={14} />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>
          <span>Riphah International University</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>FYP-COMPUTING-2026</span>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-form-side">
        <div className="auth-card-modern">
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>
              Create Account
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Enter your student information to generate your behavioral profile.
            </p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} id="register-form">
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="full_name">Full Legal Name</label>
              <input
                id="full_name"
                type="text"
                name="full_name"
                className="form-input"
                placeholder="e.g. Ayesha Khalil"
                value={form.full_name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">University Email Address</label>
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

            {/* CMS Number */}
            <div className="form-group">
              <label className="form-label" htmlFor="cms_number">CMS / Student Roll Number</label>
              <input
                id="cms_number"
                type="text"
                name="cms_number"
                className="form-input"
                placeholder="e.g. 2021-CS-042"
                value={form.cms_number}
                onChange={handleChange}
                required
              />
            </div>

            {/* Department & Living Situation — side by side on wider screens */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="department" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Building2 size={13} color="var(--color-primary-light)" />
                  Department <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400 }}>&nbsp;(optional)</span>
                </label>
                <select
                  id="department"
                  name="department"
                  className="form-input"
                  value={form.department}
                  onChange={handleChange}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Select…</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="living_situation" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Home size={13} color="var(--color-accent)" />
                  Living Situation <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400 }}>&nbsp;(optional)</span>
                </label>
                <select
                  id="living_situation"
                  name="living_situation"
                  className="form-input"
                  value={form.living_situation}
                  onChange={handleChange}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Select…</option>
                  {LIVING_SITUATIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Helper text for optional fields */}
            <p style={{ fontSize: '0.76rem', color: 'var(--color-text-subtle)', marginTop: '0.4rem', marginBottom: '0.85rem' }}>
              These fields help personalize your AI-generated assessment scenarios. You can also set them later in Profile settings.
            </p>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
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

              {/* Strength Meter */}
              {form.password && (
                <div style={{ marginTop: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--color-text-subtle)' }}>Security Strength:</span>
                    <span style={{ fontWeight: 700, color: strengthColor }}>{strengthLabel}</span>
                  </div>
                  <div className="progress-bar" style={{ height: 4 }}>
                    <div
                      style={{
                        width: `${passwordStrength}%`,
                        height: '100%',
                        background: strengthColor,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.3s ease, background 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              id="register-submit"
              variant="primary"
              size="lg"
              loading={loading}
              style={{ width: '100%', marginTop: '0.5rem' }}
              iconRight={<UserPlus size={16} />}
            >
              Enroll &amp; Create Account
            </Button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
