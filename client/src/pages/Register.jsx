import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Hash, Lock, Eye, EyeOff,
  GraduationCap, Home, Smartphone, Users,
  CheckCircle2, ChevronRight, ChevronLeft,
  Sparkles, ShieldCheck, ArrowRight, BookOpen,
  Building2, School, Radio, Info
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PrismaLogo from '../components/PrismaLogo';

// ── Step Definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 'basic', title: 'Account', icon: User, desc: 'Login details' },
  { id: 'academic', title: 'Academic', icon: GraduationCap, desc: 'Field & level' },
  { id: 'living', title: 'Living', icon: Home, desc: 'Residence setting' },
  { id: 'digital', title: 'Digital Life', icon: Smartphone, desc: 'Apps & activity' },
  { id: 'social', title: 'Community', icon: Users, desc: 'Peer interaction' },
];

// ── Department & Academic Options ─────────────────────────────────────────────
const DEPARTMENTS = [
  { id: 'Computer Science', label: 'Computer Science', icon: '💻' },
  { id: 'Software Engineering', label: 'Software Engineering', icon: '⚙️' },
  { id: 'Information Technology', label: 'Information Technology', icon: '🌐' },
  { id: 'Engineering', label: 'Engineering', icon: '🔧' },
  { id: 'Psychology', label: 'Psychology', icon: '🧠' },
  { id: 'Medical / Health Sciences', label: 'Medical / Health Sciences', icon: '🏥' },
  { id: 'Business', label: 'Business', icon: '📊' },
  { id: 'Education', label: 'Education', icon: '📚' },
  { id: 'Social Sciences', label: 'Social Sciences', icon: '🏛️' },
  { id: 'Law', label: 'Law', icon: '⚖️' },
  { id: 'Other', label: 'Other', icon: '✏️' },
];

const ACADEMIC_LEVELS = [
  { id: 'Undergraduate', label: 'Undergraduate', sub: "Bachelor's / BS / MBBS / LLB", icon: '🎓' },
  { id: 'Graduate', label: 'Graduate', sub: "Master's / MS / MPhil", icon: '📘' },
  { id: 'Postgraduate', label: 'Postgraduate', sub: 'PhD / Doctoral Research', icon: '🔬' },
];

const STUDY_YEARS = [
  { id: '1st Year', label: '1st Year' },
  { id: '2nd Year', label: '2nd Year' },
  { id: '3rd Year', label: '3rd Year' },
  { id: '4th Year', label: '4th Year' },
  { id: 'Other', label: 'Other' },
];

// ── Living Situation Options ──────────────────────────────────────────────────
const LIVING_SITUATIONS = [
  {
    id: 'University hostel',
    title: 'University hostel',
    sub: 'On-campus dormitories or university student halls',
    icon: '🏢',
  },
  {
    id: 'Home with family',
    title: 'Home with family',
    sub: 'Living at home with family and commuting to campus',
    icon: '🏡',
  },
  {
    id: 'Private accommodation',
    title: 'Private accommodation',
    sub: 'Private rental, hostel, or independent student housing',
    icon: '🛋️',
  },
  {
    id: 'Shared apartment',
    title: 'Shared apartment',
    sub: 'Off-campus rented flat or apartment with peers',
    icon: '🏘️',
  },
  {
    id: 'Other',
    title: 'Other',
    sub: 'Other living arrangement during academic studies',
    icon: '📍',
  },
];

// ── Digital Environment Options ───────────────────────────────────────────────
const PLATFORMS = [
  { id: 'WhatsApp', label: 'WhatsApp', icon: '💬' },
  { id: 'Instagram', label: 'Instagram', icon: '📸' },
  { id: 'Facebook', label: 'Facebook', icon: '👤' },
  { id: 'TikTok', label: 'TikTok', icon: '🎵' },
  { id: 'Discord', label: 'Discord', icon: '🎮' },
  { id: 'LinkedIn', label: 'LinkedIn', icon: '💼' },
  { id: 'Gaming communities', label: 'Gaming communities', icon: '🕹️' },
  { id: 'University portals', label: 'University portals', icon: '🎓' },
  { id: 'Other', label: 'Other', icon: '🌐' },
];

const INTERACTION_FREQUENCIES = [
  { id: 'Rarely', label: 'Rarely', desc: 'Essential academic updates only', icon: '🍃' },
  { id: 'Sometimes', label: 'Sometimes', desc: 'A few hours daily for study & friends', icon: '🌤️' },
  { id: 'Frequently', label: 'Frequently', desc: 'Active throughout the day across apps', icon: '⚡' },
  { id: 'Almost daily', label: 'Almost daily', desc: 'Constantly connected to study groups & chats', icon: '🔥' },
];

// ── Social Context Options ────────────────────────────────────────────────────
const INTERACTION_PARTNERS = [
  { id: 'Classmates', label: 'Classmates', sub: 'Academic peers, batch groups & project partners', icon: '👥' },
  { id: 'Friends', label: 'Friends', sub: 'Close personal social circles', icon: '🤝' },
  { id: 'Teachers', label: 'Teachers', sub: 'Academic instructors & research advisors', icon: '👨‍🏫' },
  { id: 'Professional groups', label: 'Professional groups', sub: 'Career networks & internship colleagues', icon: '💼' },
  { id: 'Online communities', label: 'Online communities', sub: 'Special-interest forums & discussion groups', icon: '🌍' },
  { id: 'Gaming communities', label: 'Gaming communities', sub: 'Multiplayer teams & gaming channels', icon: '🎮' },
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Unified Form State
  const [form, setForm] = useState({
    // Step 1: Basic
    full_name: '',
    email: '',
    cms_number: '',
    password: '',

    // Step 2: Academic
    university: 'Riphah International University',
    department: 'Computer Science',
    custom_department: '',
    academic_level: 'Undergraduate',
    academic_year: '1st Year',

    // Step 3: Living
    living_situation: 'University hostel',

    // Step 4: Digital
    platforms_used: ['WhatsApp', 'Instagram', 'Discord'],
    online_activity_level: 'Frequently',

    // Step 5: Social
    main_interaction_with: 'Classmates',
    university_groups_participation: 'Yes',
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const togglePlatform = (platformId) => {
    setForm((prev) => {
      const exists = prev.platforms_used.includes(platformId);
      const updated = exists
        ? prev.platforms_used.filter((p) => p !== platformId)
        : [...prev.platforms_used, platformId];
      return { ...prev, platforms_used: updated };
    });
  };

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

  // Step Validation
  const validateStep = (stepIdx) => {
    setError('');
    if (stepIdx === 0) {
      if (!form.full_name.trim()) {
        setError('Please enter your full name.');
        return false;
      }
      if (!form.email.trim() || !form.email.includes('@')) {
        setError('Please enter a valid university email address.');
        return false;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return false;
      }
      return true;
    }

    if (stepIdx === 1) {
      if (!form.university.trim()) {
        setError('Please specify your university or institution.');
        return false;
      }
      if (!form.department) {
        setError('Please select your department / field of study.');
        return false;
      }
      if (form.department === 'Other' && !form.custom_department.trim()) {
        setError('Please specify your field of study in the text input.');
        return false;
      }
      if (!form.academic_level) {
        setError('Please select your academic level.');
        return false;
      }
      if (!form.academic_year) {
        setError('Please select your year of study.');
        return false;
      }
      return true;
    }

    if (stepIdx === 2) {
      if (!form.living_situation) {
        setError('Please select where you live during your studies.');
        return false;
      }
      return true;
    }

    if (stepIdx === 3) {
      if (form.platforms_used.length === 0) {
        setError('Please select at least one online platform you frequently use.');
        return false;
      }
      if (!form.online_activity_level) {
        setError('Please indicate how often you interact online.');
        return false;
      }
      return true;
    }

    if (stepIdx === 4) {
      if (!form.main_interaction_with) {
        setError('Please select who you mainly interact with online.');
        return false;
      }
      if (!form.university_groups_participation) {
        setError('Please indicate whether you participate in online university groups.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1));
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  // Submit Final Registration & Profile Setup
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateStep(currentStep)) return;

    const finalDepartment = form.department === 'Other' && form.custom_department.trim()
      ? form.custom_department.trim()
      : form.department;

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      cms_number: form.cms_number.trim() || undefined,
      password: form.password,
      university: form.university.trim() || 'Riphah International University',
      department: finalDepartment,
      academic_level: form.academic_level,
      academic_year: form.academic_year,
      living_situation: form.living_situation,
      platforms_used: form.platforms_used.length > 0 ? form.platforms_used : ['WhatsApp'],
      online_activity_level: form.online_activity_level,
      main_interaction_with: form.main_interaction_with,
      university_groups_participation: form.university_groups_participation,
    };

    setLoading(true);
    try {
      await authApi.register(payload);
      // Automatically authenticate and show clean completion screen
      try {
        await login(payload.email, payload.password);
      } catch (_) {
        // Auto-login fallback
      }
      setIsCompleted(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your inputs and try again.');
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
                STUDENT WELL-BEING PORTAL
              </div>
            </div>
          </div>

          <Badge variant="primary" icon={<ShieldCheck size={12} />} style={{ marginBottom: '1.25rem' }}>
            Student Onboarding
          </Badge>

          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1.25rem', color: 'var(--color-text-primary)' }}>
            Empowering safer digital campus communities.
          </h2>

          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '0.92rem', maxWidth: '440px' }}>
            Prisma provides research-grounded tools and interactive reflections to foster empathy, respect, and positive digital habits across higher education.
          </p>

          <div style={{ marginTop: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                title: 'Safe & Confidential',
                desc: 'Your profile details and responses are completely private and secure.',
              },
              {
                title: 'Evidence-Based Framework',
                desc: 'Designed around behavioral science principles to support healthy online communities.',
              },
              {
                title: 'Self-Paced Experience',
                desc: 'Engage with interactive exercises, gain self-awareness, and track your progress.',
              },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.88rem' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }}>
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.title}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step List on Left */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', marginTop: '2rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '0.85rem' }}>
            {isCompleted ? 'Account Ready' : 'Onboarding Steps'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {STEPS.map((s, idx) => {
              const isPast = isCompleted || idx < currentStep;
              const isCurr = !isCompleted && idx === currentStep;
              return (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.84rem',
                    color: isPast ? 'var(--color-success)' : isCurr ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    fontWeight: isCurr ? 700 : 500,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: isPast ? 'var(--color-success)' : isCurr ? 'var(--color-primary)' : 'var(--color-surface-2)',
                      color: isPast || isCurr ? '#fff' : 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  >
                    {isPast ? <CheckCircle2 size={12} /> : idx + 1}
                  </div>
                  <span>{s.title}</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--color-text-subtle)' }}>({s.desc})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-form-side">
        <div className="auth-card-modern auth-card-wide">
          {isCompleted ? (
            /* ── STEP 6: Simple & Professional Completion Screen ── */
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background: 'rgba(5, 150, 105, 0.12)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669',
                  marginBottom: '1.25rem',
                }}
              >
                <CheckCircle2 size={38} />
              </div>

              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                Profile Setup Complete
              </h2>

              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.98rem', maxWidth: '420px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                Your account is ready. Let's get started.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '340px', margin: '0 auto' }}>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => navigate('/assessment?stage=pre')}
                  icon={<ArrowRight size={16} />}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1.5rem',
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  }}
                >
                  Start Assessment
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    justifyContent: 'center',
                  }}
                >
                  Continue to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Header */}
              <div className="onb-progress-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {Math.round(((currentStep + 1) / STEPS.length) * 100)}% Complete
                  </span>
                </div>

                <div className="onb-progress-track">
                  <div
                    className="onb-progress-bar"
                    style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="onb-privacy-notice">
                <ShieldCheck size={18} />
                <div>
                  <strong>Confidential & Secure:</strong> Your personal profile and responses are kept strictly confidential and will never be shared with peers or instructors.
                </div>
              </div>

              {error && <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>{error}</div>}

              {/* Dynamic Step Content with Transitions */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.22 }}
                >
                  {/* ── STEP 1: Basic Information ──────────────────────────── */}
                  {currentStep === 0 && (
                    <div>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--color-text-primary)' }}>
                          Create Your Student Account
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                          Enter your basic information to get started with Prisma.
                        </p>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="full_name">
                          Full Legal Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            id="full_name"
                            type="text"
                            name="full_name"
                            className="form-input"
                            placeholder="e.g. Rakshanda Mehboob"
                            value={form.full_name}
                            onChange={handleChange}
                            required
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="email">
                          University Email Address <span style={{ color: 'var(--color-danger)' }}>*</span>
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
                        <label className="form-label" htmlFor="cms_number" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>CMS / Student Roll Number</span>
                          <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400 }}>Optional</span>
                        </label>
                        <input
                          id="cms_number"
                          type="text"
                          name="cms_number"
                          className="form-input"
                          placeholder="e.g. 2021-CS-042 (auto-assigned if blank)"
                          value={form.cms_number}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="password">
                          Account Password <span style={{ color: 'var(--color-danger)' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            id="password"
                            type={showPass ? 'text' : 'password'}
                            name="password"
                            className="form-input"
                            placeholder="At least 6 characters"
                            value={form.password}
                            onChange={handleChange}
                            required
                            style={{ paddingRight: '2.75rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            style={{
                              position: 'absolute',
                              right: '0.75rem',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>

                        {form.password && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                              <span style={{ color: 'var(--color-text-muted)' }}>Strength</span>
                              <span style={{ color: strengthColor, fontWeight: 700 }}>{strengthLabel}</span>
                            </div>
                            <div style={{ height: 4, background: 'var(--color-surface-2)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ width: `${passwordStrength}%`, height: '100%', background: strengthColor, transition: 'all 0.3s ease' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── STEP 2: Academic Information ───────────────────────── */}
                  {currentStep === 1 && (
                    <div>
                      <div style={{ marginBottom: '1.35rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>
                          Academic Information
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                          Tell us about your university, department, and academic level.
                        </p>
                      </div>

                      {/* University */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="university">University / Institution</label>
                        <input
                          id="university"
                          type="text"
                          name="university"
                          className="form-input"
                          placeholder="e.g. Riphah International University"
                          value={form.university}
                          onChange={handleChange}
                          required
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.45rem' }}>
                          {['Riphah International University', 'NUST', 'FAST-NUCES', 'COMSATS', 'Quaid-i-Azam University'].map((uni) => (
                            <button
                              key={uni}
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, university: uni }))}
                              className={`onb-pill-btn ${form.university === uni ? 'active' : ''}`}
                              style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem' }}
                            >
                              {uni}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Department / Field of Study */}
                      <div className="form-group">
                        <label className="form-label">
                          Department / Field of Study <span style={{ color: 'var(--color-danger)' }}>*</span>
                        </label>
                        <div className="onb-options-grid">
                          {DEPARTMENTS.map((d) => {
                            const selected = form.department === d.id;
                            return (
                              <button
                                key={d.id}
                                type="button"
                                className={`onb-card-option ${selected ? 'active' : ''}`}
                                onClick={() => setForm((f) => ({ ...f, department: d.id }))}
                                style={{ padding: '0.65rem 0.8rem' }}
                              >
                                <span style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{d.icon}</span>
                                <span style={{ fontSize: '0.84rem', fontWeight: selected ? 700 : 500, color: 'var(--color-text-primary)' }}>
                                  {d.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {form.department === 'Other' && (
                          <div style={{ marginTop: '0.65rem' }}>
                            <input
                              type="text"
                              name="custom_department"
                              className="form-input"
                              placeholder="Type your department or degree program name…"
                              value={form.custom_department}
                              onChange={handleChange}
                              autoFocus
                              required
                            />
                          </div>
                        )}
                      </div>

                      {/* Academic Level & Year */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Academic Level</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                            {ACADEMIC_LEVELS.map((lvl) => {
                              const selected = form.academic_level === lvl.id;
                              return (
                                <button
                                  key={lvl.id}
                                  type="button"
                                  className={`onb-card-option ${selected ? 'active' : ''}`}
                                  onClick={() => setForm((f) => ({ ...f, academic_level: lvl.id }))}
                                  style={{ padding: '0.65rem 0.75rem' }}
                                >
                                  <span style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{lvl.icon}</span>
                                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{lvl.label}</span>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{lvl.sub}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Year of Study</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                            {STUDY_YEARS.map((yr) => {
                              const selected = form.academic_year === yr.id;
                              return (
                                <button
                                  key={yr.id}
                                  type="button"
                                  className={`onb-pill-btn ${selected ? 'active' : ''}`}
                                  onClick={() => setForm((f) => ({ ...f, academic_year: yr.id }))}
                                >
                                  {selected && <CheckCircle2 size={13} />}
                                  <span>{yr.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 3: Living Situation ───────────────────────────── */}
                  {currentStep === 2 && (
                    <div>
                      <div style={{ marginBottom: '1.35rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>
                          Living Situation
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                          Where do you currently live during your studies?
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {LIVING_SITUATIONS.map((sit) => {
                          const selected = form.living_situation === sit.id;
                          return (
                            <button
                              key={sit.id}
                              type="button"
                              className={`onb-card-option ${selected ? 'active' : ''}`}
                              onClick={() => setForm((f) => ({ ...f, living_situation: sit.id }))}
                              style={{ padding: '1rem 1.15rem' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '0.35rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                  <span style={{ fontSize: '1.4rem' }}>{sit.icon}</span>
                                  <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                    {sit.title}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '50%',
                                    border: selected ? '5px solid var(--color-primary)' : '2px solid var(--color-border)',
                                    background: 'var(--color-surface)',
                                    transition: 'all 0.15s ease',
                                  }}
                                />
                              </div>

                              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.45, paddingLeft: '2.05rem' }}>
                                {sit.sub}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── STEP 4: Digital Environment ────────────────────────── */}
                  {currentStep === 3 && (
                    <div>
                      <div style={{ marginBottom: '1.35rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>
                          Digital Environment
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                          Select the platforms and digital services you use regularly.
                        </p>
                      </div>

                      {/* Platforms (Multi-select) */}
                      <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Frequently Used Platforms</span>
                          <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400 }}>Select all that apply</span>
                        </label>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                          {PLATFORMS.map((p) => {
                            const selected = form.platforms_used.includes(p.id);
                            return (
                              <button
                                key={p.id}
                                type="button"
                                className={`onb-pill-btn ${selected ? 'active' : ''}`}
                                onClick={() => togglePlatform(p.id)}
                                style={{ padding: '0.55rem 0.95rem' }}
                              >
                                <span style={{ fontSize: '1rem' }}>{p.icon}</span>
                                <span>{p.label}</span>
                                {selected && <CheckCircle2 size={13} style={{ marginLeft: 2 }} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Online Interaction Frequency */}
                      <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label className="form-label">
                          How often do you interact online? <span style={{ color: 'var(--color-danger)' }}>*</span>
                        </label>

                        <div className="onb-options-grid-2col">
                          {INTERACTION_FREQUENCIES.map((freq) => {
                            const selected = form.online_activity_level === freq.id;
                            return (
                              <button
                                key={freq.id}
                                type="button"
                                className={`onb-card-option ${selected ? 'active' : ''}`}
                                onClick={() => setForm((f) => ({ ...f, online_activity_level: freq.id }))}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                  <span>{freq.icon}</span>
                                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{freq.label}</span>
                                </div>
                                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                                  {freq.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 5: Social & Community Context ─────────────────── */}
                  {currentStep === 4 && (
                    <div>
                      <div style={{ marginBottom: '1.35rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>
                          Student Community
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                          Tell us about your typical online interactions and student group participation.
                        </p>
                      </div>

                      {/* Main Interaction Partners */}
                      <div className="form-group">
                        <label className="form-label">
                          Who do you mainly interact with online? <span style={{ color: 'var(--color-danger)' }}>*</span>
                        </label>

                        <div className="onb-options-grid-2col">
                          {INTERACTION_PARTNERS.map((partner) => {
                            const selected = form.main_interaction_with === partner.id;
                            return (
                              <button
                                key={partner.id}
                                type="button"
                                className={`onb-card-option ${selected ? 'active' : ''}`}
                                onClick={() => setForm((f) => ({ ...f, main_interaction_with: partner.id }))}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                  <span style={{ fontSize: '1.15rem' }}>{partner.icon}</span>
                                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{partner.label}</span>
                                </div>
                                <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', lineHeight: 1.35 }}>
                                  {partner.sub}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Online University Group Participation */}
                      <div className="form-group" style={{ marginTop: '1.25rem' }}>
                        <label className="form-label">
                          Do you participate in online university groups? <span style={{ color: 'var(--color-danger)' }}>*</span>
                        </label>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          {[
                            {
                              val: 'Yes',
                              label: 'Yes, I participate',
                              desc: 'Batch WhatsApp chats, LMS forums, Discord study servers, or student societies',
                              icon: '✅',
                            },
                            {
                              val: 'No',
                              label: 'No, rarely or never',
                              desc: 'Prefer direct 1-on-1 messages or independent study without large groups',
                              icon: '❌',
                            },
                          ].map((item) => {
                            const selected = form.university_groups_participation === item.val;
                            return (
                              <button
                                key={item.val}
                                type="button"
                                className={`onb-card-option ${selected ? 'active' : ''}`}
                                onClick={() => setForm((f) => ({ ...f, university_groups_participation: item.val }))}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                  <span>{item.icon}</span>
                                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.label}</span>
                                </div>
                                <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', lineHeight: 1.35 }}>
                                  {item.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="onb-nav-bar">
                {currentStep > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={loading}
                    icon={<ChevronLeft size={16} />}
                  >
                    Back
                  </Button>
                ) : (
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    Already registered? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign In</Link>
                  </div>
                )}

                {currentStep < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNext}
                    icon={<ChevronRight size={16} />}
                    style={{ padding: '0.65rem 1.4rem' }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSubmit}
                    loading={loading}
                    icon={<ArrowRight size={16} />}
                    style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                  >
                    {loading ? 'Setting up your account…' : 'Complete Registration'}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
