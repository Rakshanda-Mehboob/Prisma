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
import OnboardingLayout from '../components/OnboardingLayout';
import {
  GraduationCap, Home, Smartphone, Users,
  CheckCircle2, Sparkles, ArrowRight, ShieldCheck
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
    sub: 'On-campus dorms or halls',
    icon: '🏢',
  },
  {
    id: 'Home with family',
    title: 'Home with family',
    sub: 'Living at home & commuting',
    icon: '🏡',
  },
  {
    id: 'Private accommodation',
    title: 'Private housing',
    sub: 'Independent student flat',
    icon: '🛋️',
  },
  {
    id: 'Shared apartment',
    title: 'Shared apartment',
    sub: 'Rented flat with peers',
    icon: '🏘️',
  },
  {
    id: 'Other',
    title: 'Other',
    sub: 'Other living arrangement',
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
  { id: 'Rarely', label: 'Rarely', desc: 'Essential updates only', icon: '🍃' },
  { id: 'Sometimes', label: 'Sometimes', desc: 'A few hours daily', icon: '🌤️' },
  { id: 'Frequently', label: 'Frequently', desc: 'Active throughout the day', icon: '⚡' },
  { id: 'Almost daily', label: 'Almost daily', desc: 'Constantly connected', icon: '🔥' },
];

const INTERACTION_PARTNERS = [
  { id: 'Classmates', label: 'Classmates', icon: '👥' },
  { id: 'Friends', label: 'Friends', icon: '🤝' },
  { id: 'Teachers', label: 'Teachers', icon: '👨‍🏫' },
  { id: 'Professional groups', label: 'Professional groups', icon: '💼' },
  { id: 'Online communities', label: 'Online communities', icon: '🌍' },
  { id: 'Gaming communities', label: 'Gaming communities', icon: '🎮' },
  { id: 'None', label: 'None', icon: '🚫' },
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

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      steps={STEPS}
      stepLabel={STEPS[step]?.label}
      error={error}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={handleNext}
      onSkip={handleSkipAndSave}
      canProceed={canProceed()}
      saving={saving}
      showNav={step < totalSteps - 1}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {/* Step 0: Welcome */}
              {step === 0 && (
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.4rem 0.95rem', borderRadius: 999, background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                    <Sparkles size={16} />
                    Welcome to Prisma
                  </div>

                  <h1 className="onb-heading">
                    Welcome to Prisma! 👋
                  </h1>

                  <p className="onb-body-text w-full" style={{ marginBottom: '1.25rem' }}>
                    Thank you for creating your account. Before starting your diagnostic assessment, we would like to understand a little about your university background and everyday digital environment.
                  </p>

                  <p className="onb-body-text w-full" style={{ color: 'var(--color-text-muted)', marginBottom: '2.25rem' }}>
                    These brief questions help personalize diagnostic scenarios and tailored interventions to your faculty. It takes about a minute, and you select all your answers manually.
                  </p>

                  {/* Full-width Safe, Confidential & Academic Box */}
                  <div className="onb-privacy-box w-full">
                    <div className="onb-privacy-icon">
                      <ShieldCheck size={26} />
                    </div>
                    <div>
                      <div className="onb-privacy-title">
                        Safe, Confidential & Academic
                      </div>
                      <div className="onb-privacy-desc">
                        Your responses and details are kept strictly private. They are never shared with instructors, classmates, or university administration, and are exclusively utilized for your personalized learning path.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Academic */}
              {step === 1 && (
                <div>
                  <h2 className="onb-heading">
                    Academic Details
                  </h2>
                  <p className="onb-body-text w-full" style={{ marginBottom: '1.75rem' }}>
                    Tell us about your university, field of study, and academic year.
                  </p>

                  {/* Row 1: University & Year of Study in 2-column grid */}
                  <div className="onb-grid-2col" style={{ marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.55rem' }}>
                        University / Institution
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Riphah International University"
                        value={profile.university}
                        onChange={(e) => set('university', e.target.value)}
                        style={{ fontSize: '1rem', padding: '0.8rem 1.15rem' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.55rem' }}>
                        Year of Study
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                        {STUDY_YEARS.map((yr) => {
                          const sel = profile.academic_year === yr;
                          return (
                            <button
                              key={yr}
                              type="button"
                              className={`onb-chip-btn ${sel ? 'active' : ''}`}
                              onClick={() => set('academic_year', yr)}
                              style={{ padding: '0.65rem 1.1rem' }}
                            >
                              {sel && <CheckCircle2 size={16} />}
                              <span>{yr}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Academic Level — Horizontal Single-Row Cards */}
                  <div className="form-group mb-6" style={{ marginBottom: '1.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.55rem' }}>
                      Academic Level
                    </label>
                    <div className="onb-grid-3col">
                      {ACADEMIC_LEVELS.map((lvl) => {
                        const sel = profile.academic_level === lvl.id;
                        return (
                          <button
                            key={lvl.id}
                            type="button"
                            className={`onb-card-horizontal ${sel ? 'active' : ''}`}
                            onClick={() => set('academic_level', lvl.id)}
                            style={{ padding: '0.85rem 1.1rem' }}
                          >
                            <span style={{ fontSize: '1.65rem', flexShrink: 0 }}>{lvl.icon}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{lvl.label}</span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lvl.sub}</span>
                            </div>
                            {sel && <CheckCircle2 size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row 3: Department / Field of Study — Horizontal Chip Pills */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.55rem' }}>
                      Department / Field of Study
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                      {DEPARTMENTS.map((d) => {
                        const sel = profile.degree_program === d.id;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            className={`onb-chip-btn ${sel ? 'active' : ''}`}
                            onClick={() => set('degree_program', d.id)}
                          >
                            <span style={{ fontSize: '1.2rem' }}>{d.icon}</span>
                            <span>{d.label}</span>
                            {sel && <CheckCircle2 size={15} style={{ color: 'var(--color-primary)' }} />}
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
                        style={{ marginTop: '0.85rem', fontSize: '0.98rem', padding: '0.8rem 1.15rem' }}
                        autoFocus
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Living — 5 Compact Horizontal Cards in 1 Row */}
              {step === 2 && (
                <div>
                  <h2 className="onb-heading">
                    Living Situation
                  </h2>
                  <p className="onb-body-text w-full" style={{ marginBottom: '1.75rem' }}>
                    Where do you currently reside during your university studies?
                  </p>

                  <div className="onb-living-grid">
                    {LIVING_SITUATIONS.map((sit) => {
                      const sel = profile.living_situation === sit.id;
                      return (
                        <button
                          key={sit.id}
                          type="button"
                          className={`onb-living-card ${sel ? 'active' : ''}`}
                          onClick={() => set('living_situation', sit.id)}
                        >
                          <div className="onb-living-icon-wrap">
                            {sit.icon}
                          </div>
                          <div className="onb-living-title">
                            {sit.title}
                          </div>
                          <div className="onb-living-sub">
                            {sit.sub}
                          </div>
                          {sel && (
                            <div className="onb-living-check">
                              <CheckCircle2 size={14} />
                              <span>Selected</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Digital Life — Horizontal Platforms & 4-Column Frequencies */}
              {step === 3 && (
                <div>
                  <h2 className="onb-heading">
                    Digital Environment
                  </h2>
                  <p className="onb-body-text w-full" style={{ marginBottom: '1.75rem' }}>
                    Which platforms and online channels do you use regularly? (Select all that apply)
                  </p>

                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                      Frequently Used Platforms
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                      {/* None option */}
                      <button
                        type="button"
                        className={`onb-chip-btn ${profile.platforms_used.includes('None') ? 'active' : ''}`}
                        onClick={selectNonePlatforms}
                      >
                        <span style={{ fontSize: '1.2rem' }}>🚫</span>
                        <span>None</span>
                        {profile.platforms_used.includes('None') && <CheckCircle2 size={15} style={{ color: 'var(--color-primary)' }} />}
                      </button>

                      {PLATFORMS.map((p) => {
                        const sel = profile.platforms_used.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            className={`onb-chip-btn ${sel ? 'active' : ''}`}
                            onClick={() => togglePlatform(p.id)}
                          >
                            <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                            <span>{p.label}</span>
                            {sel && <CheckCircle2 size={15} style={{ color: 'var(--color-primary)' }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                      How often do you interact online?
                    </label>
                    <div className="onb-grid-4col">
                      {INTERACTION_FREQUENCIES.map((freq) => {
                        const sel = profile.online_activity_level === freq.id;
                        return (
                          <button
                            key={freq.id}
                            type="button"
                            className={`onb-card-option ${sel ? 'active' : ''}`}
                            onClick={() => set('online_activity_level', freq.id)}
                            style={{ padding: '1.15rem 1.1rem', textAlign: 'left', minHeight: '105px' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                              <span style={{ fontSize: '1.35rem' }}>{freq.icon}</span>
                              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>{freq.label}</span>
                            </div>
                            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                              {freq.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Community — Horizontal Partners Chips & Side-by-Side Groups */}
              {step === 4 && (
                <div>
                  <h2 className="onb-heading">
                    Student Community
                  </h2>
                  <p className="onb-body-text w-full" style={{ marginBottom: '1.75rem' }}>
                    Tell us about your peer interactions and university group participation.
                  </p>

                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                      Who do you mainly interact with online?
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                      {INTERACTION_PARTNERS.map((partner) => {
                        const sel = profile.main_interaction_with === partner.id;
                        return (
                          <button
                            key={partner.id}
                            type="button"
                            className={`onb-chip-btn ${sel ? 'active' : ''}`}
                            onClick={() => set('main_interaction_with', partner.id)}
                            style={{ padding: '0.75rem 1.25rem' }}
                          >
                            <span style={{ fontSize: '1.25rem' }}>{partner.icon}</span>
                            <span>{partner.label}</span>
                            {sel && <CheckCircle2 size={15} style={{ color: 'var(--color-primary)' }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                      Do you participate in online university groups?
                    </label>
                    <div className="onb-grid-2col">
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
                            style={{ padding: '1.15rem 1.25rem', textAlign: 'left' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                              <span style={{ fontSize: '1.35rem' }}>{item.icon}</span>
                              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>{item.label}</span>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
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
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(5, 150, 105, 0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '1.75rem', boxShadow: '0 8px 24px -4px rgba(5, 150, 105, 0.25)' }}>
                    <CheckCircle2 size={48} strokeWidth={2.5} />
                  </div>

                  <h2 className="onb-heading">
                    Profile Setup Complete
                  </h2>

                  <p className="onb-body-text w-full" style={{ marginBottom: '2.5rem' }}>
                    Your academic profile has been calibrated. You are now prepared to begin your baseline diagnostic assessment.
                  </p>

                  <div className="onb-grid-2col" style={{ maxWidth: '440px', margin: '0 auto' }}>
                    <button
                      type="button"
                      onClick={() => navigate('/assessment?stage=pre')}
                      className="onb-btn-continue"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <span>Start Baseline Assessment</span>
                      <ArrowRight size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="onb-btn-ghost"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Continue to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
    </OnboardingLayout>
  );
}
