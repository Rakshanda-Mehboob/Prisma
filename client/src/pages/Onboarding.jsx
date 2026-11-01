/**
 * pages/Onboarding.jsx — Multi-step Student Profile Setup
 *
 * Collects student background information:
 * - Academic environment (University, Department, Academic Level, Year of Study)
 * - Living situation (Hostel, Home with family, Private accommodation, Shared apartment, Other)
 * - Digital platform usage & frequency
 * - Student community context
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import PrismaLogo from '../components/PrismaLogo';
import Button from '../components/ui/Button';
import {
  GraduationCap, Home, Smartphone, Users,
  ChevronRight, ChevronLeft, CheckCircle2,
  Sparkles, ArrowRight, ShieldCheck, Lock, Brain
} from 'lucide-react';

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'welcome', label: 'Welcome', icon: Sparkles },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'living', label: 'Living', icon: Home },
  { id: 'digital', label: 'Digital Life', icon: Smartphone },
  { id: 'social', label: 'Community', icon: Users },
  { id: 'complete', label: 'Complete', icon: CheckCircle2 },
];

// ── Options ───────────────────────────────────────────────────────────────────
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

const STUDY_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Other'];

const LIVING_SITUATIONS = [
  {
    id: 'University hostel',
    title: 'University hostel',
    sub: 'On-campus dormitories or university halls of residence',
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
    sub: 'Independent private residence or private student housing',
    icon: '🛋️',
  },
  {
    id: 'Shared apartment',
    title: 'Shared apartment',
    sub: 'Off-campus rented apartment or house with peers',
    icon: '🏘️',
  },
  {
    id: 'Other',
    title: 'Other',
    sub: 'Other living arrangement during studies',
    icon: '📍',
  },
];

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

const INTERACTION_PARTNERS = [
  { id: 'Classmates', label: 'Classmates', sub: 'Academic peers, batch groups & project partners', icon: '👥' },
  { id: 'Friends', label: 'Friends', sub: 'Close personal social circles', icon: '🤝' },
  { id: 'Teachers', label: 'Teachers', sub: 'Academic instructors & research advisors', icon: '👨‍🏫' },
  { id: 'Professional groups', label: 'Professional groups', sub: 'Career networks & internship colleagues', icon: '💼' },
  { id: 'Online communities', label: 'Online communities', sub: 'Special-interest forums & discussion groups', icon: '🌍' },
  { id: 'Gaming communities', label: 'Gaming communities', sub: 'Multiplayer teams & gaming channels', icon: '🎮' },
  { id: 'None', label: 'None', sub: 'I do not actively interact in groups or communities', icon: '🚫' },
];

// ── Decorative Side Panel Contextual Data ─────────────────────────────────────
const STEP_DECORATIVE_DATA = [
  {
    badge: 'Theory of Planned Behavior',
    badgeIcon: Brain,
    title: 'Personalized Behavioral Diagnostic',
    description: 'Prisma combines behavioral psychology with interactive scenarios to assess attitudes, social norms, and confidence in addressing online harassment.',
    stats: [
      { label: 'Tailored Scenarios', desc: 'Situations calibrated to your faculty & academic stage', icon: '🎯' },
      { label: 'Strict Confidentiality', desc: 'Data is protected and used solely for educational assessment', icon: '🔒' },
      { label: 'Quick Experience', desc: 'Takes about 60 seconds to complete your profile', icon: '⚡' },
    ],
    highlight: 'Your answers ensure scenario simulations and learning modules are directly relevant to your daily campus life.',
  },
  {
    badge: 'Academic Context',
    badgeIcon: GraduationCap,
    title: 'Campus Environment Calibration',
    description: 'Online student culture and peer dynamics differ across academic departments, project teams, and study years.',
    stats: [
      { label: 'Faculty Calibration', desc: 'Labs, clinics, studios, or lecture cohorts', icon: '📚' },
      { label: 'Peer Cohort', desc: 'Undergraduate, graduate, or doctoral norms', icon: '🎓' },
      { label: 'Communication Hubs', desc: 'Batch WhatsApp chats and LMS discussion boards', icon: '💬' },
    ],
    highlight: 'Calibrating by faculty ensures you experience realistic situations rather than generic advice.',
  },
  {
    badge: 'Residential Context',
    badgeIcon: Home,
    title: 'Living Spaces & Peer Ties',
    description: 'Residential life shapes communication frequency, after-hours messaging, and social support networks.',
    stats: [
      { label: 'Campus Hostels', desc: 'Close-knit living quarters & roommate communication', icon: '🏢' },
      { label: 'Commuter Students', desc: 'Family-centered living and virtual peer connections', icon: '🏡' },
      { label: 'Private Housing', desc: 'Independent student living and shared spaces', icon: '🛋️' },
    ],
    highlight: 'Understanding living situations helps tailor recommendations for digital boundaries and roommate communication.',
  },
  {
    badge: 'Digital Environment',
    badgeIcon: Smartphone,
    title: 'Multi-Platform Safety Readiness',
    description: 'Harassment and peer pressure look different across private messaging, public feeds, and student forums.',
    stats: [
      { label: 'Messaging Channels', desc: 'Group chat dynamics, forwarded rumors, exclusion', icon: '💬' },
      { label: 'Visual Platforms', desc: 'Comments, story callouts, and tagging pressure', icon: '📸' },
      { label: 'Academic Portals', desc: 'LMS forums, student drives, and official portals', icon: '🎓' },
    ],
    highlight: 'Selecting the platforms you use allows Prisma to offer platform-specific safety and privacy strategies.',
  },
  {
    badge: 'Community Readiness',
    badgeIcon: Users,
    title: 'Fostering Proactive Peer Norms',
    description: 'Research shows that when even one peer intervenes or reaches out privately, the likelihood of ongoing harassment drops dramatically.',
    stats: [
      { label: 'Bystander Support', desc: 'Private peer outreach offers immediate emotional relief', icon: '🛡️' },
      { label: 'Group Norms', desc: 'Constructive norms discourage hostile behavior', icon: '🌟' },
      { label: 'Actionable Steps', desc: 'Practical, low-risk strategies for student allies', icon: '🤝' },
    ],
    highlight: 'Your community participation profile helps Prisma gauge social norm readiness in your cohort.',
  },
  {
    badge: 'Assessment Ready',
    badgeIcon: CheckCircle2,
    title: 'Your Diagnostic Pathway',
    description: 'Profile complete! You are ready to start the interactive baseline assessment.',
    stats: [
      { label: 'Step 1: Baseline', desc: '3 realistic online scenarios with 12 questions', icon: '📋' },
      { label: 'Step 2: Modules', desc: 'Tailored TPB learning modules & digital reflection', icon: '📖' },
      { label: 'Step 3: Growth', desc: 'Post-assessment to measure readiness gains', icon: '🚀' },
    ],
    highlight: 'The assessment takes about 8-10 minutes and provides instant personalized feedback.',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Profile state — all start completely empty so nothing is pre-selected
  const [profile, setProfile] = useState({
    university: user?.university || '',
    degree_program: user?.department || '',
    custom_department: '',
    academic_level: '',
    academic_year: '',
    living_situation: user?.living_situation || '',
    platforms_used: [],
    online_activity_level: '',
    main_interaction_with: '',
    university_groups_participation: '',
  });

  // Pre-fill from user context if user becomes available after mount
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        university: prev.university || user.university || '',
        degree_program: prev.degree_program || user.department || '',
        living_situation: prev.living_situation || user.living_situation || '',
      }));
    }
  }, [user]);

  // Pre-load existing profile if present
  useEffect(() => {
    authApi.getStudentProfile()
      .then((res) => {
        if (res.data) {
          const d = res.data;
          setProfile((prev) => ({
            ...prev,
            university: d.university || prev.university,
            degree_program: d.degree_program || prev.degree_program,
            academic_level: d.academic_level || prev.academic_level,
            academic_year: d.academic_year || prev.academic_year,
            living_situation: d.living_situation || prev.living_situation,
            platforms_used: d.platforms_used || prev.platforms_used,
            online_activity_level: d.online_activity_level || prev.online_activity_level,
            main_interaction_with: d.main_interaction_with || prev.main_interaction_with,
            university_groups_participation: d.university_groups_participation || prev.university_groups_participation,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const set = (key, val) => setProfile((p) => ({ ...p, [key]: val }));

  const togglePlatform = (platformId) => {
    setProfile((prev) => {
      const withoutNone = prev.platforms_used.filter((p) => p !== 'None');
      const exists = withoutNone.includes(platformId);
      const updated = exists
        ? withoutNone.filter((p) => p !== platformId)
        : [...withoutNone, platformId];
      return { ...prev, platforms_used: updated };
    });
  };

  const selectNonePlatforms = () => {
    setProfile((prev) => ({
      ...prev,
      platforms_used: prev.platforms_used.includes('None') ? [] : ['None']
    }));
  };

  const totalSteps = STEPS.length;

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) {
      if (!profile.degree_program) return false;
      if (profile.degree_program === 'Other' && !profile.custom_department.trim()) return false;
      return Boolean(profile.university && profile.academic_level && profile.academic_year);
    }
    if (step === 2) return Boolean(profile.living_situation);
    if (step === 3) return profile.platforms_used.length > 0 && Boolean(profile.online_activity_level);
    if (step === 4) return Boolean(profile.main_interaction_with && profile.university_groups_participation);
    return true;
  };

  const handleNext = async () => {
    setError('');
    if (step === totalSteps - 2) {
      // Save profile before moving to complete screen
      setSaving(true);
      try {
        const finalDepartment = profile.degree_program === 'Other' && profile.custom_department.trim()
          ? profile.custom_department.trim()
          : profile.degree_program;

        const payload = {
          university: profile.university.trim() || 'Riphah International University',
          degree_program: finalDepartment,
          faculty_department: finalDepartment,
          academic_level: profile.academic_level,
          academic_year: profile.academic_year,
          living_situation: profile.living_situation,
          platforms_used: profile.platforms_used.length ? profile.platforms_used : ['None'],
          online_activity_level: profile.online_activity_level,
          main_interaction_with: profile.main_interaction_with,
          university_groups_participation: profile.university_groups_participation,
        };

        await authApi.submitStudentProfile(payload);
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
    setSaving(true);
    try {
      const finalDepartment = profile.degree_program === 'Other' && profile.custom_department.trim()
        ? profile.custom_department.trim()
        : profile.degree_program;

      await authApi.submitStudentProfile({
        university: profile.university.trim() || 'Riphah International University',
        degree_program: finalDepartment,
        faculty_department: finalDepartment,
        academic_level: profile.academic_level,
        academic_year: profile.academic_year,
        living_situation: profile.living_situation,
        platforms_used: profile.platforms_used.length ? profile.platforms_used : ['None'],
        online_activity_level: profile.online_activity_level,
        main_interaction_with: profile.main_interaction_with,
        university_groups_participation: profile.university_groups_participation,
      });

      const meRes = await authApi.me();
      updateUser(meRes.data);
    } catch (_) {}
    setSaving(false);
    navigate('/dashboard');
  };

  const currentDecor = STEP_DECORATIVE_DATA[step] || STEP_DECORATIVE_DATA[0];
  const DecorBadgeIcon = currentDecor.badgeIcon;

  return (
    <div className="onb-layout">
      {/* ─── 1. Left Step Sidebar ─── */}
      <aside className="onb-sidebar">
        <div>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
            <PrismaLogo size={38} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                Prisma
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.04em' }}>
                STUDENT ONBOARDING
              </div>
            </div>
          </div>

          {/* Stepper with continuous vertical connector line */}
          <div className="onb-steps-list">
            {STEPS.map((s, i) => {
              const done = i < step || step === totalSteps - 1;
              const active = i === step;
              const isLast = i === totalSteps - 1;

              return (
                <div key={s.id} className="onb-step-row">
                  {/* Connector Line */}
                  {!isLast && (
                    <div className={`onb-step-connector ${i < step ? 'completed' : ''}`} />
                  )}

                  {/* Step Circle */}
                  <div className={`onb-step-circle ${active ? 'active' : done ? 'completed' : 'upcoming'}`}>
                    {done ? <CheckCircle2 size={16} strokeWidth={2.5} /> : i + 1}
                  </div>

                  {/* Step Label */}
                  <div className="onb-step-text-wrap">
                    <span className={`onb-step-label ${active ? 'active' : done ? 'completed' : ''}`}>
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Security Note & Progress Bar */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>
            <Lock size={14} style={{ color: 'var(--color-primary)' }} />
            <span>Encrypted & Confidential</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
            Your student profile data is used strictly for personalized cyberbullying intervention scenarios.
          </div>
          <div className="onb-progress-track">
            <div className="onb-progress-bar" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
          </div>
        </div>
      </aside>

      {/* ─── 2. Main Content Area (Split into Form Column & Decorative Column) ─── */}
      <main className="onb-main-area">
        {/* Left Column: The Form */}
        <div className="onb-form-column">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {/* Step 0: Welcome */}
              {step === 0 && (
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.35rem 0.85rem', borderRadius: 999, background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                    <Sparkles size={14} />
                    Welcome to Prisma
                  </div>

                  <h1 style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', color: 'var(--color-text-primary)', letterSpacing: '-0.025em' }}>
                    Welcome to Prisma! 👋
                  </h1>

                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '1rem', marginBottom: '1.25rem' }}>
                    Thank you for creating your account. Before starting your diagnostic assessment, we would like to know a little about your university environment.
                  </p>

                  <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '2rem' }}>
                    These brief questions help calibrate assessment scenarios and tailored learning modules to your study area. It takes about a minute, and you select all your answers manually.
                  </p>

                  <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem 1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                        Safe, Confidential & Academic
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
                        Your details and responses are completely private and never shared with instructors, classmates, or campus administration.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Academic */}
              {step === 1 && (
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.35rem 0.85rem', borderRadius: 999, background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
                    <GraduationCap size={15} />
                    Step 1 of 5
                  </div>

                  <h2 style={{ fontSize: 'clamp(1.85rem, 2.5vw, 2.25rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                    Academic Details
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                    Tell us about your university, field of study, and academic year.
                  </p>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      University / Institution
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Riphah International University"
                      value={profile.university}
                      onChange={(e) => set('university', e.target.value)}
                      style={{ fontSize: '0.96rem', padding: '0.75rem 1rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Department / Field of Study
                    </label>
                    <div className="onb-options-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                      {DEPARTMENTS.map((d) => {
                        const sel = profile.degree_program === d.id;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            className={`onb-card-option ${sel ? 'active' : ''}`}
                            onClick={() => set('degree_program', d.id)}
                            style={{ padding: '0.8rem 0.95rem' }}
                          >
                            <span style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>{d.icon}</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: sel ? 700 : 500, color: 'var(--color-text-primary)' }}>{d.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {profile.degree_program === 'Other' && (
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Type your department or major name…"
                        value={profile.custom_department}
                        onChange={(e) => set('custom_department', e.target.value)}
                        style={{ marginTop: '0.75rem', fontSize: '0.95rem' }}
                        autoFocus
                      />
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Academic Level
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                        {ACADEMIC_LEVELS.map((lvl) => {
                          const sel = profile.academic_level === lvl.id;
                          return (
                            <button
                              key={lvl.id}
                              type="button"
                              className={`onb-card-option ${sel ? 'active' : ''}`}
                              onClick={() => set('academic_level', lvl.id)}
                              style={{ padding: '0.85rem 1rem' }}
                            >
                              <span style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{lvl.icon}</span>
                              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{lvl.label}</span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>{lvl.sub}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Year of Study
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                        {STUDY_YEARS.map((yr) => {
                          const sel = profile.academic_year === yr;
                          return (
                            <button
                              key={yr}
                              type="button"
                              className={`onb-pill-btn ${sel ? 'active' : ''}`}
                              onClick={() => set('academic_year', yr)}
                              style={{ padding: '0.65rem 1.15rem', fontSize: '0.88rem' }}
                            >
                              {sel && <CheckCircle2 size={15} />}
                              <span>{yr}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Living */}
              {step === 2 && (
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.35rem 0.85rem', borderRadius: 999, background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
                    <Home size={15} />
                    Step 2 of 5
                  </div>

                  <h2 style={{ fontSize: 'clamp(1.85rem, 2.5vw, 2.25rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                    Living Situation
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                    Where do you currently reside during your university studies?
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {LIVING_SITUATIONS.map((sit) => {
                      const sel = profile.living_situation === sit.id;
                      return (
                        <button
                          key={sit.id}
                          type="button"
                          className={`onb-card-option ${sel ? 'active' : ''}`}
                          onClick={() => set('living_situation', sit.id)}
                          style={{ padding: '1.1rem 1.25rem' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{ fontSize: '1.45rem' }}>{sit.icon}</span>
                              <span style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{sit.title}</span>
                            </div>
                            <div
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                border: sel ? '6px solid var(--color-primary)' : '2px solid var(--color-border)',
                                background: 'var(--color-surface)',
                                transition: 'all 0.2s ease',
                              }}
                            />
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', paddingLeft: '2.25rem', lineHeight: 1.5 }}>
                            {sit.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Digital Life */}
              {step === 3 && (
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.35rem 0.85rem', borderRadius: 999, background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
                    <Smartphone size={15} />
                    Step 3 of 5
                  </div>

                  <h2 style={{ fontSize: 'clamp(1.85rem, 2.5vw, 2.25rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                    Digital Environment
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                    Which platforms and online channels do you use regularly? (Select all that apply)
                  </p>

                  <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Frequently Used Platforms
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                      <button
                        type="button"
                        className={`onb-pill-btn ${profile.platforms_used.includes('None') ? 'active' : ''}`}
                        onClick={selectNonePlatforms}
                        style={{ padding: '0.65rem 1.15rem', fontSize: '0.9rem' }}
                      >
                        <span>🚫</span>
                        <span>None</span>
                        {profile.platforms_used.includes('None') && <CheckCircle2 size={15} style={{ marginLeft: 3 }} />}
                      </button>

                      {PLATFORMS.map((p) => {
                        const sel = profile.platforms_used.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            className={`onb-pill-btn ${sel ? 'active' : ''}`}
                            onClick={() => togglePlatform(p.id)}
                            style={{ padding: '0.65rem 1.15rem', fontSize: '0.9rem' }}
                          >
                            <span>{p.icon}</span>
                            <span>{p.label}</span>
                            {sel && <CheckCircle2 size={15} style={{ marginLeft: 3 }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      How often do you interact online?
                    </label>
                    <div className="onb-options-grid-2col" style={{ gap: '0.85rem' }}>
                      {INTERACTION_FREQUENCIES.map((freq) => {
                        const sel = profile.online_activity_level === freq.id;
                        return (
                          <button
                            key={freq.id}
                            type="button"
                            className={`onb-card-option ${sel ? 'active' : ''}`}
                            onClick={() => set('online_activity_level', freq.id)}
                            style={{ padding: '1rem 1.15rem' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                              <span style={{ fontSize: '1.25rem' }}>{freq.icon}</span>
                              <span style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--color-text-primary)' }}>{freq.label}</span>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                              {freq.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Community */}
              {step === 4 && (
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.35rem 0.85rem', borderRadius: 999, background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
                    <Users size={15} />
                    Step 4 of 5
                  </div>

                  <h2 style={{ fontSize: 'clamp(1.85rem, 2.5vw, 2.25rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                    Student Community
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                    Tell us about your peer interactions and university group participation.
                  </p>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Who do you mainly interact with online?
                    </label>
                    <div className="onb-options-grid-2col" style={{ gap: '0.85rem' }}>
                      {INTERACTION_PARTNERS.map((partner) => {
                        const sel = profile.main_interaction_with === partner.id;
                        return (
                          <button
                            key={partner.id}
                            type="button"
                            className={`onb-card-option ${sel ? 'active' : ''}`}
                            onClick={() => set('main_interaction_with', partner.id)}
                            style={{ padding: '0.95rem 1.15rem' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.3rem' }}>
                              <span style={{ fontSize: '1.25rem' }}>{partner.icon}</span>
                              <span style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--color-text-primary)' }}>{partner.label}</span>
                            </div>
                            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                              {partner.sub}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Do you participate in online university groups?
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                      {[
                        { val: 'Yes', label: 'Yes, I participate', desc: 'Batch WhatsApp chats, LMS forums, Discord servers, or student societies', icon: '✅' },
                        { val: 'No', label: 'No, rarely or never', desc: 'Prefer direct 1-on-1 messages or independent study without large groups', icon: '❌' },
                      ].map((item) => {
                        const sel = profile.university_groups_participation === item.val;
                        return (
                          <button
                            key={item.val}
                            type="button"
                            className={`onb-card-option ${sel ? 'active' : ''}`}
                            onClick={() => set('university_groups_participation', item.val)}
                            style={{ padding: '1rem 1.15rem' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.35rem' }}>
                              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                              <span style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--color-text-primary)' }}>{item.label}</span>
                            </div>
                            <span style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                              {item.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Complete */}
              {step === 5 && (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'rgba(5, 150, 105, 0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '1.5rem', boxShadow: '0 8px 24px -4px rgba(5, 150, 105, 0.25)' }}>
                    <CheckCircle2 size={42} strokeWidth={2.5} />
                  </div>

                  <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.45rem)', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                    Profile Setup Complete
                  </h2>

                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', maxWidth: '440px', margin: '0 auto 2.25rem', lineHeight: 1.65 }}>
                    Your academic profile has been calibrated. You are now prepared to begin your baseline diagnostic assessment.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '360px', margin: '0 auto' }}>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => navigate('/assessment?stage=pre')}
                      icon={<ArrowRight size={18} />}
                      style={{
                        width: '100%',
                        padding: '0.95rem 1.75rem',
                        fontSize: '1.02rem',
                        fontWeight: 700,
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-lg)',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.35)',
                      }}
                    >
                      Start Baseline Assessment
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1.75rem',
                        fontSize: '0.96rem',
                        fontWeight: 600,
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-lg)',
                      }}
                    >
                      Continue to Dashboard
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && <div className="alert alert-danger" style={{ marginTop: '1.25rem' }}>{error}</div>}

          {/* Navigation Controls */}
          {step < totalSteps - 1 && (
            <div className="onb-nav-bar" style={{ marginTop: '2.25rem' }}>
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.7rem 1.35rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'none',
                  border: '1.5px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  cursor: step === 0 ? 'not-allowed' : 'pointer',
                  opacity: step === 0 ? 0.45 : 1,
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <ChevronLeft size={16} />
                Back
              </button>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {step > 0 && (
                  <button
                    type="button"
                    onClick={handleSkipAndSave}
                    disabled={saving}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.88rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Skip for now
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed() || saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.75rem 1.65rem',
                    borderRadius: 'var(--radius-md)',
                    background: canProceed() ? 'linear-gradient(135deg, var(--color-primary), #6366f1)' : 'var(--color-surface-3)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: canProceed() ? 'pointer' : 'not-allowed',
                    boxShadow: canProceed() ? '0 4px 14px rgba(79, 70, 229, 0.3)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {saving ? 'Saving Profile…' : step === totalSteps - 2 ? 'Save & Continue' : 'Continue'}
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Decorative & Educational Insights Panel (Desktop Only) */}
        <div className="onb-decorative-column">
          <motion.div
            key={`decor-${step}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="onb-decorative-card"
          >
            {/* Ambient orb */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.95rem', borderRadius: 999, background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', fontSize: '0.84rem', fontWeight: 700, width: 'fit-content' }}>
              <DecorBadgeIcon size={16} />
              <span>{currentDecor.badge}</span>
            </div>

            {/* Heading & Description */}
            <div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.65rem', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                {currentDecor.title}
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.94rem', lineHeight: 1.65, margin: 0 }}>
                {currentDecor.description}
              </p>
            </div>

            {/* Structured Insights Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {currentDecor.stats.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    padding: '0.95rem 1.15rem',
                    borderRadius: 'var(--radius-lg)',
                    background: '#ffffff',
                    border: '1px solid rgba(99, 102, 241, 0.12)',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
                  }}
                >
                  <span style={{ fontSize: '1.25rem', lineHeight: 1, marginTop: '2px' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-text-primary)', marginBottom: '0.15rem' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Highlight Banner */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(79, 70, 229, 0.06)',
                border: '1px solid rgba(79, 70, 229, 0.18)',
                fontSize: '0.86rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.55,
              }}
            >
              <strong style={{ color: 'var(--color-primary)' }}>💡 Context Matters: </strong>
              {currentDecor.highlight}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
