import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi } from '../api';
import {
  Mail, ArrowLeft, ArrowRight, ShieldCheck,
  CheckCircle2, Sparkles, AlertCircle, KeyRound, ExternalLink
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PrismaLogo from '../components/PrismaLogo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your university email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(cleanEmail);
      setSubmitted(true);
      if (res.data?.dev_reset_url) {
        setDevResetUrl(res.data.dev_reset_url);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (!err.response) {
        setError('Cannot connect to backend server. Please verify the backend is running.');
      } else {
        setError('Failed to process password recovery request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Brand Side */}
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
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>Prisma</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                COGNITIVE CYBER DEFENSE
              </div>
            </div>
          </div>

          <Badge variant="primary" icon={<KeyRound size={12} />} style={{ marginBottom: '1.25rem' }}>
            Account Recovery
          </Badge>

          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1.25rem', color: 'var(--color-text-primary)' }}>
            Reset your password securely.
          </h2>

          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '0.95rem', maxWidth: '440px' }}>
            Enter your registered university email to receive a secure, encrypted link to recover access to your Prisma assessment and learning modules.
          </p>

          {/* Key Security Features */}
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <ShieldCheck size={14} />
              </div>
              <span>Expiring 30-minute link prevents unauthorized tampering</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <CheckCircle2 size={14} />
              </div>
              <span>Single-use cryptographic tokens protect against replay</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <Sparkles size={14} />
              </div>
              <span>Seamlessly return to your learning pathway</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
          <span>Prisma Identity System</span>
          <span>Faculty of Computing</span>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-form-side">
        <div className="auth-card-modern">
          {!submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div style={{ marginBottom: '2rem' }}>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: '1rem',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                  className="auth-link"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                  Forgot Password?
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Enter the email associated with your account, and we'll send you instructions to reset your password.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} id="forgot-password-form">
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" htmlFor="forgot-email">
                    Registered Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="forgot-email"
                      type="email"
                      className="form-input"
                      placeholder="student@riphah.edu.pk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <Mail
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '0.9rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-subtle)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', marginTop: '0.35rem', display: 'block' }}>
                    Use the same email address you used when registering on Prisma.
                  </span>
                </div>

                <Button
                  type="submit"
                  id="forgot-password-submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  style={{ width: '100%' }}
                  iconRight={<ArrowRight size={16} />}
                >
                  Send Reset Link
                </Button>
              </form>

              <div className="auth-footer" style={{ marginTop: '2rem' }}>
                Remember your password?{' '}
                <Link to="/login" className="auth-link">
                  Sign in
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: 'center', padding: '1rem 0' }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(5, 150, 105, 0.1)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}
              >
                <Mail size={32} />
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
                Check Your Inbox
              </h2>

              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                If an account exists with <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>, a password reset link has been sent. Please check your inbox and click the link to create a new password.
              </p>

              <div
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.82rem',
                  color: 'var(--color-text-secondary)',
                  textAlign: 'left',
                  lineHeight: 1.6,
                  marginBottom: '1.75rem',
                }}
              >
                <strong>Important:</strong>
                <ul style={{ margin: '0.35rem 0 0 1.25rem', padding: 0 }}>
                  <li>The reset link is active for <strong>30 minutes</strong>.</li>
                  <li>Check your spam or junk folder if the email doesn't appear in a few minutes.</li>
                  <li>For security reasons, each reset link can only be used once.</li>
                </ul>
              </div>

              {/* Development Environment Fallback Helper */}
              {devResetUrl && (
                <div
                  style={{
                    background: 'rgba(79, 70, 229, 0.05)',
                    border: '1px dashed var(--color-primary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    textAlign: 'left',
                    marginBottom: '1.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <Sparkles size={14} />
                    <span>Development Environment Link</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>
                    SMTP email server is not configured in local environment. The link was logged to your backend console and is also provided directly below:
                  </p>
                  <Link
                    to={devResetUrl.replace('http://localhost:5173', '')}
                    style={{ textDecoration: 'none' }}
                  >
                    <Button variant="secondary" size="sm" iconRight={<ExternalLink size={14} />} style={{ width: '100%' }}>
                      Proceed to Reset Password
                    </Button>
                  </Link>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                    setDevResetUrl('');
                  }}
                >
                  Try Another Email
                </Button>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="md" style={{ width: '100%' }}>
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
