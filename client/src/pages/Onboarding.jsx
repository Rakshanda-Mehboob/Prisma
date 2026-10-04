/**
 * pages/Onboarding.jsx — Multi-step Student Behavioral Profile Collection
 *
 * Collects rich student context to enable AI-powered personalized scenario generation.
 * Designed to feel like a modern onboarding experience, NOT a form or survey.
 *
 * Steps:
 *   1. Welcome (introduction)
 *   2. Academic Profile
 *   3. Digital Life
 *   4. Social Life
 *   5. Online Experience (sensitive, fully optional)
 *   6. Complete → redirect to Assessment
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import PrismaLogo from '../components/PrismaLogo';
import {
  GraduationCap, Smartphone, Users, Shield,
  ChevronRight, ChevronLeft, CheckCircle2,
  Sparkles, BookOpen, Wifi, Heart, ArrowRight,
  Star
} from 'lucide-react';

// ── Step Configuration ────────────────────────────────────────────────────────

const STEPS = [
  { id: 'welcome', label: 'Welcome', icon: Sparkles },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'digital', label: 'Digital Life', icon: Smartphone },
  { id: 'social', label: 'Social Life', icon: Users },
  { id: 'experience', label: 'Experience', icon: Shield },
  { id: 'complete', label: 'Complete', icon: CheckCircle2 },
];

// ── Option Data ───────────────────────────────────────────────────────────────

const DEGREE_PROGRAMS = [
  { value: 'Computer Science', emoji: '💻', label: 'Computer Science' },
  { value: 'Software Engineering', emoji: '⚙️', label: 'Software Engineering' },
  { value: 'Information Technology', emoji: '🌐', label: 'Information Technology' },
  { value: 'Medical Sciences', emoji: '🏥', label: 'Medical Sciences' },
  { value: 'Engineering', emoji: '🔧', label: 'Engineering' },
  { value: 'Business', emoji: '📊', label: 'Business' },
  { value: 'Social Sciences', emoji: '🧠', label: 'Social Sciences' },
  { value: 'Other', emoji: '📚', label: 'Other' },
];

const ACADEMIC_YEARS = [
  { value: 'First Year', label: '1st Year', sub: 'Just getting started' },
  { value: 'Second Year', label: '2nd Year', sub: 'Finding your footing' },
  { value: 'Third Year', label: '3rd Year', sub: 'Deep in the curriculum' },
  { value: 'Fourth Year', label: '4th Year', sub: 'Almost there!' },
  { value: 'Graduate Student', label: 'Graduate', sub: 'Advanced studies' },
];

const LEARNING_ENVS = [
  { value: 'Mostly Online', emoji: '🖥️', desc: 'Lectures, classes, and discussions are primarily digital' },
  { value: 'Hybrid', emoji: '🔀', desc: 'Mix of in-person and online activities' },
  { value: 'Mostly Physical', emoji: '🏫', desc: 'Mostly on-campus with occasional online sessions' },
];

const CLASS_SIZES = [
  { value: 'Small', label: 'Small', sub: 'Under 30 students', emoji: '👥' },
  { value: 'Medium', label: 'Medium', sub: '30–80 students', emoji: '👨‍👩‍👧‍👦' },
  { value: 'Large', label: 'Large', sub: '80+ students', emoji: '🏟️' },
];

const PLATFORMS = [
  { value: 'WhatsApp', emoji: '💬', label: 'WhatsApp' },
  { value: 'Instagram', emoji: '📸', label: 'Instagram' },
  { value: 'Facebook', emoji: '👤', label: 'Facebook' },
  { value: 'TikTok', emoji: '🎵', label: 'TikTok' },
  { value: 'Discord', emoji: '🎮', label: 'Discord' },
  { value: 'University LMS', emoji: '🎓', label: 'University LMS' },
  { value: 'Twitter/X', emoji: '𝕏', label: 'Twitter / X' },
  { value: 'YouTube', emoji: '▶️', label: 'YouTube' },
  { value: 'LinkedIn', emoji: '💼', label: 'LinkedIn' },
];

const ACTIVITY_LEVELS = [
  { value: 'Low', label: 'Low', desc: 'I rarely go online beyond essentials', color: '#059669' },
  { value: 'Moderate', label: 'Moderate', desc: 'A few hours each day', color: '#0891b2' },
  { value: 'High', label: 'High', desc: 'Several hours daily online', color: '#7c3aed' },
  { value: 'Very High', label: 'Very High', desc: "I'm almost always connected", color: '#4f46e5' },
];

const ONLINE_ACTIVITIES = [
  { value: 'Academic discussions', emoji: '📖', label: 'Academic discussions' },
  { value: 'Entertainment', emoji: '🎭', label: 'Entertainment' },
  { value: 'Gaming communities', emoji: '🕹️', label: 'Gaming communities' },
  { value: 'Social networking', emoji: '🤝', label: 'Social networking' },
  { value: 'Student groups', emoji: '👨‍🏫', label: 'Student groups' },
  { value: 'Content sharing', emoji: '📤', label: 'Content sharing' },
];

const SOCIAL_ROLES = [
  { value: 'Usually leads discussions', emoji: '🎤', desc: 'I often initiate and guide group conversations' },
  { value: 'Usually participates', emoji: '🙋', desc: 'I actively join in when discussions happen' },
  { value: 'Usually observes', emoji: '👀', desc: 'I tend to watch and absorb rather than speak up' },
  { value: 'Usually avoids conflicts', emoji: '🕊️', desc: 'I prefer to stay out of difficult social situations' },
];

const PARTICIPATION_TYPES = [
  { value: 'Student societies', emoji: '🏛️', label: 'Student Societies' },
  { value: 'Sports clubs', emoji: '⚽', label: 'Sports Clubs' },
  { value: 'Academic groups', emoji: '🔬', label: 'Academic Groups' },
  { value: 'Volunteer activities', emoji: '❤️', label: 'Volunteer Activities' },
  { value: 'Online communities', emoji: '🌍', label: 'Online Communities' },
];

const ENCOUNTER_FREQS = [
  { value: 'Never', label: 'Never', desc: "I haven't encountered this", color: '#059669' },
  { value: 'Rarely', label: 'Rarely', desc: 'Maybe once or twice', color: '#0891b2' },
  { value: 'Sometimes', label: 'Sometimes', desc: 'A few times over time', color: '#d97706' },
  { value: 'Frequently', label: 'Frequently', desc: 'It happens regularly', color: '#dc2626' },
];

const EXPERIENCE_TYPES = [
  { value: 'Insults or mocking', emoji: '😔', label: 'Insults or mocking' },
  { value: 'Rumors', emoji: '💬', label: 'Rumors or gossip' },
  { value: 'Social exclusion', emoji: '🚫', label: 'Social exclusion' },
  { value: 'Sharing private information', emoji: '🔐', label: 'Sharing private info' },
  { value: 'Humiliating content', emoji: '😣', label: 'Humiliating content' },
  { value: 'Threats', emoji: '⚠️', label: 'Threats' },
];

const EXPERIENCE_ROLES = [
  { value: 'Observer', emoji: '👁️', label: 'Observer', desc: 'I witnessed it happening to others' },
  { value: 'Person affected', emoji: '💙', label: 'Affected', desc: 'I was personally impacted' },
  { value: 'Supporter', emoji: '🤗', label: 'Supporter', desc: 'I helped someone who was affected' },
  { value: 'Participant', emoji: '⚡', label: 'Participant', desc: 'I was involved in some way' },
  { value: 'Prefer not to answer', emoji: '🔒', label: 'Prefer not to say', desc: '' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function OptionCard({ selected, onClick, children, style = {} }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`onb-option-card ${selected ? 'selected' : ''}`}
      style={style}
    >
      {children}
    </button>
  );
}

function MultiChip({ label, emoji, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`onb-chip ${selected ? 'selected' : ''}`}
    >
      {emoji && <span>{emoji}</span>}
      <span>{label}</span>
      {selected && <CheckCircle2 size={13} style={{ marginLeft: 2 }} />}
    </button>
  );
}

// ── Main Onboarding Component ─────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [step, setStep] = useState(0); // 0=welcome, 1=academic, 2=digital, 3=social, 4=experience, 5=complete
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Profile state
  const [profile, setProfile] = useState({
    // Academic
    degree_program: '',
    academic_year: '',
    faculty_department: '',
    learning_environment: '',
    class_size: '',
    // Digital
    platforms_used: [],
    online_activity_level: '',
    main_online_activities: [],
    // Social
    university_activity_level: '',
    participation_types: [],
    social_role: '',
    // Experience (optional)
    encounter_frequency: '',
    experience_types: [],
    experience_role: '',
  });

  const set = (key, val) => setProfile((p) => ({ ...p, [key]: val }));
  const toggle = (key, val) =>
    setProfile((p) => ({
      ...p,
      [key]: p[key].includes(val) ? p[key].filter((v) => v !== val) : [...p[key], val],
    }));

  const totalSteps = STEPS.length;
  const currentStep = STEPS[step];
  const isLastStep = step === totalSteps - 1;

  const handleNext = async () => {
    setError('');
    if (step === totalSteps - 2) {
      // Save profile before moving to complete screen
      setSaving(true);
      try {
        const payload = {
          ...profile,
          platforms_used: profile.platforms_used.length ? profile.platforms_used : null,
          main_online_activities: profile.main_online_activities.length ? profile.main_online_activities : null,
          participation_types: profile.participation_types.length ? profile.participation_types : null,
          experience_types: profile.experience_types.length ? profile.experience_types : null,
        };
        await authApi.submitStudentProfile(payload);
        // Refresh user data so has_profile is updated
        try {
          const meRes = await authApi.me();
          updateUser(meRes.data);
        } catch (_) {}
      } catch (err) {
        setError(err.response?.data?.detail || 'Could not save profile. Please try again.');
        setSaving(false);
        return;
      }
      setSaving(false);
    }
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    }
  };

  const handleSkipAndSave = async () => {
    // Save what we have and go to assessment
    setSaving(true);
    try {
      await authApi.submitStudentProfile({
        ...profile,
        platforms_used: profile.platforms_used.length ? profile.platforms_used : null,
        main_online_activities: profile.main_online_activities.length ? profile.main_online_activities : null,
        participation_types: profile.participation_types.length ? profile.participation_types : null,
        experience_types: profile.experience_types.length ? profile.experience_types : null,
      });
      try {
        const meRes = await authApi.me();
        updateUser(meRes.data);
      } catch (_) {}
    } catch (_) {}
    setSaving(false);
    navigate('/assessment');
  };

  const canProceed = () => {
    if (step === 0) return true; // welcome
    if (step === 1) return profile.degree_program && profile.academic_year; // academic min
    if (step === 2) return profile.online_activity_level; // digital min
    if (step === 3) return profile.social_role; // social min
    if (step === 4) return true; // experience is all optional
    return true;
  };

  return (
    <div className="onb-layout">
      {/* Left Brand Strip */}
      <div className="onb-sidebar">
        <div className="onb-sidebar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '2.5rem' }}>
            <PrismaLogo size={38} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>Prisma</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                AI PROFILE SETUP
              </div>
            </div>
          </div>

          {/* Step list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <div
                  key={s.id}
                  className={`onb-step-item ${done ? 'done' : ''} ${active ? 'active' : ''}`}
                >
                  <div className="onb-step-icon">
                    {done ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                  </div>
                  <span>{s.label}</span>
                </div>
              );
            })}
          </div>

          <div className="onb-sidebar-footer">
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', lineHeight: 1.6 }}>
              Your profile helps Prisma generate scenarios that feel real and relevant to your life.
            </div>
            <div style={{ marginTop: '1rem', width: '100%', height: 4, borderRadius: 4, background: 'var(--color-surface-3)' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                  width: `${(step / (totalSteps - 1)) * 100}%`,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
              Step {step + 1} of {totalSteps}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="onb-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="onb-step-content"
          >
            {/* ── Step 0: Welcome ───────────────────────────────────── */}
            {step === 0 && (
              <div className="onb-welcome">
                <div className="onb-welcome-badge">
                  <Sparkles size={16} />
                  <span>AI-Powered Personalization</span>
                </div>
                <h1 className="onb-welcome-title">
                  Welcome to Prisma's<br />Digital Interaction Assessment
                </h1>
                <p className="onb-welcome-body">
                  Before your assessment begins, we'd like to understand a bit about you.
                  The scenarios you'll encounter will be shaped around your academic background,
                  the platforms you use, and how you typically engage online.
                </p>

                <div className="onb-feature-list">
                  {[
                    { icon: '🎯', title: 'No right or wrong answers', desc: 'This is not a test. Be honest about how you really feel and act.' },
                    { icon: '🔒', title: 'Completely confidential', desc: 'Your responses are used only to personalize your experience.' },
                    { icon: '⏱️', title: '7–10 minutes', desc: 'The full assessment takes about 7–10 minutes to complete.' },
                    { icon: '🤖', title: 'AI-generated scenarios', desc: 'Every scenario is freshly generated for your specific background.' },
                  ].map((f) => (
                    <div key={f.title} className="onb-feature-item">
                      <span className="onb-feature-icon">{f.icon}</span>
                      <div>
                        <div className="onb-feature-title">{f.title}</div>
                        <div className="onb-feature-desc">{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 1: Academic Profile ──────────────────────────── */}
            {step === 1 && (
              <div>
                <div className="onb-step-header">
                  <GraduationCap size={28} color="var(--color-primary)" />
                  <div>
                    <h2 className="onb-step-title">Your Academic Background</h2>
                    <p className="onb-step-subtitle">
                      This helps us create scenarios that feel like they belong to your actual university life.
                    </p>
                  </div>
                </div>

                <div className="onb-section">
                  <label className="onb-label">What is your degree program?</label>
                  <div className="onb-grid-2">
                    {DEGREE_PROGRAMS.map((d) => (
                      <OptionCard
                        key={d.value}
                        selected={profile.degree_program === d.value}
                        onClick={() => set('degree_program', d.value)}
                      >
                        <span style={{ fontSize: '1.4rem' }}>{d.emoji}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.label}</span>
                      </OptionCard>
                    ))}
                  </div>
                </div>

                <div className="onb-section">
                  <label className="onb-label">Which year are you in?</label>
                  <div className="onb-grid-years">
                    {ACADEMIC_YEARS.map((y) => (
                      <OptionCard
                        key={y.value}
                        selected={profile.academic_year === y.value}
                        onClick={() => set('academic_year', y.value)}
                        style={{ flexDirection: 'column', gap: '0.2rem', padding: '1rem 0.75rem' }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)' }}>{y.label}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{y.sub}</span>
                      </OptionCard>
                    ))}
                  </div>
                </div>

                <div className="onb-section">
                  <label className="onb-label">
                    Faculty / Department <span className="onb-optional">(optional)</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Faculty of Computing, Department of Psychology…"
                    value={profile.faculty_department}
                    onChange={(e) => set('faculty_department', e.target.value)}
                    style={{ maxWidth: 480 }}
                  />
                </div>

                <div className="onb-section">
                  <label className="onb-label">How do you mostly attend your classes?</label>
                  <div className="onb-grid-3">
                    {LEARNING_ENVS.map((env) => (
                      <OptionCard
                        key={env.value}
                        selected={profile.learning_environment === env.value}
                        onClick={() => set('learning_environment', env.value)}
                        style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}
                      >
                        <span style={{ fontSize: '1.6rem' }}>{env.emoji}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{env.value}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{env.desc}</span>
                      </OptionCard>
                    ))}
                  </div>
                </div>

                <div className="onb-section">
                  <label className="onb-label">
                    What is your typical class size? <span className="onb-optional">(optional)</span>
                  </label>
                  <div className="onb-grid-3">
                    {CLASS_SIZES.map((s) => (
                      <OptionCard
                        key={s.value}
                        selected={profile.class_size === s.value}
                        onClick={() => set('class_size', s.value)}
                        style={{ flexDirection: 'column', gap: '0.2rem' }}
                      >
                        <span style={{ fontSize: '1.4rem' }}>{s.emoji}</span>
                        <span style={{ fontWeight: 700 }}>{s.label}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{s.sub}</span>
                      </OptionCard>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Digital Life ──────────────────────────────── */}
            {step === 2 && (
              <div>
                <div className="onb-step-header">
                  <Wifi size={28} color="var(--color-secondary)" />
                  <div>
                    <h2 className="onb-step-title">Your Digital Life</h2>
                    <p className="onb-step-subtitle">
                      Tell us about your online presence so your scenarios reflect the platforms you actually use.
                    </p>
                  </div>
                </div>

                <div className="onb-section">
                  <label className="onb-label">
                    Which platforms do you use regularly? <span className="onb-optional">(select all that apply)</span>
                  </label>
                  <div className="onb-chip-group">
                    {PLATFORMS.map((p) => (
                      <MultiChip
                        key={p.value}
                        label={p.label}
                        emoji={p.emoji}
                        selected={profile.platforms_used.includes(p.value)}
                        onClick={() => toggle('platforms_used', p.value)}
                      />
                    ))}
                  </div>
                </div>

                <div className="onb-section">
                  <label className="onb-label">How would you describe your overall online activity level?</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {ACTIVITY_LEVELS.map((a) => (
                      <button
                        key={a.value}
                        type="button"
                        onClick={() => set('online_activity_level', a.value)}
                        className={`onb-activity-row ${profile.online_activity_level === a.value ? 'selected' : ''}`}
                        style={{ '--activity-color': a.color }}
                      >
                        <div
                          className="onb-activity-dot"
                          style={{ background: profile.online_activity_level === a.value ? a.color : 'var(--color-surface-3)' }}
                        />
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{a.label}</span>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>{a.desc}</span>
                        </div>
                        {profile.online_activity_level === a.value && (
                          <CheckCircle2 size={16} color={a.color} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="onb-section">
                  <label className="onb-label">
                    What do you mainly do online? <span className="onb-optional">(select all that apply)</span>
                  </label>
                  <div className="onb-chip-group">
                    {ONLINE_ACTIVITIES.map((a) => (
                      <MultiChip
                        key={a.value}
                        label={a.label}
                        emoji={a.emoji}
                        selected={profile.main_online_activities.includes(a.value)}
                        onClick={() => toggle('main_online_activities', a.value)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Social Life ───────────────────────────────── */}
            {step === 3 && (
              <div>
                <div className="onb-step-header">
                  <Users size={28} color="var(--color-accent)" />
                  <div>
                    <h2 className="onb-step-title">Your Social Life</h2>
                    <p className="onb-step-subtitle">
                      Understanding your social environment helps us create group-dynamic and peer-influence scenarios.
                    </p>
                  </div>
                </div>

                <div className="onb-section">
                  <label className="onb-label">How active are you in university life overall?</label>
                  <div className="onb-likert-row">
                    {['Very Low', 'Low', 'Moderate', 'High', 'Very High'].map((level, i) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => set('university_activity_level', level)}
                        className={`onb-likert-btn ${profile.university_activity_level === level ? 'selected' : ''}`}
                      >
                        <div className="onb-likert-dot" />
                        <span>{level}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="onb-section">
                  <label className="onb-label">
                    Are you involved in any of these? <span className="onb-optional">(select all that apply)</span>
                  </label>
                  <div className="onb-chip-group">
                    {PARTICIPATION_TYPES.map((p) => (
                      <MultiChip
                        key={p.value}
                        label={p.label}
                        emoji={p.emoji}
                        selected={profile.participation_types.includes(p.value)}
                        onClick={() => toggle('participation_types', p.value)}
                      />
                    ))}
                  </div>
                </div>

                <div className="onb-section">
                  <label className="onb-label">In group or community settings, which best describes you?</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                    {SOCIAL_ROLES.map((r) => (
                      <OptionCard
                        key={r.value}
                        selected={profile.social_role === r.value}
                        onClick={() => set('social_role', r.value)}
                        style={{ flexDirection: 'row', gap: '0.85rem', alignItems: 'center', padding: '0.9rem 1.1rem' }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>{r.emoji}</span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.value}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{r.desc}</div>
                        </div>
                      </OptionCard>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Online Experience (Sensitive) ─────────────── */}
            {step === 4 && (
              <div>
                <div className="onb-step-header">
                  <Shield size={28} color="var(--color-success)" />
                  <div>
                    <h2 className="onb-step-title">Online Experience</h2>
                    <p className="onb-step-subtitle">
                      All questions on this page are completely optional. Your honest answers help us understand
                      the context better, but you can skip any question you prefer not to answer.
                    </p>
                  </div>
                </div>

                <div className="onb-sensitivity-note">
                  <Shield size={15} />
                  <span>
                    This information is used only to personalize your scenarios. It is never shared, judged, or
                    used to make assumptions about your character.
                  </span>
                </div>

                <div className="onb-section">
                  <label className="onb-label">
                    Have you encountered harmful online behavior in university communities?{' '}
                    <span className="onb-optional">(optional)</span>
                  </label>
                  <div className="onb-grid-2" style={{ maxWidth: 520 }}>
                    {ENCOUNTER_FREQS.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => set('encounter_frequency', profile.encounter_frequency === f.value ? '' : f.value)}
                        className={`onb-freq-btn ${profile.encounter_frequency === f.value ? 'selected' : ''}`}
                        style={{ '--freq-color': f.color }}
                      >
                        <span style={{ fontWeight: 700, color: profile.encounter_frequency === f.value ? f.color : 'var(--color-text-primary)' }}>
                          {f.label}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{f.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {profile.encounter_frequency && profile.encounter_frequency !== 'Never' && (
                  <>
                    <div className="onb-section">
                      <label className="onb-label">
                        What kind of behavior did you encounter?{' '}
                        <span className="onb-optional">(optional — select all that apply)</span>
                      </label>
                      <div className="onb-chip-group">
                        {EXPERIENCE_TYPES.map((t) => (
                          <MultiChip
                            key={t.value}
                            label={t.label}
                            emoji={t.emoji}
                            selected={profile.experience_types.includes(t.value)}
                            onClick={() => toggle('experience_types', t.value)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="onb-section">
                      <label className="onb-label">
                        What was your role in these situations?{' '}
                        <span className="onb-optional">(optional)</span>
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {EXPERIENCE_ROLES.map((r) => (
                          <OptionCard
                            key={r.value}
                            selected={profile.experience_role === r.value}
                            onClick={() => set('experience_role', profile.experience_role === r.value ? '' : r.value)}
                            style={{ flexDirection: 'row', gap: '0.8rem', alignItems: 'center', padding: '0.75rem 1rem' }}
                          >
                            <span style={{ fontSize: '1.3rem' }}>{r.emoji}</span>
                            <div style={{ textAlign: 'left' }}>
                              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.label}</div>
                              {r.desc && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{r.desc}</div>}
                            </div>
                          </OptionCard>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Step 5: Complete ──────────────────────────────────── */}
            {step === 5 && (
              <div className="onb-complete">
                <div className="onb-complete-icon">
                  <CheckCircle2 size={48} color="#fff" />
                </div>
                <h2 className="onb-complete-title">Your Profile is Ready!</h2>
                <p className="onb-complete-body">
                  Prisma has learned about your academic background, digital habits, and social environment.
                  Your personalized assessment scenarios are ready to be generated.
                </p>

                <div className="onb-profile-summary">
                  {profile.degree_program && (
                    <div className="onb-summary-item">
                      <span>🎓</span>
                      <span>{profile.degree_program} · {profile.academic_year}</span>
                    </div>
                  )}
                  {profile.learning_environment && (
                    <div className="onb-summary-item">
                      <span>🏫</span>
                      <span>{profile.learning_environment} Learning</span>
                    </div>
                  )}
                  {profile.platforms_used.length > 0 && (
                    <div className="onb-summary-item">
                      <span>📱</span>
                      <span>{profile.platforms_used.slice(0, 3).join(', ')}{profile.platforms_used.length > 3 ? ` +${profile.platforms_used.length - 3} more` : ''}</span>
                    </div>
                  )}
                  {profile.social_role && (
                    <div className="onb-summary-item">
                      <span>👥</span>
                      <span>{profile.social_role}</span>
                    </div>
                  )}
                </div>

                <div className="onb-complete-callout">
                  <Sparkles size={18} color="var(--color-primary)" />
                  <div>
                    <strong>What happens next?</strong>
                    <br />
                    Prisma will generate 3 personalized scenario blocks covering real situations
                    that feel familiar to your university context. Each scenario includes 8
                    questions measuring your attitudes, norms, confidence, and intentions.
                  </div>
                </div>

                <button
                  type="button"
                  className="onb-start-btn"
                  onClick={() => navigate('/assessment')}
                  disabled={saving}
                >
                  <BookOpen size={20} />
                  <span>Start My Assessment</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
            {error}
          </div>
        )}

        {/* Navigation Footer */}
        {step < totalSteps - 1 && (
          <div className="onb-nav-footer">
            <button
              type="button"
              className="onb-nav-back"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {step > 0 && step < totalSteps - 2 && (
                <button
                  type="button"
                  className="onb-nav-skip"
                  onClick={handleSkipAndSave}
                  disabled={saving}
                >
                  Skip & Start Assessment
                </button>
              )}

              <button
                type="button"
                className="onb-nav-next"
                onClick={handleNext}
                disabled={!canProceed() || saving}
              >
                {saving ? (
                  <span>Saving…</span>
                ) : step === totalSteps - 2 ? (
                  <>
                    <span>Save Profile</span>
                    <CheckCircle2 size={16} />
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
