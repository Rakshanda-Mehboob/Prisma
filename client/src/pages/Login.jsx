import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Eye, EyeOff, Mail, LockKeyhole, UserRound, BookOpen, ShieldCheck, Check, Sparkles } from 'lucide-react';
import PrismaLogo from '../components/PrismaLogo';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const infoMessage = location.state?.message || '';

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((item) => item.msg || 'Invalid input').join(', ') || 'Please check your details.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else if (!err.response) {
        setError('Cannot connect to the server. Please check that the backend is running.');
      } else {
        setError('Sign in failed. Please check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="prisma-signin">
      <div className="ps-layout">
        <header className="ps-topbar">
          <Link to="/" className="ps-header-brand" aria-label="PRISMA home">
            <PrismaLogo size={46} />
            <span className="ps-wordmark">PRISM<span>A</span></span>
          </Link>
        </header>

        <section className="ps-story" aria-label="About signing in to PRISMA">
          <div className="ps-story-inner">
            <div className="ps-story-body">
              <h1>Your safer online space.</h1>
              <p className="ps-lead">Sign in to learn about online behavior and help make your campus kinder.</p>
              <div className="ps-story-grid">
                <div className="ps-benefits">
                  <div className="ps-benefit"><span className="ps-benefit-icon"><UserRound size={23} /></span><div><strong>Access your account</strong><small>Continue where you left off.</small></div></div>
                  <div className="ps-benefit"><span className="ps-benefit-icon"><BookOpen size={23} /></span><div><strong>Learn and grow</strong><small>Explore activities made for you.</small></div></div>
                  <div className="ps-benefit"><span className="ps-benefit-icon"><ShieldCheck size={23} /></span><div><strong>Keep your data safe</strong><small>Sign in to your private account.</small></div></div>
                </div>
                <div className="ps-art" aria-hidden="true">
                  <span className="ps-art-halo ps-halo-one" />
                  <span className="ps-art-halo ps-halo-two" />
                  <span className="ps-art-spark ps-spark-one" />
                  <span className="ps-art-spark ps-spark-two" />
                  <div className="ps-art-platform" />
                  <div className="ps-laptop">
                    <div className="ps-laptop-screen">
                      <div className="ps-screen-bar"><i /><i /><i /></div>
                      <div className="ps-screen-card">
                        <div className="ps-avatar"><UserRound size={34} strokeWidth={2.5} /></div>
                        <div className="ps-art-field"><Mail size={14} /><span /></div>
                        <div className="ps-art-field"><LockKeyhole size={14} /><b>••••••</b></div>
                        <div className="ps-art-button">Sign In <ArrowRight size={12} /></div>
                      </div>
                    </div>
                    <div className="ps-laptop-base" />
                  </div>
                  <div className="ps-floating-shield"><ShieldCheck size={64} strokeWidth={1.6} /></div>
                  <div className="ps-floating-check"><Check size={20} strokeWidth={3} /></div>
                </div>
              </div>
            </div>
            <div className="ps-story-footer"><Sparkles size={15} /> Your space. Your voice. A safer campus.</div>
          </div>
        </section>

        <section className="ps-form-side">
          <div className="ps-form-container">
            <div className="ps-mobile-brand"><PrismaLogo size={50} /><span className="ps-wordmark">PRISM<span>A</span></span></div>
            <div className="ps-form-heading"><div className="ps-eyebrow">WELCOME BACK</div><h2>Sign in to PRISMA</h2><p>Enter your account details to continue.</p></div>
            {infoMessage && <div className="ps-message ps-success" role="status">{infoMessage}</div>}
            {error && <div className="ps-message ps-error" role="alert">{error}</div>}
            <form onSubmit={handleSubmit} id="login-form">
              <div className="ps-field"><label htmlFor="email">Email address</label><div className="ps-input-wrap"><Mail size={19} /><input id="email" name="email" type="email" autoComplete="email" placeholder="Enter your university email" value={form.email} onChange={handleChange} required disabled={loading} /></div></div>
              <div className="ps-field"><div className="ps-label-row"><label htmlFor="password">Password</label><Link className="ps-forgot" to="/support" state={{ topic: "password-reset" }}>Forgot Password?</Link></div><div className="ps-input-wrap"><LockKeyhole size={19} /><input id="password" name="password" type={showPass ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={handleChange} required disabled={loading} /><button className="ps-eye" type="button" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? 'Hide password' : 'Show password'}>{showPass ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></div>
              <button className="ps-submit" id="login-submit" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'} {!loading && <ArrowRight size={19} />}</button>
            </form>
            <div className="ps-register">Don't have an account? <Link to="/register">Create an account</Link></div>
            <div className="ps-security"><ShieldCheck size={17} /> Your account is protected by secure sign-in.</div>
          </div>
        </section>
        <nav className="ps-auth-footer" aria-label="Account information links">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/support">Support</Link>
        </nav>
      </div>
    </main>
  );
}
