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
  Sparkles, ShieldCheck, ArrowRight, BookOpen,
  Building2, School, Radio, Check
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
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Profile state
  const [profile, setProfile] = useState({
    university: user?.university || 'Riphah International University',
    degree_program: user?.department || 'Computer Science',
    custom_department: '',
    academic_level: 'Undergraduate',
    academic_year: '1st Year',
    living_situation: user?.living_situation || 'University hostel',
    platforms_used: ['WhatsApp', 'Instagram', 'Discord'],
    online_activity_level: 'Frequently',
    main_interaction_with: 'Classmates',
    university_groups_participation: 'Yes',
  });

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
      const exists = prev.platforms_used.includes(platformId);
      const updated = exists
        ? prev.platforms_used.filter((p) => p !== platformId)
        : [...prev.platforms_used, platformId];
      return { ...prev, platforms_used: updated };
    });
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
          platforms_used: profile.platforms_used.length ? profile.platforms_used : ['WhatsApp'],
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
        platforms_used: profile.platforms_used,
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
    <div className="onb-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 'calc(100vh - 70px)', background: 'var(--color-bg)' }}>
      {/* Left Brand Strip */}
      <div style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', padding: '2.5rem 1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <PrismaLogo size={36} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>Prisma</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                STUDENT ONBOARDING
              </div>
            </div>
          </div>

          {/* Step list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {STEPS.map((s, i) => {
              const done = i < step || step === totalSteps - 1;
              const active = i === step;
              return (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.86rem',
                    color: active ? 'var(--color-primary)' : done ? 'var(--color-success)' : 'var(--color-text-muted)',
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: active ? 'var(--color-primary)' : done ? 'var(--color-success)' : 'var(--color-surface-2)',
                      color: active || done ? '#fff' : 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {done ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <span>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
            Your profile information is kept strictly confidential and secure.
          </div>
          <div className="onb-progress-track">
            <div className="onb-progress-bar" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '3rem 2.5rem', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ maxWidth: '640px', width: '100%' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 0: Welcome */}
              {step === 0 && (
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', borderRadius: 999, background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                    <Sparkles size={14} />
                    Student Profile Setup
                  </div>

                  <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
                    Welcome to Prisma. Let's personalize your experience.
                  </h1>

                  <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '0.94rem', marginBottom: '2rem' }}>
                    Take a moment to complete your student profile. This helps us ensure your learning experience and platform modules are relevant to you.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                    {[
                      { icon: '🔒', title: 'Safe & Confidential', desc: 'Your details and responses are completely private and never shared with instructors or peers.' },
                      { icon: '🧠', title: 'Evidence-Based Framework', desc: 'Designed with behavioral science principles to support awareness and respectful digital communication.' },
                      { icon: '⚡', title: 'Quick & Interactive', desc: 'Takes under two minutes to complete with simple multiple-choice questions.' },
                    ].map((f) => (
                      <div key={f.title} style={{ display: 'flex', gap: '0.85rem', padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                        <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-text-primary)', marginBottom: '0.15rem' }}>{f.title}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>{f.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Academic */}
              {step === 1 && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--color-text-primary)' }}>
                    Academic Details
                  </h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                    Tell us about your university, field of study, and academic year.
                  </p>

                  <div className="form-group">
                    <label className="form-label">University / Institution</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.university}
                      onChange={(e) => set('university', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department / Field of Study</label>
                    <div className="onb-options-grid">
                      {DEPARTMENTS.map((d) => {
                        const sel = profile.degree_program === d.id;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            className={`onb-card-option ${sel ? 'active' : ''}`}
                            onClick={() => set('degree_program', d.id)}
                            style={{ padding: '0.7rem 0.85rem' }}
                          >
                            <span style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{d.icon}</span>
                            <span style={{ fontSize: '0.84rem', fontWeight: sel ? 700 : 500 }}>{d.label}</span>
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
                        style={{ marginTop: '0.65rem' }}
                        autoFocus
                      />
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '1.25rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Academic Level</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {ACADEMIC_LEVELS.map((lvl) => {
                          const sel = profile.academic_level === lvl.id;
                          return (
                            <button
                              key={lvl.id}
                              type="button"
                              className={`onb-card-option ${sel ? 'active' : ''}`}
                              onClick={() => set('academic_level', lvl.id)}
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
                          const sel = profile.academic_year === yr;
                          return (
                            <button
                              key={yr}
                              type="button"
                              className={`onb-pill-btn ${sel ? 'active' : ''}`}
                              onClick={() => set('academic_year', yr)}
                            >
                              {sel && <CheckCircle2 size={13} />}
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
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--color-text-primary)' }}>
                    Living Situation
                  </h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                    Where do you currently live during your studies?
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {LIVING_SITUATIONS.map((sit) => {
                      const sel = profile.living_situation === sit.id;
                      return (
                        <button
                          key={sit.id}
                          type="button"
                          className={`onb-card-option ${sel ? 'active' : ''}`}
                          onClick={() => set('living_situation', sit.id)}
                          style={{ padding: '1rem 1.15rem' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '0.35rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <span style={{ fontSize: '1.4rem' }}>{sit.icon}</span>
                              <span style={{ fontSize: '0.98rem', fontWeight: 700 }}>{sit.title}</span>
                            </div>
                            <div
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                border: sel ? '5px solid var(--color-primary)' : '2px solid var(--color-border)',
                                background: 'var(--color-surface)',
                              }}
                            />
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', paddingLeft: '2.05rem', lineHeight: 1.45 }}>
                            {sit.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Digital */}
              {step === 3 && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--color-text-primary)' }}>
                    Digital Environment
                  </h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                    Which platforms and online services do you use regularly?
                  </p>

                  <div className="form-group">
                    <label className="form-label">Frequently Used Platforms</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                      {PLATFORMS.map((p) => {
                        const sel = profile.platforms_used.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            className={`onb-pill-btn ${sel ? 'active' : ''}`}
                            onClick={() => togglePlatform(p.id)}
                            style={{ padding: '0.55rem 0.95rem' }}
                          >
                            <span>{p.icon}</span>
                            <span>{p.label}</span>
                            {sel && <CheckCircle2 size={13} style={{ marginLeft: 2 }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">How often do you interact online?</label>
                    <div className="onb-options-grid-2col">
                      {INTERACTION_FREQUENCIES.map((freq) => {
                        const sel = profile.online_activity_level === freq.id;
                        return (
                          <button
                            key={freq.id}
                            type="button"
                            className={`onb-card-option ${sel ? 'active' : ''}`}
                            onClick={() => set('online_activity_level', freq.id)}
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

              {/* Step 4: Social & Community */}
              {step === 4 && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--color-text-primary)' }}>
                    Student Community
                  </h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                    Tell us about your typical interactions and university group participation.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Who do you mainly interact with online?</label>
                    <div className="onb-options-grid-2col">
                      {INTERACTION_PARTNERS.map((partner) => {
                        const sel = profile.main_interaction_with === partner.id;
                        return (
                          <button
                            key={partner.id}
                            type="button"
                            className={`onb-card-option ${sel ? 'active' : ''}`}
                            onClick={() => set('main_interaction_with', partner.id)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                              <span>{partner.icon}</span>
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

                  <div className="form-group" style={{ marginTop: '1.25rem' }}>
                    <label className="form-label">Do you participate in online university groups?</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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

              {/* Step 5: Complete */}
              {step === 5 && (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(5, 150, 105, 0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '1.25rem' }}>
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
              )}
            </motion.div>
          </AnimatePresence>

          {error && <div className="alert alert-danger" style={{ marginTop: '1rem' }}>{error}</div>}

          {/* Navigation Controls */}
          {step < totalSteps - 1 && (
            <div className="onb-nav-bar">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'none',
                  border: '1.5px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  cursor: step === 0 ? 'not-allowed' : 'pointer',
                  opacity: step === 0 ? 0.5 : 1,
                  fontWeight: 600,
                }}
              >
                <ChevronLeft size={16} />
                Back
              </button>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {step > 0 && (
                  <button
                    type="button"
                    onClick={handleSkipAndSave}
                    disabled={saving}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.84rem', cursor: 'pointer', textDecoration: 'underline' }}
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
                    gap: '0.4rem',
                    padding: '0.65rem 1.4rem',
                    borderRadius: 'var(--radius-md)',
                    background: canProceed() ? 'var(--color-primary)' : 'var(--color-surface-3)',
                    color: '#fff',
                    fontWeight: 700,
                    border: 'none',
                    cursor: canProceed() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {saving ? 'Saving Profile…' : step === totalSteps - 2 ? 'Save & Continue' : 'Continue'}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
