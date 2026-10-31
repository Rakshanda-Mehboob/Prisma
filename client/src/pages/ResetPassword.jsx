import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi } from '../api';
import {
  Lock, Eye, EyeOff, ShieldCheck, CheckCircle2,
  AlertCircle, ArrowRight, ArrowLeft, RefreshCw, KeyRound
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PrismaLogo from '../components/PrismaLogo';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [accountEmail, setAccountEmail] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Verify the token validity on page mount
  useEffect(() => {
    let isMounted = true;

    async function checkToken() {
      if (!token) {
        if (isMounted) {
          setTokenError('No password reset token was found in the link. Please request a new password reset.');
          setVerifying(false);
        }
        return;
      }

      try {
        const res = await authApi.verifyResetToken(token);
        if (isMounted) {
          setTokenValid(true);
          if (res.data?.email) {
            setAccountEmail(res.data.email);
          }
        }
      } catch (err) {
        if (isMounted) {
          const detail = err.response?.data?.detail;
          setTokenError(
            typeof detail === 'string'
              ? detail
              : 'This password reset link is invalid or has expired. Please request a new one.'
          );
          setTokenValid(false);
        }
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    }

    checkToken();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Real-time password requirement metrics
  const hasMinLength = newPassword.length >= 6;
  const hasMixedChars = /[A-Za-z]/.test(newPassword) && /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!hasMinLength) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (!err.response) {
        setError('Cannot reach server. Please ensure the backend is running.');
      } else {
        setError('Failed to reset password. The link may have expired.');
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
            Security & Access
          </Badge>

          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1.25rem', color: 'var(--color-text-primary)' }}>
            Choose a strong, memorable password.
          </h2>

          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '0.95rem', maxWidth: '440px' }}>
            Updating your password restores your access while safeguarding your personal cyberbullying assessment insights and intervention milestones.
          </p>

          {/* Highlights */}
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <ShieldCheck size={14} />
              </div>
              <span>Secured with industry-standard bcrypt encryption</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <CheckCircle2 size={14} />
              </div>
              <span>Instant sync across all your session devices</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
          <span>Prisma Security Suite</span>
          <span>Riphah International University</span>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-form-side">
        <div className="auth-card-modern">
          {verifying ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'rgba(79, 70, 229, 0.08)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  animation: 'spin 1.5s linear infinite',
                }}
              >
                <RefreshCw size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                Verifying Security Link...
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                Please wait a moment while we validate your token.
              </p>
            </div>
          ) : !tokenValid ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '1rem 0' }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--color-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}
              >
                <AlertCircle size={32} />
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
                Link Invalid or Expired
              </h2>

              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                {tokenError || 'This password reset link is invalid or has already expired. Password reset links are time-limited for your security.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="lg" style={{ width: '100%' }} iconRight={<ArrowRight size={16} />}>
                    Request a New Reset Link
                  </Button>
                </Link>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="md" style={{ width: '100%' }}>
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: 'center', padding: '1.5rem 0' }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background: 'rgba(5, 150, 105, 0.1)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
                Password Updated!
              </h2>

              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Your account password has been successfully reset. You can now use your new password to sign into Prisma.
              </p>

              <Button
                variant="primary"
                size="lg"
                style={{ width: '100%' }}
                iconRight={<ArrowRight size={16} />}
                onClick={() => navigate('/login', { state: { message: 'Password reset successfully! Please sign in with your new password.' } })}
              >
                Sign In Now
              </Button>
            </motion.div>
          ) : (
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
                  Set New Password
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  {accountEmail ? (
                    <>Resetting password for <strong style={{ color: 'var(--color-text-primary)' }}>{accountEmail}</strong></>
                  ) : (
                    'Enter and confirm your new password below.'
                  )}
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} id="reset-password-form">
                {/* New Password */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" htmlFor="new-password">
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="new-password"
                      type={showPass ? 'text' : 'password'}
                      className="form-input"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      style={{ paddingRight: '2.75rem', paddingLeft: '2.5rem' }}
                    />
                    <Lock
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

                {/* Confirm Password */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" htmlFor="confirm-password">
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirm-password"
                      type={showConfirmPass ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      style={{ paddingRight: '2.75rem', paddingLeft: '2.5rem' }}
                    />
                    <Lock
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
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
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
                      aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Requirements feedback */}
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.5rem',
                    fontSize: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: hasMinLength ? 'var(--color-success)' : 'var(--color-text-subtle)' }}>
                    <CheckCircle2 size={13} />
                    <span>Minimum 6 characters long</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: passwordsMatch ? 'var(--color-success)' : 'var(--color-text-subtle)' }}>
                    <CheckCircle2 size={13} />
                    <span>Passwords match</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  id="reset-password-submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  style={{ width: '100%' }}
                  iconRight={<ArrowRight size={16} />}
                >
                  Save New Password
                </Button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
