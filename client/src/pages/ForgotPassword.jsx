import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../api';
import {
  Mail, ArrowLeft, ArrowRight, ShieldCheck,
  CheckCircle2, AlertCircle, KeyRound, Lock, Eye, EyeOff,
  RefreshCw, Info, Check
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PrismaLogo from '../components/PrismaLogo';

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Multi-step flow: 1: Enter Email -> 2: Verify OTP -> 3: Create New Password
  const [step, setStep] = useState(1);

  // Form states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ──────────────────────────────────────────────────────────────────────────
  // Step 1: Request OTP for Registered Email
  // ──────────────────────────────────────────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your registered university email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(cleanEmail);
      if (res.data?.otp) {
        setGeneratedOtp(res.data.otp);
      }
      setStep(2);
      setSuccessMessage('A 6-digit verification OTP has been generated for your account.');
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;

      if (status === 404) {
        setError('No account found with this email address.');
      } else if (typeof detail === 'string') {
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

  // ──────────────────────────────────────────────────────────────────────────
  // Step 2: Verify Entered OTP
  // ──────────────────────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.verifyOTP(email.trim().toLowerCase(), cleanOtp);
      if (res.data?.reset_token) {
        setResetToken(res.data.reset_token);
      }
      setStep(3);
      setError('');
      setSuccessMessage('Verification successful. Please create your new password.');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Verification failed. Please check your OTP code and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Step 3: Set New Password
  // ──────────────────────────────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
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
        reset_token: resetToken,
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      // Redirect with success message to Login
      navigate('/login', {
        state: {
          message: 'Your password has been reset successfully. Please sign in with your new password.',
        },
      });
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Failed to update password. Please try the process again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick helper to re-generate OTP
  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim().toLowerCase());
      if (res.data?.otp) {
        setGeneratedOtp(res.data.otp);
      }
      setOtp('');
      setSuccessMessage('A new verification OTP has been generated.');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to generate new OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Password validation checks for Step 3
  const hasMinLength = newPassword.length >= 6;
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

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
            Follow our 3-step security verification to authenticate your student identity and restore access to your assessment and intervention progress.
          </p>

          {/* Stepper Progress Indicator */}
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: step > 1 ? 'var(--color-success)' : step === 1 ? 'var(--color-primary)' : 'var(--color-surface-3)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                }}
              >
                {step > 1 ? <Check size={16} /> : '1'}
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: step === 1 ? 700 : 500, color: step === 1 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                  Enter Email Address
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-subtle)' }}>
                  Verify registered student account
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: step > 2 ? 'var(--color-success)' : step === 2 ? 'var(--color-primary)' : 'var(--color-surface-3)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                }}
              >
                {step > 2 ? <Check size={16} /> : '2'}
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: step === 2 ? 700 : 500, color: step === 2 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                  Verify 6-Digit OTP
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-subtle)' }}>
                  Confirm security verification code
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: step === 3 ? 'var(--color-primary)' : 'var(--color-surface-3)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                }}
              >
                3
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: step === 3 ? 700 : 500, color: step === 3 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                  Create New Password
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-subtle)' }}>
                  Set your new secure password
                </div>
              </div>
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
          <AnimatePresence mode="wait">
            {/* ──────────────────────────────────────────────────────────── */}
            {/* STEP 1: Enter Registered Email Address                       */}
            {/* ──────────────────────────────────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
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
                    Enter your registered university email address to receive an in-app verification code.
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleRequestOtp} id="forgot-password-step1-form">
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
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError('');
                        }}
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
                      Must match the email address associated with your registered Prisma account.
                    </span>
                  </div>

                  <Button
                    type="submit"
                    id="forgot-password-step1-submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    style={{ width: '100%' }}
                    iconRight={<ArrowRight size={16} />}
                  >
                    Continue to Verification
                  </Button>
                </form>

                <div className="auth-footer" style={{ marginTop: '2rem' }}>
                  Remember your password?{' '}
                  <Link to="/login" className="auth-link">
                    Sign in
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ──────────────────────────────────────────────────────────── */}
            {/* STEP 2: Enter & Verify 6-Digit OTP                           */}
            {/* ──────────────────────────────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <div style={{ marginBottom: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.85rem',
                      color: 'var(--color-text-muted)',
                      marginBottom: '1rem',
                      fontWeight: 600,
                    }}
                    className="auth-link"
                  >
                    <ArrowLeft size={14} /> Change Email
                  </button>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                    Enter Verification Code
                  </h1>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    Enter the 6-digit verification OTP generated for <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>.
                  </p>
                </div>

                {/* Demonstration OTP Information Card */}
                {generatedOtp && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%)',
                      border: '1.5px solid rgba(79, 70, 229, 0.3)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                      marginBottom: '1.5rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      <Info size={14} />
                      <span>Demonstration Verification Code</span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                      Your verification OTP:
                    </div>

                    <div
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '2rem',
                        fontWeight: 800,
                        letterSpacing: '0.25em',
                        color: 'var(--color-primary)',
                        padding: '0.5rem 1rem',
                        background: '#ffffff',
                        border: '1px solid rgba(79, 70, 229, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        display: 'inline-block',
                        margin: '0 auto 0.75rem auto',
                        boxShadow: '0 2px 8px rgba(79, 70, 229, 0.08)',
                      }}
                    >
                      {generatedOtp}
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                      "This OTP is displayed for demonstration purposes and would normally be sent via email in a production system."
                    </p>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} id="forgot-password-step2-form">
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" htmlFor="otp-input">
                      6-Digit Security OTP
                    </label>
                    <input
                      id="otp-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      className="form-input"
                      placeholder="e.g. 482913"
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(val);
                        if (error) setError('');
                      }}
                      required
                      autoComplete="one-time-code"
                      style={{
                        textAlign: 'center',
                        fontSize: '1.3rem',
                        letterSpacing: '0.35em',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    />
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', marginTop: '0.35rem', display: 'block', textAlign: 'center' }}>
                      Code expires in 10 minutes. Single-use only.
                    </span>
                  </div>

                  <Button
                    type="submit"
                    id="forgot-password-step2-submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    style={{ width: '100%', marginBottom: '1rem' }}
                    iconRight={<ArrowRight size={16} />}
                  >
                    Verify Code
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={handleResendOtp}
                    disabled={loading}
                    style={{ width: '100%' }}
                    iconLeft={<RefreshCw size={14} />}
                  >
                    Generate New OTP
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ──────────────────────────────────────────────────────────── */}
            {/* STEP 3: Create New Password                                  */}
            {/* ──────────────────────────────────────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-success)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <CheckCircle2 size={15} />
                    <span>Identity Verified</span>
                  </div>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                    Create New Password
                  </h1>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    Setting new password for <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleResetPassword} id="forgot-password-step3-form">
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
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (error) setError('');
                        }}
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
                        placeholder="Re-enter your new password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError('');
                        }}
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

                  {/* Password requirements visual check */}
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
                    id="forgot-password-step3-submit"
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
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
