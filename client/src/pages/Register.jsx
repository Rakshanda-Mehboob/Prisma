import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import {
  ArrowRight, Eye, EyeOff, Mail, LockKeyhole, UserRound,
  GraduationCap, House, ShieldCheck, ClipboardCheck, BookOpen,
  ChartNoAxesCombined, UserPlus, CheckCircle2
} from 'lucide-react';
import PrismaLogo from '../components/PrismaLogo';
import './Register.css';

const DEPARTMENTS = [
  'Computer Science', 'Software Engineering', 'Information Technology',
  'Electrical Engineering', 'Business Administration', 'Psychology',
  'Education', 'Medical Sciences', 'Law', 'Other'
];
const LIVING_SITUATIONS = [
  'University Hostel / On-Campus', 'Home with Parents / Family',
  'Off-Campus Shared Accommodation', 'Independent / Solo Apartment', 'Other'
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', cms_number: '', password: '',
    department: '', living_situation: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    if (error) setError('');
  };

  const strength = useMemo(() => {
    const p = form.password;
    if (!p) return 0;
    return (p.length >= 6 ? 25 : 0) +
      (p.length >= 8 ? 25 : 0) +
      (/[A-Z]/.test(p) && /[a-z]/.test(p) ? 25 : 0) +
      (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p) ? 25 : 0);
  }, [form.password]);

  const strengthLabel = strength <= 25 ? 'Weak' :
    strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Strong';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    if (form.password.length < 6) {
      setError('Your password must have at least 6 characters.');
      return;
    }
    if (form.password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }
    setLoading(true);
    try {
      await authApi.register(form);
      navigate('/login', {
        replace: true,
        state: { message: 'Account created! Please sign in.' }
      });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string' ? detail :
        Array.isArray(detail) ? detail.map((x) => x.msg || 'Invalid input').join(', ') :
        !err.response ? 'Cannot connect to the server. Please check that the backend is running.' :
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pr-register-page">
      <div className="pr-register-card">
        <header className="pr-register-header">
          <Link to="/" className="pr-register-brand" aria-label="PRISMA home">
            <PrismaLogo size={48} />
            <span className="pr-register-wordmark">PRISM<span>A</span></span>
          </Link>
        </header>
        <section className="pr-register-story" aria-label="About creating a PRISMA account">

          <div className="pr-register-story-content">
            <span className="pr-register-kicker">GET STARTED WITH PRISMA</span>
            <h1>A safer online space starts with you.</h1>
            <p>Create your student account to understand online behavior and learn how to respond to cyberbullying.</p>

            <div className="pr-register-visual" aria-hidden="true">
              <div className="pr-register-glow" />
              <div className="pr-register-visual-card">
                <div className="pr-register-visual-top">
                  <span className="pr-register-mini-avatar"><UserRound size={23} /></span>
                  <span className="pr-register-mini-lines"><i /><i /></span>
                  <CheckCircle2 size={22} />
                </div>
                <div className="pr-register-visual-line" />
                <div className="pr-register-visual-line short" />
                <div className="pr-register-visual-button"><UserPlus size={16} /> Create account</div>
              </div>
              <span className="pr-register-float pr-register-float-one"><ShieldCheck size={27} /></span>
              <span className="pr-register-float pr-register-float-two"><GraduationCap size={25} /></span>
            </div>

            <div className="pr-register-steps">
              <div><ClipboardCheck size={19} /><span>Understand your online behavior</span></div>
              <div><BookOpen size={19} /><span>Learn with activities selected for you</span></div>
              <div><ChartNoAxesCombined size={19} /><span>See your progress over time</span></div>
            </div>
          </div>
          <div className="pr-register-story-note"><ShieldCheck size={15} /> Based on the Theory of Planned Behavior (TPB)</div>
        </section>

        <section className="pr-register-form-side">
          <div className="pr-register-form-content">
            <div className="pr-register-form-heading">
              <span className="pr-register-kicker">STUDENT REGISTRATION</span>
              <h2>Create your account</h2>
              <p>Enter your details to get started with PRISMA.</p>
            </div>

            {error && <div className="pr-register-error" role="alert">{error}</div>}

            <form onSubmit={handleSubmit} id="register-form">
              <div className="pr-register-row">
                <div className="pr-register-field">
                  <label htmlFor="full_name">Full name</label>
                  <div className="pr-register-input">
                    <UserRound size={17} />
                    <input id="full_name" name="full_name" type="text"
                      placeholder="Enter your full name" value={form.full_name}
                      onChange={change} autoComplete="name" required disabled={loading} />
                  </div>
                </div>
                <div className="pr-register-field">
                  <label htmlFor="cms_number">CMS / Student roll number</label>
                  <div className="pr-register-input">
                    <GraduationCap size={17} />
                    <input id="cms_number" name="cms_number" type="text"
                      placeholder="Enter your student ID" value={form.cms_number}
                      onChange={change} required disabled={loading} />
                  </div>
                </div>
              </div>

              <div className="pr-register-field">
                <label htmlFor="email">University email address</label>
                <div className="pr-register-input">
                  <Mail size={17} />
                  <input id="email" name="email" type="email"
                    placeholder="student@university.edu.pk" value={form.email}
                    onChange={change} autoComplete="email" required disabled={loading} />
                </div>
              </div>

              <div className="pr-register-row">
                <div className="pr-register-field">
                  <label htmlFor="department">Department <em>(optional)</em></label>
                  <div className="pr-register-input pr-register-select">
                    <GraduationCap size={17} />
                    <select id="department" name="department" value={form.department}
                      onChange={change} disabled={loading}>
                      <option value="">Select department</option>
                      {DEPARTMENTS.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                </div>
                <div className="pr-register-field">
                  <label htmlFor="living_situation">Living situation <em>(optional)</em></label>
                  <div className="pr-register-input pr-register-select">
                    <House size={17} />
                    <select id="living_situation" name="living_situation"
                      value={form.living_situation} onChange={change} disabled={loading}>
                      <option value="">Select situation</option>
                      {LIVING_SITUATIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <p className="pr-register-hint">Optional details help make your assessment scenarios more relevant. You can add them later.</p>

              <div className="pr-register-field">
                <label htmlFor="password">Create password</label>
                <div className="pr-register-input">
                  <LockKeyhole size={17} />
                  <input id="password" name="password" type={showPass ? 'text' : 'password'}
                    placeholder="At least 6 characters" value={form.password}
                    onChange={change} autoComplete="new-password" required
                    minLength={6} disabled={loading} />
                  <button type="button" className="pr-register-eye"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    aria-pressed={showPass} onClick={() => setShowPass((s) => !s)}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.password && (
                  <div className="pr-register-strength">
                    <div className="pr-register-strength-label">
                      <span>Password strength</span><strong>{strengthLabel}</strong>
                    </div>
                    <div className="pr-register-meter">
                      <span style={{ width: `${strength}%` }} data-strength={strengthLabel.toLowerCase()} />
                    </div>
                  </div>
                )}
              </div>

              <div className="pr-register-field">
                <label htmlFor="confirm_password">Confirm password</label>
                <div className="pr-register-input">
                  <LockKeyhole size={17} />
                  <input id="confirm_password" name="confirm_password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter your password" value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                    autoComplete="new-password" required disabled={loading} />
                  <button type="button" className="pr-register-eye"
                    aria-label={showConfirm ? 'Hide confirmed password' : 'Show confirmed password'}
                    onClick={() => setShowConfirm((s) => !s)}>
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && form.password !== confirmPassword && (
                  <p className="pr-register-password-mismatch">Passwords do not match.</p>
                )}
              </div>

              <button type="submit" id="register-submit"
                className="pr-register-submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="pr-register-signin">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </section>
        <nav className="pr-register-auth-footer" aria-label="Account information links">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/support">Support</Link>
        </nav>
      </div>
    </main>
  );
}
